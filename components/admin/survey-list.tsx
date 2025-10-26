'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Survey } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { useToastContext } from '@/lib/contexts/toast-context';
import { surveysApi } from '@/lib/api/surveys';

interface SurveyListProps {
  surveys: Survey[];
  onDelete: (id: number) => void;
}

export function SurveyList({ surveys, onDelete }: SurveyListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<Survey | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { success, error } = useToastContext();

  const handleDeleteClick = (survey: Survey) => {
    setSurveyToDelete(survey);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!surveyToDelete) return;

    setIsDeleting(true);
    try {
      await surveysApi.delete(surveyToDelete.id);
      success('问卷删除成功');
      onDelete(surveyToDelete.id);
      setDeleteDialogOpen(false);
      setSurveyToDelete(null);
    } catch (err) {
      error('删除问卷失败，请重试');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (surveys.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">暂无问卷</p>
        <Link href="/admin/surveys/new">
          <Button>创建第一个问卷</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {surveys.map((survey) => (
              <TableRow key={survey.id}>
                <TableCell className="font-medium">{survey.title}</TableCell>
                <TableCell className="max-w-md truncate">
                  {survey.description || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={survey.status === 'published' ? 'default' : 'secondary'}>
                    {survey.status === 'published' ? '已发布' : '草稿'}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(survey.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/surveys/${survey.id}/edit`}>
                      <Button variant="outline" size="sm">
                        编辑
                      </Button>
                    </Link>
                    {survey.status === 'published' && (
                      <>
                        <Link href={`/admin/surveys/${survey.id}/data`}>
                          <Button variant="outline" size="sm">
                            查看数据
                          </Button>
                        </Link>
                        <Link href={`/admin/surveys/${survey.id}/statistics`}>
                          <Button variant="outline" size="sm">
                            查看统计
                          </Button>
                        </Link>
                      </>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(survey)}
                    >
                      删除
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View - Shown only on mobile */}
      <div className="md:hidden space-y-4">
        {surveys.map((survey) => (
          <div key={survey.id} className="border rounded-lg p-4 bg-card">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-base flex-1">{survey.title}</h3>
                <Badge variant={survey.status === 'published' ? 'default' : 'secondary'}>
                  {survey.status === 'published' ? '已发布' : '草稿'}
                </Badge>
              </div>
              
              {survey.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {survey.description}
                </p>
              )}
              
              <p className="text-xs text-muted-foreground">
                {formatDate(survey.created_at)}
              </p>
              
              <div className="flex flex-col gap-2 pt-2">
                <Link href={`/admin/surveys/${survey.id}/edit`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full min-h-[44px]">
                    编辑
                  </Button>
                </Link>
                {survey.status === 'published' && (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/admin/surveys/${survey.id}/data`}>
                      <Button variant="outline" size="sm" className="w-full min-h-[44px]">
                        查看数据
                      </Button>
                    </Link>
                    <Link href={`/admin/surveys/${survey.id}/statistics`}>
                      <Button variant="outline" size="sm" className="w-full min-h-[44px]">
                        查看统计
                      </Button>
                    </Link>
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(survey)}
                  className="w-full min-h-[44px]"
                >
                  删除
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除问卷 "{surveyToDelete?.title}" 吗？此操作无法撤销。
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
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
