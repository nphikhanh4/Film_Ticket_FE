export function decodeToken(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('❌ Token format invalid, parts:', parts.length);
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    console.log('✅ Token decoded:', payload);
    return payload;
  } catch (err) {
    console.log('❌ Token decode error:', err);
    return null;
  }
}

export function extractRoleFromToken(token: string): string | undefined {
  const payload = decodeToken(token);
  if (!payload) {
    console.log('⚠️ No payload to extract role from');
    return undefined;
  }

  const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
  const role = payload[roleKey];
  const normalizedRole = role?.toLowerCase();
  console.log(`🔑 Role key: ${roleKey}`);
  console.log(`📌 Role value (raw):`, role);
  console.log(`📌 Role value (normalized):`, normalizedRole);
  return normalizedRole;
}

