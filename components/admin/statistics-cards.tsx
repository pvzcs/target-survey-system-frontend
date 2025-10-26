'use client';

import { Card } from '@/components/ui';

interface StatisticsCardsProps {
  totalResponses: number;
  completionRate: number;
}

export function StatisticsCards({ totalResponses, completionRate }: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-medium text-gray-600">总填答数</span>
          <span className="text-3xl sm:text-4xl font-bold mt-2">{totalResponses}</span>
        </div>
      </Card>
      
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-medium text-gray-600">完成率</span>
          <span className="text-3xl sm:text-4xl font-bold mt-2">{completionRate.toFixed(1)}%</span>
        </div>
      </Card>
    </div>
  );
}
