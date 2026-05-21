import { useState, useEffect } from 'react';
import { Star, Clock, Globe, Calendar, MapPin, Heart, AlertCircle } from 'lucide-react';
import { moviesApi } from '@/api/movies';
import { screeningsApi } from '@/api/screenings';
import { MovieResponse, ScreeningResponse } from '@/types/api';
import { toast } from 'sonner';

interface MovieDetailPageProps {
  movieId: string;
  onSelectShowtime: (screening: ScreeningResponse) => void;
}

export function MovieDetailPage({ movieId, onSelectShowtime }: MovieDetailPageProps) {
  const [movie, setMovie] = useState<MovieResponse | null>(null);
  const [screenings, setScreenings] = useState<ScreeningResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(0);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    loadData();
  }, [movieId]);

  // Đảm bảo selectedDate luôn nằm trong khoảng hợp lệ khi danh sách ngày thay đổi
  useEffect(() => {
    if (selectedDate !== 0) {
      setSelectedDate(0);
    }
    // chỉ reset khi screenings được tải lại
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenings]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [movieData, screeningsData] = await Promise.all([
        moviesApi.getById(movieId),
        screeningsApi.getByMovie(movieId),
      ]);
      setMovie(movieData);
      setScreenings(screeningsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải dữ liệu phim';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ background: '#1A1410', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#9C8B75', fontSize: '16px' }}>Đang tải thông tin phim...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div style={{ background: '#1A1410', minHeight: '100vh', padding: '40px 20px' }}>
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #EF4444',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <AlertCircle color="#EF4444" style={{ flexShrink: 0 }} />
          <span style={{ color: '#EF4444', fontSize: '14px' }}>{error || 'Không thể tải phim'}</span>
        </div>
      </div>
    );
  }

  // Chỉ giữ các suất chiếu trong tương lai (sau thời điểm hiện tại)
  const now = new Date();
  const upcomingScreenings = screenings.filter(
    (s) => new Date(s.startAtUtc).getTime() > now.getTime()
  );

  // Extract unique dates from upcoming screenings
  const uniqueDates = Array.from(
    new Set(
      upcomingScreenings.map((s) => new Date(s.startAtUtc).toDateString())
    )
  )
    .map((dateStr) => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime())
    .map((date) => {
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return {
        day: dayNames[date.getDay()],
        date: date.getDate().toString().padStart(2, '0'),
        dateObj: date,
      };
    });

  // Filter screenings by selected date
  const selectedDateObj = uniqueDates[selectedDate]?.dateObj;
  const filteredScreenings = selectedDateObj
    ? upcomingScreenings.filter((s) => {
        const screeningDate = new Date(s.startAtUtc);
        return screeningDate.toDateString() === selectedDateObj.toDateString();
      })
    : upcomingScreenings;

  // Group screenings by venue
  const screeningsByVenue = filteredScreenings.reduce(
    (acc, screening) => {
      if (!acc[screening.venue || 'Không xác định']) {
        acc[screening.venue || 'Không xác định'] = [];
      }
      acc[screening.venue || 'Không xác định'].push(screening);
      return acc;
    },
    {} as Record<string, ScreeningResponse[]>
  );

  const genres = movie.genres?.split(',').map((g) => g.trim()) || [];

  return (
    <div style={{ background: '#1A1410', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Hero Backdrop */}
      <div style={{ position: 'relative', height: 380, overflow: 'hidden' }}>
        {/* Blurred background */}
        <img
          src={movie.coverImageUrl || 'https://images.unsplash.com/photo-1643677841226-d6427625f118?w=1440&h=380&fit=crop'}
          alt="backdrop"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(10px) brightness(0.2)',
            transform: 'scale(1.08)',
          }}
        />
        {/* Amber glow overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(232,131,42,0.1) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(26,20,16,0.3), rgba(26,20,16,0.95))',
          }}
        />

        {/* Content container */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-end',
            padding: '40px',
            gap: '40px',
          }}
        >
          {/* Poster */}
          <div
            style={{
              flexShrink: 0,
              width: '200px',
              aspectRatio: '2/3',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              background: '#2A2018',
            }}
          >
            {movie.coverImageUrl ? (
              <img
                src={movie.coverImageUrl}
                alt={movie.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#211A14',
                  color: '#9C8B75',
                }}
              >
                Không có hình ảnh
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <h1
                style={{
                  fontSize: '40px',
                  fontWeight: 700,
                  color: '#F5ECD7',
                  margin: 0,
                }}
              >
                {movie.title}
              </h1>
              <button
                onClick={() => setFavorited(!favorited)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '1px solid #3D3020',
                  background: favorited ? 'rgba(232,131,42,0.1)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Heart size={24} color={favorited ? '#E8832A' : '#9C8B75'} fill={favorited ? '#E8832A' : 'none'} />
              </button>
            </div>

            {/* Meta info */}
            <div
              style={{
                display: 'flex',
                gap: '24px',
                marginBottom: '16px',
                color: '#9C8B75',
                fontSize: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={16} fill="#E8832A" color="#E8832A" />
                <span style={{ color: '#E8832A', fontWeight: 600 }}>8.5/10</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#E8832A" />
                <span>{movie.durationMinutes} phút</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={16} color="#E8832A" />
                <span>{movie.director || 'Không xác định'}</span>
              </div>
            </div>

            {/* Genres */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {genres.map((g) => (
                <span
                  key={g}
                  style={{
                    border: '1px solid #E8832A',
                    color: '#E8832A',
                    fontSize: '12px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                  }}
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Description */}
            <p style={{ color: '#9C8B75', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              {movie.description || 'Không có mô tả'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {upcomingScreenings.length === 0 ? (
          <div
            style={{
              background: 'rgba(232,131,42,0.1)',
              border: '1px solid #E8832A',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              color: '#E8832A',
            }}
          >
            {screenings.length === 0
              ? 'Không có lịch chiếu nào cho phim này'
              : 'Không còn lịch chiếu sắp tới cho phim này'}
          </div>
        ) : (
          <>
            {/* Date selector */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ color: '#F5ECD7', fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                Chọn Ngày Chiếu
              </h2>
              {uniqueDates.length === 0 ? (
                <div style={{ color: '#9C8B75', fontSize: '14px' }}>
                  Không có suất chiếu nào cho phim này
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {uniqueDates.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(i)}
                      style={{
                        flexShrink: 0,
                        padding: '12px 20px',
                        borderRadius: '8px',
                        border: selectedDate === i ? '2px solid #E8832A' : '1px solid #3D3020',
                        background:
                          selectedDate === i
                            ? 'linear-gradient(to right, rgba(232,131,42,0.15), rgba(232,131,42,0.05))'
                            : 'transparent',
                        color: selectedDate === i ? '#E8832A' : '#9C8B75',
                        fontSize: '14px',
                        fontWeight: selectedDate === i ? 600 : 400,
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '12px' }}>{d.day}</div>
                      <div style={{ fontSize: '16px', fontWeight: 700 }}>{d.date}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Screenings by venue */}
            <div style={{ display: 'grid', gap: '32px' }}>
              {Object.entries(screeningsByVenue).map(([venue, venueScreenings]) => (
                <div key={venue}>
                  <h3
                    style={{
                      color: '#F5ECD7',
                      fontSize: '18px',
                      fontWeight: 600,
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <MapPin size={20} color="#E8832A" />
                    {venue}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                    {venueScreenings.map((screening) => {
                      const screeningDate = new Date(screening.startAtUtc);
                      const screeningTime = screeningDate.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div
                          key={screening.id}
                          style={{
                            background: '#211A14',
                            border: '1px solid #3D3020',
                            borderRadius: '12px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                          }}
                        >
                          <div>
                            <div style={{ color: '#9C8B75', fontSize: '12px', marginBottom: '4px' }}>Giờ chiếu</div>
                            <div style={{ color: '#F5ECD7', fontSize: '24px', fontWeight: 700 }}>{screeningTime}</div>
                          </div>

                          <div>
                            <div style={{ color: '#9C8B75', fontSize: '12px', marginBottom: '4px' }}>Tổng ghế</div>
                            <div style={{ color: '#F5ECD7', fontSize: '16px' }}>{screening.totalSeats} ghế</div>
                          </div>

                          <button
                            onClick={() => onSelectShowtime(screening)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              background: '#E8832A',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '14px',
                              cursor: 'pointer',
                              fontFamily: 'Inter, sans-serif',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.background = '#D4691F';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.background = '#E8832A';
                            }}
                          >
                            Chọn Ghế
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
