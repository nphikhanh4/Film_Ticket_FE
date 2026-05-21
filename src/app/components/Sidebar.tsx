import { Home, Ticket, History, Heart, Settings, LogOut, Crown, Shield, KeyRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export type Page = 'home' | 'detail' | 'confirmation' | 'history' | 'admin' | 'change-password';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  isAdmin?: boolean;
}

const navItems = [
  { icon: Home, label: 'Trang Chủ', page: 'home' as Page },
  { icon: Ticket, label: 'Đặt Vé', page: 'detail' as Page },
  { icon: History, label: 'Lịch Sử Đặt Vé', page: 'history' as Page },
  { icon: KeyRound, label: 'Đổi Mật Khẩu', page: 'change-password' as Page },
  { icon: Heart, label: 'Yêu Thích', page: null as null },
  { icon: Settings, label: 'Cài Đặt', page: null as null },
];

const adminItems = [
  { icon: Shield, label: 'Quản Lý Hệ Thống', page: 'admin' as Page },
];

export function Sidebar({ activePage, onNavigate, isAdmin }: SidebarProps) {
  const { logout, user } = useAuth();
  const items = isAdmin ? [...navItems, ...adminItems] : navItems;
  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        background: '#211A14',
        borderRight: '1px solid #3D3020',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 40,
      }}
    >
      {/* User profile */}
      <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <img
          src="https://images.unsplash.com/photo-1571893714939-85a8e97c329d?w=96&h=96&fit=crop&crop=face"
          alt="Avatar"
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '2px solid #E8832A',
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
        <div>
          <div
            style={{
              color: '#F5ECD7',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            {user?.username || 'Người dùng'}
          </div>
          <div
            style={{
              color: '#9C8B75',
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 2,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <Crown size={10} color="#E8832A" />
            Premium Member
          </div>
        </div>
      </div>

      <div style={{ borderBottom: '1px solid #3D3020', margin: '0 16px 12px' }} />

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((item) => {
          const isActive = item.page === activePage;
          return (
            <button
              key={item.label}
              onClick={() => item.page && onNavigate(item.page)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 8,
                background: isActive
                  ? 'linear-gradient(to right, rgba(232,131,42,0.15) 0%, rgba(232,131,42,0.05) 100%)'
                  : 'transparent',
                boxShadow: isActive ? 'inset 3px 0 0 #E8832A' : 'none',
                color: isActive ? '#E8832A' : '#9C8B75',
                cursor: item.page ? 'pointer' : 'default',
                border: 'none',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <item.icon size={18} color={isActive ? '#E8832A' : '#9C8B75'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 12px 20px' }}>
        <div style={{ borderTop: '1px solid #3D3020', marginBottom: 12 }} />
        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '11px 14px',
            borderRadius: 8,
            color: '#9C8B75',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#E8832A';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#9C8B75';
          }}
        >
          <LogOut size={18} color="currentColor" />
          Đăng Xuất
        </button>
      </div>
    </aside>
  );
}
