# إعداد قاعدة البيانات | Database Setup

## الخطوات المطلوبة | Required Steps

### 1. إعداد Supabase

1. قم بتسجيل الدخول إلى [Supabase](https://supabase.com)
2. أنشئ مشروع جديد أو استخدم المشروع الموجود
3. احصل على `SUPABASE_URL` و `SUPABASE_ANON_KEY`

### 2. إضافة متغيرات البيئة | Environment Variables

أنشئ ملف `.env` في مجلد `ai-tuwaiq-sync`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 3. تشغيل Migration

#### الطريقة الأولى: من خلال Supabase Dashboard

1. افتح Supabase Dashboard
2. اذهب إلى SQL Editor
3. انسخ محتوى ملف `supabase/migrations/20240101000000_create_projects_table.sql`
4. قم بتشغيله

#### الطريقة الثانية: باستخدام Supabase CLI

```bash
# تثبيت Supabase CLI
npm install -g supabase

# تسجيل الدخول
supabase login

# ربط المشروع
supabase link --project-ref your-project-ref

# تشغيل migration
supabase db push
```

### 4. إضافة البيانات التجريبية | Seed Data

1. افتح SQL Editor في Supabase Dashboard
2. انسخ محتوى ملف `supabase/seed.sql`
3. قم بتشغيله لإضافة بيانات تجريبية

### 5. تشغيل التطبيق | Run the Application

```bash
cd ai-tuwaiq-sync
npm install
npm run dev
```

## هيكل قاعدة البيانات | Database Structure

### جدول Projects

- `id` (UUID): معرف فريد للمشروع
- `title` (TEXT): عنوان المشروع
- `description` (TEXT): وصف المشروع
- `bootcamp` (TEXT): اسم البرنامج التدريبي
- `technologies` (TEXT[]): قائمة التقنيات المستخدمة
- `team_members` (TEXT[]): قائمة أعضاء الفريق
- `status` (TEXT): حالة المشروع
- `created_at` (TIMESTAMP): تاريخ الإنشاء
- `updated_at` (TIMESTAMP): تاريخ التحديث
- `similarity_score` (FLOAT): درجة التشابه
- `keywords` (TEXT[]): الكلمات المفتاحية
- `full_text_search` (TSVECTOR): للبحث النصي

### جدول Similarity Results

- `id` (UUID): معرف فريد
- `input_idea` (TEXT): الفكرة المدخلة
- `project_id` (UUID): معرف المشروع
- `similarity_score` (FLOAT): درجة التشابه
- `created_at` (TIMESTAMP): تاريخ الإنشاء

## كيفية الاستخدام | How to Use

1. افتح التطبيق
2. اذهب إلى تبويب "تحليل الفكرة"
3. اكتب فكرة مشروعك
4. اضغط على "تحليل الفكرة"
5. سيقوم الـ Agent بمقارنة فكرتك مع المشاريع الموجودة في قاعدة البيانات
6. ستظهر النتائج المشابهة مع درجات التشابه

## ملاحظات | Notes

- يمكن تحسين خوارزمية المقارنة لاستخدام AI/ML متقدم
- يمكن إضافة مزيد من الميزات مثل حفظ الأفكار الجديدة كأفكار مشاريع
- يمكن تحسين البحث النصي باستخدام Full-Text Search المدمج في PostgreSQL

---

**For English version, translate the above content or use Supabase documentation**

