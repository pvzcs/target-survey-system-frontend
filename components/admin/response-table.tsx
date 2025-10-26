'use client';

import { Response, Question } from '@/types';
import { formatDate, formatAnswerValue } from '@/lib/utils/format';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ResponseTableProps {
  responses: Response[];
  questions: Question[];
}

export function ResponseTable({ responses, questions }: ResponseTableProps) {
  if (responses.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">暂无填答记录</p>
      </div>
    );
  }

  // Get answer for a specific question from a response
  const getAnswer = (response: Response, questionId: number) => {
    const answer = response.data.answers.find(
      (a) => a.question_id === questionId
    );
    return answer ? answer.value : null;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Mobile hint */}
      <div className="md:hidden bg-muted/50 px-4 py-2 text-xs text-muted-foreground border-b">
        提示：左右滑动查看更多内容
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] sm:w-[100px] sticky left-0 bg-background z-10">ID</TableHead>
              <TableHead className="w-[140px] sm:w-[180px]">提交时间</TableHead>
              <TableHead className="w-[120px] sm:w-[140px]">IP 地址</TableHead>
              {questions.map((question) => (
                <TableHead key={question.id} className="min-w-[180px] sm:min-w-[200px]">
                  <div className="line-clamp-2">{question.title}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((response) => (
              <TableRow key={response.id}>
                <TableCell className="font-medium sticky left-0 bg-background z-10">{response.id}</TableCell>
                <TableCell className="text-xs sm:text-sm">{formatDate(response.submitted_at)}</TableCell>
                <TableCell className="font-mono text-xs sm:text-sm">
                  {response.ip_address}
                </TableCell>
                {questions.map((question) => {
                  const value = getAnswer(response, question.id);
                  const formattedValue = value !== null ? formatAnswerValue(value) : '-';
                  
                  return (
                    <TableCell key={question.id}>
                      {question.type === 'table' ? (
                        <pre className="text-xs whitespace-pre-wrap font-mono max-w-[300px]">
                          {formattedValue}
                        </pre>
                      ) : (
                        <span className="whitespace-pre-wrap text-xs sm:text-sm">
                          {formattedValue}
                        </span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
