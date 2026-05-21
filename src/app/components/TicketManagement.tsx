import { useState, useEffect } from 'react';
import { TrendingUp, Ticket, Users, DollarSign } from 'lucide-react';
import { adminTicketsApi } from '@/api/adminTickets';
import { MyTicketsResponse, TicketStatus } from '@/types/api';
import { toast } from 'sonner';

export function TicketManagement() {
  const [tickets, setTickets] = useState<MyTicketsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      console.log('📥 Loading all tickets...');
      const rawData = await adminTicketsApi.getAll();
      console.log('✅ Raw tickets data:', rawData);

      // Convert numeric status back to string enum
      const statusMap: Record<number, TicketStatus> = {
        0: TicketStatus.Pending,
        1: TicketStatus.Paid,
        2: TicketStatus.Cancelled,
        3: TicketStatus.Refunded,
      };

      // Map PascalCase response to camelCase and convert status
      const mappedData = (rawData as any[]).map((t: any) => ({
        id: t.ticketId || t.id,
        userId: t.userId,
        screeningId: t.screeningId,
        seatCount: t.seatCount,
        seatNumbers: t.seatNumbers,
        amount: t.amount,
        status: statusMap[t.status] || t.status,
        paymentReference: t.paymentReference,
        createdAtUtc: t.createdAtUtc,
      }));

      console.log('✅ Mapped tickets:', mappedData);
      setTickets(mappedData as any);
    } catch (err) {
      console.error('❌ Load tickets error:', err);
      toast.error('Không thể tải danh sách vé');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    console.log('🔄 Status change requested:', { ticketId, newStatus });
    try {
      console.log('📤 Sending update request...');
      await adminTicketsApi.updateStatus(ticketId, { status: newStatus });
      console.log('✅ Status updated successfully');
      toast.success('Cập nhật trạng thái vé thành công');
      loadTickets();
    } catch (err) {
      console.error('❌ Status update error:', err);
      toast.error('Không thể cập nhật trạng thái vé');
    }
  };

  // Calculate stats
  const stats = {
    total: tickets.length,
    paid: tickets.filter(t => t.status === TicketStatus.Paid).length,
    cancelled: tickets.filter(t => t.status === TicketStatus.Cancelled).length,
    pending: tickets.filter(t => t.status === TicketStatus.Pending).length,
    revenue: tickets
      .filter(t => t.status === TicketStatus.Paid)
      .reduce((sum, t) => sum + t.amount, 0),
  };

  // Filter tickets
  const filteredTickets = statusFilter === 'all'
    ? tickets
    : tickets.filter(t => t.status === statusFilter);

  const getStatusLabel = (status: TicketStatus): string => {
    const labels: Record<TicketStatus, string> = {
      [TicketStatus.Pending]: 'Chờ xác nhận',
      [TicketStatus.Paid]: 'Đã thanh toán',
      [TicketStatus.Cancelled]: 'Đã hủy',
      [TicketStatus.Refunded]: 'Đã hoàn tiền',
    };
    return labels[status];
  };

  const getStatusColor = (status: TicketStatus) => {
    const colors: Record<TicketStatus, { bg: string; color: string }> = {
      [TicketStatus.Pending]: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' },
      [TicketStatus.Paid]: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' },
      [TicketStatus.Cancelled]: { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' },
    };
    return colors[status] || { bg: 'rgba(156, 139, 117, 0.1)', color: '#9C8B75' };
  };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '32px' }}>
        <div style={{ background: '#211A14', border: '1px solid #3D3020', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Ticket size={24} color="#E8832A" />
            <span style={{ color: '#9C8B75', fontSize: '14px' }}>Tổng Vé</span>
          </div>
          <div style={{ color: '#F5ECD7', fontSize: '32px', fontWeight: 700 }}>
            {stats.total}
          </div>
        </div>

        <div style={{ background: '#211A14', border: '1px solid #3D3020', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <TrendingUp size={24} color="#22C55E" />
            <span style={{ color: '#9C8B75', fontSize: '14px' }}>Vé Đã Thanh Toán</span>
          </div>
          <div style={{ color: '#22C55E', fontSize: '32px', fontWeight: 700 }}>
            {stats.paid}
          </div>
        </div>

        <div style={{ background: '#211A14', border: '1px solid #3D3020', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <DollarSign size={24} color="#E8832A" />
            <span style={{ color: '#9C8B75', fontSize: '14px' }}>Doanh Thu</span>
          </div>
          <div style={{ color: '#E8832A', fontSize: '32px', fontWeight: 700 }}>
            {(stats.revenue / 1000).toLocaleString('vi-VN')}k
          </div>
        </div>

        <div style={{ background: '#211A14', border: '1px solid #3D3020', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Users size={24} color="#3B82F6" />
            <span style={{ color: '#9C8B75', fontSize: '14px' }}>Khách Hàng</span>
          </div>
          <div style={{ color: '#3B82F6', fontSize: '32px', fontWeight: 700 }}>
            {new Set(tickets.map(t => t.userId)).size}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {['all', TicketStatus.Pending, TicketStatus.Paid, TicketStatus.Cancelled].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as any)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: statusFilter === status ? '2px solid #E8832A' : '1px solid #3D3020',
              background: statusFilter === status ? 'rgba(232,131,42,0.15)' : 'transparent',
              color: statusFilter === status ? '#E8832A' : '#9C8B75',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: statusFilter === status ? 600 : 400,
            }}
          >
            {status === 'all' ? 'Tất Cả' : getStatusLabel(status as TicketStatus)}
          </button>
        ))}
      </div>

      {/* Tickets Table */}
      {isLoading ? (
        <div style={{ color: '#9C8B75', textAlign: 'center', padding: '40px' }}>
          Đang tải...
        </div>
      ) : filteredTickets.length === 0 ? (
        <div style={{ color: '#9C8B75', textAlign: 'center', padding: '40px' }}>
          Không có vé nào
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', color: '#F5ECD7', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #3D3020' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#9C8B75' }}>Mã Vé</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#9C8B75' }}>Người Dùng</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#9C8B75' }}>Phim</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#9C8B75' }}>Ghế</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#9C8B75' }}>Giá</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#9C8B75' }}>Trạng Thái</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#9C8B75' }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => {
                const statusColor = getStatusColor(ticket.status as TicketStatus) || { bg: '#3D3020', color: '#9C8B75' };
                return (
                  <tr key={ticket.id} style={{ borderBottom: '1px solid #3D3020' }}>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                        {ticket.id.substring(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{(ticket.userId || 'N/A').substring(0, 8)}</td>
                    <td style={{ padding: '12px' }}>Phim</td>
                    <td style={{ padding: '12px' }}>
                      {ticket.seatNumbers.map(s => (
                        <span key={s} style={{ display: 'inline-block', marginRight: '4px', background: '#E8832A', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                          {s}
                        </span>
                      ))}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {(ticket.amount / 1000).toLocaleString('vi-VN')}k
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          background: statusColor.bg,
                          color: statusColor.color,
                          padding: '4px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        {getStatusLabel(ticket.status)}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <select
                        value={ticket.status}
                        onChange={(e) => {
                          console.log('🔄 Dropdown changed:', { ticketId: ticket.id, value: e.target.value, type: typeof e.target.value });
                          handleStatusChange(ticket.id, e.target.value as TicketStatus);
                        }}
                        style={{
                          padding: '6px 8px',
                          background: '#1A1410',
                          border: '1px solid #3D3020',
                          borderRadius: '4px',
                          color: '#F5ECD7',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        <option value={TicketStatus.Pending}>{getStatusLabel(TicketStatus.Pending)}</option>
                        <option value={TicketStatus.Paid}>{getStatusLabel(TicketStatus.Paid)}</option>
                        <option value={TicketStatus.Cancelled}>{getStatusLabel(TicketStatus.Cancelled)}</option>
                        <option value={TicketStatus.Refunded}>{getStatusLabel(TicketStatus.Refunded)}</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
