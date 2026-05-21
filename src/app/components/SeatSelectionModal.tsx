import { useState, useEffect, useMemo } from 'react';
import { X, AlertCircle, ArrowLeft, Copy, Check } from 'lucide-react';
import { screeningsApi } from '@/api/screenings';
import { ticketsApi } from '@/api/tickets';
import { moviesApi } from '@/api/movies';
import { ScreeningResponse, TicketResponse, MovieResponse } from '@/types/api';
import { toast } from 'sonner';

interface SeatSelectionModalProps {
  screening: ScreeningResponse;
  onClose: () => void;
  onConfirm: (movie: MovieResponse, ticket: TicketResponse) => void;
}

const SEAT_PRICE = 90000;

// Thông tin tài khoản để chuyển khoản (mock cho UI)
const BANK_INFO = {
  bankName: 'Vietcombank',
  accountNumber: '0123456789',
  accountName: 'CONG TY FILMTICKET',
  branch: 'Hồ Chí Minh',
};

function formatCurrency(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

type Step = 'select' | 'payment';

// Tạo QR code "ảo" trông giống QR thật từ một chuỗi đầu vào.
// Có 3 ô finder (góc trên-trái, trên-phải, dưới-trái) và 1 alignment ở giữa-dưới-phải.
// Phần data ngẫu nhiên nhưng deterministic theo input để tránh nhấp nháy.
function FakeQRCode({ value, size = 152 }: { value: string; size?: number }) {
  const grid = 25;
  const padding = 12;
  const inner = size - padding * 2;
  const cell = inner / grid;

  // Hash chuỗi -> seed cố định
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // PRNG đơn giản
  let s = (h >>> 0) || 1;
  const rand = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1000) / 1000;
  };

  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c > grid - 8) || (r > grid - 8 && c < 7);

  const inFinderPattern = (r: number, c: number, or: number, oc: number) => {
    const dr = r - or;
    const dc = c - oc;
    const ring1 = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
    if (!ring1) return false;
    const isOuter = dr === 0 || dr === 6 || dc === 0 || dc === 6;
    const isInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
    return isOuter || isInner;
  };

  // Alignment 5x5 ở góc dưới-phải
  const alignR = grid - 5;
  const alignC = grid - 5;
  const inAlignment = (r: number, c: number) => {
    const dr = r - alignR;
    const dc = c - alignC;
    if (dr < 0 || dr > 4 || dc < 0 || dc > 4) return false;
    const isOuter = dr === 0 || dr === 4 || dc === 0 || dc === 4;
    const isInner = dr === 2 && dc === 2;
    return isOuter || isInner;
  };

  // Timing patterns: hàng 6 và cột 6
  const inTiming = (r: number, c: number) => {
    if (isFinder(r, c)) return false;
    if (r === 6) return c % 2 === 0;
    if (c === 6) return r % 2 === 0;
    return false;
  };

  const cells: { x: number; y: number; on: boolean }[] = [];
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      let on = false;
      if (
        inFinderPattern(r, c, 0, 0) ||
        inFinderPattern(r, c, 0, grid - 7) ||
        inFinderPattern(r, c, grid - 7, 0)
      ) {
        on = true;
      } else if (inAlignment(r, c)) {
        on = true;
      } else if (inTiming(r, c)) {
        on = true;
      } else if (!isFinder(r, c) && r !== 6 && c !== 6) {
        on = rand() > 0.5;
      }
      cells.push({ x: padding + c * cell, y: padding + r * cell, on });
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Mã QR thanh toán cho ${value}`}
      style={{ display: 'block', borderRadius: 6 }}
    >
      <rect width={size} height={size} fill="#F5ECD7" />
      {cells.map((c, i) =>
        c.on ? (
          <rect
            key={i}
            x={c.x}
            y={c.y}
            width={cell}
            height={cell}
            fill="#1A1410"
          />
        ) : null
      )}
    </svg>
  );
}

export function SeatSelectionModal({ screening, onClose, onConfirm }: SeatSelectionModalProps) {
  const [soldSeats, setSoldSeats] = useState<Set<number>>(new Set());
  const [selectedSeats, setSelectedSeats] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('select');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const TOTAL_SEATS = screening.totalSeats;
  const COLS_PER_ROW = 10;

  useEffect(() => {
    loadData();
  }, [screening.id]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const soldSeatsData = await screeningsApi.getSoldSeats(screening.id);
      setSoldSeats(new Set(soldSeatsData.seatNumbers));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải thông tin ghế';
      setError(message);
      console.error('Error loading seats:', err);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSeat = (seatNumber: number) => {
    if (soldSeats.has(seatNumber)) return;
    setSelectedSeats((prev) => {
      const next = new Set(prev);
      if (next.has(seatNumber)) {
        next.delete(seatNumber);
      } else {
        next.add(seatNumber);
      }
      return next;
    });
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.size === 0) {
      toast.error('Vui lòng chọn ít nhất một ghế');
      return;
    }
    setStep('payment');
  };

  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    try {
      const seatNumbers = Array.from(selectedSeats).sort((a, b) => a - b);
      const amount = seatNumbers.length * SEAT_PRICE;

      const ticket = await ticketsApi.create({
        screeningId: screening.id,
        seatNumbers,
        amount,
      });

      const movie = await moviesApi.getById(screening.movieId);

      toast.success('Đặt vé thành công!');
      onConfirm(movie, ticket);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể đặt vé';
      console.error('Booking error:', err);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      setTimeout(() => setCopiedField((prev) => (prev === label ? null : prev)), 1500);
    } catch {
      toast.error('Không thể sao chép');
    }
  };

  const selectedList = Array.from(selectedSeats).sort((a, b) => a - b);
  const total = selectedList.length * SEAT_PRICE;

  // Mã nội dung chuyển khoản gợi ý cho người dùng
  const transferContent = useMemo(() => {
    const shortId = screening.id.replace(/-/g, '').slice(0, 8).toUpperCase();
    return `FILMTICKET ${shortId} ${selectedList.join(',')}`;
  }, [screening.id, selectedList.join(',')]);

  // Fallback UI for loading/error
  if (isLoading) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            background: '#1E1710',
            borderRadius: 16,
            padding: '40px',
            textAlign: 'center',
            color: '#9C8B75',
          }}
        >
          <p>Đang tải thông tin ghế...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            background: '#1E1710',
            borderRadius: 16,
            padding: '40px',
            maxWidth: '500px',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
            <AlertCircle color="#EF4444" size={24} />
            <span style={{ color: '#EF4444', fontSize: '14px' }}>{error}</span>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#E8832A',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          fontFamily: 'Inter, sans-serif',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 560,
            background: '#1E1710',
            borderRadius: 16,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '95vh',
            boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #3D3020',
              background: 'rgba(232,131,42,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => !isSubmitting && setStep('select')}
                disabled={isSubmitting}
                aria-label="Quay lại chọn ghế"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#3D3020',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F5ECD7',
                  opacity: isSubmitting ? 0.5 : 1,
                }}
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div style={{ color: '#F5ECD7', fontWeight: 700, fontSize: 16, marginBottom: 2 }}>
                  Thanh Toán Bằng Chuyển Khoản
                </div>
                <div style={{ color: '#9C8B75', fontSize: 12 }}>
                  Quét QR hoặc chuyển khoản theo thông tin bên dưới
                </div>
              </div>
            </div>
            <button
              onClick={() => !isSubmitting && onClose()}
              disabled={isSubmitting}
              aria-label="Đóng"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#3D3020',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isSubmitting ? 0.5 : 1,
              }}
            >
              <X size={18} color="#F5ECD7" />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 24px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Tổng tiền */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(232,131,42,0.18), rgba(232,131,42,0.04))',
                border: '1px solid rgba(232,131,42,0.4)',
                borderRadius: 12,
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div style={{ color: '#9C8B75', fontSize: 12, marginBottom: 4 }}>Số tiền cần chuyển</div>
                <div style={{ color: '#E8832A', fontSize: 26, fontWeight: 800 }}>
                  {formatCurrency(total)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#9C8B75', fontSize: 12, marginBottom: 4 }}>Ghế</div>
                <div style={{ color: '#F5ECD7', fontSize: 14, fontWeight: 600 }}>
                  {selectedList.join(', ')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {/* QR mock */}
              <div
                style={{
                  flex: '0 0 160px',
                  background: '#F5ECD7',
                  borderRadius: 12,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 152,
                    height: 152,
                    borderRadius: 6,
                    overflow: 'hidden',
                    border: '4px solid #1A1410',
                    background: '#F5ECD7',
                  }}
                >
                  <FakeQRCode value={`${BANK_INFO.accountNumber}|${total}|${transferContent}`} size={144} />
                </div>
                <div style={{ color: '#1A1410', fontSize: 11, fontWeight: 600 }}>
                  Quét bằng app ngân hàng
                </div>
              </div>

              {/* Bank info */}
              <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Ngân hàng', value: BANK_INFO.bankName, copy: false },
                  { label: 'Số tài khoản', value: BANK_INFO.accountNumber, copy: true },
                  { label: 'Chủ tài khoản', value: BANK_INFO.accountName, copy: false },
                  { label: 'Chi nhánh', value: BANK_INFO.branch, copy: false },
                  { label: 'Số tiền', value: total.toLocaleString('vi-VN'), copy: true },
                  { label: 'Nội dung', value: transferContent, copy: true },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      background: '#211A14',
                      border: '1px solid #3D3020',
                      borderRadius: 8,
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ color: '#9C8B75', fontSize: 11, marginBottom: 2 }}>
                        {row.label}
                      </div>
                      <div
                        style={{
                          color: '#F5ECD7',
                          fontSize: 13,
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={row.value}
                      >
                        {row.value}
                      </div>
                    </div>
                    {row.copy && (
                      <button
                        onClick={() => handleCopy(row.label, row.value)}
                        title="Sao chép"
                        style={{
                          background: 'rgba(232,131,42,0.12)',
                          border: '1px solid rgba(232,131,42,0.4)',
                          color: '#E8832A',
                          padding: '6px 8px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        {copiedField === row.label ? <Check size={14} /> : <Copy size={14} />}
                        {copiedField === row.label ? 'Đã chép' : 'Chép'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(251,146,60,0.08)',
                border: '1px solid rgba(251,146,60,0.4)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#FB923C',
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              Vui lòng chuyển khoản đúng số tiền và nội dung để hệ thống tự động xác nhận. Sau khi
              chuyển khoản xong, nhấn nút bên dưới để hoàn tất đặt vé.
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              background: '#211A14',
              borderTop: '1px solid #3D3020',
              padding: '14px 24px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            <button
              onClick={() => !isSubmitting && setStep('select')}
              disabled={isSubmitting}
              style={{
                padding: '10px 16px',
                background: '#3D3020',
                color: '#F5ECD7',
                border: 'none',
                borderRadius: 8,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              Quay lại
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={isSubmitting}
              style={{
                padding: '10px 18px',
                background: '#E8832A',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Đang xác nhận...' : 'Đã chuyển khoản'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: 'Inter, sans-serif',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 900,
          background: '#1E1710',
          borderRadius: 16,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '95vh',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #3D3020',
          }}
        >
          <div>
            <div style={{ color: '#F5ECD7', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
              Chọn Ghế
            </div>
            <div style={{ color: '#9C8B75', fontSize: 13 }}>Tổng {TOTAL_SEATS} ghế</div>
          </div>
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

        {/* Seat area (scrollable) */}
        <div style={{ flex: 1, overflow: 'auto', padding: '28px 24px 20px' }}>
          {/* Screen */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 32,
            }}
          >
            <span
              style={{
                color: '#E8832A',
                fontSize: 10,
                letterSpacing: 3,
                marginBottom: 10,
                textTransform: 'uppercase',
              }}
            >
              Màn Hình
            </span>
            <div
              style={{
                width: '100%',
                maxWidth: 500,
                height: 10,
                borderRadius: 5,
                background:
                  'linear-gradient(to right, rgba(232,131,42,0.3), #E8832A, #F5B563, #E8832A, rgba(232,131,42,0.3))',
                boxShadow: '0 0 30px rgba(232,131,42,0.5)',
              }}
            />
          </div>

          {/* Seat grid - simple numbered list */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS_PER_ROW}, 1fr)`,
              gap: 8,
              marginBottom: 24,
            }}
          >
            {Array.from({ length: TOTAL_SEATS }, (_, i) => {
              const seatNumber = i + 1;
              const isSold = soldSeats.has(seatNumber);
              const isSelected = selectedSeats.has(seatNumber);

              let bg = '#C9A96E';
              if (isSold) {
                bg = '#3D3020';
              } else if (isSelected) {
                bg = '#E8832A';
              }

              return (
                <button
                  key={seatNumber}
                  onClick={() => toggleSeat(seatNumber)}
                  title={`Ghế ${seatNumber}`}
                  disabled={isSold}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 6,
                    border: 'none',
                    background: bg,
                    opacity: isSold ? 0.4 : 1,
                    cursor: isSold ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: isSelected ? '#fff' : isSold ? '#9C8B75' : '#1A1410',
                    transition: 'all 0.2s',
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {seatNumber}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              gap: 28,
              justifyContent: 'center',
              flexWrap: 'wrap',
              padding: '20px',
              background: '#211A14',
              borderRadius: 8,
            }}
          >
            {[
              { bg: '#C9A96E', label: 'Còn trống', opacity: 1 },
              { bg: '#E8832A', label: 'Đã chọn', opacity: 1 },
              { bg: '#3D3020', label: 'Đã bán', opacity: 0.4 },
            ].map(({ bg, label, opacity }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 3,
                    background: bg,
                    opacity,
                  }}
                />
                <span style={{ color: '#9C8B75', fontSize: 12 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking bar */}
        <div
          style={{
            background: '#211A14',
            borderTop: '1px solid #3D3020',
            padding: '18px 24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            {/* Left: seat summary */}
            <div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: '#9C8B75', fontSize: 13 }}>Ghế đã chọn: </span>
                {selectedList.length === 0 ? (
                  <span style={{ color: '#9C8B75', fontSize: 13 }}>Chưa chọn ghế</span>
                ) : (
                  selectedList.map((s) => (
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
                        borderRadius: 4,
                      }}
                    >
                      {s}
                    </span>
                  ))
                )}
              </div>
              <div style={{ color: '#9C8B75', fontSize: 12 }}>
                {selectedList.length} ghế × 90,000đ
              </div>
            </div>

            {/* Right: pricing & confirm */}
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}
            >
              <div>
                <span style={{ color: '#9C8B75', fontSize: 13 }}>Tổng cộng: </span>
                <span style={{ color: '#E8832A', fontSize: 22, fontWeight: 700 }}>
                  {formatCurrency(total)}
                </span>
              </div>
              <button
                onClick={handleProceedToPayment}
                disabled={selectedSeats.size === 0}
                style={{
                  width: 200,
                  height: 44,
                  background: selectedSeats.size > 0 ? '#E8832A' : '#3D3020',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: selectedSeats.size > 0 ? 'pointer' : 'not-allowed',
                  fontFamily: 'Inter, sans-serif',
                  whiteSpace: 'nowrap',
                }}
              >
                Tiếp Tục Thanh Toán →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
