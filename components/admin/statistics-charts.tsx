'use client';

import { Card } from '@/components/ui';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { QuestionStatistics } from '@/types';

interface StatisticsChartsProps {
  questionStatistics: QuestionStatistics[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

export function StatisticsCharts({ questionStatistics }: StatisticsChartsProps) {
  if (!questionStatistics || questionStatistics.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        暂无统计数据
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {questionStatistics.map((stat) => {
        // Only show charts for single/multiple choice questions
        if (stat.question_type !== 'single' && stat.question_type !== 'multiple') {
          return (
            <Card key={stat.question_id} className="p-6">
              <h3 className="text-lg font-semibold mb-2">{stat.question_title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>题目类型: {getQuestionTypeLabel(stat.question_type)}</span>
                <span>填答率: {stat.response_rate.toFixed(1)}%</span>
                <span>回答数: {stat.response_count}</span>
              </div>
            </Card>
          );
        }

        // Prepare data for charts
        const chartData = stat.option_counts
          ? Object.entries(stat.option_counts).map(([name, value]) => ({
              name,
              value,
              percentage: stat.response_count > 0 ? ((value / stat.response_count) * 100).toFixed(1) : '0',
            }))
          : [];

        return (
          <Card key={stat.question_id} className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{stat.question_title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>题目类型: {getQuestionTypeLabel(stat.question_type)}</span>
                <span>填答率: {stat.response_rate.toFixed(1)}%</span>
                <span>回答数: {stat.response_count}</span>
              </div>
            </div>

            {chartData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-4 text-center">选项分布（饼图）</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value} 次`, '选择次数']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-4 text-center">选项分布（柱状图）</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`${value} 次`, '选择次数']} />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="选择次数">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function getQuestionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    text: '填空题',
    single: '单选题',
    multiple: '多选题',
    table: '表格题',
  };
  return labels[type] || type;
}
