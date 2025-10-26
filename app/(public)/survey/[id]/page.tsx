'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { SurveyHeader } from '@/components/survey/survey-header';
import { QuestionRenderer } from '@/components/survey/question-renderer';
import { SubmitButton } from '@/components/survey/submit-button';
import { responsesApi } from '@/lib/api/responses';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import type { PublicSurveyData, Answer } from '@/types';
import { toast } from 'sonner';

export default function SurveyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const surveyId = Number(params.id);
  const token = searchParams.get('token') || '';

  const [surveyData, setSurveyData] = useState<PublicSurveyData | null>(null);
  const [answers, setAnswers, removeAnswers] = useLocalStorage<Record<number, Answer>>(
    `survey_${surveyId}_${token}`,
    {}
  );
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load survey data
  useEffect(() => {
    const loadSurvey = async () => {
      if (!token) {
        setError('缺少访问令牌，请使用有效的问卷链接');
        setIsLoading(false);
        return;
      }

      try {
        const data = await responsesApi.getSurvey(surveyId, token);
        setSurveyData(data);

        // Auto-fill prefill data
        if (data.questions && data.prefill_data && Object.keys(data.prefill_data).length > 0) {
          const prefillAnswers: Record<number, Answer> = {};
          data.questions.forEach((question) => {
            if (question.prefill_key && data.prefill_data[question.prefill_key]) {
              prefillAnswers[question.id] = {
                question_id: question.id,
                value: data.prefill_data[question.prefill_key],
              };
            }
          });
          setAnswers((prev) => ({ ...prefillAnswers, ...prev }));
        }
      } catch (err: any) {
        console.error('Failed to load survey:', err);
        if (err?.message?.includes('expired')) {
          setError('问卷链接已过期，请联系管理员获取新链接');
        } else if (err?.message?.includes('used')) {
          setError('此问卷链接已被使用，每个链接只能使用一次');
        } else if (err?.message?.includes('invalid')) {
          setError('无效的问卷链接，请检查链接是否正确');
        } else {
          setError('加载问卷失败，请稍后重试');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSurvey();
  }, [surveyId, token, setAnswers]);

  // Calculate progress
  const progress = surveyData?.questions?.length
    ? (Object.keys(answers).length / surveyData.questions.length) * 100
    : 0;

  // Handle answer change - stable callback that doesn't change
  const handleAnswerChange = useCallback((questionId: number, value: Answer['value']) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { question_id: questionId, value },
    }));
    // Clear error for this question
    setErrors((prev) => {
      if (prev[questionId]) {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      }
      return prev;
    });
  }, [setAnswers]);

  // Create stable onChange handlers map for all questions
  const onChangeHandlers = useMemo(() => {
    const handlers: Record<number, (value: Answer['value']) => void> = {};
    surveyData?.questions?.forEach((question) => {
      handlers[question.id] = (value: Answer['value']) => handleAnswerChange(question.id, value);
    });
    return handlers;
  }, [surveyData?.questions, handleAnswerChange]);

  // Validate answers
  const validateAnswers = (): boolean => {
    const newErrors: Record<number, string> = {};
    
    surveyData?.questions?.forEach((question) => {
      if (question.required) {
        const answer = answers[question.id];
        if (!answer || !answer.value) {
          newErrors[question.id] = '此题为必填项';
        } else if (Array.isArray(answer.value) && answer.value.length === 0) {
          newErrors[question.id] = '此题为必填项';
        } else if (
          Array.isArray(answer.value) &&
          Array.isArray(answer.value[0]) &&
          answer.value.length === 0
        ) {
          newErrors[question.id] = '此题为必填项';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateAnswers()) {
      toast.error('请填写所有必填项');
      // Scroll to first error
      const firstErrorId = Object.keys(errors)[0];
      if (firstErrorId) {
        const element = document.getElementById(`question-${firstErrorId}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const answerList = Object.values(answers);
      await responsesApi.submit(token, answerList);
      setIsSubmitted(true);
      removeAnswers();
      toast.success('问卷提交成功！');
    } catch (err: any) {
      console.error('Failed to submit survey:', err);
      if (err?.message?.includes('used')) {
        toast.error('此问卷链接已被使用');
      } else {
        toast.error('提交失败，请稍后重试');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载问卷中...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">无法加载问卷</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">提交成功</h2>
          <p className="text-muted-foreground">感谢您的参与！</p>
        </div>
      </div>
    );
  }

  // Main survey form
  return (
    <div className="min-h-screen bg-background py-4 sm:py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <SurveyHeader
          title={surveyData?.title || ''}
          description={surveyData?.description || ''}
          progress={progress}
        />

        <div className="space-y-4 sm:space-y-6">
          {surveyData?.questions?.map((question, index) => {
            // Check if this question has prefill data
            const isPrefilled = !!(
              question.prefill_key && 
              surveyData.prefill_data?.[question.prefill_key]
            );
            
            return (
              <QuestionRenderer
                key={question.id}
                question={question}
                value={answers[question.id]?.value}
                error={errors[question.id]}
                onChange={onChangeHandlers[question.id]}
                questionNumber={index + 1}
                readonly={isPrefilled}
              />
            );
          })}
        </div>

        <SubmitButton
          isLoading={isSubmitting}
          disabled={!surveyData?.questions || surveyData.questions.length === 0}
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
}
