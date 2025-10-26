'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function SubmitButton({ isLoading, disabled, onClick }: SubmitButtonProps) {
  return (
    <div className="flex justify-center mt-6 sm:mt-8 pb-4">
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        size="lg"
        className="w-full sm:w-auto sm:min-w-[200px] min-h-[48px] text-base"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            提交中...
          </>
        ) : (
          '提交问卷'
        )}
      </Button>
    </div>
  );
}
