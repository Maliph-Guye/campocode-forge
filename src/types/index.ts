// User types
export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_points: number;
  level: string;
  streak_days: number;
  last_activity: string;
}

export interface UserRegistration {
  email: string;
  username: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Course types
export enum CourseCategory {
  FRONTEND = "frontend",
  BACKEND = "backend",
  DATA_ANALYTICS = "data_analytics"
}

export enum CourseLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced"
}

export interface Course {
  id: number;
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: CourseLevel;
  price: number;
  instructor_id: number;
  created_at: string;
  updated_at: string;
  duration_hours: number;
  total_lessons: number;
  total_exercises: number;
  prerequisites: string[];
  learning_objectives: string[];
  skills_covered: string[];
  thumbnail_url?: string;
  video_intro_url?: string;
  is_published: boolean;
  instructor?: User;
}

export interface CourseCreate {
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: CourseLevel;
  price: number;
}

// Lesson types
export interface Lesson {
  id: number;
  title: string;
  content: string;
  course_id: number;
  order: number;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
  lesson_type: string;
  video_url?: string;
  resources: any[];
  quiz_questions: any[];
}

// Exercise types
export interface Exercise {
  id: number;
  title: string;
  description: string;
  course_id: number;
  lesson_id?: number;
  order: number;
  points: number;
  created_at: string;
  exercise_type: string;
  difficulty: CourseLevel;
  estimated_time: number;
  starter_code?: string;
  solution_code?: string;
  test_cases: any[];
}

// Enrollment types
export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
  completed_at?: string;
  progress: number;
  payment_status: string;
  payment_amount: number;
  payment_date?: string;
  access_expires?: string;
  lessons_completed: number;
  exercises_completed: number;
  total_points_earned: number;
  last_accessed: string;
  course?: Course;
}

// Progress types
export interface LessonProgress {
  id: number;
  user_id: number;
  lesson_id: number;
  enrollment_id: number;
  started_at: string;
  completed_at?: string;
  progress_percentage: number;
  time_spent_seconds: number;
  quiz_score?: number;
  notes?: string;
  lesson?: Lesson;
}

export interface ExerciseAttempt {
  id: number;
  user_id: number;
  exercise_id: number;
  started_at: string;
  completed_at?: string;
  code_submitted?: string;
  test_results: any[];
  score: number;
  points_earned: number;
  time_spent_seconds: number;
  attempts_count: number;
  exercise?: Exercise;
}

// Practice types
export interface PracticeSession {
  id: number;
  user_id: number;
  session_type: string;
  started_at: string;
  ended_at?: string;
  duration_minutes: number;
  exercises_completed: number;
  points_earned: number;
  difficulty_level: CourseLevel;
}

// Analytics types
export interface UserAnalytics {
  id: number;
  user_id: number;
  date: string;
  time_spent_minutes: number;
  lessons_completed: number;
  exercises_completed: number;
  points_earned: number;
  practice_sessions: number;
  preferred_time?: string;
  preferred_duration: number;
  most_active_category?: CourseCategory;
}

export interface LearningStats {
  total_courses_enrolled: number;
  total_lessons_completed: number;
  total_exercises_completed: number;
  total_points_earned: number;
  current_streak: number;
  average_progress: number;
  level: string;
  last_activity: string;
}

export interface PracticeStats {
  total_sessions: number;
  total_exercises_completed: number;
  total_points_earned: number;
  average_score: number;
  preferred_language: string;
  strength_areas: string[];
  improvement_areas: string[];
  recent_sessions: PracticeSession[];
}

// Achievement types
export interface Achievement {
  id: number;
  name: string;
  description: string;
  points: number;
  icon?: string;
  created_at: string;
  achievement_type: string;
  criteria: any;
  rarity: string;
}

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_id: number;
  earned_at: string;
  context_data: any;
  achievement?: Achievement;
}

// Payment types
export interface Payment {
  id: number;
  user_id: number;
  course_id: number;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  created_at: string;
  completed_at?: string;
  transaction_id?: string;
  payment_reference?: string;
  metadata: any;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Form types
export interface CourseEnrollmentRequest {
  course_id: number;
  payment_method: string;
}

export interface LessonProgressUpdate {
  progress_percentage: number;
  time_spent_seconds: number;
  notes?: string;
}

export interface ExerciseSubmission {
  code: string;
  language: string;
}

export interface PracticeSessionRequest {
  session_type: string;
  difficulty_level: string;
  category?: string;
}

export interface PracticeExerciseSubmission {
  code: string;
  language: string;
  time_spent_seconds: number;
}

// Supabase Profile types
export interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  subscription_tier?: string;
  created_at: string;
  updated_at: string;
}

// Auth Context types
export interface AuthContextType {
  user: any | null;
  session: any | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}