import { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  Bell,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Play,
  Ticket,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { moviesApi } from '@/api/movies';
import { MovieResponse } from '@/types/api';
import { toast } from 'sonner';

interface HomePageProps {
  onMovieClick: (movieId: string) => void;
}

const heroSlides = [
  {
    id: 0,
    image:
      'https://images.unsplash.com/photo-1675629229879-8823573b8d74?w=1440&h=440&fit=crop',
    title: 'Avengers: Secret Wars',
    genres: ['Hành Động', 'Khoa Học Viễn Tưởng'],
    rating: 8.7,
    reviews: '2.4k',
    duration: '2h 45m',
    age: 'T18',
  },
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1633885274919-04b5af171f8c?w=1440&h=440&fit=crop',
    title: 'Dune: Part Three',
    genres: ['Khoa Học Viễn Tưởng', 'Phiêu Lưu'],
    rating: 8.5,
    reviews: '1.8k',
    duration: '2h 32m',
    age: 'T16',
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1667857431728-00884201d629?w=1440&h=440&fit=crop',
    title: 'Mission: Impossible 8',
    genres: ['Hành Động', 'Gián Điệp'],
    rating: 8.2,
    reviews: '3.1k',
    duration: '2h 18m',
    age: 'T16',
  },
  {
    id: 3,
    image:
      'https://images.unsplash.com/photo-1629278357549-b413116d211c?w=1440&h=440&fit=crop',
    title: 'Black Widow: Reborn',
    genres: ['Hành Động', 'Siêu Anh Hùng'],
    rating: 7.9,
    reviews: '2.0k',
    duration: '2h 05m',
    age: 'T13',
  },
  {
    id: 4,
    image:
      'https://images.unsplash.com/photo-1572283046480-e990be92d301?w=1440&h=440&fit=crop',
    title: 'The Dark Knight Rises II',
    genres: ['Hành Động', 'Tội Phạm'],
    rating: 9.1,
    reviews: '5.2k',
    duration: '3h 00m',
    age: 'T18',
  },
];

const comingSoon = [
  {
    id: 1,
    title: 'Thor: Love & Thunder 2',
    date: '25/06/2025',
    image:
      'https://images.unsplash.com/photo-1643766737678-2859ed79d2a6?w=200&h=300&fit=crop',
  },
  {
    id: 2,
    title: 'Spider-Man: No Return',
    date: '10/07/2025',
    image:
      'https://images.unsplash.com/photo-1577916239209-c2cab58b4e0d?w=200&h=300&fit=crop',
  },
  {
    id: 3,
    title: 'Guardians Vol. 4',
    date: '15/07/2025',
    image:
      'https://images.unsplash.com/photo-1675726205553-4e348f24da2c?w=200&h=300&fit=crop',
  },
  {
    id: 4,
    title: 'Black Panther 3',
    date: '01/08/2025',
    image:
      'https://images.unsplash.com/photo-1637059880830-59a90102de77?w=200&h=300&fit=crop',
  },
  {
    id: 5,
    title: 'Doctor Strange 3',
    date: '20/08/2025',
    image:
      'https://images.unsplash.com/photo-1720022785516-9653ead7180c?w=200&h=300&fit=crop',
  },
];

const tabs = [
  'Đang Chiếu',
  'Sắp Chiếu',
  'Top Tuần',
  'Phim Hành Động',
  'Phim Tình Cảm',
  'Hoạt Hình',
];

export function HomePage({ onMovieClick }: HomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [movies, setMovies] = useState<MovieResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await moviesApi.getAll();
      setMovies(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách phim';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const slide = heroSlides[currentSlide];
  const prevSlide = () =>
    setCurrentSlide((c) => (c - 1 + heroSlides.length) % heroSlides.length);
  const nextSlide = () =>
    setCurrentSlide((c) => (c + 1) % heroSlides.length);

  return (
    <div style={{ background: '#1A1410', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div
        style={{
          height: 64,
          background: '#211A14',
          borderBottom: '1px solid #3D3020',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <span style={{ color: '#9C8B75', fontSize: 13, whiteSpace: 'nowrap' }}>
          Trang Chủ
        </span>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 420, position: 'relative' }}>
          <Search
            size={15}
            color="#E8832A"
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            placeholder="Tìm kiếm phim..."
            style={{
              width: '100%',
              background: '#2A2018',
              border: '1px solid #3D3020',
              borderRadius: 24,
              padding: '8px 16px 8px 36px',
              color: '#F5ECD7',
              fontSize: 13,
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginLeft: 'auto',
          }}
        >
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#F5ECD7',
              fontSize: 13,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Hồ Chí Minh <ChevronDown size={14} color="#9C8B75" />
          </button>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={20} color="#9C8B75" />
            <div
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#E8832A',
              }}
            />
          </div>
        </div>
      </div>

      {/* Hero Slider */}
      <div style={{ position: 'relative', height: 440, overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Gradients */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to right, rgba(26,20,16,0.92) 35%, rgba(26,20,16,0.3) 100%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(to top, #1A1410, transparent)',
              }}
            />

            {/* Badges */}
            <div
              style={{ position: 'absolute', top: 24, left: 32, display: 'flex', gap: 8 }}
            >
              <span
                style={{
                  background: '#E85252',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                HOT
              </span>
              <span
                style={{
                  background: '#E8832A',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                ĐANG CHIẾU
              </span>
            </div>

            {/* Content */}
            <div style={{ position: 'absolute', bottom: 48, left: 32 }}>
              {/* Genre pills */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {slide.genres.map((g) => (
                  <span
                    key={g}
                    style={{
                      border: '1px solid #E8832A',
                      color: '#E8832A',
                      fontSize: 12,
                      padding: '4px 14px',
                      borderRadius: 20,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Title */}
              <div
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 48,
                  fontWeight: 700,
                  color: '#F5ECD7',
                  lineHeight: 1.1,
                  marginBottom: 14,
                }}
              >
                {slide.title}
              </div>

              {/* Stars */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={14} fill="#E8832A" color="#E8832A" />
                  ))}
                </div>
                <span
                  style={{ color: '#E8832A', fontWeight: 700, fontSize: 14 }}
                >
                  {slide.rating}/10
                </span>
                <span style={{ color: '#9C8B75', fontSize: 13 }}>
                  ({slide.reviews} đánh giá)
                </span>
              </div>

              {/* Meta */}
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  marginBottom: 22,
                  color: '#9C8B75',
                  fontSize: 13,
                }}
              >
                <Clock size={14} color="#9C8B75" />
                <span>{slide.duration}</span>
                <span style={{ color: '#3D3020' }}>|</span>
                <span
                  style={{
                    border: '1px solid #9C8B75',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  {slide.age}
                </span>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => onMovieClick(slide.id?.toString() || '')}
                  style={{
                    width: 160,
                    padding: '12px 0',
                    background: '#E8832A',
                    border: 'none',
                    borderRadius: 8,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <Ticket size={16} /> Đặt Vé Ngay
                </button>
                <button
                  style={{
                    width: 160,
                    padding: '12px 0',
                    background: 'transparent',
                    border: '1px solid #E8832A',
                    borderRadius: 8,
                    color: '#E8832A',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <Play size={15} fill="#E8832A" color="#E8832A" /> Xem Trailer
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Arrow buttons */}
        <button
          onClick={prevSlide}
          style={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={20} color="#F5ECD7" />
        </button>
        <button
          onClick={nextSlide}
          style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronRight size={20} color="#F5ECD7" />
        </button>

        {/* Dot navigation */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 6,
          }}
        >
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              style={{
                height: 6,
                width: i === currentSlide ? 24 : 6,
                borderRadius: 3,
                background: i === currentSlide ? '#E8832A' : '#3D3020',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div
        style={{
          padding: '20px 24px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #3D3020',
        }}
      >
        <div style={{ display: 'flex' }}>
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              style={{
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                borderBottom:
                  activeTab === i ? '2px solid #E8832A' : '2px solid transparent',
                cursor: 'pointer',
                color: activeTab === i ? '#E8832A' : '#9C8B75',
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                fontWeight: activeTab === i ? 600 : 400,
                transition: 'all 0.2s',
                marginBottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          style={{
            color: '#E8832A',
            fontSize: 13,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Xem tất cả →
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            margin: '24px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #EF4444',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <AlertCircle color="#EF4444" size={20} style={{ flexShrink: 0 }} />
          <span style={{ color: '#EF4444', fontSize: '14px' }}>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ color: '#9C8B75', fontSize: '16px' }}>Đang tải danh sách phim...</div>
        </div>
      )}

      {/* Movie Grid */}
      {!isLoading && !error && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
            padding: '24px 24px 40px',
          }}
        >
          {movies.map((movie, idx) => (
            <div
              key={movie.id}
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: '#2A2018',
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                transform: hoveredCard === idx ? 'translateY(-4px)' : 'translateY(0)',
              }}
            >
              {/* Poster */}
              <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden', background: '#1A1410' }}>
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
                      background: '#2A2018',
                      color: '#9C8B75',
                      fontSize: '12px',
                    }}
                  >
                    Không có hình ảnh
                  </div>
                )}
                {hoveredCard === idx && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.65)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: '#E8832A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Play size={20} color="#fff" fill="#fff" />
                    </div>
                    <button
                      onClick={() => onMovieClick(movie.id)}
                      style={{
                        background: '#E8832A',
                        border: 'none',
                        borderRadius: 6,
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 700,
                        padding: '8px 20px',
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      Đặt Vé Nhanh
                    </button>
                  </div>
                )}
              </div>

              {/* Card info */}
              <div style={{ padding: 12 }}>
                <div
                  style={{
                    color: '#F5ECD7',
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 4,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.4,
                  }}
                >
                  {movie.title}
                </div>
                <div style={{ color: '#9C8B75', fontSize: 12, marginBottom: 8 }}>
                  {movie.genres || 'Không xác định'}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 10,
                    fontSize: 12,
                  }}
                >
                  <Star size={12} fill="#E8832A" color="#E8832A" />
                  <span style={{ color: '#E8832A', fontWeight: 600 }}>8.5</span>
                  <span style={{ color: '#3D3020' }}>|</span>
                  <Clock size={12} color="#9C8B75" />
                  <span style={{ color: '#9C8B75' }}>{movie.durationMinutes}m</span>
                </div>
                <button
                  onClick={() => onMovieClick(movie.id)}
                  style={{
                    width: '100%',
                    padding: '8px 0',
                    background: '#E8832A',
                    border: 'none',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Đặt Vé
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Coming Soon */}
      <div style={{ padding: '0 24px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 24,
              fontWeight: 600,
              color: '#F5ECD7',
            }}
          >
            Sắp Ra Mắt
          </div>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#E8832A',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            paddingBottom: 8,
          }}
        >
          {comingSoon.map((movie) => (
            <div key={movie.id} style={{ flexShrink: 0, width: 180 }}>
              <div
                style={{
                  borderRadius: 10,
                  overflow: 'hidden',
                  marginBottom: 10,
                  aspectRatio: '2/3',
                }}
              >
                <img
                  src={movie.image}
                  alt={movie.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ color: '#E8832A', fontSize: 11, marginBottom: 4 }}>
                Khởi chiếu: {movie.date}
              </div>
              <div
                style={{
                  color: '#F5ECD7',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 10,
                }}
              >
                {movie.title}
              </div>
              <button
                style={{
                  width: '100%',
                  padding: '7px 0',
                  background: 'transparent',
                  border: '1px solid #E8832A',
                  borderRadius: 6,
                  color: '#E8832A',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Nhắc Nhở
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
