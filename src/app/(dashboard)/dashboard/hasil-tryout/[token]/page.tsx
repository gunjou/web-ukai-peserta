"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import TryoutHeader from "@/components/tryout/tryout-header";
import QuestionNavigation from "@/components/tryout/question-navigation";
import QuestionPaletteModal from "@/components/tryout/question-palette-modal";
import { getTryoutReport } from "@/services/tryout.service";
import { TryoutReportQuestion, AnswersMap } from "@/types/tryout";

export default function TryoutResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const attemptToken = String(params.token);

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<TryoutReportQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedPembahasan, setExpandedPembahasan] = useState(false);
  const [paletteVisible, setPaletteVisible] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [attemptToken]);

  async function fetchReport() {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const result = await getTryoutReport(attemptToken, token);
      setQuestions(result.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setExpandedPembahasan(false);
  }, [currentIndex]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-lg font-medium">Memuat pembahasan...</p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">Pembahasan tidak ditemukan</p>
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

  const question = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  const answersMap: AnswersMap = Object.fromEntries(
    questions.map((q) => [q.id, { answer: q.user_answer, ragu: q.is_ragu }])
  );

  const statuses: { [key: number]: "benar" | "salah" | "kosong" } =
    Object.fromEntries(questions.map((q) => [q.id, q.status]));

  const benarCount = questions.filter((q) => q.status === "benar").length;
  const salahCount = questions.filter((q) => q.status === "salah").length;
  const kosongCount = questions.filter((q) => q.status === "kosong").length;

  return (
    // Ubah menjadi h-screen overflow-hidden agar seluruh halaman tidak scroll
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* HEADER — tidak ikut scroll karena berada di luar area scroll */}
      <TryoutHeader
        current={currentIndex}
        total={questions.length}
        remainingTime={0}
        totalDuration={0}
        answeredCount={benarCount + salahCount}
        raguCount={questions.filter((q) => q.is_ragu).length}
        onOpenPalette={() => setPaletteVisible(true)}
      />

      {/*
        BODY — flex-1 + overflow-hidden agar tepat mengisi sisa tinggi layar
        di bawah header dan di atas footer
      */}
      <div className="flex flex-1 gap-6 p-6 overflow-hidden">
        {/* SIDEBAR — tidak perlu sticky lagi karena sudah tidak ikut scroll */}
        <div className="hidden xl:flex xl:w-[320px] shrink-0 flex-col">
          <div className="rounded-3xl border bg-card p-5 flex flex-col h-full overflow-hidden">
            <h2 className="mb-5 text-lg font-bold shrink-0">Navigasi Soal</h2>

            {/* Legend */}
            <div className="mb-4 space-y-2 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-green-500" />
                <span>Benar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-red-500" />
                <span>Salah</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-gray-400" />
                <span>Tidak dijawab</span>
              </div>
            </div>

            {/* QuestionNavigation scroll secara independen di dalam sidebar */}
            <div className="flex-1 overflow-y-auto">
              <QuestionNavigation
                total={questions.length}
                current={currentIndex}
                onSelect={setCurrentIndex}
                questions={questions}
                answers={answersMap}
                mode="pembahasan"
                statuses={statuses}
              />
            </div>
          </div>
        </div>

        {/* MAIN CONTENT — hanya area ini yang scroll */}
        <div className="flex-1 min-w-0 overflow-y-auto rounded-3xl border bg-card p-8 space-y-8">
          {/* STATUS BADGE */}
          <div className="flex items-center gap-3">
            <div
              className={`
                h-10 w-10 rounded-xl flex items-center justify-center font-bold text-lg
                ${
                  question.status === "benar"
                    ? "bg-green-500/10 text-green-600"
                    : question.status === "salah"
                    ? "bg-red-500/10 text-red-600"
                    : "bg-gray-500/10 text-gray-500"
                }
              `}
            >
              {question.status === "benar" && "✓"}
              {question.status === "salah" && "✗"}
              {question.status === "kosong" && "–"}
            </div>

            <div>
              <p className="text-sm font-semibold">
                Soal {question.nomor} —{" "}
                <span
                  className={
                    question.status === "benar"
                      ? "text-green-600"
                      : question.status === "salah"
                      ? "text-red-600"
                      : "text-gray-500"
                  }
                >
                  {question.status.toUpperCase()}
                </span>
              </p>
              {question.is_ragu && (
                <p className="text-xs text-yellow-600 flex items-center gap-1 mt-0.5">
                  <Flag className="h-3 w-3" />
                  Ditandai Ragu
                </p>
              )}
            </div>
          </div>

          {/* SOAL */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Soal
            </h3>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: question.pertanyaan }}
            />
          </div>

          {/* OPTIONS */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Pilihan Jawaban
            </h3>
            <div className="space-y-2">
              {["A", "B", "C", "D", "E"].map((option) => {
                const isCorrect = option === question.correct_answer;
                const isUserAnswer = option === question.user_answer;
                const isWrong = isUserAnswer && !isCorrect;

                return (
                  <div
                    key={option}
                    className={`
                      flex gap-3 rounded-2xl border-2 p-4 transition-colors
                      ${
                        isCorrect
                          ? "border-green-500 bg-green-500/10"
                          : isWrong
                          ? "border-red-500 bg-red-500/10"
                          : "border-border bg-background"
                      }
                    `}
                  >
                    <div
                      className={`
                        flex h-8 w-8 shrink-0 items-center justify-center
                        rounded-xl font-bold text-sm
                        ${
                          isCorrect
                            ? "bg-green-600 text-white"
                            : isWrong
                            ? "bg-red-600 text-white"
                            : "bg-muted text-muted-foreground"
                        }
                      `}
                    >
                      {option}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{question.pilihan[option]}</p>
                      {isCorrect && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                          ✓ Jawaban Benar
                        </p>
                      )}
                      {isWrong && (
                        <p className="text-xs text-red-600 font-medium mt-1">
                          ✗ Jawaban Anda
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PEMBAHASAN */}
          {question.pembahasan && (
            <div>
              <button
                onClick={() => setExpandedPembahasan(!expandedPembahasan)}
                className="
                  flex w-full items-center justify-between
                  rounded-2xl bg-muted/50 p-4
                  hover:bg-muted transition-colors
                "
              >
                <span className="font-semibold text-sm">Pembahasan</span>
                <ChevronRight
                  className={`h-5 w-5 transition-transform ${
                    expandedPembahasan ? "rotate-90" : ""
                  }`}
                />
              </button>

              {expandedPembahasan && (
                <div className="mt-4 px-1 prose prose-sm max-w-none dark:prose-invert">
                  <div
                    dangerouslySetInnerHTML={{ __html: question.pembahasan }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER — tidak ikut scroll karena berada di luar area scroll */}
      <div className="shrink-0 border-t bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Prev */}
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={isFirst}
              className={`
                flex flex-1 items-center justify-center gap-2
                rounded-lg border px-3 py-2.5
                text-sm md:text-base font-medium transition-colors
                ${isFirst ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"}
              `}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Soal Sebelumnya</span>
            </button>

            {/* Progress */}
            <div className="hidden lg:flex flex-col min-w-[220px] px-4">
              <div className="flex justify-between text-xs mb-1">
                <span>
                  {currentIndex + 1}/{questions.length}
                </span>
                <span className="text-muted-foreground">
                  {benarCount} benar · {salahCount} salah · {kosongCount} kosong
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Next */}
            <button
              onClick={() =>
                setCurrentIndex(
                  Math.min(questions.length - 1, currentIndex + 1)
                )
              }
              disabled={isLast}
              className={`
                flex flex-[1.5] items-center justify-center gap-2
                rounded-lg bg-primary px-3 py-2.5
                text-sm md:text-base font-medium text-white
                transition-colors
                ${
                  isLast
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-primary/90"
                }
              `}
            >
              <span className="hidden sm:inline">Soal Berikutnya</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PALETTE MODAL (Mobile) */}
      <QuestionPaletteModal
        visible={paletteVisible}
        onClose={() => setPaletteVisible(false)}
        questions={questions}
        answers={answersMap}
        currentIndex={currentIndex}
        answeredCount={benarCount + salahCount}
        raguCount={questions.filter((q) => q.is_ragu).length}
        onSelect={(index) => {
          setCurrentIndex(index);
          setPaletteVisible(false);
        }}
        mode="pembahasan"
        statuses={statuses}
        title="Navigasi Pembahasan"
        subtitle="Pilih soal yang ingin dilihat"
      />
    </div>
  );
}
