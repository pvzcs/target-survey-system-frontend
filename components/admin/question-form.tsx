'use client';

import { useState } from 'react';
import { Question, QuestionType, QuestionConfig } from '@/types';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, Checkbox } from '@/components/ui';
import { SingleMultipleConfig } from './question-config-single-multiple';
import { TableConfig } from './question-config-table';

interface QuestionFormProps {
  question?: Question;
  surveyId: number;
  onSave: (data: Partial<Question>) => void;
  onCancel: () => void;
  isSaving?: boolean;
  nextOrder?: number; // The order value for new questions
}

export function QuestionForm({ question, surveyId, onSave, onCancel, isSaving = false, nextOrder = 0 }: QuestionFormProps) {
  const [type, setType] = useState<QuestionType>(question?.type || 'text');
  const [title, setTitle] = useState(question?.title || '');
  const [description, setDescription] = useState(question?.description || '');
  const [required, setRequired] = useState(question?.required || false);
  const [prefillKey, setPrefillKey] = useState(question?.prefill_key || '');
  const [config, setConfig] = useState(question?.config || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    const questionData: Partial<Question> = {
      survey_id: surveyId,
      type,
      title: title.trim(),
      description: description.trim(),
      required,
      prefill_key: prefillKey.trim(),
      config,
      order: question?.order ?? nextOrder,
    };

    onSave(questionData);
  };

  const questionTypeOptions = [
    { value: 'text', label: '填空题' },
    { value: 'single', label: '单选题' },
    { value: 'multiple', label: '多选题' },
    { value: 'table', label: '表格题' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question Type */}
      <div className="space-y-2">
        <Label htmlFor="type">题目类型 *</Label>
        <Select value={type} onValueChange={(value) => setType(value as QuestionType)}>
          <SelectTrigger id="type" className="w-full">
            <SelectValue placeholder="选择题目类型" />
          </SelectTrigger>
          <SelectContent>
            {questionTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">题目标题 *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入题目标题"
          maxLength={200}
          required
        />
        <p className="text-xs text-muted-foreground">{title.length}/200</p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">题目描述</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="请输入题目描述（可选）"
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">{description.length}/500</p>
      </div>

      {/* Required */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="required"
          checked={required}
          onCheckedChange={(checked) => setRequired(checked as boolean)}
        />
        <Label htmlFor="required" className="cursor-pointer">
          必填题目
        </Label>
      </div>

      {/* Prefill Key */}
      <div className="space-y-2">
        <Label htmlFor="prefillKey">预填字段键名</Label>
        <Input
          id="prefillKey"
          value={prefillKey}
          onChange={(e) => setPrefillKey(e.target.value)}
          placeholder="例如: user_name, email"
          maxLength={50}
        />
        <p className="text-xs text-muted-foreground">
          用于生成分享链接时预填此题目的答案
        </p>
      </div>

      {/* Type-specific Configuration */}
      {(type === 'single' || type === 'multiple') && (
        <SingleMultipleConfig
          options={config.options || []}
          onChange={(options: string[]) => setConfig({ ...config, options })}
        />
      )}

      {type === 'table' && (
        <TableConfig
          columns={config.columns || []}
          minRows={config.min_rows || 1}
          maxRows={config.max_rows || 10}
          canAddRow={config.can_add_row !== false}
          onChange={(tableConfig: Partial<QuestionConfig>) => setConfig({ ...config, ...tableConfig })}
        />
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          取消
        </Button>
        <Button type="submit" disabled={isSaving || !title.trim()}>
          {isSaving ? '保存中...' : question ? '更新题目' : '创建题目'}
        </Button>
      </div>
    </form>
  );
}
