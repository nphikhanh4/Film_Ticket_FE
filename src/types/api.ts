// API Response types
export interface AuthResponse {
  accessToken: string;
  expiresAtUtc: string;
}

export interface MovieResponse {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  isActive: boolean;
  director?: string;
  genres?: string;
  coverImageUrl?: string;
}

export interface ScreeningResponse {
  id: string;
  movieId: string;
  startAtUtc: string;
  totalSeats: number;
  venue?: string;
}

export interface SoldSeatsResponse {
  screeningId: string;
  seatNumbers: number[];
}

export interface TicketResponse {
  id: string;
  screeningId: string;
  seatCount: number;
  seatNumbers: number[];
  amount: number;
  status: TicketStatus;
  paymentReference?: string;
  createdAtUtc: string;
}

export interface MyTicketsResponse {
  id: string;
  userId?: string;
  screeningId: string;
  seatCount: number;
  seatNumbers: number[];
  amount: number;
  status: TicketStatus;
  paymentReference?: string;
  createdAtUtc: string;
}

export interface AdminTicketResponseDto {
  ticketId: string;
  userId: string;
  screeningId: string;
  seatCount: number;
  seatNumbers: number[];
  amount: number;
  status: TicketStatus;
  paymentReference?: string;
  createdAtUtc: string;
}

export interface CancelTicketResponse {
  id: string;
  status: TicketStatus;
}

// API Request types
export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TicketCreateRequest {
  screeningId: string;
  seatNumbers: number[];
  amount: number;
}

// Enums
export enum TicketStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded',
}

// User session
export interface User {
  id: string;
  username: string;
  role?: 'user' | 'admin';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}
