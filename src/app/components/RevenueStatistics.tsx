import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, DollarSign, Ticket, Film, RefreshCw, Search } from 'lucide-react';
import { adminTicketsApi } from '@/api/adminTickets';
import { moviesApi } from '@/api/movies';
import { screeningsApi } from '@/api/screenings';
import { MovieResponse, ScreeningResponse, TicketStatus } from '@/types/api';
import { toast } from 'sonner';

// Có thể tickets từ /all có 2 dạng key (ticketId vs id, status numeric vs string).
// Dùng kiểu lỏng + map về dạng chuẩn.
interface RawAdminTicket {
  id?: string;
  ticketId?: string;
  userId?: string;
  screeningId: string;
  seatCount: number;
  seatNumbers: number[];
  amount: number;
  status: number | TicketStatus;
  createdAtUtc: string;
}

interface NormalizedTicket {
  id: string;
  userId: string;
  screeningId: string;
  seatCount: number;
  amount: number;
  status: TicketStatus;
  createdAtUtc: string;
}

interface MovieStat {
  movie: MovieResponse;
  paidTickets: number;
  paidSeats: number;
  totalSeatsCapacity: number;
  revenue: number;
  cancelledTickets: number;
  screeningCount: number;
}

const STATUS_NUM_MAP: Record<number, TicketStatus> = {
  0: TicketStatus.Pending,
  1: TicketStatus.Paid,
  2: TicketStatus.Cancelled,
  3: TicketStatus.Refunded,
};

function formatCurrency(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

export function RevenueStatistics() {
  const [tickets, setTickets] = useState<NormalizedTicket[]>([]);
  const [movies, setMovies] = useState<MovieResponse[]>([]);
  const [screenings, setScreenings] = useState<ScreeningResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'revenue' | 'seats' | 'tickets'>('revenue');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [rawTickets, moviesData, screeningsData] = await Promise.all([
        adminTicketsApi.getAll() as unknown as Promise<RawAdminTicket[]>,
        moviesApi.getAll(true),
        screeningsApi.getAll(),
      ]);

      const normalized: NormalizedTicket[] = (rawTickets || []).map((t) => {
        const status =
          typeof t.status === 'number' ? STATUS_NUM_MAP[t.status] ?? TicketStatus.Pending : t.status;
        return {
          id: t.ticketId || t.id || '',
          userId: t.userId || '',
          screeningId: t.screeningId,
          seatCount: t.seatCount,
          amount: t.amount,
          status,
          createdAtUtc: t.createdAtUtc,
        };
      });

      setTickets(normalized);
      setMovies(moviesData);
      setScreenings(screeningsData);
    } catch (err) {
      console.error('Load statistics error:', err);
      toast.error('Không thể tải dữ liệu thống kê');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo<MovieStat[]>(() => {
    const screeningById = new Map<string, ScreeningResponse>();
    for (const s of screenings) screeningById.set(s.id, s);

    const screeningsByMovie = new Map<string, ScreeningResponse[]>();
    for (const s of screenings) {
      const arr = screeningsByMovie.get(s.movieId) || [];
      arr.push(s);
      screeningsByMovie.set(s.movieId, arr);
    }

    return movies.map<MovieStat>((movie) => {
      const movieScreenings = screeningsByMovie.get(movie.id) || [];
      const screeningIds = new Set(movieScreenings.map((s) => s.id));
      const totalSeatsCapacity = movieScreenings.reduce((acc, s) => acc + s.totalSeats, 0);

      const movieTickets = tickets.filter((t) => screeningIds.has(t.screeningId));
      const paidTickets = movieTickets.filter((t) => t.status === TicketStatus.Paid);
      const cancelledTickets = movieTickets.filter(
        (t) => t.status === TicketStatus.Cancelled || t.status === TicketStatus.Refunded
      );

      const paidSeats = paidTickets.reduce((acc, t) => acc + t.seatCount, 0);
      const revenue = paidTickets.reduce((acc, t) => acc + t.amount, 0);

      return {
        movie,
        paidTickets: paidTickets.length,
        paidSeats,
        totalSeatsCapacity,
        revenue,
        cancelledTickets: cancelledTickets.length,
        screeningCount: movieScreenings.length,
      };
    });
  }, [tickets, movies, screenings]);

  const visibleStats = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = q
      ? stats.filter((s) => s.movie.title.toLowerCase().includes(q))
      : [...stats];
    result.sort((a, b) => {
      if (sortKey === 'revenue') return b.revenue - a.revenue;
      if (sortKey === 'seats') return b.paidSeats - a.paidSeats;
      return b.paidTickets - a.paidTickets;
    });
    return result;
  }, [stats, search, sortKey]);

  const totals = useMemo(() => {
    const revenue = stats.reduce((acc, s) => acc + s.revenue, 0);
    const paidSeats = stats.reduce((acc, s) => acc + s.paidSeats, 0);
    const paidTickets = stats.reduce((acc, s) => acc + s.paidTickets, 0);
    const totalSeatsCapacity = stats.reduce((acc, s) => acc + s.totalSeatsCapacity, 0);
    return { revenue, paidSeats, paidTickets, totalSeatsCapacity };
  }, [stats]);

  const topMovie = useMemo(() => {
    return [...stats].sort((a, b) => b.revenue - a.revenue)[0] ?? null;
  }, [stats]);

  return (
    <div>
      {/* Header actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ color: '#F5ECD7', fontSize: 18, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
          Doanh Thu & Vé Đã Bán Theo Phim
        </div>
        <button
          onClick={loadAll}
          disabled={isLoading}
          style={{
            padding: '8px 14px',
            background: '#3D3020',
            color: '#F5ECD7',
            border: 'none',
            borderRadius: 8,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          <RefreshCw size={14} />
          Làm mới
        </button>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          marginBottom: 24,
        }}
      >
        <SummaryCard
          icon={<DollarSign size={22} color="#E8832A" />}
          label="Tổng doanh thu (Paid)"
          value={formatCurrency(totals.revenue)}
          accent="#E8832A"
        />
        <SummaryCard
          icon={<Ticket size={22} color="#22C55E" />}
          label="Tổng ghế đã bán"
          value={`${totals.paidSeats.toLocaleString('vi-VN')} / ${totals.totalSeatsCapacity.toLocaleString('vi-VN')}`}
          accent="#22C55E"
          subtext={
            totals.totalSeatsCapacity > 0
              ? `Tỉ lệ lấp đầy ${((totals.paidSeats / totals.totalSeatsCapacity) * 100).toFixed(1)}%`
              : undefined
          }
        />
        <SummaryCard
          icon={<TrendingUp size={22} color="#3B82F6" />}
          label="Vé đã thanh toán"
          value={totals.paidTickets.toLocaleString('vi-VN')}
          accent="#3B82F6"
        />
        <SummaryCard
          icon={<Film size={22} color="#FB923C" />}
          label="Phim doanh thu cao nhất"
          value={topMovie ? topMovie.movie.title : '—'}
          accent="#FB923C"
          subtext={topMovie ? formatCurrency(topMovie.revenue) : undefined}
        />
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#1A1410',
            border: '1px solid #3D3020',
            borderRadius: 8,
            padding: '8px 12px',
            flex: '1 1 240px',
            maxWidth: 360,
          }}
        >
          <Search size={14} color="#9C8B75" />
          <input
            type="text"
            placeholder="Tìm phim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#F5ECD7',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {([
            { key: 'revenue', label: 'Doanh thu' },
            { key: 'seats', label: 'Ghế đã bán' },
            { key: 'tickets', label: 'Số vé' },
          ] as const).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortKey(opt.key)}
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                border: sortKey === opt.key ? '2px solid #E8832A' : '1px solid #3D3020',
                background:
                  sortKey === opt.key ? 'rgba(232,131,42,0.15)' : 'transparent',
                color: sortKey === opt.key ? '#E8832A' : '#9C8B75',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                fontWeight: sortKey === opt.key ? 600 : 400,
              }}
            >
              Sắp xếp theo {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ color: '#9C8B75', textAlign: 'center', padding: 40 }}>Đang tải...</div>
      ) : visibleStats.length === 0 ? (
        <div style={{ color: '#9C8B75', textAlign: 'center', padding: 40 }}>
          Không có dữ liệu phù hợp
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              color: '#F5ECD7',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid #3D3020' }}>
                <th style={th}>Phim</th>
                <th style={th}>Suất chiếu</th>
                <th style={th}>Vé thanh toán</th>
                <th style={th}>Vé hủy/hoàn</th>
                <th style={th}>Ghế đã bán</th>
                <th style={th}>Tỉ lệ lấp đầy</th>
                <th style={{ ...th, textAlign: 'right' }}>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {visibleStats.map((s) => {
                const fillRate =
                  s.totalSeatsCapacity > 0 ? (s.paidSeats / s.totalSeatsCapacity) * 100 : 0;
                return (
                  <tr key={s.movie.id} style={{ borderBottom: '1px solid #3D3020' }}>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {s.movie.coverImageUrl ? (
                          <img
                            src={s.movie.coverImageUrl}
                            alt={s.movie.title}
                            style={{
                              width: 40,
                              height: 56,
                              objectFit: 'cover',
                              borderRadius: 4,
                              border: '1px solid #3D3020',
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 40,
                              height: 56,
                              borderRadius: 4,
                              background: '#3D3020',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600 }}>{s.movie.title}</div>
                          <div style={{ color: '#9C8B75', fontSize: 12 }}>
                            {s.movie.genres || 'Chưa có thể loại'}
                            {!s.movie.isActive && (
                              <span
                                style={{
                                  marginLeft: 8,
                                  padding: '1px 8px',
                                  borderRadius: 999,
                                  background: 'rgba(156,139,117,0.18)',
                                  color: '#9C8B75',
                                  border: '1px solid rgba(156,139,117,0.4)',
                                  fontSize: 10,
                                }}
                              >
                                Đã ẩn
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={td}>{s.screeningCount}</td>
                    <td style={td}>{s.paidTickets}</td>
                    <td style={td}>{s.cancelledTickets}</td>
                    <td style={td}>
                      {s.paidSeats}
                      <span style={{ color: '#9C8B75' }}>
                        {' '}
                        / {s.totalSeatsCapacity}
                      </span>
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}>
                        <div
                          style={{
                            flex: 1,
                            height: 6,
                            background: '#3D3020',
                            borderRadius: 999,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(100, fillRate).toFixed(1)}%`,
                              height: '100%',
                              background:
                                fillRate >= 70
                                  ? '#22C55E'
                                  : fillRate >= 40
                                  ? '#E8832A'
                                  : '#9C8B75',
                              transition: 'width 0.3s',
                            }}
                          />
                        </div>
                        <span style={{ color: '#9C8B75', fontSize: 12, width: 44, textAlign: 'right' }}>
                          {fillRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ ...td, textAlign: 'right', color: '#E8832A', fontWeight: 700 }}>
                      {formatCurrency(s.revenue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #3D3020' }}>
                <td style={{ ...td, fontWeight: 700 }}>Tổng cộng</td>
                <td style={td}>—</td>
                <td style={{ ...td, fontWeight: 700 }}>{totals.paidTickets}</td>
                <td style={td}>—</td>
                <td style={{ ...td, fontWeight: 700 }}>
                  {totals.paidSeats}
                  <span style={{ color: '#9C8B75' }}> / {totals.totalSeatsCapacity}</span>
                </td>
                <td style={td}>
                  {totals.totalSeatsCapacity > 0
                    ? ((totals.paidSeats / totals.totalSeatsCapacity) * 100).toFixed(1) + '%'
                    : '—'}
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: 'right',
                    color: '#E8832A',
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                >
                  {formatCurrency(totals.revenue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px',
  color: '#9C8B75',
  fontWeight: 500,
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
};

const td: React.CSSProperties = {
  padding: '12px',
  verticalAlign: 'middle',
};

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  subtext?: string;
}

function SummaryCard({ icon, label, value, accent, subtext }: SummaryCardProps) {
  return (
    <div
      style={{
        background: '#211A14',
        border: '1px solid #3D3020',
        borderRadius: 12,
        padding: 20,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        {icon}
        <span style={{ color: '#9C8B75', fontSize: 13 }}>{label}</span>
      </div>
      <div
        style={{
          color: accent,
          fontSize: 24,
          fontWeight: 800,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={value}
      >
        {value}
      </div>
      {subtext && (
        <div style={{ color: '#9C8B75', fontSize: 12, marginTop: 4 }}>{subtext}</div>
      )}
    </div>
  );
}
