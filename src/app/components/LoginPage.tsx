import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface LoginFormData {
  username: string;
  password: string;
}

export function LoginPage({ onSuccess }: { onSuccess: () => void }) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const { login, register, isLoading, error } = useAuth();
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      if (tab === 'login') {
        await login(data.username, data.password);
        toast.success('Đăng nhập thành công!');
      } else {
        await register(data.username, data.password);
        toast.success('Đăng ký thành công!');
      }
      reset();
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      toast.error(message);
    }
  };

  return (
    <div
      style={{
        background: '#1A1410',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#211A14',
          border: '1px solid #3D3020',
          borderRadius: '12px',
          padding: '40px',
        }}
      >
        <h1
          style={{
            color: '#F5ECD7',
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '30px',
            textAlign: 'center',
          }}
        >
          CinemaHub
        </h1>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '10px',
                background:
                  tab === t
                    ? 'linear-gradient(to right, rgba(232,131,42,0.15) 0%, rgba(232,131,42,0.05) 100%)'
                    : 'transparent',
                border:
                  tab === t
                    ? '1px solid rgba(232,131,42,0.3)'
                    : '1px solid #3D3020',
                borderRadius: '8px',
                color: tab === t ? '#E8832A' : '#9C8B75',
                fontWeight: tab === t ? 600 : 400,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
            >
              {t === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Username field */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                color: '#F5ECD7',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
              }}
            >
              Tên đăng nhập
            </label>
            <input
              {...registerField('username', {
                required: 'Tên đăng nhập là bắt buộc',
                minLength: {
                  value: 3,
                  message: 'Tên đăng nhập phải từ 3 ký tự trở lên',
                },
              })}
              type="text"
              placeholder="Nhập tên đăng nhập"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#1A1410',
                border: errors.username
                  ? '1px solid #E63946'
                  : '1px solid #3D3020',
                borderRadius: '8px',
                color: '#F5ECD7',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            {errors.username && (
              <span style={{ color: '#E63946', fontSize: '12px' }}>
                {errors.username.message}
              </span>
            )}
          </div>

          {/* Password field */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                color: '#F5ECD7',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
              }}
            >
              Mật khẩu
            </label>
            <input
              {...registerField('password', {
                required: 'Mật khẩu là bắt buộc',
                minLength: {
                  value: 6,
                  message: 'Mật khẩu phải từ 6 ký tự trở lên',
                },
              })}
              type="password"
              placeholder="Nhập mật khẩu"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#1A1410',
                border: errors.password
                  ? '1px solid #E63946'
                  : '1px solid #3D3020',
                borderRadius: '8px',
                color: '#F5ECD7',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            {errors.password && (
              <span style={{ color: '#E63946', fontSize: '12px' }}>
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Error message from API */}
          {error && (
            <div
              style={{
                background: 'rgba(230, 57, 70, 0.1)',
                border: '1px solid #E63946',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#E63946',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              background:
                isLoading
                  ? 'rgba(232,131,42,0.5)'
                  : 'linear-gradient(to right, #E8832A, #D4691F)',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isLoading ? 'default' : 'pointer',
              transition: 'all 0.2s',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading
              ? 'Đang xử lý...'
              : tab === 'login'
                ? 'Đăng Nhập'
                : 'Đăng Ký'}
          </button>
        </form>

        {/* Footer info */}
        <p
          style={{
            color: '#9C8B75',
            fontSize: '12px',
            textAlign: 'center',
            marginTop: '20px',
          }}
        >
          {tab === 'login'
            ? 'Chưa có tài khoản? Nhấn "Đăng Ký" để tạo mới'
            : 'Đã có tài khoản? Nhấn "Đăng Nhập" để vào'}
        </p>
      </div>
    </div>
  );
}
