/**
 * إعدادات الموقع — تُقرأ من Supabase وتُطبَّق على الواجهة.
 * القيم الافتراضية تُستخدم عند فشل التحميل.
 */

export type AppSettings = {
  session_ended: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
  show_points_to_viewers: boolean;
  show_ranking: boolean;
  show_medals: boolean;
  show_hall_of_fame: boolean;
  show_progress_bar: boolean;
  allow_add_points: boolean;
  allow_subtract_points: boolean;
  session_name: string;
  session_start_date: string | null;
};

export const DEFAULT_SETTINGS: AppSettings = {
  session_ended: false,
  maintenance_mode: false,
  maintenance_message: "الموقع في وضع الصيانة مؤقتًا، نعود قريبًا بإذن الله.",
  show_points_to_viewers: false,
  show_ranking: true,
  show_medals: true,
  show_hall_of_fame: true,
  show_progress_bar: true,
  allow_add_points: true,
  allow_subtract_points: true,
  session_name: "الدورة الحالية",
  session_start_date: null,
};

export type SettingKey = keyof AppSettings;
