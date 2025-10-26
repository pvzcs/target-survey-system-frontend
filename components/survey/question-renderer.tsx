'use client';

import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { TextQuestion } from './text-question';
import { SingleQuestion } from './single-question';
import { MultipleQuestion } from './multiple-question';
import { TableQuestion } from './table-question';
import type { Question, AnswerValue } from '@/types';

interface QuestionRendererProps {
  question: Question;
  value?: AnswerValue;
  error?: string;
  onChange: (value: AnswerValue) => void;
  questionNumber: number;
  readonly?: boolean;
}

export const QuestionRenderer = memo(function QuestionRenderer({
  question,
  value,
  error,
  onChange,
  questionNumber,
  readonly = false,
}: QuestionRendererProps) {
  const renderQuestionComponent = () => {
    switch (question.type) {
      case 'text':
        return (
          <TextQuestion
            value={value as string}
            onChange={onChange}
            placeholder="请输入答案"
            readonly={readonly}
          />
        );
      case 'single':
        return (
          <SingleQuestion
            options={question.config.options || []}
            value={value as string}
            onChange={onChange}
            readonly={readonly}
          />
        );
      case 'multiple':
        return (
          <MultipleQuestion
            options={question.config.options || []}
            value={value as string[]}
            onChange={onChange}
            readonly={readonly}
          />
        );
      case 'table':
        return (
          <TableQuestion
            columns={question.config.columns || []}
            minRows={question.config.min_rows || 1}
            maxRows={question.config.max_rows}
            canAddRow={question.config.can_add_row ?? true}
            value={value as string[][]}
            onChange={onChange}
            readonly={readonly}
          />
        );
      default:
        return <div className="text-muted-foreground">不支持的题目类型</div>;
    }
  };

  return (
    <Card
      id={`question-${question.id}`}
      className={`p-4 sm:p-6 ${error ? 'border-destructive' : ''} ${readonly ? 'bg-muted/30' : ''}`}
    >
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-start gap-2 break-words">
          <span className="text-muted-foreground flex-shrink-0">{questionNumber}.</span>
          <span className="flex-1">
            {question.title}
            {question.required && !readonly && (
              <span className="text-destructive text-sm ml-1">*</span>
            )}
            {readonly && (
              <span className="text-xs text-muted-foreground ml-2 font-normal">(已预填)</span>
            )}
          </span>
        </h3>
        {question.description && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
            {question.description}
          </p>
        )}
      </div>

      {renderQuestionComponent()}

      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </Card>
  );
});
