'use client';

import { useState } from 'react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox } from '@/components/ui';
import { PlusIcon, XIcon } from 'lucide-react';
import { TableColumn, ColumnType } from '@/types';

interface TableConfigProps {
  columns: TableColumn[];
  minRows: number;
  maxRows: number;
  canAddRow: boolean;
  onChange: (config: {
    columns: TableColumn[];
    min_rows: number;
    max_rows: number;
    can_add_row: boolean;
  }) => void;
}

export function TableConfig({ columns, minRows, maxRows, canAddRow, onChange }: TableConfigProps) {
  const [localColumns, setLocalColumns] = useState<TableColumn[]>(
    columns.length > 0 ? columns : [{ id: crypto.randomUUID(), type: 'text', label: '' }]
  );
  const [localMinRows, setLocalMinRows] = useState(minRows);
  const [localMaxRows, setLocalMaxRows] = useState(maxRows);
  const [localCanAddRow, setLocalCanAddRow] = useState(canAddRow);

  const updateConfig = (
    newColumns: TableColumn[],
    newMinRows: number,
    newMaxRows: number,
    newCanAddRow: boolean
  ) => {
    onChange({
      columns: newColumns,
      min_rows: newMinRows,
      max_rows: newMaxRows,
      can_add_row: newCanAddRow,
    });
  };

  const handleColumnChange = (index: number, field: keyof TableColumn, value: any) => {
    const newColumns = [...localColumns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setLocalColumns(newColumns);
    updateConfig(newColumns, localMinRows, localMaxRows, localCanAddRow);
  };

  const handleAddColumn = () => {
    const newColumns = [...localColumns, { id: crypto.randomUUID(), type: 'text' as ColumnType, label: '' }];
    setLocalColumns(newColumns);
    updateConfig(newColumns, localMinRows, localMaxRows, localCanAddRow);
  };

  const handleRemoveColumn = (index: number) => {
    if (localColumns.length <= 1) return;
    const newColumns = localColumns.filter((_, i) => i !== index);
    setLocalColumns(newColumns);
    updateConfig(newColumns, localMinRows, localMaxRows, localCanAddRow);
  };

  const handleMinRowsChange = (value: number) => {
    const newValue = Math.max(1, Math.min(value, localMaxRows));
    setLocalMinRows(newValue);
    updateConfig(localColumns, newValue, localMaxRows, localCanAddRow);
  };

  const handleMaxRowsChange = (value: number) => {
    const newValue = Math.max(localMinRows, Math.min(value, 100));
    setLocalMaxRows(newValue);
    updateConfig(localColumns, localMinRows, newValue, localCanAddRow);
  };

  const handleCanAddRowChange = (checked: boolean) => {
    setLocalCanAddRow(checked);
    updateConfig(localColumns, localMinRows, localMaxRows, checked);
  };

  const handleColumnOptionsChange = (index: number, optionsText: string) => {
    const options = optionsText.split('\n').map(opt => opt.trim()).filter(opt => opt !== '');
    handleColumnChange(index, 'options', options);
  };

  const columnTypeOptions = [
    { value: 'text', label: '文本' },
    { value: 'number', label: '数字' },
    { value: 'select', label: '下拉选择' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>列配置 *</Label>
        <div className="space-y-3">
          {localColumns.map((column, index) => (
            <div key={column.id} className="border rounded-lg p-4 space-y-3 bg-card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">列 {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveColumn(index)}
                  disabled={localColumns.length <= 1}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`column-label-${index}`}>列标签</Label>
                  <Input
                    id={`column-label-${index}`}
                    value={column.label}
                    onChange={(e) => handleColumnChange(index, 'label', e.target.value)}
                    placeholder="例如: 姓名"
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`column-type-${index}`}>列类型</Label>
                  <Select
                    value={column.type}
                    onValueChange={(value) => handleColumnChange(index, 'type', value as ColumnType)}
                  >
                    <SelectTrigger id={`column-type-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columnTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {column.type === 'select' && (
                <div className="space-y-2">
                  <Label htmlFor={`column-options-${index}`}>下拉选项（每行一个）</Label>
                  <textarea
                    id={`column-options-${index}`}
                    value={(column.options || []).join('\n')}
                    onChange={(e) => handleColumnOptionsChange(index, e.target.value)}
                    placeholder="选项1&#10;选项2&#10;选项3"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background text-foreground"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddColumn}
          className="w-full"
        >
          <PlusIcon className="size-4 mr-2" />
          添加列
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minRows">最小行数</Label>
          <Input
            id="minRows"
            type="number"
            min={1}
            max={localMaxRows}
            value={localMinRows}
            onChange={(e) => handleMinRowsChange(parseInt(e.target.value) || 1)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxRows">最大行数</Label>
          <Input
            id="maxRows"
            type="number"
            min={localMinRows}
            max={100}
            value={localMaxRows}
            onChange={(e) => handleMaxRowsChange(parseInt(e.target.value) || 10)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="canAddRow"
          checked={localCanAddRow}
          onCheckedChange={(checked) => handleCanAddRowChange(checked as boolean)}
        />
        <Label htmlFor="canAddRow" className="cursor-pointer">
          允许用户添加行
        </Label>
      </div>

      <p className="text-xs text-muted-foreground">
        表格题至少需要一列，行数范围为 1-100
      </p>
    </div>
  );
}
