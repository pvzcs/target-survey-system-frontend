'use client';

import { useRouter } from 'next/navigation';
import { SurveyForm } from '@/components/admin/survey-form';
import { surveysApi } from '@/lib/api/surveys';
import { useToastContext } from '@/lib/contexts/toast-context';

export const dynamic = 'force-dynamic';

export default function NewSurveyPage() {
  const router = useRouter();
  const { success, error } = useToastContext();

  const handleSubmit = async (data: { title: string; description: string }) => {
    try {
      const survey = await surveysApi.create(data);
      success('问卷创建成功');
      router.push(`/admin/surveys/${survey.id}/edit`);
    } catch (err) {
      error('创建问卷失败，请重试');
      throw err;
    }
  };

  const handleCancel = () => {
    router.push('/admin/surveys');
  };

  return (
    <div className="container mx-auto py-4 sm:py-6 max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">创建问卷</h1>
      <SurveyForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="创建"
      />
    </div>
  );
}
