'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import type { TableColumn } from '@/types';

interface TableQuestionProps {
  columns: TableColumn[];
  minRows?: number;
  maxRows?: number;
  canAddRow?: boolean;
  value?: string[][];
  onChange: (value: string[][]) => void;
  readonly?: boolean;
}

export function TableQuestion({
  columns,
  minRows = 1,
  maxRows,
  canAddRow = true,
  value = [],
  onChange,
  readonly = false,
}: TableQuestionProps) {
  // Initialize with minimum rows
  const [rows, setRows] = useState<string[][]>(() => {
    if (value && value.length > 0) {
      return value;
    }
    return Array(minRows).fill(null).map(() => Array(columns.length).fill(''));
  });

  useEffect(() => {
    if (value && value.length > 0) {
      setRows(value);
    }
  }, [value]);

  const handleCellChange = (rowIndex: number, colIndex: number, newValue: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = newValue;
    setRows(newRows);
    onChange(newRows);
  };

  const handleAddRow = () => {
    if (!maxRows || rows.length < maxRows) {
      const newRows = [...rows, Array(columns.length).fill('')];
      setRows(newRows);
      onChange(newRows);
    }
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (rows.length > minRows) {
      const newRows = rows.filter((_, index) => index !== rowIndex);
      setRows(newRows);
      onChange(newRows);
    }
  };

  const renderCell = (rowIndex: number, colIndex: number, column: TableColumn) => {
    const cellValue = rows[rowIndex]?.[colIndex] || '';

    switch (column.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={cellValue}
            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
            placeholder={`输入${column.label}`}
            className="w-full min-h-[44px] text-sm sm:text-base"
            disabled={readonly}
            readOnly={readonly}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={cellValue}
            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
            placeholder={`输入${column.label}`}
            className="w-full min-h-[44px] text-sm sm:text-base"
            disabled={readonly}
            readOnly={readonly}
          />
        );
      case 'select':
        return (
          <Select
            value={cellValue}
            onValueChange={(value) => handleCellChange(rowIndex, colIndex, value)}
            disabled={readonly}
          >
            <SelectTrigger className="w-full min-h-[44px] text-sm sm:text-base">
              <SelectValue placeholder={`选择${column.label}`} />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  const canDelete = !readonly && rows.length > minRows;
  const canAdd = !readonly && canAddRow && (!maxRows || rows.length < maxRows);

  return (
    <div className="space-y-4">
      {/* Mobile hint */}
      <div className="md:hidden bg-muted/50 px-3 py-2 text-xs text-muted-foreground rounded-md">
        提示：左右滑动查看更多列
      </div>
      
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className="min-w-[140px] sm:min-w-[150px]">
                  <div className="text-xs sm:text-sm">{column.label}</div>
                </TableHead>
              ))}
              {canDelete && <TableHead className="w-[60px] sm:w-[80px]">操作</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {renderCell(rowIndex, colIndex, column)}
                  </TableCell>
                ))}
                {canDelete && (
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRow(rowIndex)}
                      disabled={!canDelete}
                      className="min-h-[44px] min-w-[44px]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {canAdd && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          className="w-full min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          添加行
          {maxRows && ` (${rows.length}/${maxRows})`}
        </Button>
      )}

      {maxRows && rows.length >= maxRows && (
        <p className="text-sm text-muted-foreground">
          已达到最大行数限制
        </p>
      )}
    </div>
  );
}
