import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { authApi } from '@/api/auth';
import { toast } from 'sonner';

export function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới tối thiểu 6 ký tự');
      return;
    }
    if (newPassword !== confirm) {
      toast.error('Xác nhận mật khẩu không khớp');
      return;
    }
    if (newPassword === currentPassword) {
      toast.error('Mật khẩu mới phải khác mật khẩu hiện tại');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể đổi mật khẩu';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#1A1410', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <h1
          style={{
            color: '#F5ECD7',
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 8,
            fontFamily: 'Inter, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <KeyRound size={24} color="#E8832A" />
          Đổi Mật Khẩu
        </h1>
        <p
          style={{
            color: '#9C8B75',
            fontSize: 14,
            marginBottom: 24,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Cập nhật mật khẩu của tài khoản. Mật khẩu mới phải có ít nhất 6 ký tự.
        </p>

        <form
          onSubmit={submit}
          style={{
            background: '#211A14',
            border: '1px solid #3D3020',
            borderRadius: 12,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <Field
            label="Mật khẩu hiện tại"
            input={
              <input
                type="password"
                autoFocus
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                style={inputStyle}
              />
            }
          />
          <Field
            label="Mật khẩu mới"
            input={
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                style={inputStyle}
              />
            }
          />
          <Field
            label="Xác nhận mật khẩu mới"
            input={
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                style={inputStyle}
              />
            }
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 18px',
                background: '#E8832A',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: '#1A1410',
  border: '1px solid #3D3020',
  borderRadius: 8,
  color: '#F5ECD7',
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  outline: 'none',
};

function Field({ label, input }: { label: string; input: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ color: '#9C8B75', fontSize: 12 }}>{label}</span>
      {input}
    </label>
  );
}
