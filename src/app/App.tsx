import { useState, useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { LoginPage } from './components/LoginPage';
import { Sidebar, type Page } from './components/Sidebar';
import { HomePage } from './components/HomePage';
import { MovieDetailPage } from './components/MovieDetailPage';
import { SeatSelectionModal } from './components/SeatSelectionModal';
import { TicketConfirmationPage } from './components/TicketConfirmationPage';
import { BookingHistoryPage } from './components/BookingHistoryPage';
import { AdminDashboard } from './components/AdminDashboard';
import { ChangePasswordPage } from './components/ChangePasswordPage';
import { ScreeningResponse, TicketResponse, MovieResponse } from '@/types/api';

interface BookingInfo {
  movie: MovieResponse;
  screening: ScreeningResponse;
  ticket: TicketResponse;
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showModal, setShowModal] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [selectedScreening, setSelectedScreening] = useState<ScreeningResponse | null>(null);
  const [lastBooking, setLastBooking] = useState<BookingInfo | null>(null);
  const auth = useAuth();

  useEffect(() => {
    const storedUser = sessionStorage.getItem('auth_user');
    console.log('💾 Stored user in sessionStorage:', storedUser ? JSON.parse(storedUser) : null);
    console.log('🔍 Auth state:', { user: auth.user, role: auth.user?.role });

    if (auth.user?.role === 'admin') {
      console.log('✅ User is admin, redirecting...');
      if (currentPage === 'home') {
        setCurrentPage('admin');
      }
    } else {
      console.log('❌ User is not admin, role is:', auth.user?.role);
    }
  }, [auth.user?.role, currentPage]);

  const navigate = (page: Page, movieId?: string) => {
    if (movieId) {
      setSelectedMovieId(movieId);
    }
    setCurrentPage(page);
    setShowModal(false);
  };

  if (!auth.isAuthenticated) {
    return <LoginPage onSuccess={() => navigate('home')} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1A1410' }}>
      <Sidebar activePage={currentPage} onNavigate={navigate} isAdmin={auth.user?.role === 'admin'} />

      <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh' }}>
        {currentPage === 'home' && (
          <HomePage
            onMovieClick={(movieId) => {
              navigate('detail', movieId);
            }}
          />
        )}
        {currentPage === 'detail' && selectedMovieId && (
          <MovieDetailPage
            movieId={selectedMovieId}
            onSelectShowtime={(screening) => {
              setSelectedScreening(screening);
              setShowModal(true);
            }}
          />
        )}
        {currentPage === 'confirmation' && lastBooking && (
          <TicketConfirmationPage
            booking={lastBooking}
            onViewHistory={() => navigate('history')}
            onBookAnother={() => {
              setLastBooking(null);
              navigate('home');
            }}
          />
        )}
        {currentPage === 'history' && <BookingHistoryPage />}
        {currentPage === 'change-password' && <ChangePasswordPage />}
        {currentPage === 'admin' && auth.user?.role === 'admin' && <AdminDashboard />}
      </main>

      {showModal && selectedScreening && (
        <SeatSelectionModal
          screening={selectedScreening}
          onClose={() => setShowModal(false)}
          onConfirm={(movie, ticket) => {
            setLastBooking({
              movie,
              screening: selectedScreening,
              ticket,
            });
            setShowModal(false);
            navigate('confirmation');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
