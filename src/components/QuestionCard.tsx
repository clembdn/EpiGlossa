'use client'

import { useState, useRef, useEffect } from 'react'
import { Question, AnswerState, Choice } from '@/types/question'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CheckCircle2, XCircle, Volume2 } from 'lucide-react'
import Image from 'next/image'

interface QuestionCardProps {
  question: Question
  onNext?: () => void
}

export default function QuestionCard({ question, onNext }: QuestionCardProps) {
  const [answerState, setAnswerState] = useState<AnswerState>({
    selectedAnswer: null,
    isSubmitted: false,
    isCorrect: null,
  })
  const audioRef = useRef<HTMLAudioElement>(null)

  // Reset state when question changes
  useEffect(() => {
    setAnswerState({
      selectedAnswer: null,
      isSubmitted: false,
      isCorrect: null,
    })
  }, [question.id])

  const handleAnswerSelect = (value: string) => {
    if (!answerState.isSubmitted) {
      setAnswerState((prev) => ({
        ...prev,
        selectedAnswer: value as 'A' | 'B' | 'C' | 'D',
      }))
    }
  }

  const handleSubmit = () => {
    if (!answerState.selectedAnswer) return

    const correctOption = question.choices.find((c: Choice) => c.is_correct)?.option || null
    const isCorrect = answerState.selectedAnswer === correctOption
    setAnswerState((prev) => ({
      ...prev,
      isSubmitted: true,
      isCorrect,
    }))
  }

  const handleNext = () => {
    if (onNext) {
      onNext()
    }
  }

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
    }
  }

  const getCategoryLabel = (category: string) => {
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const getChoiceClassName = (choice: 'A' | 'B' | 'C' | 'D') => {
    if (!answerState.isSubmitted) {
      return answerState.selectedAnswer === choice 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
        : 'border-gray-200 dark:border-gray-700'
    }

    const correctOption = question.choices.find((c: Choice) => c.is_correct)?.option || null
    if (choice === correctOption) {
      return 'border-green-500 bg-green-50 dark:bg-green-950'
    }

    if (choice === answerState.selectedAnswer && !answerState.isCorrect) {
      return 'border-red-500 bg-red-50 dark:bg-red-950'
    }

    return 'border-gray-200 dark:border-gray-700'
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg sm:text-xl">{getCategoryLabel(question.category)}</span>
          <span className="text-sm font-normal text-muted-foreground">
            Question {question.id}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Audio Player */}
        {question.audio_url && (
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <Button
              onClick={playAudio}
              variant="outline"
              size="icon"
              className="h-12 w-12"
              disabled={answerState.isSubmitted}
            >
              <Volume2 className="h-6 w-6" />
            </Button>
            <span className="text-sm text-muted-foreground">Click to play audio</span>
            <audio ref={audioRef} src={question.audio_url} />
          </div>
        )}

        {/* Image */}
        {question.image_url && (
          <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <Image
              src={question.image_url}
              alt="Question image"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
        )}

        {/* Question Text */}
        {question.question_text && (
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-base sm:text-lg">{question.question_text}</p>
          </div>
        )}

        {/* Answer Choices */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Select your answer:</p>
          <RadioGroup
            value={answerState.selectedAnswer || undefined}
            onValueChange={handleAnswerSelect}
            disabled={answerState.isSubmitted}
            className="space-y-3"
          >
            {question.choices.map((c: Choice) => {
              const choice = c.option
              const correctOption = question.choices.find((cc: Choice) => cc.is_correct)?.option || null
              return (
                <label
                  key={choice}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${getChoiceClassName(choice)} ${answerState.isSubmitted ? 'cursor-not-allowed' : 'hover:border-blue-300 dark:hover:border-blue-700'}`}
                >
                  <RadioGroupItem value={choice} id={`choice-${choice}`} className="mt-1" />
                  <div className="flex-1">
                    <span className="font-semibold mr-2">{choice}.</span>
                    <span>{c.text}</span>
                  </div>
                  {answerState.isSubmitted && choice === correctOption && (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  )}
                  {answerState.isSubmitted &&
                    choice === answerState.selectedAnswer &&
                    !answerState.isCorrect && (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                </label>
              )
            })}
          </RadioGroup>
        </div>

        {/* Feedback */}
        {answerState.isSubmitted && (
          <div
            className={`p-4 rounded-lg ${
              answerState.isCorrect
                ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {answerState.isCorrect ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-900 dark:text-green-100">
                    Correct!
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-900 dark:text-red-100">
                    Incorrect
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{question.explanation}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          onClick={handleSubmit}
          disabled={!answerState.selectedAnswer || answerState.isSubmitted}
          className="w-full sm:w-auto"
        >
          Submit Answer
        </Button>
        {answerState.isSubmitted && onNext && (
          <Button onClick={handleNext} variant="outline" className="w-full sm:w-auto ml-2">
            Next Question
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
