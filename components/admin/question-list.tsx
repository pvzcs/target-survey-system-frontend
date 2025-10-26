'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/types';
import { Button, Card, CardContent, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui';
import { GripVerticalIcon } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { questionsApi } from '@/lib/api/questions';
import { toast } from 'sonner';

interface QuestionListProps {
  questions: Question[];
  surveyId: number;
  onAddQuestion: () => void;
  onEditQuestion: (question: Question) => void;
  onQuestionDeleted?: (questionId: number) => void;
  onQuestionsReordered: (questions: Question[]) => void;
}

interface SortableQuestionItemProps {
  question: Question;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableQuestionItem({ question, index, onEdit, onDelete }: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: '填空题',
      single: '单选题',
      multiple: '多选题',
      table: '表格题',
    };
    return labels[type] || type;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg p-3 sm:p-4 bg-card hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <button
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none min-h-[44px] min-w-[44px] flex items-center justify-center sm:min-h-0 sm:min-w-0"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-5" />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">
              {index + 1}.
            </span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {getQuestionTypeLabel(question.type)}
            </span>
            {question.required && (
              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">
                必填
              </span>
            )}
          </div>
          <h4 className="font-medium text-foreground break-words">{question.title}</h4>
          {question.description && (
            <p className="text-sm text-muted-foreground mt-1 break-words">
              {question.description}
            </p>
          )}
          
          {/* Mobile buttons - shown below content on small screens */}
          <div className="flex gap-2 mt-3 sm:hidden">
            <Button variant="outline" size="sm" onClick={onEdit} className="flex-1 min-h-[44px]">
              编辑
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete} className="flex-1 min-h-[44px]">
              删除
            </Button>
          </div>
        </div>
        
        {/* Desktop buttons - shown on the right on larger screens */}
        <div className="hidden sm:flex gap-2 ml-4">
          <Button variant="outline" size="sm" onClick={onEdit}>
            编辑
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            删除
          </Button>
        </div>
      </div>
    </div>
  );
}

export function QuestionList({ questions, surveyId, onAddQuestion, onEditQuestion, onQuestionDeleted, onQuestionsReordered }: QuestionListProps) {
  const [localQuestions, setLocalQuestions] = useState(questions);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync local questions with prop changes
  useEffect(() => {
    setLocalQuestions(questions);
  }, [questions]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localQuestions.findIndex((q) => q.id === active.id);
      const newIndex = localQuestions.findIndex((q) => q.id === over.id);

      const reorderedQuestions = arrayMove(localQuestions, oldIndex, newIndex);
      setLocalQuestions(reorderedQuestions);

      try {
        await questionsApi.reorder(surveyId, reorderedQuestions.map(q => q.id));
        onQuestionsReordered(reorderedQuestions);
        toast.success('题目顺序已更新');
      } catch (error) {
        setLocalQuestions(localQuestions);
        toast.error('更新题目顺序失败');
        console.error('Failed to reorder questions:', error);
      }
    }
  };

  const handleDeleteClick = (question: Question) => {
    setQuestionToDelete(question);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!questionToDelete) return;

    setIsDeleting(true);
    try {
      await questionsApi.delete(questionToDelete.id);
      toast.success('题目已删除');
      
      // Notify parent component
      if (onQuestionDeleted) {
        onQuestionDeleted(questionToDelete.id);
      } else {
        // Fallback: update local state
        const updatedQuestions = localQuestions.filter(q => q.id !== questionToDelete.id);
        setLocalQuestions(updatedQuestions);
        onQuestionsReordered(updatedQuestions);
      }
      
      setDeleteDialogOpen(false);
      setQuestionToDelete(null);
    } catch (error) {
      toast.error('删除题目失败');
      console.error('Failed to delete question:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">题目列表</h3>
            <Button onClick={onAddQuestion}>添加题目</Button>
          </div>

          {localQuestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>暂无题目，点击"添加题目"开始创建</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localQuestions.map(q => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {localQuestions.map((question, index) => (
                    <SortableQuestionItem
                      key={question.id}
                      question={question}
                      index={index}
                      onEdit={() => onEditQuestion(question)}
                      onDelete={() => handleDeleteClick(question)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除题目"{questionToDelete?.title}"吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? '删除中...' : '删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
