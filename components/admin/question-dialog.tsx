'use client';

import { useState } from 'react';
import { Question } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
import { QuestionForm } from './question-form';
import { questionsApi } from '@/lib/api/questions';
import { toast } from 'sonner';

interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: Question;
  surveyId: number;
  onSuccess: (question: Question) => void;
  nextOrder?: number; // The order value for new questions
}

export function QuestionDialog({ open, onOpenChange, question, surveyId, onSuccess, nextOrder = 0 }: QuestionDialogProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: Partial<Question>) => {
    setIsSaving(true);
    try {
      let savedQuestion: Question;
      
      if (question) {
        // Update existing question
        console.log('Updating question with data:', data);
        savedQuestion = await questionsApi.update(question.id, data);
        toast.success('题目已更新');
      } else {
        // Create new question
        console.log('Creating question with data:', data);
        savedQuestion = await questionsApi.create(data as Omit<Question, 'id' | 'created_at' | 'updated_at'>);
        toast.success('题目已创建');
      }
      
      onSuccess(savedQuestion);
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error?.message || '操作失败';
      toast.error(errorMessage);
      console.error('Failed to save question:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Reset saving state when dialog closes
    if (!newOpen) {
      setIsSaving(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {question ? '编辑题目' : '创建题目'}
          </DialogTitle>
        </DialogHeader>
        <QuestionForm
          key={question?.id || 'new'}
          question={question}
          surveyId={surveyId}
          onSave={handleSave}
          onCancel={() => onOpenChange(false)}
          isSaving={isSaving}
          nextOrder={nextOrder}
        />
      </DialogContent>
    </Dialog>
  );
}
