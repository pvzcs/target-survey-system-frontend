// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

// Authentication response
export interface AuthResponse {
  token: string;
  user: User;
}

// Survey status
export type SurveyStatus = 'draft' | 'published';

// Survey type
export interface Survey {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: SurveyStatus;
  created_at: string;
  updated_at: string;
  questions?: Question[];
}

// Question types
export type QuestionType = 'text' | 'single' | 'multiple' | 'table';

// Table column types
export type ColumnType = 'text' | 'number' | 'select';

// Table column configuration
export interface TableColumn {
  id: string;
  type: ColumnType;
  label: string;
  options?: string[];
}

// Question configuration
export interface QuestionConfig {
  options?: string[];
  columns?: TableColumn[];
  min_rows?: number;
  max_rows?: number;
  can_add_row?: boolean;
}

// Question type
export interface Question {
  id: number;
  survey_id: number;
  type: QuestionType;
  title: string;
  description: string;
  required: boolean;
  order: number;
  config: QuestionConfig;
  prefill_key: string;
  created_at: string;
  updated_at: string;
}

// Answer value types
export type AnswerValue = string | string[] | string[][];

// Answer type
export interface Answer {
  question_id: number;
  value: AnswerValue;
}

// Response record
export interface Response {
  id: number;
  survey_id: number;
  data: {
    answers: Answer[];
  };
  ip_address: string;
  user_agent: string;
  submitted_at: string;
  created_at: string;
}

// Statistics information
export interface Statistics {
  survey_id: number;
  total_responses: number;
  completion_rate: number;
}

// Share link
export interface ShareLink {
  url: string;
  token: string;
  expires_at: string;
}

// Public survey data
export interface PublicSurveyData {
  survey: Survey;
  prefill_data: Record<string, string>;
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

// API error
export interface ApiError {
  code: string;
  message: string;
}
