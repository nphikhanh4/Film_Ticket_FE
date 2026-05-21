import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { MovieResponse, ScreeningResponse, MyTicketsResponse, TicketStatus } from '@/types/api';
import { moviesApi } from '@/api/movies';
import { screeningsApi } from '@/api/screenings';
import { toast } from 'sonner';

function QRCodeSVG() {
  const cellSize = 7;
  const cols = 21;
  const rows = 21;
  const padding = 4;
  const size = cols * cellSize + padding * 2;

  const pattern = [
    [1,1,1,1,1,1,1,0,1,0,0,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,1,1,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,1,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,0,1,1,0],
    [0,1,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,0,1],
    [1,1,0,0,1,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1],
    [0,0,1,1,0,0,0,1,0,0,1,1,0,1,0,1,0,0,0,1,0],
    [1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1],
    [0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,0,1,0,1,0,0,0,1,0,1,0,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,0,1,0,0,0,1,0,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,0,1,0,1,1,0,0,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,0,1,1,0,1,0,1,0,1,1,0],
    [1,0,1,1,1,0,1,0,1,1,1,0,0,1,0,1,0,1,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,1,0,1,0,0,1,1,0,0],
    [1,1,1,1,1,1,1,0,1,0,0,1,0,0,0,1,1,0,0,1,1],
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ border: '2px solid #E8832A', borderRadius: 6 }}>
      <rect width={size} height={size} fill="#1A1410" />
      {pattern.map((row, ri) =>
        row.map((cell, ci) =>
          cell ? (
            <rect
              key={`${ri}-${ci}`}
              x={ci * cellSize + padding}
              y={ri * cellSize + padding}
              width={cellSize - 1}
              height={cellSize - 1}
              fill="#F5ECD7"
            />
          ) : null
        )
      )}
    </svg>
  );
}

interface TicketDetailModalProps {
  ticket: MyTicketsResponse;
  onClose: () => void;
}

export function TicketDetailModal({ ticket, onClose }: TicketDetailModalProps) {
  const [movie, setMovie] = useState<MovieResponse | null>(null);
  const [screening, setScreening] = useState<ScreeningResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [ticket.screeningId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allScreenings = await screeningsApi.getAll();
      const screeningData = allScreenings.find(s => s.id === ticket.screeningId);
      if (!screeningData) {
        throw new Error('Không tìm thấy thông tin suất chiếu');
      }
      setScreening(screeningData);
      const movieData = await moviesApi.getById(screeningData.movieId);
      setMovie(movieData);
    } catch (err) {
      console.error('Error loading ticket details:', err);
      toast.error('Không thể tải chi tiết vé');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ color: '#9C8B75', fontSize: 14 }}>Đang tải...</div>
      </div>
    );
  }

  if (!movie || !screening) {
    return null;
  }

  const screeningDate = new Date(screening.startAtUtc);
  const dateStr = screeningDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = screeningDate.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Inter, sans-serif',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 460,
          maxWidth: '100%',
          background: '#1A1410',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#3D3020',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={18} color="#F5ECD7" />
          </button>
        </div>

        {/* Stamp overlay khi vé đã hủy / hoàn tiền */}
        {(ticket.status === TicketStatus.Cancelled ||
          ticket.status === TicketStatus.Refunded) && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                transform: 'rotate(-22deg)',
                border: '6px solid #EF4444',
                color: '#EF4444',
                padding: '14px 36px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 900,
                fontSize: 44,
                letterSpacing: '6px',
                textTransform: 'uppercase',
                background: 'rgba(239, 68, 68, 0.08)',
                boxShadow:
                  '0 0 0 3px rgba(239, 68, 68, 0.25), inset 0 0 0 3px rgba(239, 68, 68, 0.15)',
                borderRadius: 8,
                textShadow: '1px 1px 0 rgba(0,0,0,0.25)',
                opacity: 0.92,
              }}
            >
              Đã hủy
            </div>
          </div>
        )}

        {/* Top half */}
        <div
          style={{
            background: '#2A1F14',
            padding: '24px 24px 20px',
          }}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            <img
              src={movie.coverImageUrl || "https://via.placeholder.com/80x120?text=No+Image"}
              alt="Movie poster"
              style={{
                width: 80,
                height: 120,
                borderRadius: 8,
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                <div
                  style={{
                    color: '#F5ECD7',
                    fontWeight: 700,
                    fontSize: 17,
                    lineHeight: 1.3,
                    flex: 1,
                  }}
                >
                  {movie.title}
                </div>
              </div>
              <div style={{ color: '#9C8B75', fontSize: 12, marginBottom: 12 }}>
                {screening.venue || 'Rạp chiếu phim'}
              </div>
              <div
                style={{ borderTop: '1px solid #3D3020', marginBottom: 12 }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { icon: '📅', text: dateStr },
                  { icon: '🕐', text: timeStr },
                  { icon: '🎬', text: movie.durationMinutes ? `${movie.durationMinutes} phút` : 'N/A' },
                  { icon: '🎭', text: movie.genres || 'N/A' },
                ].map(({ icon, text }) => (
                  <div
                    key={text}
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      fontSize: 13,
                      color: '#F5ECD7',
                    }}
                  >
                    <span>{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                {movie.genres && (
                  <span
                    style={{
                      background: 'rgba(232,131,42,0.15)',
                      color: '#E8832A',
                      border: '1px solid rgba(232,131,42,0.4)',
                      fontSize: 11,
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontWeight: 700,
                    }}
                  >
                    {movie.genres}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tear divider */}
        <div style={{ position: 'relative', height: 20, overflow: 'visible' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#241A12',
              borderTop: '2px dashed #3D3020',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: -10,
              top: -10,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#1A1410',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: -10,
              top: -10,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#1A1410',
            }}
          />
        </div>

        {/* Bottom half */}
        <div
          style={{
            background: '#241A12',
            borderRadius: '0 0 12px 12px',
            padding: '20px 24px 28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ width: '100%', marginBottom: 20 }}>
            <div style={{ color: '#9C8B75', fontSize: 13, marginBottom: 8 }}>
              Ghế:{' '}
              {ticket.seatNumbers.map((s) => (
                <span
                  key={s}
                  style={{
                    display: 'inline-block',
                    marginLeft: 6,
                    background: '#E8832A',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 20,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
            <div style={{ color: '#9C8B75', fontSize: 13, marginBottom: 8 }}>
              Số lượng:{' '}
              <span style={{ color: '#F5ECD7' }}>
                {ticket.seatCount}× Thường
              </span>
            </div>
            <div style={{ color: '#9C8B75', fontSize: 13 }}>
              Giá tiền:{' '}
              <span style={{ color: '#E8832A', fontWeight: 700 }}>
                {(ticket.amount / 1000).toLocaleString('vi-VN')}k
              </span>
            </div>
          </div>

          <QRCodeSVG />

          <div
            style={{
              color: '#E8832A',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 15,
              fontWeight: 700,
              marginTop: 16,
              marginBottom: 6,
              letterSpacing: 1,
            }}
          >
            {ticket.paymentReference || ticket.id.substring(0, 16).toUpperCase()}
          </div>
          <div style={{ color: '#9C8B75', fontSize: 12 }}>
            Quét mã này tại quầy để nhận vé
          </div>
        </div>
      </div>
    </div>
  );
}
