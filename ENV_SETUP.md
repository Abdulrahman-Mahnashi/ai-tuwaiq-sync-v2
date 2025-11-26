# إعداد متغيرات البيئة | Environment Variables Setup

## ⚠️ مهم جداً

**المشروع يعمل فقط مع Gemini AI** - لا توجد خوارزميات بديلة. يجب إضافة API key ليعمل المشروع.

## الملفات المطلوبة

أنشئ ملف `.env` في مجلد `ai-tuwaiq-sync` مع المتغيرات التالية:

```env
# Google Gemini API Configuration (مطلوب)
# احصل على API key من: https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## ملاحظات مهمة

1. **ملف `.env` محمي**: ملف `.env` موجود في `.gitignore` ولن يتم رفعه إلى Git
2. **AI Agent إلزامي**: المشروع **لا يعمل** بدون `VITE_GEMINI_API_KEY`
3. **الأمان**: لا تشارك API keys مع أي شخص

## كيفية الحصول على Gemini API Key

1. اذهب إلى https://aistudio.google.com/app/apikey
2. سجل الدخول بحساب Google
3. اضغط على "Create API Key"
4. اختر مشروع Google Cloud أو أنشئ مشروع جديد
5. انسخ المفتاح وأضفه في ملف `.env`

## تثبيت المكتبات

```bash
cd ai-tuwaiq-sync
npm install
```

## اختبار الإعداد

بعد إضافة API key، شغّل المشروع:
```bash
npm run dev
```

عند تحليل فكرة مشروع، سيتم استخدام **Gemini AI** فقط لتحليل التشابه.

