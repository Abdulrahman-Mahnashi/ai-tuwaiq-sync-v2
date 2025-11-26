-- Seed data for projects table
-- This file contains sample projects to test the application

INSERT INTO public.projects (title, description, bootcamp, technologies, team_members, status) VALUES
(
  'نظام إدارة المشاريع',
  'نظام شامل لإدارة المشاريع والفرق مع ميزات التعاون والتتبع',
  'برنامج تطوير الويب',
  ARRAY['React', 'Node.js', 'MongoDB', 'Express'],
  ARRAY['أحمد محمد', 'فاطمة علي'],
  'completed'
),
(
  'تطبيق التجارة الإلكترونية',
  'منصة تجارة إلكترونية متكاملة مع نظام دفع وإدارة مخزون',
  'برنامج تطوير التطبيقات',
  ARRAY['Vue.js', 'Python', 'PostgreSQL', 'Django'],
  ARRAY['سارة خالد', 'محمد فهد'],
  'in_progress'
),
(
  'نظام الذكاء الاصطناعي للتحليل',
  'نظام تحليل البيانات باستخدام الذكاء الاصطناعي والتعلم الآلي',
  'برنامج الذكاء الاصطناعي',
  ARRAY['Python', 'TensorFlow', 'FastAPI', 'PyTorch'],
  ARRAY['نورا سعد', 'عبدالله يوسف', 'لينا أحمد'],
  'completed'
),
(
  'تطبيق التعلم الإلكتروني',
  'منصة تعليمية تفاعلية مع دورات فيديو واختبارات',
  'برنامج تطوير الويب',
  ARRAY['React', 'Node.js', 'MySQL', 'AWS'],
  ARRAY['خالد أحمد', 'مريم علي'],
  'in_progress'
),
(
  'نظام إدارة المهام',
  'تطبيق لإدارة المهام والمواعيد مع إشعارات تلقائية',
  'برنامج تطوير التطبيقات',
  ARRAY['Flutter', 'Firebase', 'Dart'],
  ARRAY['يوسف محمد', 'سارة أحمد'],
  'completed'
),
(
  'منصة التواصل الاجتماعي',
  'منصة للتواصل والتفاعل مع ميزات الرسائل والمجموعات',
  'برنامج تطوير الويب',
  ARRAY['React', 'Socket.io', 'MongoDB', 'Redis'],
  ARRAY['علي خالد', 'فاطمة يوسف', 'أحمد سعد'],
  'in_progress'
),
(
  'نظام التوصية الذكي',
  'نظام توصية يستخدم خوارزميات التعلم الآلي',
  'برنامج الذكاء الاصطناعي',
  ARRAY['Python', 'Scikit-learn', 'Flask', 'PostgreSQL'],
  ARRAY['لينا خالد', 'محمد علي'],
  'completed'
),
(
  'تطبيق الطقس',
  'تطبيق لعرض حالة الطقس والتنبؤات الجوية',
  'برنامج تطوير التطبيقات',
  ARRAY['React Native', 'API', 'JavaScript'],
  ARRAY['نورا محمد'],
  'completed'
);

-- English version (commented out, you can uncomment if needed)
/*
INSERT INTO public.projects (title, description, bootcamp, technologies, team_members, status) VALUES
(
  'Project Management System',
  'Comprehensive project and team management system with collaboration and tracking features',
  'Web Development Bootcamp',
  ARRAY['React', 'Node.js', 'MongoDB', 'Express'],
  ARRAY['Ahmed Mohammed', 'Fatima Ali'],
  'completed'
),
(
  'E-commerce Application',
  'Integrated e-commerce platform with payment system and inventory management',
  'App Development Bootcamp',
  ARRAY['Vue.js', 'Python', 'PostgreSQL', 'Django'],
  ARRAY['Sara Khalid', 'Mohammed Fahad'],
  'in_progress'
),
(
  'AI Analysis System',
  'Data analysis system using artificial intelligence and machine learning',
  'AI Bootcamp',
  ARRAY['Python', 'TensorFlow', 'FastAPI', 'PyTorch'],
  ARRAY['Nora Saad', 'Abdullah Youssef', 'Lina Ahmed'],
  'completed'
);
*/

