// app/(tryout)/tryout/[id]/attempt/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import TryoutHeader from "@/components/tryout/tryout-header";
import QuestionNavigation from "@/components/tryout/question-navigation";
import QuestionViewer from "@/components/tryout/question-viewer";
import TryoutFooter from "@/components/tryout/tryout-footer";
import QuestionPaletteModal from "@/components/tryout/question-palette-modal";

import {
  getTryoutAttempt,
  startTryout,
  saveAttemptAnswers,
  submitAttempt,
  checkOngoingTryout,
} from "@/services/tryout.service";

import { TryoutAttempt, AnswersMap, SessionState } from "@/types/tryout";

const STORAGE_KEY = "ACTIVE_TRYOUT_SESSION";

export default function TryoutAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const tryoutId = Number(params.id);
  const hasPushedHistory = useRef(false);
  const initialized = useRef(false);

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<TryoutAttempt | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [remainingTime, setRemainingTime] = useState(0);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [paletteVisible, setPaletteVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitVisible, setSubmitVisible] = useState(false);
  const [leaveWarningVisible, setLeaveWarningVisible] = useState(false);
  const [allowLeave, setAllowLeave] = useState(false);

  // Always-fresh ref so timers/closures never read stale `answers`
  const answersRef = useRef<AnswersMap>({});
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Ref to avoid double-submits from timer + manual click racing
  const submittingRef = useRef(false);

  useEffect(() => {
    if (loading || allowLeave) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      setLeaveWarningVisible(true);
    };

    if (!hasPushedHistory.current) {
      window.history.pushState(null, "", window.location.href);
      hasPushedHistory.current = true;
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [loading, allowLeave]);

  // Initialize tryout
  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;

    console.log("INIT TRYOUT");

    void initTryout();
  }, [tryoutId]);

  async function initTryout() {
    try {
      setError(null);
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Token tidak ditemukan. Silakan login ulang.");
        setLoading(false);
        return;
      }

      const ongoingRes = await checkOngoingTryout(token);
      const candidates = (ongoingRes?.data?.ongoing ?? []).filter(
        (item) => item.id_tryout === tryoutId
      );

      // Kalau ada banyak ongoing untuk tryout yang sama (data lama/duplikat),
      // ambil yang paling baru berdasarkan start_time, jangan asumsikan index [0].
      const ongoingForThis = candidates.sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      )[0];

      let attemptToken: string;
      let newEndTime: number;

      if (ongoingForThis) {
        attemptToken = ongoingForThis.attempt_token;
        localStorage.setItem("attempt_token", attemptToken);

        // is_ongoing tidak memberi end_time untuk attempt yang masih aktif,
        // jadi endTime dihitung dari start_time + duration hasil fetch soal.
        const attemptRes = await getTryoutAttempt(attemptToken, token);
        setAttempt(attemptRes.data);

        const startMs = new Date(ongoingForThis.start_time).getTime();
        newEndTime = startMs + attemptRes.data.duration * 60 * 1000;
        setEndTime(newEndTime);

        // Restore jawaban HANYA kalau formatnya cocok dengan AnswersMap
        // (key = questionId numerik, value = {answer, ragu}).
        // Kalau formatnya "soal_N" / "jawaban" (format lama), skip restore
        // dan biarkan mulai kosong -- daripada salah mapping.
        const rawAnswers = ongoingForThis.jawaban_user ?? {};
        const looksLikeCurrentFormat = Object.values(rawAnswers).every(
          (v: any) => v && typeof v === "object" && "answer" in v
        );
        if (looksLikeCurrentFormat) {
          setAnswers(rawAnswers as AnswersMap);
          answersRef.current = rawAnswers as AnswersMap;
        }
      } else {
        console.log("Creating new attempt...");
        const startRes = await startTryout(tryoutId, token);
        attemptToken = startRes.data.attempt_token;
        const durationSeconds = startRes.data.duration * 60;
        newEndTime = Date.now() + durationSeconds * 1000;
        localStorage.setItem("attempt_token", attemptToken);

        const attemptRes = await getTryoutAttempt(attemptToken, token);
        setAttempt(attemptRes.data);
        setEndTime(newEndTime);
      }

      const session: SessionState = {
        tryoutId,
        attemptToken,
        answers: ongoingForThis ? answersRef.current : {},
        currentIndex: ongoingForThis ? currentIndex : 0,
        endTime: newEndTime,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error("Init error:", error);
      setError(error instanceof Error ? error.message : "Gagal memulai tryout");
    } finally {
      setLoading(false);
    }
  }

  // Persist session to localStorage
  function persistSession() {
    if (!endTime) return;

    const attemptToken = localStorage.getItem("attempt_token");
    if (!attemptToken) return;

    const session: SessionState = {
      tryoutId,
      attemptToken,
      answers: answersRef.current,
      currentIndex,
      endTime,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  // Timer countdown
  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setRemainingTime(remaining);

      // Auto-submit when time runs out
      if (remaining === 0 && !submittingRef.current && attempt && !loading) {
        console.log("Time's up, auto-submitting...");
        // Close any open modals so nothing lingers over the redirect
        setSubmitVisible(false);
        setLeaveWarningVisible(false);
        handleSubmit();
      }
    }, 1000);

    return () => clearInterval(interval);
    // NOTE: intentionally NOT depending on `answers` -- we read the latest
    // value through answersRef instead, so this interval doesn't need to
    // be torn down/recreated every keystroke.
  }, [endTime, attempt, loading]);

  // Persist answers changes
  useEffect(() => {
    persistSession();
  }, [answers, currentIndex, endTime]);

  // Auto-save to server every 10 seconds
  useEffect(() => {
    if (!endTime) return;

    const autoSaveInterval = setInterval(async () => {
      if (Object.keys(answersRef.current).length === 0) return;

      const token = localStorage.getItem("access_token");
      const attemptToken = localStorage.getItem("attempt_token");

      if (!token || !attemptToken) return;

      try {
        await saveAttemptAnswers(attemptToken, answersRef.current, token);
        console.log("Auto-saved");
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 10000);

    return () => clearInterval(autoSaveInterval);
  }, [endTime]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden") {
        await saveBeforeExit();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  function handleSelectAnswer(option: string) {
    const questionId = attempt?.questions[currentIndex]?.id;
    if (!questionId) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answer: option,
      },
    }));
  }

  function handleToggleRagu(questionId: number) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ragu: !prev[questionId]?.ragu,
      },
    }));
  }

  // Shared implementation used by both the manual "Kumpulkan" button
  // (handleSubmit) and the "Kumpulkan & Keluar" leave-warning button
  // (handleLeaveTryout), and by the auto-submit-on-timeout path.
  async function submitAndExit() {
    if (submittingRef.current || !attempt) return;

    submittingRef.current = true;
    setSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      const attemptToken = localStorage.getItem("attempt_token");

      if (!token || !attemptToken) {
        setError("Token tidak ditemukan");
        return;
      }

      // Save final answers (always the latest, via ref)
      await saveAttemptAnswers(attemptToken, answersRef.current, token);

      // Submit attempt
      const result = await submitAttempt(attemptToken, token);

      // Simpan hasil
      localStorage.setItem("TRYOUT_RESULT", JSON.stringify(result.data));

      // Hapus session
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("attempt_token");

      // Allow navigation away without triggering the leave-warning guard
      setAllowLeave(true);

      // Redirect ke result page
      router.replace(
        `/tryout/${tryoutId}/result?token=${attemptToken}&score=${result.data.score}`
      );
    } catch (error) {
      console.error("Submit failed:", error);
      setError(error instanceof Error ? error.message : "Gagal submit hasil");
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  async function handleLeaveTryout() {
    await submitAndExit();
  }

  async function saveBeforeExit() {
    if (submittingRef.current || !attempt) return;
    try {
      const token = localStorage.getItem("access_token");
      const attemptToken = localStorage.getItem("attempt_token");

      if (!token || !attemptToken) return;

      await saveAttemptAnswers(attemptToken, answersRef.current, token);

      persistSession();
    } catch (error) {
      console.error("Failed saving before exit:", error);
    }
  }

  async function handleSubmit() {
    await submitAndExit();
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-lg font-medium">Mempersiapkan soal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-red-600">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0-12a9 9 0 110 18 9 9 0 010-18z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium">Error</p>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => router.back()}
            className="rounded-lg bg-primary px-4 py-2 text-white font-medium hover:bg-primary/90"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!attempt || !attempt.questions || attempt.questions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">Soal tidak ditemukan</p>
          <button
            onClick={() => router.back()}
            className="rounded-lg bg-primary px-4 py-2 text-white font-medium hover:bg-primary/90"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const question = attempt.questions[currentIndex];
  const currentAnswer = answers[question?.id];
  const answeredCount = Object.values(answers).filter((a) => a?.answer).length;

  const raguCount = Object.values(answers).filter((a) => a?.ragu).length;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28 md:pb-32">
      {/* HEADER */}
      <TryoutHeader
        current={currentIndex}
        total={attempt.questions.length}
        remainingTime={remainingTime}
        totalDuration={attempt.duration * 60}
        answeredCount={answeredCount}
        raguCount={raguCount}
        onOpenPalette={() => setPaletteVisible(true)}
      />
      {/* CONTENT */}
      <div className="flex flex-1 gap-6 p-6 overflow-hidden">
        {/* SIDEBAR - Question Palette */}
        <div className="hidden xl:block w-[320px] shrink-0">
          <div
            className="
    sticky
    top-24
    h-[calc(100vh-180px)]
    rounded-3xl
    border
    bg-card
    p-5
    flex
    flex-col
  "
          >
            <h2 className="mb-5 text-lg font-bold">Navigasi Soal</h2>
            <div className="mb-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-green-500" />
                <span>Dijawab</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-yellow-500" />
                <span>Ragu-ragu</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded border" />
                <span>Belum dijawab</span>
              </div>
            </div>

            <QuestionNavigation
              total={attempt.questions.length}
              current={currentIndex}
              onSelect={setCurrentIndex}
              questions={attempt.questions}
              answers={answers}
              mode="tryout"
            />
          </div>
        </div>
        {/* MAIN QUESTION */}
        <div className="flex-1 min-w-0">
          <div className="w-full">
            <div
              className="
      rounded-3xl
      border
      bg-card
      h-[calc(100vh-180px)]
      overflow-y-auto
      p-8
    "
            >
              <QuestionViewer
                question={question}
                answer={currentAnswer}
                onSelectAnswer={handleSelectAnswer}
              />
            </div>
          </div>
        </div>
      </div>
      {/* FOOTER */}
      <TryoutFooter
        currentIndex={currentIndex}
        questions={attempt.questions}
        currentAnswer={currentAnswer}
        currentQuestion={question}
        toggleRagu={handleToggleRagu}
        setCurrentIndex={setCurrentIndex}
        onSubmitPress={() => setSubmitVisible(true)}
      />
      {/* PALETTE MODAL (Mobile) */}
      <QuestionPaletteModal
        visible={paletteVisible}
        onClose={() => setPaletteVisible(false)}
        questions={attempt.questions}
        answers={answers}
        currentIndex={currentIndex}
        answeredCount={answeredCount}
        raguCount={raguCount}
        onSelect={(index) => {
          setCurrentIndex(index);
          setPaletteVisible(false);
        }}
        mode="tryout"
      />
      {/* SUBMIT CONFIRMATION MODAL */}
      {submitVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="
    w-full
    max-w-md
    rounded-xl
    bg-card
    p-5
    sm:p-6
    space-y-6
  "
          >
            <div>
              <h2 className="text-lg font-semibold">Kumpulkan Jawaban?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Apakah Anda yakin ingin mengumpulkan jawaban? Anda tidak dapat
                mengubahnya lagi setelah submit.
              </p>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Total",
                  value: attempt.questions.length,
                  color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                },
                {
                  label: "Dijawab",
                  value: Object.values(answers).filter((a) => a?.answer).length,
                  color: "bg-green-500/10 text-green-600 dark:text-green-400",
                },
                {
                  label: "Kosong",
                  value:
                    attempt.questions.length -
                    Object.values(answers).filter((a) => a?.answer).length,
                  color: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
                },
                {
                  label: "Ragu",
                  value: Object.values(answers).filter((a) => a?.ragu).length,
                  color:
                    "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-lg ${stat.color} p-3 text-center`}
                >
                  <p className="text-xs font-medium opacity-75">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setSubmitVisible(false)}
                disabled={submitting}
                className="flex-1 rounded-lg border bg-background py-2 font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                Lanjut
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-lg bg-primary py-2 font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "Mengirim..." : "Kumpulkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {leaveWarningVisible && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Akhiri Tryout?</h2>

            <p className="text-sm text-muted-foreground mt-2">
              Tryout akan dikumpulkan sekarang dan Anda akan langsung melihat
              hasilnya. Setelah dikumpulkan, jawaban tidak dapat diubah lagi.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setLeaveWarningVisible(false)}
                disabled={submitting}
                className="
            flex-1
            rounded-xl
            border
            py-2.5
            font-medium
            hover:bg-muted
            disabled:opacity-50
          "
              >
                Tetap Mengerjakan
              </button>

              <button
                onClick={handleLeaveTryout}
                disabled={submitting}
                className="
            flex-1
            rounded-xl
            bg-red-500
            py-2.5
            font-medium
            text-white
            hover:bg-red-600
            disabled:opacity-50
          "
              >
                {submitting ? "Mengirim..." : "Kumpulkan & Keluar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
