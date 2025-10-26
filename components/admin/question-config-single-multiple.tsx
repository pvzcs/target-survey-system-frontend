'use client';

import { useState } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { PlusIcon, XIcon } from 'lucide-react';

interface SingleMultipleConfigProps {
  options: string[];
  onChange: (options: string[]) => void;
}

export function SingleMultipleConfig({ options, onChange }: SingleMultipleConfigProps) {
  const [localOptions, setLocalOptions] = useState<string[]>(
    options.length > 0 ? options : ['']
  );

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...localOptions];
    newOptions[index] = value;
    setLocalOptions(newOptions);
    onChange(newOptions.filter(opt => opt.trim() !== ''));
  };

  const handleAddOption = () => {
    const newOptions = [...localOptions, ''];
    setLocalOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (localOptions.length <= 1) return;
    const newOptions = localOptions.filter((_, i) => i !== index);
    setLocalOptions(newOptions);
    onChange(newOptions.filter(opt => opt.trim() !== ''));
  };

  return (
    <div className="space-y-3">
      <Label>选项列表 *</Label>
      <div className="space-y-2">
        {localOptions.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-8">
              {index + 1}.
            </span>
            <Input
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`选项 ${index + 1}`}
              maxLength={200}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveOption(index)}
              disabled={localOptions.length <= 1}
              className="shrink-0"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddOption}
        className="w-full"
      >
        <PlusIcon className="size-4 mr-2" />
        添加选项
      </Button>
      <p className="text-xs text-muted-foreground">
        至少需要一个选项，每个选项最多 200 个字符
      </p>
    </div>
  );
}
