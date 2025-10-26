'use client';

import { memo, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';

interface TextQuestionProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  readonly?: boolean;
}

export const TextQuestion = memo(function TextQuestion({
  value = '',
  onChange,
  placeholder = '请输入答案',
  maxLength = 500,
  readonly = false,
}: TextQuestionProps) {
  const charCount = value.length;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  }, [maxLength, onChange]);

  const charCountColor = useMemo(() => 
    charCount > maxLength * 0.9 ? 'text-destructive' : 'text-muted-foreground',
    [charCount, maxLength]
  );

  return (
    <div className="space-y-2">
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full min-h-[44px] text-base"
        disabled={readonly}
        readOnly={readonly}
      />
      {!readonly && (
        <div className="flex justify-end">
          <span className={`text-xs ${charCountColor}`}>
            {charCount} / {maxLength}
          </span>
        </div>
      )}
    </div>
  );
});
