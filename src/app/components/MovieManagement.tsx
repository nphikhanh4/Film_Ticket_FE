import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Eye, EyeOff } from 'lucide-react';
import { moviesApi } from '@/api/movies';
import { adminMoviesApi } from '@/api/adminMovies';
import { MovieResponse } from '@/types/api';
import { toast } from 'sonner';

interface FormData {
  title: string;
  description?: string;
  durationMinutes: number;
  director?: string;
  genres?: string;
  coverImageUrl?: string;
  isActive: boolean;
}

export function MovieManagement() {
  const [movies, setMovies] = useState<MovieResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    durationMinutes: 120,
    isActive: true,
  });

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    setIsLoading(true);
    try {
      const data = await moviesApi.getAll(true);
      setMovies(data);
    } catch (err) {
      toast.error('Không thể tải danh sách phim');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminMoviesApi.update(editingId, formData);
        toast.success('Cập nhật phim thành công');
      } else {
        const { isActive: _ignored, ...createPayload } = formData;
        await adminMoviesApi.create(createPayload);
        toast.success('Thêm phim thành công');
      }
      loadMovies();
      resetForm();
    } catch (err) {
      toast.error('Không thể lưu phim');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phim này?')) return;
    try {
      await adminMoviesApi.delete(id);
      toast.success('Xóa phim thành công');
      loadMovies();
    } catch (err) {
      toast.error('Không thể xóa phim');
    }
  };

  const handleToggleActive = async (movie: MovieResponse) => {
    try {
      await adminMoviesApi.update(movie.id, {
        title: movie.title,
        description: movie.description,
        durationMinutes: movie.durationMinutes,
        director: movie.director,
        genres: movie.genres,
        coverImageUrl: movie.coverImageUrl,
        isActive: !movie.isActive,
      });
      toast.success(
        !movie.isActive ? 'Đã bật hiển thị phim' : 'Đã tắt hiển thị phim'
      );
      loadMovies();
    } catch (err) {
      toast.error('Không thể cập nhật trạng thái phim');
    }
  };

  const handleEdit = (movie: MovieResponse) => {
    setFormData({
      title: movie.title,
      description: movie.description,
      durationMinutes: movie.durationMinutes,
      director: movie.director,
      genres: movie.genres,
      coverImageUrl: movie.coverImageUrl,
      isActive: movie.isActive,
    });
    setEditingId(movie.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ title: '', durationMinutes: 120, isActive: true });
    setEditingId(null);
    setShowForm(false);
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
        Thêm Phim Mới
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
            <input
              type="text"
              placeholder="Tên phim *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              placeholder="Thời lượng (phút) *"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
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
              placeholder="Đạo diễn"
              value={formData.director || ''}
              onChange={(e) => setFormData({ ...formData, director: e.target.value })}
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
              placeholder="Thể loại"
              value={formData.genres || ''}
              onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
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
              type="url"
              placeholder="URL ảnh bìa"
              value={formData.coverImageUrl || ''}
              onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
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
          <textarea
            placeholder="Mô tả"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#1A1410',
              border: '1px solid #3D3020',
              borderRadius: '6px',
              color: '#F5ECD7',
              fontFamily: 'Inter, sans-serif',
              marginTop: '16px',
              minHeight: '80px',
              resize: 'vertical',
            }}
          />
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
        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {movies.map((movie) => (
            <div
              key={movie.id}
              style={{
                background: '#211A14',
                border: movie.isActive ? '1px solid #3D3020' : '1px dashed #5A4632',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                opacity: movie.isActive ? 1 : 0.7,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  background: movie.isActive
                    ? 'rgba(34,197,94,0.15)'
                    : 'rgba(156,139,117,0.18)',
                  color: movie.isActive ? '#22C55E' : '#9C8B75',
                  border: movie.isActive
                    ? '1px solid rgba(34,197,94,0.4)'
                    : '1px solid rgba(156,139,117,0.4)',
                  zIndex: 1,
                }}
              >
                {movie.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
              </div>
              {movie.coverImageUrl && (
                <img
                  src={movie.coverImageUrl}
                  alt={movie.title}
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    filter: movie.isActive ? 'none' : 'grayscale(0.6)',
                  }}
                />
              )}
              <h3 style={{ color: '#F5ECD7', marginBottom: '8px', fontSize: '16px', fontWeight: 700 }}>
                {movie.title}
              </h3>
              <div style={{ color: '#9C8B75', fontSize: '12px', marginBottom: '12px', flex: 1 }}>
                <p>⏱️ {movie.durationMinutes} phút</p>
                {movie.director && <p>🎬 {movie.director}</p>}
                {movie.genres && <p>🎭 {movie.genres}</p>}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleToggleActive(movie)}
                  title={movie.isActive ? 'Ẩn phim' : 'Bật hiển thị'}
                  style={{
                    flex: '1 1 100%',
                    padding: '8px 12px',
                    background: movie.isActive
                      ? 'rgba(156,139,117,0.15)'
                      : 'rgba(34,197,94,0.15)',
                    color: movie.isActive ? '#9C8B75' : '#22C55E',
                    border: movie.isActive
                      ? '1px solid rgba(156,139,117,0.4)'
                      : '1px solid rgba(34,197,94,0.4)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {movie.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                  {movie.isActive ? 'Ẩn phim' : 'Bật hiển thị'}
                </button>
                <button
                  onClick={() => handleEdit(movie)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'rgba(232,131,42,0.15)',
                    color: '#E8832A',
                    border: '1px solid rgba(232,131,42,0.4)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Edit2 size={14} />
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(movie.id)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'rgba(239,68,68,0.15)',
                    color: '#EF4444',
                    border: '1px solid rgba(239,68,68,0.4)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Trash2 size={14} />
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
