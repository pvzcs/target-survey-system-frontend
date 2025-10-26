'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Survey } from '@/types';
import { Button } from '@/components/ui';
import { SurveyList } from '@/components/admin/survey-list';
import { Pagination } from '@/components/admin/pagination';
import { surveysApi } from '@/lib/api/surveys';
import { useToastContext } from '@/lib/contexts/toast-context';

export const dynamic = 'force-dynamic';

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { error } = useToastContext();

  const pageSize = 20;

  const fetchSurveys = async (page: number) => {
    setIsLoading(true);
    try {
      const data = await surveysApi.list(page, pageSize);
      setSurveys(data);
      // Calculate total pages based on response
      // Note: API should return pagination metadata, but for now we'll estimate
      setTotalPages(data.length === pageSize ? page + 1 : page);
    } catch (err) {
      error('加载问卷列表失败');
      setSurveys([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = (id: number) => {
    setSurveys((prev) => prev.filter((survey) => survey.id !== id));
  };

  return (
    <div className="container mx-auto py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">问卷列表</h1>
        <Link href="/admin/surveys/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto min-h-[44px]">创建问卷</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : (
        <>
          <SurveyList surveys={surveys} onDelete={handleDelete} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
