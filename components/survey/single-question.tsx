'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface SingleQuestionProps {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  readonly?: boolean;
}

export function SingleQuestion({ options, value, onChange, readonly = false }: SingleQuestionProps) {
  return (
    <RadioGroup value={value} onValueChange={readonly ? undefined : onChange} disabled={readonly}>
      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-3 min-h-[44px]">
            <RadioGroupItem 
              value={option} 
              id={`option-${index}`} 
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
    </RadioGroup>
  );
}
