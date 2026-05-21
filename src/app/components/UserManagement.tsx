import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Crown,
  KeyRound,
  Trash2,
  Plus,
  Search,
  X,
  AlertTriangle,
  Eye,
  Trophy,
  RefreshCw,
} from 'lucide-react';
import { adminUsersApi, AdminUserListItem, AdminUserDetail } from '@/api/adminUsers';
import { TicketStatus } from '@/types/api';
import { toast } from 'sonner';

const STATUS_NUM_MAP: Record<number, TicketStatus> = {
  0: TicketStatus.Pending,
  1: TicketStatus.Paid,
  2: TicketStatus.Cancelled,
  3: TicketStatus.Refunded,
};

function formatCurrency(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

function rankColor(rank: number) {
  if (rank === 1) return '#F5C242';
  if (rank === 2) return '#C0C0C0';
  if (rank === 3) return '#CD7F32';
  return '#9C8B75';
}

export function UserManagement() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [creating, setCreating] = useState(false);
  const [resettingUser, setResettingUser] = useState<AdminUserListItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserListItem | null>(null);
  const [historyUser, setHistoryUser] = useState<AdminUserListItem | null>(null);
  const [historyData, setHistoryData] = useState<AdminUserDetail | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminUsersApi.getAll();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách user');
    } finally {
      setIsLoading(false);
    }
  };

  // Backend đã sort theo totalSpent desc, nhưng để chắc chắn rank đúng khi search filter,
  // ta gắn rank toàn cục trước khi filter.
  const rankedUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => b.totalSpent - a.totalSpent || b.paidTicketCount - a.paidTicketCount)
      .map((u, idx) => ({ ...u, rank: idx + 1 }));
  }, [users]);

  const visibleUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rankedUsers;
    return rankedUsers.filter((u) => u.username.toLowerCase().includes(q));
  }, [rankedUsers, search]);

  const totals = useMemo(() => {
    const totalUsers = users.length;
    const totalAdmins = users.filter((u) => u.isAdmin).length;
    const totalRevenue = users.reduce((acc, u) => acc + u.totalSpent, 0);
    return { totalUsers, totalAdmins, totalRevenue };
  }, [users]);

  const openHistory = async (user: AdminUserListItem) => {
    setHistoryUser(user);
    setHistoryData(null);
    setHistoryLoading(true);
    try {
      const detail = await adminUsersApi.getTickets(user.id);
      setHistoryData(detail);
    } catch {
      toast.error('Không thể tải lịch sử đặt vé');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 20,
        }}
      >
        <div style={{ color: '#F5ECD7', fontSize: 18, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
          Quản Lý Tài Khoản
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={loadUsers}
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
          <button
            onClick={() => setCreating(true)}
            style={{
              padding: '8px 14px',
              background: '#E8832A',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Plus size={14} />
            Tạo Tài Khoản Mới
          </button>
        </div>
      </div>

      {/* Summary */}
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          marginBottom: 20,
        }}
      >
        <SummaryCard
          icon={<Users size={22} color="#3B82F6" />}
          label="Tổng số tài khoản"
          value={totals.totalUsers.toLocaleString('vi-VN')}
          accent="#3B82F6"
        />
        <SummaryCard
          icon={<Crown size={22} color="#E8832A" />}
          label="Quản trị viên"
          value={totals.totalAdmins.toLocaleString('vi-VN')}
          accent="#E8832A"
        />
        <SummaryCard
          icon={<Trophy size={22} color="#F5C242" />}
          label="Tổng chi tiêu (Paid)"
          value={formatCurrency(totals.totalRevenue)}
          accent="#F5C242"
        />
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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
            placeholder="Tìm theo tên đăng nhập..."
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
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ color: '#9C8B75', textAlign: 'center', padding: 40 }}>Đang tải...</div>
      ) : visibleUsers.length === 0 ? (
        <div style={{ color: '#9C8B75', textAlign: 'center', padding: 40 }}>
          Không có user nào
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
                <th style={th}>#</th>
                <th style={th}>Tài Khoản</th>
                <th style={th}>Vai Trò</th>
                <th style={th}>Số Vé Paid</th>
                <th style={th}>Lần Đặt Gần Nhất</th>
                <th style={{ ...th, textAlign: 'right' }}>Tổng Chi Tiêu</th>
                <th style={th}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #3D3020' }}>
                  <td style={td}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background:
                          u.rank <= 3 ? `${rankColor(u.rank)}33` : 'rgba(156,139,117,0.18)',
                        color: rankColor(u.rank),
                        fontWeight: 700,
                        fontSize: 12,
                        border: `1px solid ${rankColor(u.rank)}`,
                      }}
                    >
                      {u.rank}
                    </span>
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{u.username}</div>
                    <div style={{ color: '#9C8B75', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
                      {u.id.substring(0, 8).toUpperCase()}
                    </div>
                  </td>
                  <td style={td}>
                    {u.isAdmin ? (
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: 999,
                          background: 'rgba(232,131,42,0.18)',
                          color: '#E8832A',
                          border: '1px solid rgba(232,131,42,0.4)',
                          fontSize: 11,
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Crown size={12} />
                        Admin
                      </span>
                    ) : (
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: 999,
                          background: 'rgba(59,130,246,0.15)',
                          color: '#3B82F6',
                          border: '1px solid rgba(59,130,246,0.4)',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        User
                      </span>
                    )}
                  </td>
                  <td style={td}>{u.paidTicketCount}</td>
                  <td style={td}>
                    {u.lastPurchaseAtUtc
                      ? new Date(u.lastPurchaseAtUtc).toLocaleString('vi-VN')
                      : '—'}
                  </td>
                  <td style={{ ...td, textAlign: 'right', color: '#E8832A', fontWeight: 700 }}>
                    {formatCurrency(u.totalSpent)}
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <IconButton
                        title="Xem lịch sử"
                        color="#3B82F6"
                        onClick={() => openHistory(u)}
                      >
                        <Eye size={14} />
                      </IconButton>
                      <IconButton
                        title="Đổi mật khẩu"
                        color="#E8832A"
                        onClick={() => setResettingUser(u)}
                      >
                        <KeyRound size={14} />
                      </IconButton>
                      <IconButton
                        title="Xóa user"
                        color="#EF4444"
                        onClick={() => setDeletingUser(u)}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {creating && (
        <CreateUserModal
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            loadUsers();
          }}
        />
      )}

      {resettingUser && (
        <ResetPasswordModal
          user={resettingUser}
          onClose={() => setResettingUser(null)}
          onDone={() => {
            setResettingUser(null);
            loadUsers();
          }}
        />
      )}

      {deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onDone={() => {
            setDeletingUser(null);
            loadUsers();
          }}
        />
      )}

      {historyUser && (
        <UserHistoryModal
          user={historyUser}
          detail={historyData}
          loading={historyLoading}
          onClose={() => {
            setHistoryUser(null);
            setHistoryData(null);
          }}
        />
      )}
    </div>
  );
}

// ====== Modal: Tạo user mới ======
function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || password.length < 6) {
      toast.error('Tên đăng nhập bắt buộc, mật khẩu tối thiểu 6 ký tự');
      return;
    }
    setSubmitting(true);
    try {
      await adminUsersApi.create({ username: username.trim(), password, isAdmin });
      toast.success(`Đã tạo ${isAdmin ? 'quản trị viên' : 'người dùng'} ${username}`);
      onCreated();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể tạo tài khoản';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      title="Tạo Tài Khoản Mới"
      onClose={() => !submitting && onClose()}
      icon={<Plus size={18} />}
      accent="#E8832A"
    >
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field
          label="Tên đăng nhập"
          input={
            <input
              type="text"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              style={inputStyle}
            />
          }
        />
        <Field
          label="Mật khẩu (≥ 6 ký tự)"
          input={
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={inputStyle}
            />
          }
        />

        {/* Toggle xác nhận admin */}
        <div
          style={{
            background: '#1A1410',
            border: '1px solid #3D3020',
            borderRadius: 8,
            padding: '12px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div>
            <div style={{ color: '#F5ECD7', fontSize: 13, fontWeight: 600 }}>
              Cấp quyền quản trị viên
            </div>
            <div style={{ color: '#9C8B75', fontSize: 11, marginTop: 2 }}>
              Bật để gán role Admin cho tài khoản này
            </div>
          </div>
          <ToggleSwitch checked={isAdmin} onChange={setIsAdmin} />
        </div>

        {isAdmin && (
          <div
            style={{
              background: 'rgba(232,131,42,0.08)',
              border: '1px solid rgba(232,131,42,0.4)',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#E8832A',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertTriangle size={14} />
            Tài khoản sẽ có toàn quyền quản trị hệ thống. Hãy chắc chắn trước khi tạo.
          </div>
        )}

        <ModalFooter>
          <SecondaryButton onClick={() => !submitting && onClose()} disabled={submitting}>
            Hủy
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? 'Đang tạo...' : isAdmin ? 'Tạo Admin' : 'Tạo User'}
          </PrimaryButton>
        </ModalFooter>
      </form>
    </ModalShell>
  );
}

// ====== Modal: Reset password ======
function ResetPasswordModal({
  user,
  onClose,
  onDone,
}: {
  user: AdminUserListItem;
  onClose: () => void;
  onDone: () => void;
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới tối thiểu 6 ký tự');
      return;
    }
    if (newPassword !== confirm) {
      toast.error('Xác nhận mật khẩu không khớp');
      return;
    }
    setSubmitting(true);
    try {
      await adminUsersApi.resetPassword(user.id, { newPassword });
      toast.success(`Đã đổi mật khẩu cho ${user.username}`);
      onDone();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể đổi mật khẩu';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      title="Đổi Mật Khẩu User"
      onClose={() => !submitting && onClose()}
      icon={<KeyRound size={18} />}
      accent="#E8832A"
    >
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div
          style={{
            background: '#1A1410',
            border: '1px solid #3D3020',
            borderRadius: 8,
            padding: '10px 14px',
          }}
        >
          <div style={{ color: '#9C8B75', fontSize: 11, marginBottom: 2 }}>Tài khoản</div>
          <div style={{ color: '#F5ECD7', fontWeight: 600 }}>{user.username}</div>
        </div>
        <Field
          label="Mật khẩu mới"
          input={
            <input
              type="password"
              autoFocus
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              style={inputStyle}
            />
          }
        />
        <Field
          label="Xác nhận mật khẩu"
          input={
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              style={inputStyle}
            />
          }
        />

        <ModalFooter>
          <SecondaryButton onClick={() => !submitting && onClose()} disabled={submitting}>
            Hủy
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? 'Đang lưu...' : 'Đổi mật khẩu'}
          </PrimaryButton>
        </ModalFooter>
      </form>
    </ModalShell>
  );
}

// ====== Modal: Delete ======
function DeleteUserModal({
  user,
  onClose,
  onDone,
}: {
  user: AdminUserListItem;
  onClose: () => void;
  onDone: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const confirm = async () => {
    setSubmitting(true);
    try {
      await adminUsersApi.delete(user.id);
      toast.success(`Đã xóa tài khoản ${user.username}`);
      onDone();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa user';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      title="Xác Nhận Xóa User"
      onClose={() => !submitting && onClose()}
      icon={<AlertTriangle size={18} />}
      accent="#EF4444"
    >
      <p style={{ margin: 0, color: '#D6C5A7', fontSize: 14, lineHeight: 1.5 }}>
        Bạn có chắc muốn xóa tài khoản <strong style={{ color: '#F5ECD7' }}>{user.username}</strong>? Hành động không thể hoàn tác.
      </p>
      <p style={{ margin: '8px 0 0', color: '#9C8B75', fontSize: 12 }}>
        Nếu user đang có vé thì backend sẽ từ chối xóa.
      </p>
      <ModalFooter>
        <SecondaryButton onClick={() => !submitting && onClose()} disabled={submitting}>
          Hủy
        </SecondaryButton>
        <button
          onClick={confirm}
          disabled={submitting}
          style={{
            padding: '8px 18px',
            background: '#EF4444',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Đang xóa...' : 'Xóa'}
        </button>
      </ModalFooter>
    </ModalShell>
  );
}

// ====== Modal: User history ======
function UserHistoryModal({
  user,
  detail,
  loading,
  onClose,
}: {
  user: AdminUserListItem;
  detail: AdminUserDetail | null;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <ModalShell
      title={`Lịch Sử Đặt Vé · ${user.username}`}
      onClose={onClose}
      icon={<Eye size={18} />}
      accent="#3B82F6"
      maxWidth={720}
    >
      {loading ? (
        <div style={{ color: '#9C8B75', padding: 20, textAlign: 'center' }}>Đang tải...</div>
      ) : !detail || detail.tickets.length === 0 ? (
        <div style={{ color: '#9C8B75', padding: 20, textAlign: 'center' }}>
          User chưa có vé nào
        </div>
      ) : (
        <div style={{ maxHeight: 460, overflow: 'auto' }}>
          <table
            style={{
              width: '100%',
              color: '#F5ECD7',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid #3D3020' }}>
                <th style={th}>Mã Vé</th>
                <th style={th}>Ghế</th>
                <th style={th}>Trạng Thái</th>
                <th style={th}>Ngày Đặt</th>
                <th style={{ ...th, textAlign: 'right' }}>Số Tiền</th>
              </tr>
            </thead>
            <tbody>
              {detail.tickets.map((t) => {
                const statusEnum =
                  typeof t.status === 'number'
                    ? STATUS_NUM_MAP[t.status as unknown as number] ?? TicketStatus.Pending
                    : (t.status as TicketStatus);
                const colors = statusBadgeColors(statusEnum);
                return (
                  <tr key={t.ticketId} style={{ borderBottom: '1px solid #3D3020' }}>
                    <td style={{ ...td, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                      {t.ticketId.substring(0, 8).toUpperCase()}
                    </td>
                    <td style={td}>{t.seatNumbers.join(', ')}</td>
                    <td style={td}>
                      <span
                        style={{
                          padding: '2px 10px',
                          borderRadius: 999,
                          background: colors.bg,
                          color: colors.color,
                          border: `1px solid ${colors.border}`,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {statusLabel(statusEnum)}
                      </span>
                    </td>
                    <td style={td}>{new Date(t.createdAtUtc).toLocaleString('vi-VN')}</td>
                    <td
                      style={{ ...td, textAlign: 'right', color: '#E8832A', fontWeight: 600 }}
                    >
                      {formatCurrency(t.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ModalShell>
  );
}

function statusLabel(s: TicketStatus): string {
  switch (s) {
    case TicketStatus.Paid:
      return 'Đã thanh toán';
    case TicketStatus.Pending:
      return 'Chờ thanh toán';
    case TicketStatus.Cancelled:
      return 'Đã hủy';
    case TicketStatus.Refunded:
      return 'Đã hoàn tiền';
  }
}

function statusBadgeColors(s: TicketStatus) {
  switch (s) {
    case TicketStatus.Paid:
      return { bg: 'rgba(34,197,94,0.12)', color: '#22C55E', border: 'rgba(34,197,94,0.4)' };
    case TicketStatus.Pending:
      return { bg: 'rgba(251,146,60,0.12)', color: '#FB923C', border: 'rgba(251,146,60,0.4)' };
    case TicketStatus.Cancelled:
      return { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', border: 'rgba(239,68,68,0.4)' };
    case TicketStatus.Refunded:
      return { bg: 'rgba(148,163,184,0.12)', color: '#94A3B8', border: 'rgba(148,163,184,0.4)' };
  }
}

// ====== Reusable bits ======
const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  color: '#9C8B75',
  fontWeight: 500,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
};

const td: React.CSSProperties = {
  padding: '10px 12px',
  verticalAlign: 'middle',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: '#1A1410',
  border: '1px solid #3D3020',
  borderRadius: 8,
  color: '#F5ECD7',
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  outline: 'none',
};

function Field({ label, input }: { label: string; input: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ color: '#9C8B75', fontSize: 12 }}>{label}</span>
      {input}
    </label>
  );
}

function ModalShell({
  title,
  onClose,
  children,
  icon,
  accent,
  maxWidth = 480,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  accent: string;
  maxWidth?: number;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          width: '100%',
          maxWidth,
          background: '#211A14',
          border: '1px solid #3D3020',
          borderRadius: 12,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          color: '#F5ECD7',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid #3D3020',
            background: `${accent}14`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {icon && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: `${accent}26`,
                  border: `1px solid ${accent}66`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: accent,
                }}
              >
                {icon}
              </div>
            )}
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9C8B75',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 18,
        paddingTop: 12,
        borderTop: '1px solid #3D3020',
      }}
    >
      {children}
    </div>
  );
}

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { children, disabled, style, ...rest } = props;
  return (
    <button
      {...rest}
      disabled={disabled}
      style={{
        padding: '8px 18px',
        background: '#E8832A',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        fontWeight: 600,
        opacity: disabled ? 0.7 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { children, disabled, style, ...rest } = props;
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled}
      style={{
        padding: '8px 16px',
        background: '#3D3020',
        color: '#F5ECD7',
        border: 'none',
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function IconButton({
  children,
  color,
  onClick,
  title,
}: {
  children: React.ReactNode;
  color: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: 6,
        width: 30,
        height: 30,
        background: `${color}1F`,
        color,
        border: `1px solid ${color}66`,
        borderRadius: 6,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </button>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 46,
        height: 26,
        borderRadius: 999,
        background: checked ? '#E8832A' : '#3D3020',
        border: '1px solid',
        borderColor: checked ? '#E8832A' : '#5A4632',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.15s',
        padding: 0,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#F5ECD7',
          transition: 'left 0.15s',
          boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
        }}
      />
    </button>
  );
}

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}

function SummaryCard({ icon, label, value, accent }: SummaryCardProps) {
  return (
    <div
      style={{
        background: '#211A14',
        border: '1px solid #3D3020',
        borderRadius: 12,
        padding: 18,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        {icon}
        <span style={{ color: '#9C8B75', fontSize: 13 }}>{label}</span>
      </div>
      <div
        style={{
          color: accent,
          fontSize: 22,
          fontWeight: 800,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={value}
      >
        {value}
      </div>
    </div>
  );
}
