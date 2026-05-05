import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface AdminLoginPageProps {
  redirectPath: string;
}

export function AdminLoginPage({ redirectPath }: AdminLoginPageProps) {
  const navigate = useNavigate();
  const signIn = useAdminAuth((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!email || !password) {
      setError('يرجى ملء جميع الحقول');
      setSubmitting(false);
      return;
    }

    try {
      console.log('محاولة تسجيل الدخول...', email);
      await signIn(email, password);
      console.log('تم تسجيل الدخول بنجاح');
      navigate(redirectPath);
    } catch (error) {
      console.error('خطأ:', error);
      const message = error instanceof Error ? error.message : 'بيانات الدخول غير صحيحة';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-2xl border border-stone-200 p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-stone-900" style={{ fontFamily: 'Tajawal, sans-serif' }}>
            تسجيل دخول المدير
          </h1>
          <p className="text-sm text-stone-500 mt-2">
            أدخل بيانات حسابك الإدارية
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-2">البريد الإلكتروني</label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="admin@example.com"
              required 
            />
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700 block mb-2">كلمة المرور</label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button 
          className="w-full bg-[#8b1a2b] hover:bg-[#6b1520] text-white" 
          type="submit" 
          disabled={submitting}
        >
          {submitting ? 'جاري تسجيل الدخول...' : 'دخول'}
        </Button>
      </form>
    </div>
  );
}
