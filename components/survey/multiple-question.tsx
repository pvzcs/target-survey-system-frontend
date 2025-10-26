'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface MultipleQuestionProps {
  options: string[];
  value?: string[];
  onChange: (value: string[]) => void;
  readonly?: boolean;
}

export function MultipleQuestion({ options, value = [], onChange, readonly = false }: MultipleQuestionProps) {
  const handleCheckChange = (option: string, checked: boolean) => {
    if (readonly) return;
    if (checked) {
      onChange([...value, option]);
    } else {
      onChange(value.filter((v) => v !== option));
    }
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <div key={index} className="flex items-center space-x-3 min-h-[44px]">
          <Checkbox
            id={`option-${index}`}
            checked={value.includes(option)}
            onCheckedChange={(checked) => handleCheckChange(option, checked as boolean)}
            className="min-h-[24px] min-w-[24px]"
            disabled={readonly}
          />
          <Label
            htmlFor={`option-${index}`}
            className={`text-sm sm:text-base font-normal flex-1 py-2 break-words ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            {option}
          </Label>
        </div>
      ))}
    </div>
  );
}
