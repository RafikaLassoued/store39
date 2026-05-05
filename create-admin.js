import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// تحميل متغيرات البيئة
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ متغيرات البيئة مفقودة!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * إنشاء حساب مدير جديد
 */
async function createNewAdmin() {
  // إنشاء بيانات عشوائية للمدير
  const randomId = Math.random().toString(36).substring(2, 8);
  const email = `admin-${randomId}@test.com`;
  const password = `Admin${randomId}123!`;

  try {
    console.log('🔄 جاري إنشاء حساب مدير جديد...');

    // إنشاء الحساب
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'admin'
        }
      }
    });

    if (error) {
      console.error('❌ خطأ في إنشاء الحساب:', error.message);
      return null;
    }

    // محاولة تسجيل الدخول للتأكد من أن الحساب يعمل
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      console.error('❌ خطأ في تسجيل الدخول:', loginError.message);
      return null;
    }

    console.log('✅ تم إنشاء حساب المدير بنجاح!');
    console.log('📧 البريد الإلكتروني:', email);
    console.log('🔑 كلمة المرور:', password);
    console.log('🆔 معرّف المستخدم:', data.user?.id || loginData.user?.id);

    return {
      email,
      password,
      userId: data.user?.id || loginData.user?.id
    };

  } catch (error) {
    console.error('❌ خطأ غير متوقع:', error);
    return null;
  }
}

// تشغيل الدالة
createNewAdmin().then((result) => {
  if (result) {
    console.log('\n🎉 معلومات حساب المدير الجديد:');
    console.log('=====================================');
    console.log(`البريد الإلكتروني: ${result.email}`);
    console.log(`كلمة المرور: ${result.password}`);
    console.log(`معرّف المستخدم: ${result.userId}`);
    console.log('=====================================');
    console.log('\n🔗 رابط تسجيل الدخول:');
    console.log('http://localhost:5173/admin-secret-x9k2/login');
  } else {
    console.log('❌ فشل في إنشاء حساب المدير');
  }
  process.exit(0);
});