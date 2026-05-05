import { supabase } from './supabase';

/**
 * إنشاء مستخدم مدير اختبار
 * استخدم هذه الدالة مرة واحدة فقط لإنشاء المستخدم الأول
 */
export async function createTestAdminUser() {
  const email = import.meta.env.VITE_DEFAULT_ADMIN_EMAIL ?? 'admin@test.com';
  const password = import.meta.env.VITE_DEFAULT_ADMIN_PASSWORD ?? 'Admin1234!';

  try {
    console.log('جاري محاولة إنشاء مستخدم اختبار...', email);
    
    // محاولة تسجيل الدخول أولاً
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!signInError && signInData.user) {
      console.log('الحساب موجود بالفعل وتم تسجيل الدخول');
      return { email, password, userId: signInData.user.id };
    }

    // إذا لم يكن موجوداً، إنشاء حساب جديد
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
      console.error('خطأ في إنشاء المستخدم:', error.message);
      throw error;
    }

    // محاولة تسجيل الدخول مباشرة بعد الإنشاء
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      console.error('تم إنشاء الحساب لكن تسجيل الدخول فشل:', loginError.message);
      throw loginError;
    }

    if (!loginData.session) {
      const err = new Error('لم يتم إنشاء جلسة تسجيل الدخول. تحقق من إعدادات Supabase.');
      console.error(err);
      throw err;
    }

    console.log('✅ تم إنشاء المستخدم بنجاح!');
    console.log('البريد:', email);
    console.log('كلمة المرور:', password);
    console.log('معرّف المستخدم:', data.user?.id || loginData.user?.id);

    return { email, password, userId: data.user?.id || loginData.user?.id };
  } catch (error) {
    console.error('فشل:', error);
    throw error;
  }
}

/**
 * حذف مستخدم الاختبار
 */
export async function deleteTestAdminUser() {
  try {
    // لا يمكن حذف المستخدمين مباشرة من Supabase JS SDK
    // يجب استخدام Admin API من السيرفر
    console.log('يجب حذف المستخدم من Supabase Studio');
    return true;
  } catch (error) {
    console.error('خطأ:', error);
    throw error;
  }
}
