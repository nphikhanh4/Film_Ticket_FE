import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, AlertTriangle, X } from 'lucide-react';
import { screeningsApi } from '@/api/screenings';
import { moviesApi } from '@/api/movies';
import { adminScreeningsApi } from '@/api/adminScreenings';
import { ScreeningResponse, MovieResponse } from '@/types/api';
import { toast } from 'sonner';

interface FormData {
  movieId: string;
  startAtUtc: string;
  totalSeats: number;
  venue?: string;
}

interface ConflictInfo {
  movieTitle: string;
  venue: string;
  startAt: Date;
  endAt: Date;
  newStartAt: Date;
  newEndAt: Date;
  newMovieTitle: string;
}

export function ScreeningManagement() {
  const [screenings, setScreenings] = useState<ScreeningResponse[]>([]);
  const [movies, setMovies] = useState<MovieResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    movieId: '',
    startAtUtc: new Date().toISOString().slice(0, 16),
    totalSeats: 100,
  });
  const [conflict, setConflict] = useState<ConflictInfo | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [screeningsData, moviesData] = await Promise.all([
        screeningsApi.getAll(),
        moviesApi.getAll(),
      ]);
      setScreenings(screeningsData);
      setMovies(moviesData);
    } catch (err) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  // Trả về thông tin xung đột nếu suất chiếu mới bị trùng giờ với suất đang có (cùng venue),
  // hoặc null nếu hợp lệ. End time = StartAtUtc + Movie.DurationMinutes.
  const validateNoOverlap = (): ConflictInfo | { error: string } | null => {
    const newMovie = movies.find((m) => m.id === formData.movieId);
    if (!newMovie) return { error: 'Phim không hợp lệ' };

    const newStart = new Date(formData.startAtUtc).getTime();
    if (Number.isNaN(newStart)) return { error: 'Thời gian bắt đầu không hợp lệ' };
    const newEnd = newStart + newMovie.durationMinutes * 60 * 1000;

    const normalize = (v?: string) => (v ?? '').trim().toLowerCase();
    const newVenue = normalize(formData.venue);

    for (const s of screenings) {
      if (editingId && s.id === editingId) continue;
      // Chỉ coi là xung đột khi cùng rạp (cùng venue, kể cả khi đều bỏ trống)
      if (normalize(s.venue) !== newVenue) continue;

      const existingMovie = movies.find((m) => m.id === s.movieId);
      const existingDuration = existingMovie?.durationMinutes ?? 0;
      const existingStart = new Date(s.startAtUtc).getTime();
      const existingEnd = existingStart + existingDuration * 60 * 1000;

      const overlap = newStart < existingEnd && existingStart < newEnd;
      if (overlap) {
        return {
          movieTitle: existingMovie?.title ?? 'Phim khác',
          venue: s.venue?.trim() ? s.venue : 'Rạp chưa đặt tên',
          startAt: new Date(existingStart),
          endAt: new Date(existingEnd),
          newStartAt: new Date(newStart),
          newEndAt: new Date(newEnd),
          newMovieTitle: newMovie.title,
        };
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Form submitted with data:', formData);

    const result = validateNoOverlap();
    if (result && 'error' in result) {
      toast.error(result.error);
      return;
    }
    if (result) {
      console.warn('⛔ Overlap detected:', result);
      setConflict(result);
      return;
    }

    try {
      if (editingId) {
        console.log('✏️ Updating screening:', editingId);
        await adminScreeningsApi.update(editingId, formData);
        toast.success('Cập nhật suất chiếu thành công');
      } else {
        console.log('➕ Creating new screening');
        await adminScreeningsApi.create(formData);
        toast.success('Thêm suất chiếu thành công');
      }
      loadData();
      resetForm();
    } catch (err) {
      console.error('❌ Submit error:', err);
      toast.error('Không thể lưu suất chiếu');
    }
  };

  const resetForm = () => {
    console.log('🔄 Resetting form');
    setFormData({
      movieId: '',
      startAtUtc: new Date().toISOString().slice(0, 16),
      totalSeats: 100,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    console.log('🗑️ Delete button clicked, id:', id);
    if (!confirm('Bạn có chắc chắn muốn xóa suất chiếu này?')) return;
    try {
      console.log('🔄 Deleting screening...');
      await adminScreeningsApi.delete(id);
      toast.success('Xóa suất chiếu thành công');
      loadData();
    } catch (err) {
      console.error('❌ Delete error:', err);
      toast.error('Không thể xóa suất chiếu');
    }
  };

  const handleEdit = (screening: ScreeningResponse) => {
    console.log('✏️ Edit button clicked, screening:', screening);
    setFormData({
      movieId: screening.movieId,
      startAtUtc: screening.startAtUtc.slice(0, 16),
      totalSeats: screening.totalSeats,
      venue: screening.venue,
    });
    setEditingId(screening.id);
    setShowForm(true);
    console.log('📋 Form opened for editing');
  };

  const getMovieTitle = (movieId: string) => {
    return movies.find(m => m.id === movieId)?.title || 'N/A';
  };

  const getEndTime = (screening: ScreeningResponse): Date | null => {
    const movie = movies.find((m) => m.id === screening.movieId);
    if (!movie) return null;
    const startMs = new Date(screening.startAtUtc).getTime();
    if (Number.isNaN(startMs)) return null;
    return new Date(startMs + movie.durationMinutes * 60 * 1000);
  };

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          marginBottom: '24px',
          padding: '10px 16px',
          background: '#E8832A',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Plus size={16} />
        Thêm Suất Chiếu Mới
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#211A14',
            border: '1px solid #3D3020',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <select
              value={formData.movieId}
              onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
              required
              style={{
                padding: '8px 12px',
                background: '#1A1410',
                border: '1px solid #3D3020',
                borderRadius: '6px',
                color: '#F5ECD7',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <option value="">Chọn phim *</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  {movie.title}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={formData.startAtUtc}
              onChange={(e) => setFormData({ ...formData, startAtUtc: e.target.value })}
              required
              style={{
                padding: '8px 12px',
                background: '#1A1410',
                border: '1px solid #3D3020',
                borderRadius: '6px',
                color: '#F5ECD7',
                fontFamily: 'Inter, sans-serif',
              }}
            />
            <input
              type="number"
              placeholder="Tổng ghế *"
              value={formData.totalSeats}
              onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })}
              required
              style={{
                padding: '8px 12px',
                background: '#1A1410',
                border: '1px solid #3D3020',
                borderRadius: '6px',
                color: '#F5ECD7',
                fontFamily: 'Inter, sans-serif',
              }}
            />
            <input
              type="text"
              placeholder="Rạp chiếu"
              value={formData.venue || ''}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              style={{
                padding: '8px 12px',
                background: '#1A1410',
                border: '1px solid #3D3020',
                borderRadius: '6px',
                color: '#F5ECD7',
                fontFamily: 'Inter, sans-serif',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                background: '#E8832A',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {editingId ? 'Cập Nhật' : 'Thêm'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: '8px 16px',
                background: '#3D3020',
                color: '#F5ECD7',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div style={{ color: '#9C8B75', textAlign: 'center', padding: '40px' }}>
          Đang tải...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', color: '#F5ECD7', fontFamily: 'Inter, sans-serif' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #3D3020' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#9C8B75' }}>Phim</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#9C8B75' }}>Bắt đầu</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#9C8B75' }}>Kết thúc</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#9C8B75' }}>Rạp</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#9C8B75' }}>Ghế</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#9C8B75' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {screenings.map((screening) => {
                const endTime = getEndTime(screening);
                return (
                <tr key={screening.id} style={{ borderBottom: '1px solid #3D3020' }}>
                  <td style={{ padding: '12px' }}>{getMovieTitle(screening.movieId)}</td>
                  <td style={{ padding: '12px' }}>
                    {new Date(screening.startAtUtc).toLocaleString('vi-VN')}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {endTime ? endTime.toLocaleString('vi-VN') : 'N/A'}
                  </td>
                  <td style={{ padding: '12px' }}>{screening.venue || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>{screening.totalSeats}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(screening)}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(232,131,42,0.15)',
                          color: '#E8832A',
                          border: '1px solid rgba(232,131,42,0.4)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(screening.id)}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(239,68,68,0.15)',
                          color: '#EF4444',
                          border: '1px solid rgba(239,68,68,0.4)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {conflict && (
        <div
          onClick={() => setConflict(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="conflict-title"
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#211A14',
              border: '1px solid #3D3020',
              borderRadius: '12px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              fontFamily: 'Inter, sans-serif',
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
                background: 'rgba(232,131,42,0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'rgba(232,131,42,0.18)',
                    border: '1px solid rgba(232,131,42,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#E8832A',
                  }}
                >
                  <AlertTriangle size={18} />
                </div>
                <h3
                  id="conflict-title"
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#F5ECD7',
                  }}
                >
                  Trùng suất chiếu
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConflict(null)}
                aria-label="Đóng"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9C8B75',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#D6C5A7', lineHeight: 1.5 }}>
                Không thể thêm/cập nhật suất chiếu này vì khoảng thời gian bị trùng với một suất
                đang chiếu tại cùng rạp.
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
                  Suất chiếu đang có
                </div>
                <div>
                  <span style={{ color: '#9C8B75' }}>Phim: </span>
                  <span style={{ color: '#F5ECD7' }}>{conflict.movieTitle}</span>
                </div>
                <div>
                  <span style={{ color: '#9C8B75' }}>Rạp: </span>
                  <span style={{ color: '#F5ECD7' }}>{conflict.venue}</span>
                </div>
                <div>
                  <span style={{ color: '#9C8B75' }}>Thời gian: </span>
                  <span style={{ color: '#E8832A' }}>
                    {conflict.startAt.toLocaleString('vi-VN')} - {conflict.endAt.toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>

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
                  Suất chiếu bạn đang thêm
                </div>
                <div>
                  <span style={{ color: '#9C8B75' }}>Phim: </span>
                  <span style={{ color: '#F5ECD7' }}>{conflict.newMovieTitle}</span>
                </div>
                <div>
                  <span style={{ color: '#9C8B75' }}>Thời gian: </span>
                  <span style={{ color: '#E8832A' }}>
                    {conflict.newStartAt.toLocaleString('vi-VN')} - {conflict.newEndAt.toLocaleString('vi-VN')}
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
                onClick={() => setConflict(null)}
                style={{
                  padding: '8px 18px',
                  background: '#E8832A',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
