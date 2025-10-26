import { z } from 'zod';
import type { Answer, QuestionType } from '@/types';

/**
 * Validation schema for login form
 */
export const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
});

/**
 * Validation schema for survey form
 */
export const surveySchema = z.object({
  title: z
    .string()
    .min(1, '标题不能为空')
    .max(200, '标题不能超过200个字符'),
  description: z
    .string()
    .max(5000, '描述不能超过5000个字符')
    .optional(),
});

/**
 * Validation schema for question form
 */
export const questionSchema = z.object({
  type: z.enum(['text', 'single', 'multiple', 'table'], {
    message: '请选择题目类型',
  }),
  title: z
    .string()
    .min(1, '题目标题不能为空')
    .max(500, '题目标题不能超过500个字符'),
  description: z
    .string()
    .max(2000, '题目描述不能超过2000个字符')
    .optional(),
  required: z.boolean().default(false),
  prefill_key: z
    .string()
    .max(100, '预填字段键名不能超过100个字符')
    .optional(),
  config: z.object({
    options: z.array(z.string()).optional(),
    columns: z
      .array(
        z.object({
          id: z.string(),
          type: z.enum(['text', 'number', 'select']),
          label: z.string(),
          options: z.array(z.string()).optional(),
        })
      )
      .optional(),
    min_rows: z.number().min(0).optional(),
    max_rows: z.number().min(1).optional(),
    can_add_row: z.boolean().optional(),
  }),
});

/**
 * Validate a single answer based on question type and requirements
 */
export function validateAnswer(
  value: Answer['value'] | undefined,
  questionType: QuestionType,
  required: boolean
): { valid: boolean; error?: string } {
  // Check if required field is empty
  if (required) {
    if (value === undefined || value === null || value === '') {
      return { valid: false, error: '此题为必填项' };
    }

    if (Array.isArray(value) && value.length === 0) {
      return { valid: false, error: '此题为必填项' };
    }

    if (
      Array.isArray(value) &&
      value.every((item) => Array.isArray(item) && item.length === 0)
    ) {
      return { valid: false, error: '此题为必填项' };
    }
  }

  // Type-specific validation
  switch (questionType) {
    case 'text':
      if (typeof value !== 'string') {
        return { valid: false, error: '答案格式不正确' };
      }
      break;

    case 'single':
      if (typeof value !== 'string') {
        return { valid: false, error: '答案格式不正确' };
      }
      break;

    case 'multiple':
      if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
        return { valid: false, error: '答案格式不正确' };
      }
      break;

    case 'table':
      if (
        !Array.isArray(value) ||
        !value.every((row) => Array.isArray(row) && row.every((cell) => typeof cell === 'string'))
      ) {
        return { valid: false, error: '答案格式不正确' };
      }
      break;

    default:
      return { valid: false, error: '未知的题目类型' };
  }

  return { valid: true };
}

/**
 * Validate all answers in a survey response
 */
export function validateAnswers(
  answers: Answer[],
  questions: Array<{
    id: number;
    type: QuestionType;
    required: boolean;
  }>
): { valid: boolean; errors: Record<number, string> } {
  const errors: Record<number, string> = {};

  for (const question of questions) {
    const answer = answers.find((a) => a.question_id === question.id);
    const validation = validateAnswer(
      answer?.value,
      question.type,
      question.required
    );

    if (!validation.valid && validation.error) {
      errors[question.id] = validation.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate table question row count
 */
export function validateTableRowCount(
  rows: string[][],
  minRows?: number,
  maxRows?: number
): { valid: boolean; error?: string } {
  const rowCount = rows.length;

  if (minRows !== undefined && rowCount < minRows) {
    return { valid: false, error: `至少需要${minRows}行数据` };
  }

  if (maxRows !== undefined && rowCount > maxRows) {
    return { valid: false, error: `最多只能有${maxRows}行数据` };
  }

  return { valid: true };
}
