// app/(tryout)/tryout/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import TryoutHeader from "@/components/tryout/tryout-header";
import QuestionNavigation from "@/components/tryout/question-navigation";
import QuestionViewer from "@/components/tryout/question-viewer";

import { getTryoutAttempt, startTryout } from "@/services/tryout.service";

import { TryoutAttempt } from "@/types/tryout";

export default function TryoutAttemptPage() {
  const params = useParams();

  const tryoutId = Number(params.id);

  const [loading, setLoading] = useState(true);

  const [attempt, setAttempt] = useState<TryoutAttempt | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    async function initTryout() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) return;

        /* START TRYOUT */
        const startRes = await startTryout(tryoutId, token);

        const attemptToken = startRes.data.attempt_token;

        /* SAVE TOKEN */
        localStorage.setItem("attempt_token", attemptToken);

        /* FETCH QUESTIONS */
        const attemptRes = await getTryoutAttempt(attemptToken, token);

        setAttempt(attemptRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    initTryout();
  }, [tryoutId]);

  if (loading) {
    return <div className="p-6">Memuat tryout...</div>;
  }

  if (!attempt) {
    return <div className="p-6">Gagal memuat tryout</div>;
  }

  const question = attempt.questions[currentQuestion];

  return (
    <div
      className="
        flex
        min-h-screen
        flex-col
      "
    >
      {/* HEADER */}
      <TryoutHeader
        current={currentQuestion + 1}
        total={attempt.questions.length}
      />

      {/* CONTENT */}
      <div
        className="
          flex
          flex-1
          gap-6
          p-6
        "
      >
        {/* SIDEBAR */}
        <div
          className="
            w-[260px]
            shrink-0
            rounded-2xl
            border
            bg-card
            p-4
          "
        >
          <h2 className="mb-4 font-semibold">Navigasi Soal</h2>

          <QuestionNavigation
            total={attempt.questions.length}
            current={currentQuestion}
            onSelect={setCurrentQuestion}
          />
        </div>

        {/* QUESTION */}
        <div
          className="
            flex-1
            rounded-2xl
            border
            bg-card
            p-6
          "
        >
          <QuestionViewer question={question} />

          {/* ACTION */}
          <div
            className="
              mt-8
              flex
              items-center
              justify-between
            "
          >
            <button
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion((prev) => prev - 1)}
              className="
                rounded-xl
                border
                px-4 py-2
                disabled:opacity-50
              "
            >
              Sebelumnya
            </button>

            <button
              disabled={currentQuestion === attempt.questions.length - 1}
              onClick={() => setCurrentQuestion((prev) => prev + 1)}
              className="
                rounded-xl
                bg-primary
                px-4 py-2
                text-white
                disabled:opacity-50
              "
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
