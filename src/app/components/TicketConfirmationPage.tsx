import { motion } from 'motion/react';
import { CheckCircle, Download, CalendarPlus } from 'lucide-react';
import { MovieResponse, ScreeningResponse, TicketResponse } from '@/types/api';

interface BookingInfo {
  movie: MovieResponse;
  screening: ScreeningResponse;
  ticket: TicketResponse;
}

interface TicketConfirmationPageProps {
  booking: BookingInfo;
  onViewHistory: () => void;
  onBookAnother: () => void;
}

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

export function TicketConfirmationPage({
  booking,
  onViewHistory,
  onBookAnother,
}: TicketConfirmationPageProps) {
  const { movie, screening, ticket } = booking;
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
        background: '#1A1410',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Inter, sans-serif',
        padding: '48px 24px 60px',
        backgroundImage:
          'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(232,131,42,0.06) 0%, transparent 70%)',
      }}
    >
      {/* Success header */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 18 }}
        style={{ textAlign: 'center', marginBottom: 36 }}
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(232,131,42,0.5)',
              '0 0 0 18px rgba(232,131,42,0)',
              '0 0 0 0 rgba(232,131,42,0)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut' }}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#E8832A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
          }}
        >
          <CheckCircle size={32} color="#fff" strokeWidth={2.5} />
        </motion.div>
        <div
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 32,
            fontWeight: 700,
            color: '#F5ECD7',
            marginBottom: 8,
          }}
        >
          Đặt Vé Thành Công!
        </div>
        <div style={{ color: '#9C8B75', fontSize: 14 }}>
          Mã xác nhận đã được gửi về email của bạn
        </div>
      </motion.div>

      {/* Ticket card */}
      <motion.div
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.18, duration: 0.4, ease: 'easeOut' }}
        style={{
          width: 460,
          maxWidth: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Top half */}
        <div
          style={{
            background: '#2A1F14',
            borderRadius: '12px 12px 0 0',
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
              <div
                style={{
                  color: '#F5ECD7',
                  fontWeight: 700,
                  fontSize: 17,
                  marginBottom: 4,
                  lineHeight: 1.3,
                }}
              >
                {movie.title}
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
            <div style={{ color: '#9C8B75', fontSize: 13 }}>
              Số lượng:{' '}
              <span style={{ color: '#F5ECD7' }}>
                {ticket.seatCount}× Thường
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
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        style={{ display: 'flex', gap: 12, marginTop: 28 }}
      >
        {[
          { icon: <Download size={15} />, label: 'Xuất Vé PDF' },
          { icon: <CalendarPlus size={15} />, label: 'Thêm vào Lịch' },
        ].map(({ icon, label }) => (
          <button
            key={label}
            style={{
              width: 180,
              padding: '11px 0',
              background: 'transparent',
              border: '1px solid #E8832A',
              borderRadius: 8,
              color: '#E8832A',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {icon}
            {label}
          </button>
        ))}
      </motion.div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 32, marginTop: 20 }}>
        <button
          onClick={onViewHistory}
          style={{
            color: '#E8832A',
            fontSize: 14,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          ← Xem Lịch Sử Đặt Vé
        </button>
        <button
          onClick={onBookAnother}
          style={{
            color: '#E8832A',
            fontSize: 14,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Đặt Vé Phim Khác →
        </button>
      </div>
    </div>
  );
}
