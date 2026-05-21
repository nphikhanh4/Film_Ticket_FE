import { useEffect, useState } from 'react';
import { Calendar, MapPin, Ticket, Clock, AlertCircle, Eye, AlertTriangle, X } from 'lucide-react';
import { ticketsApi } from '@/api/tickets';
import { MyTicketsResponse, TicketStatus } from '@/types/api';
import { toast } from 'sonner';
import { TicketDetailModal } from './TicketDetailModal';

export function BookingHistoryPage() {
  const [tickets, setTickets] = useState<MyTicketsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<MyTicketsResponse | null>(null);
  const [cancellingTicket, setCancellingTicket] = useState<MyTicketsResponse | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketsApi.getHistory();
      setTickets(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải lịch sử đặt vé';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    const statusMap: Record<TicketStatus, { bg: string; color: string; label: string }> = {
      [TicketStatus.Paid]: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', label: 'Đã thanh toán' },
      [TicketStatus.Pending]: {
        bg: 'rgba(251, 146, 60, 0.1)',
        color: '#FB923C',
        label: 'Chờ thanh toán',
      },
      [TicketStatus.Cancelled]: {
        bg: 'rgba(239, 68, 68, 0.1)',
        color: '#EF4444',
        label: 'Đã hủy',
      },
      [TicketStatus.Refunded]: {
        bg: 'rgba(148, 163, 184, 0.1)',
        color: '#94A3B8',
        label: 'Đã hoàn tiền',
      },
    };

    const info = statusMap[status] || statusMap[TicketStatus.Pending];
    return { ...info };
  };

  const handleCancel = async (ticketId: string) => {
    if (!cancellingTicket) return;
    setIsCancelling(true);
    try {
      await ticketsApi.cancel(ticketId);
      toast.success('Vé đã được hủy thành công!');
      setCancellingTicket(null);
      loadTickets();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể hủy vé';
      toast.error(message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div style={{ background: '#1A1410', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1
          style={{
            color: '#F5ECD7',
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: '40px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Lịch Sử Đặt Vé
        </h1>

        {isLoading && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div
              style={{
                color: '#9C8B75',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Đang tải...
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #EF4444',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle color="#EF4444" style={{ flexShrink: 0 }} />
            <span style={{ color: '#EF4444', fontSize: '14px' }}>{error}</span>
          </div>
        )}

        {!isLoading && !error && tickets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Ticket
              size={48}
              color="#9C8B75"
              style={{ marginBottom: '16px', display: 'block' }}
            />
            <p
              style={{
                color: '#9C8B75',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Bạn chưa đặt vé nào. Hãy bắt đầu đặt vé ngay!
            </p>
          </div>
        )}

        {!isLoading && !error && tickets.length > 0 && (
          <div style={{ display: 'grid', gap: '20px' }}>
            {tickets.map((ticket) => {
              const status = getStatusBadge(ticket.status);
              const bookingDate = new Date(ticket.createdAtUtc);
              const dateStr = bookingDate.toLocaleDateString('vi-VN');
              const timeStr = bookingDate.toLocaleTimeString('vi-VN');

              return (
                <div
                  key={ticket.id}
                  style={{
                    background: '#211A14',
                    border: '1px solid #3D3020',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                  }}
                >
                  {/* Ticket ID */}
                  <div>
                    <div
                      style={{
                        color: '#9C8B75',
                        fontSize: '12px',
                        fontWeight: 500,
                        marginBottom: '4px',
                      }}
                    >
                      Mã vé
                    </div>
                    <div style={{ color: '#F5ECD7', fontSize: '14px' }}>
                      {ticket.id.substring(0, 8)}...
                    </div>
                  </div>

                  {/* Booking date */}
                  <div>
                    <div
                      style={{
                        color: '#9C8B75',
                        fontSize: '12px',
                        fontWeight: 500,
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Calendar size={14} /> Ngày đặt
                    </div>
                    <div style={{ color: '#F5ECD7', fontSize: '14px' }}>
                      {dateStr} lúc {timeStr}
                    </div>
                  </div>

                  {/* Seats */}
                  <div>
                    <div
                      style={{
                        color: '#9C8B75',
                        fontSize: '12px',
                        fontWeight: 500,
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Ticket size={14} /> Ghế ({ticket.seatCount})
                    </div>
                    <div style={{ color: '#F5ECD7', fontSize: '14px' }}>
                      {ticket.seatNumbers.join(', ')}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <div
                      style={{
                        color: '#9C8B75',
                        fontSize: '12px',
                        fontWeight: 500,
                        marginBottom: '4px',
                      }}
                    >
                      Giá tiền
                    </div>
                    <div style={{ color: '#E8832A', fontSize: '16px', fontWeight: 600 }}>
                      {(ticket.amount / 1000).toLocaleString('vi-VN', {
                        minimumFractionDigits: 0,
                      })}
                      k
                    </div>
                  </div>

                  {/* Status and action */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        background: status.bg,
                        color: status.color,
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}
                    >
                      {status.label}
                    </div>
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(232,131,42,0.1)',
                        border: '1px solid #E8832A',
                        borderRadius: '6px',
                        color: '#E8832A',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = '#E8832A';
                        (e.currentTarget as HTMLElement).style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(232,131,42,0.1)';
                        (e.currentTarget as HTMLElement).style.color = '#E8832A';
                      }}
                    >
                      <Eye size={14} />
                      Xem Chi Tiết
                    </button>
                    {ticket.status === TicketStatus.Paid && (
                      <button
                        onClick={() => setCancellingTicket(ticket)}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid #EF4444',
                          borderRadius: '6px',
                          color: '#EF4444',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = '#EF4444';
                          (e.currentTarget as HTMLElement).style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background =
                            'rgba(239, 68, 68, 0.1)';
                          (e.currentTarget as HTMLElement).style.color = '#EF4444';
                        }}
                      >
                        Hủy Vé
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {cancellingTicket && (
        <div
          onClick={() => !isCancelling && setCancellingTicket(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-confirm-title"
            style={{
              width: '100%',
              maxWidth: '460px',
              background: '#211A14',
              border: '1px solid #3D3020',
              borderRadius: '12px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              color: '#F5ECD7',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid #3D3020',
                background: 'rgba(239,68,68,0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'rgba(239,68,68,0.18)',
                    border: '1px solid rgba(239,68,68,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EF4444',
                  }}
                >
                  <AlertTriangle size={18} />
                </div>
                <h3
                  id="cancel-confirm-title"
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#F5ECD7',
                  }}
                >
                  Xác nhận hủy vé
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !isCancelling && setCancellingTicket(null)}
                disabled={isCancelling}
                aria-label="Đóng"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9C8B75',
                  cursor: isCancelling ? 'not-allowed' : 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: isCancelling ? 0.5 : 1,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#D6C5A7', lineHeight: 1.5 }}>
                Bạn có chắc chắn muốn hủy vé này? Hành động này không thể hoàn tác.
              </p>

              <div
                style={{
                  background: '#1A1410',
                  border: '1px solid #3D3020',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '13px',
                }}
              >
                <div style={{ color: '#9C8B75', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Thông tin vé
                </div>
                <div>
                  <span style={{ color: '#9C8B75' }}>Mã vé: </span>
                  <span style={{ color: '#F5ECD7', fontFamily: 'JetBrains Mono, monospace' }}>
                    {cancellingTicket.id.substring(0, 8).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#9C8B75' }}>Ghế: </span>
                  <span style={{ color: '#F5ECD7' }}>
                    {cancellingTicket.seatNumbers.join(', ')} ({cancellingTicket.seatCount} ghế)
                  </span>
                </div>
                <div>
                  <span style={{ color: '#9C8B75' }}>Giá tiền: </span>
                  <span style={{ color: '#E8832A', fontWeight: 600 }}>
                    {(cancellingTicket.amount / 1000).toLocaleString('vi-VN')}k
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '12px 20px 16px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                borderTop: '1px solid #3D3020',
              }}
            >
              <button
                type="button"
                onClick={() => setCancellingTicket(null)}
                disabled={isCancelling}
                style={{
                  padding: '8px 16px',
                  background: '#3D3020',
                  color: '#F5ECD7',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isCancelling ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  opacity: isCancelling ? 0.6 : 1,
                }}
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => handleCancel(cancellingTicket.id)}
                disabled={isCancelling}
                style={{
                  padding: '8px 18px',
                  background: '#EF4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isCancelling ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  opacity: isCancelling ? 0.7 : 1,
                }}
              >
                {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
