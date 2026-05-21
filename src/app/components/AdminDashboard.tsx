import { useState } from 'react';
import { Plus } from 'lucide-react';
import { MovieManagement } from './MovieManagement';
import { ScreeningManagement } from './ScreeningManagement';
import { TicketManagement } from './TicketManagement';
import { RevenueStatistics } from './RevenueStatistics';
import { UserManagement } from './UserManagement';

type AdminTab = 'movies' | 'screenings' | 'tickets' | 'statistics' | 'users';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('movies');

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'movies', label: 'Quản Lý Phim' },
    { id: 'screenings', label: 'Quản Lý Suất Chiếu' },
    { id: 'tickets', label: 'Quản Lý Vé' },
    { id: 'users', label: 'Quản Lý Tài Khoản' },
    { id: 'statistics', label: 'Thống Kê Doanh Thu' },
  ];

  return (
    <div style={{ background: '#1A1410', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1
          style={{
            color: '#F5ECD7',
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: '32px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Quản Lý Hệ Thống
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid #3D3020' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                background: activeTab === tab.id ? '#E8832A' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#9C8B75',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #E8832A' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'movies' && <MovieManagement />}
        {activeTab === 'screenings' && <ScreeningManagement />}
        {activeTab === 'tickets' && <TicketManagement />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'statistics' && <RevenueStatistics />}
      </div>
    </div>
  );
}
