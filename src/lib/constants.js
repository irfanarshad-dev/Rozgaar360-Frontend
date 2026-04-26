export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001';

export const ROLES = {
  WORKER: 'worker',
  CUSTOMER: 'customer',
  ADMIN: 'admin'
};

export const SKILLS = [
  'Electrician', // بجلی کا کام
  'Plumber', // پلمبر
  'Carpenter', // بڑھئی
  'Painter', // رنگ ساز
  'Mechanic', // مکینک
  'Cleaner', // صفائی کرنے والا
  'Cook', // باورچی
  'Driver' // ڈرائیور
];

export const CITIES = [
  'Lahore', // لاہور
  'Karachi', // کراچی
  'Islamabad', // اسلام آباد
  'Rawalpindi', // راولپنڈی
  'Faisalabad', // فیصل آباد
  'Multan', // ملتان
  'Peshawar', // پشاور
  'Quetta' // کوئٹہ
];