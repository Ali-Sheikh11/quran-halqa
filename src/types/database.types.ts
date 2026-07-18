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
  /** نقاط الطالب — يُعدَّل عبر أزرار (+/-) الخاصة بالمسؤول فقط، ولا يقل عن 0 */
  points: number;
  /** تاريخ آخر مراجعة لجزء عم — يتجدد الحق كل أسبوع (الأحد) */
  last_juz_amma_review: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
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
    };
  };
};
