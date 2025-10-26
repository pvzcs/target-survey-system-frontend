'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Survey, Question } from '@/types';
import { Button, Separator } from '@/components/ui';
import { SurveyForm } from '@/components/admin/survey-form';
import { QuestionList } from '@/components/admin/question-list';
import { QuestionDialog } from '@/components/admin/question-dialog';
import { ShareDialog } from '@/components/admin/share-dialog';
import { surveysApi } from '@/lib/api/surveys';
import { toast } from 'sonner';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function EditSurveyPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = parseInt(params.id as string);

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(undefined);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const data = await surveysApi.get(surveyId);
        setSurvey(data);
      } catch (err) {
        toast.error('加载问卷失败');
        router.push('/admin/surveys');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId, router]);

  const handleUpdate = async (data: { title: string; description: string }) => {
    try {
      const updated = await surveysApi.update(surveyId, data);
      setSurvey(updated);
      toast.success('问卷更新成功');
    } catch (err) {
      toast.error('更新问卷失败，请重试');
      throw err;
    }
  };

  const handlePublish = async () => {
    if (!survey) return;

    // Validate that survey has at least one question
    if (!survey.questions || survey.questions.length === 0) {
      toast.error('问卷至少需要包含一个题目才能发布');
      return;
    }

    setIsPublishing(true);
    try {
      await surveysApi.publish(surveyId);
      const updated = await surveysApi.get(surveyId);
      setSurvey(updated);
      toast.success('问卷发布成功');
    } catch (err) {
      toast.error('发布问卷失败，请重试');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(undefined);
    setQuestionDialogOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionDialogOpen(true);
  };

  const handleQuestionSuccess = async (question: Question) => {
    // Refresh survey data to get updated questions list
    try {
      const updated = await surveysApi.get(surveyId);
      setSurvey(updated);
    } catch (err) {
      toast.error('刷新问卷数据失败');
    }
  };

  const handleQuestionsReordered = (questions: Question[]) => {
    if (survey) {
      setSurvey({ ...survey, questions });
    }
  };

  const handleCancel = () => {
    router.push('/admin/surveys');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-center text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (!survey) {
    return null;
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">编辑问卷</h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {survey.status === 'draft' && (
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              variant="default"
              className="flex-1 sm:flex-none min-h-[44px]"
            >
              {isPublishing ? '发布中...' : '发布问卷'}
            </Button>
          )}
          {survey.status === 'published' && (
            <>
              <Button
                onClick={() => setShareDialogOpen(true)}
                variant="outline"
                className="flex-1 sm:flex-none min-h-[44px]"
              >
                生成分享链接
              </Button>
              <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-md">
                已发布
              </span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <SurveyForm
          initialData={{
            title: survey.title,
            description: survey.description,
          }}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
          submitLabel="更新"
        />

        <Separator />

        <QuestionList
          questions={survey.questions || []}
          surveyId={surveyId}
          onAddQuestion={handleAddQuestion}
          onEditQuestion={handleEditQuestion}
          onQuestionsReordered={handleQuestionsReordered}
        />
      </div>

      <QuestionDialog
        open={questionDialogOpen}
        onOpenChange={setQuestionDialogOpen}
        question={editingQuestion}
        surveyId={surveyId}
        onSuccess={handleQuestionSuccess}
        nextOrder={survey.questions?.length || 0}
      />

      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        survey={survey}
      />
    </div>
  );
}
