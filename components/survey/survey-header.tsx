'use client';

import { Progress } from '@/components/ui/progress';

interface SurveyHeaderProps {
  title: string;
  description: string;
  progress: number;
}

export function SurveyHeader({ title, description, progress }: SurveyHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">{title}</h1>
      {description && (
        <p className="text-sm sm:text-base text-muted-foreground mb-4 break-words">{description}</p>
      )}
      <div className="space-y-2">
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
          <span>填写进度</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}
