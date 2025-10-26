'use client';

import { useState } from 'react';
import { Button, Input, Label, Textarea, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface SurveyFormData {
  title: string;
  description: string;
}

interface SurveyFormProps {
  initialData?: SurveyFormData;
  onSubmit: (data: SurveyFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function SurveyForm({ 
  initialData = { title: '', description: '' }, 
  onSubmit, 
  onCancel,
  submitLabel = '保存'
}: SurveyFormProps) {
  const [formData, setFormData] = useState<SurveyFormData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof SurveyFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SurveyFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = '标题不能为空';
    } else if (formData.title.length > 200) {
      newErrors.title = '标题不能超过 200 个字符';
    }

    if (formData.description.length > 5000) {
      newErrors.description = '描述不能超过 5000 个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, title: e.target.value });
    if (errors.title) {
      setErrors({ ...errors, title: undefined });
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, description: e.target.value });
    if (errors.description) {
      setErrors({ ...errors, description: undefined });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>问卷信息</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              标题 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="请输入问卷标题"
              maxLength={200}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {formData.title.length} / 200
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="请输入问卷描述（可选）"
              rows={4}
              maxLength={5000}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {formData.description.length} / 5000
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="w-full sm:w-auto min-h-[44px]"
              >
                取消
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto min-h-[44px]">
              {isSubmitting ? '保存中...' : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
