"use client";

import { TryoutQuestion, Answer } from "@/types/tryout";
import QuestionCard from "./question-card";
import OptionCard from "./option-card";

interface Props {
  question: TryoutQuestion;
  answer: Answer | undefined;
  onSelectAnswer: (option: string) => void;
}

export default function QuestionViewer({
  question,
  answer,
  onSelectAnswer,
}: Props) {
  const options = ["A", "B", "C", "D", "E"];

  return (
    <div className="w-full">
      <div className="space-y-10">
        {/* Question */}
        <QuestionCard question={question} />
        {/* Divider */}
        <div className="border-t pt-2" />
        {/* Options */}
        <div className="space-y-4">
          {options.map((option) => {
            const optionText = question?.pilihan?.[option];

            if (!optionText) return null;

            return (
              <OptionCard
                key={option}
                option={option}
                text={optionText}
                selected={answer?.answer === option}
                onPress={() => onSelectAnswer(option)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
