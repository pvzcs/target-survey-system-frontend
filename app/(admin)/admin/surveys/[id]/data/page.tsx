'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Survey, Response } from '@/types';
import { Button } from '@/components/ui';
import { ResponseTable } from '@/components/admin/response-table';
import { Pagination } from '@/components/admin/pagination';
import { surveysApi } from '@/lib/api/surveys';
import { useToastContext } from '@/lib/contexts/toast-context';

export const dynamic = 'force-dynamic';

export default function SurveyDataPage() {
  const params = useParams();
  const surveyId = Number(params.id);
  const { error, success } = useToastContext();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const pageSize = 20;

  const fetchSurvey = async () => {
    try {
      const data = await surveysApi.get(surveyId);
      setSurvey(data);
    } catch (err) {
      error('加载问卷信息失败');
    }
  };

  const fetchResponses = async (page: number) => {
    setIsLoading(true);
    try {
      const data = await surveysApi.getResponses(surveyId, page, pageSize);
      setResponses(data);
      // Calculate total pages based on response
      setTotalPages(data.length === pageSize ? page + 1 : page);
    } catch (err) {
      error('加载填答记录失败');
      setResponses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSurvey();
  }, [surveyId]);

  useEffect(() => {
    fetchResponses(currentPage);
  }, [currentPage, surveyId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    setIsExporting(true);
    try {
      const blob = await surveysApi.export(surveyId, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with survey title and current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `${survey?.title || 'survey'}_${date}.${format === 'csv' ? 'csv' : 'xlsx'}`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      success(`数据已导出为 ${format.toUpperCase()} 格式`);
    } catch (err) {
      error('导出数据失败');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto py-4 sm:py-6">
      <div className="flex flex-col gap-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">填答数据</h1>
            {survey && (
              <p className="text-sm sm:text-base text-muted-foreground mt-1 truncate">{survey.title}</p>
            )}
          </div>
          <Link href="/admin/surveys" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto min-h-[44px]">返回列表</Button>
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            disabled={isExporting || responses.length === 0}
            className="flex-1 sm:flex-none min-h-[44px]"
          >
            {isExporting ? '导出中...' : '导出 CSV'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('excel')}
            disabled={isExporting || responses.length === 0}
            className="flex-1 sm:flex-none min-h-[44px]"
          >
            {isExporting ? '导出中...' : '导出 Excel'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : (
        <>
          <ResponseTable
            responses={responses}
            questions={survey?.questions || []}
          />
          {responses.length > 0 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
