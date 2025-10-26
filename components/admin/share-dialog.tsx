'use client';

import { useState } from 'react';
import { Survey, Question, ShareLink } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { surveysApi } from '@/lib/api/surveys';
import { toast } from 'sonner';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  survey: Survey;
}

export function ShareDialog({ open, onOpenChange, survey }: ShareDialogProps) {
  const [prefillData, setPrefillData] = useState<Record<string, string>>({});
  const [expiresIn, setExpiresIn] = useState<string>('1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<ShareLink | null>(null);

  // Get questions with prefill keys
  const prefillQuestions = (survey.questions || []).filter(
    (q: Question) => q.prefill_key && q.prefill_key.trim() !== ''
  );

  const handlePrefillChange = (key: string, value: string) => {
    setPrefillData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));

      const link = await surveysApi.share(survey.id, {
        prefill_data: Object.keys(prefillData).length > 0 ? prefillData : undefined,
        expires_at: expiresAt.toISOString(),
      });

      setGeneratedLink(link);
      toast.success('分享链接生成成功');
    } catch (err) {
      toast.error('生成分享链接失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!generatedLink) return;

    try {
      await navigator.clipboard.writeText(generatedLink.url);
      toast.success('链接已复制到剪贴板');
    } catch (err) {
      toast.error('复制失败，请手动复制');
    }
  };

  const handleClose = () => {
    setPrefillData({});
    setExpiresIn('1');
    setGeneratedLink(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>生成分享链接</DialogTitle>
          <DialogDescription>
            为问卷 "{survey.title}" 生成一个加密的分享链接
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Prefill data form */}
          {prefillQuestions.length > 0 && !generatedLink && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">预填数据（可选）</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  为以下题目设置预填值，用户打开链接时将自动填充
                </p>
              </div>

              {prefillQuestions.map((question: Question) => (
                <div key={question.id} className="space-y-2">
                  <Label htmlFor={`prefill-${question.id}`}>
                    {question.title}
                    <span className="text-xs text-muted-foreground ml-2">
                      (键名: {question.prefill_key})
                    </span>
                  </Label>
                  <Input
                    id={`prefill-${question.id}`}
                    value={prefillData[question.prefill_key] || ''}
                    onChange={(e) => handlePrefillChange(question.prefill_key, e.target.value)}
                    placeholder={`输入 ${question.title} 的预填值`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Expiration time selector */}
          {!generatedLink && (
            <div className="space-y-2">
              <Label htmlFor="expires-in">链接有效期</Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger id="expires-in">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 小时</SelectItem>
                  <SelectItem value="6">6 小时</SelectItem>
                  <SelectItem value="12">12 小时</SelectItem>
                  <SelectItem value="24">24 小时</SelectItem>
                  <SelectItem value="72">3 天</SelectItem>
                  <SelectItem value="168">7 天</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Generated link display */}
          {generatedLink && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>生成的链接</Label>
                <div className="flex gap-2">
                  <Input
                    value={generatedLink.url}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={handleCopyLink} variant="outline">
                    复制
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>过期时间</Label>
                <Input
                  value={new Date(generatedLink.expires_at).toLocaleString('zh-CN')}
                  readOnly
                  className="text-sm"
                />
              </div>

              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm text-muted-foreground">
                  ✓ 链接已生成成功！此链接只能使用一次，过期后将失效。
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          {!generatedLink ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? '生成中...' : '生成链接'}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>
              关闭
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
