export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  subscription_tier: 'free' | 'pro' | 'premium';
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  price: number;
  is_published: boolean;
  instructor_id: string;
  created_at: string;
  updated_at: string;
  instructor?: Profile;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  lesson_type: 'theory' | 'exercise' | 'quiz';
  order_index: number;
  estimated_duration: number;
  created_at: string;
  updated_at: string;
  exercises?: Exercise[];
}

export interface Exercise {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  starter_code: string | null;
  solution_code: string | null;
  test_cases: any;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  progress_percentage: number;
  course?: Course;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  time_spent: number;
}

export interface ExerciseSubmission {
  id: string;
  user_id: string;
  exercise_id: string;
  submitted_code: string | null;
  is_correct: boolean;
  submitted_at: string;
  feedback: string | null;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  badge_icon: string | null;
  earned_at: string;
  category: string;
}

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