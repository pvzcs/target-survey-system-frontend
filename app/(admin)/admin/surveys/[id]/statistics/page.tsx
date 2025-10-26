'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { StatisticsCards } from '@/components/admin/statistics-cards';
import { StatisticsCharts } from '@/components/admin/statistics-charts';
import { surveysApi } from '@/lib/api/surveys';
import type { Statistics } from '@/types';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

export default function SurveyStatisticsPage() {
  const params = useParams();
  const surveyId = Number(params.id);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatistics = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const data = await surveysApi.getStatistics(surveyId);
      setStatistics(data);
      
      if (showRefreshToast) {
        toast.success('统计数据已刷新');
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      toast.error('获取统计数据失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [surveyId]);

  const handleRefresh = () => {
    fetchStatistics(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">加载中...</div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">统计分析</h1>
          <Link href="/admin/surveys">
            <Button variant="outline">返回列表</Button>
          </Link>
        </div>
        <div className="text-center py-12 text-gray-500">
          暂无统计数据
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">统计分析</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex-1 sm:flex-none min-h-[44px]"
          >
            {refreshing ? '刷新中...' : '刷新数据'}
          </Button>
          <Link href="/admin/surveys" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full min-h-[44px]">返回列表</Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatisticsCards 
        totalResponses={statistics.total_responses}
        completionRate={statistics.completion_rate}
      />

      {/* Statistics Charts */}
      {statistics.question_statistics && statistics.question_statistics.length > 0 ? (
        <StatisticsCharts questionStatistics={statistics.question_statistics} />
      ) : (
        <div className="text-center py-12 text-gray-500">
          暂无题目统计数据
        </div>
      )}
    </div>
  );
}
