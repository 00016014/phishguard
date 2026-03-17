'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizResult {
  passed: boolean;
  score: number;
  message?: string;
  points_earned?: number;
}

interface QuizModalProps {
  quiz: {
    id: number;
    title: string;
    questions: QuizQuestion[];
  } | null;
  onClose: () => void;
  onComplete: (score: number) => Promise<QuizResult>;
}

export default function QuizModal({ quiz, onClose, onComplete }: QuizModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [showResult, setShowResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!quiz) return null;

  const question = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const isCorrect = selectedAnswer === question.correctAnswer;

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setShowExplanation(true);
    if (isCorrect) {
      setScore(score + 1);
    }
    setAnsweredQuestions([...answeredQuestions, currentQuestion]);
  };

  const handleNextQuestion = async () => {
    if (isLastQuestion) {
      setSubmitting(true);
      // score state is already updated by handleSubmitAnswer (which ran before this button appears),
      // so use it directly — adding isCorrect again would double-count the last answer.
      const finalCorrect = score;
      const result = await onComplete(finalCorrect);
      setSubmitting(false);
      setShowResult(result);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleTryAgain = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnsweredQuestions([]);
    setShowResult(null);
  };

  const progressPercentage = ((currentQuestion + 1) / quiz.questions.length) * 100;

  // --- Result Screen ---
  if (showResult) {
    const passed = showResult.passed;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              passed ? 'bg-success/20' : 'bg-error/20'
            }`}
          >
            <Icon
              name={passed ? 'CheckCircleIcon' : 'XCircleIcon'}
              size={48}
              className={passed ? 'text-success' : 'text-error'}
              variant="solid"
            />
          </div>

          <h2 className={`text-2xl font-headline font-bold mb-2 ${passed ? 'text-success' : 'text-error'}`}>
            {passed ? 'Challenge Complete!' : 'Not Quite!'}
          </h2>

          <p className="text-muted-foreground mb-6">
            {passed
              ? showResult.points_earned
                ? `You scored ${showResult.score}% and earned ${showResult.points_earned} points!`
                : `You scored ${showResult.score}% — already completed before.`
              : (showResult.message ?? `You scored ${showResult.score}%. A score of 60% or higher is required to pass.`)}
          </p>

          <div className="flex gap-3 justify-center">
            {!passed && (
              <button
                onClick={handleTryAgain}
                className="py-2.5 px-6 bg-brand-primary text-white font-cta font-semibold rounded-md hover:bg-brand-primary/90 transition-all"
              >
                Try Again
              </button>
            )}
            <button
              onClick={onClose}
              className={`py-2.5 px-6 font-cta font-semibold rounded-md transition-all ${
                passed
                  ? 'bg-brand-accent text-white hover:bg-brand-accent/90'
                  : 'border border-border text-muted-foreground hover:bg-surface'
              }`}
            >
              {passed ? 'Continue' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-headline font-bold text-foreground">{quiz.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface rounded-md transition-colors"
              aria-label="Close quiz"
            >
              <Icon name="XMarkIcon" size={24} />
            </button>
          </div>

          <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-brand-accent transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">{question.question}</h3>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === question.correctAnswer;
                const showCorrect = showExplanation && isCorrectAnswer;
                const showIncorrect = showExplanation && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showExplanation}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      showCorrect
                        ? 'border-success bg-success/10'
                        : showIncorrect
                          ? 'border-error bg-error/10'
                          : isSelected
                            ? 'border-brand-primary bg-brand-primary/10'
                            : 'border-border hover:border-brand-primary/50 hover:bg-surface'
                    } ${showExplanation ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-medium ${
                          showCorrect
                            ? 'text-success'
                            : showIncorrect
                              ? 'text-error'
                              : 'text-foreground'
                        }`}
                      >
                        {option}
                      </span>
                      {showCorrect && (
                        <Icon
                          name="CheckCircleIcon"
                          size={24}
                          className="text-success"
                          variant="solid"
                        />
                      )}
                      {showIncorrect && (
                        <Icon name="XCircleIcon" size={24} className="text-error" variant="solid" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {showExplanation && (
            <div
              className={`p-6 rounded-lg border-2 mb-6 ${
                isCorrect ? 'border-success bg-success/10' : 'border-error bg-error/10'
              }`}
            >
              <div className="flex items-start space-x-3 mb-3">
                <Icon
                  name={isCorrect ? 'CheckCircleIcon' : 'XCircleIcon'}
                  size={24}
                  className={isCorrect ? 'text-success' : 'text-error'}
                  variant="solid"
                />
                <div>
                  <h4
                    className={`font-headline font-bold ${isCorrect ? 'text-success' : 'text-error'}`}
                  >
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </h4>
                  <p className="text-sm text-foreground mt-2">{question.explanation}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Score: <span className="font-bold text-brand-primary">{score}</span> /{' '}
              {quiz.questions.length}
            </div>

            {!showExplanation ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="py-2.5 px-6 bg-brand-accent text-white font-cta font-semibold rounded-md hover:bg-brand-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={submitting}
                className="py-2.5 px-6 bg-brand-primary text-white font-cta font-semibold rounded-md hover:bg-brand-primary/90 disabled:opacity-50 transition-all"
              >
                {submitting ? 'Submitting…' : isLastQuestion ? 'Complete Quiz' : 'Next Question'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

