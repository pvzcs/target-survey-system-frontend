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

// Profile update request
export interface ProfileUpdateRequest {
  username?: string;
  email?: string;
  old_password?: string;
  new_password?: string;
}

// Profile update response
export interface ProfileUpdateResponse {
  message: string;
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

// Question statistics for charts
export interface QuestionStatistics {
  question_id: number;
  question_title: string;
  question_type: QuestionType;
  response_count: number;
  response_rate: number;
  // For single/multiple choice questions
  option_counts?: Record<string, number>;
}

// Statistics information
export interface Statistics {
  survey_id: number;
  total_responses: number;
  completion_rate: number;
  question_statistics?: QuestionStatistics[];
}

// Share link
export interface ShareLink {
  url: string;
  token: string;
  expires_at: string;
}

// Public survey data (actual API response structure)
export interface PublicSurveyData {
  id: number;
  title: string;
  description: string;
  questions: Question[];
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
