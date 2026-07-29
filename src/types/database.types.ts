export type UserRole = "admin" | "viewer";

export type Profile = {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
};

export type Student = {
  id: string;
  full_name: string;
  photo_url: string | null;
  points: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MemorizationTracking = {
  id: string;
  student_id: string;
  // النطاق الأول للحفظ
  memorization_start_page: number | null;
  memorization_end_page: number | null;
  last_memorized_page: number | null;
  // النطاق الثاني للحفظ (اختياري)
  memorization_start_page_2: number | null;
  memorization_end_page_2: number | null;
  last_memorized_page_2: number | null;
  // النطاق الأول للمراجعة
  review_start_page: number | null;
  review_end_page: number | null;
  last_reviewed_page: number | null;
  // النطاق الثاني للمراجعة (اختياري)
  review_start_page_2: number | null;
  review_end_page_2: number | null;
  last_reviewed_page_2: number | null;
  updated_at: string;
};

export type LogType = "حفظ" | "مراجعة";
export type LogGrade = "ممتاز" | "جيد جدًا" | "جيد" | "يحتاج إعادة";

export type MemorizationLog = {
  id: string;
  student_id: string;
  log_date: string;
  type: LogType;
  from_page: number;
  to_page: number;
  grade: LogGrade;
  notes: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      students: {
        Row: Student;
        Insert: Partial<Student> & { id: string; full_name: string };
        Update: Partial<Student>;
      };
      memorization_tracking: {
        Row: MemorizationTracking;
        Insert: Partial<MemorizationTracking> & { student_id: string };
        Update: Partial<MemorizationTracking>;
      };
      memorization_logs: {
        Row: MemorizationLog;
        Insert: Partial<MemorizationLog> & {
          student_id: string;
          type: LogType;
          from_page: number;
          to_page: number;
          grade: LogGrade;
        };
        Update: Partial<MemorizationLog>;
      };
    };
  };
};
