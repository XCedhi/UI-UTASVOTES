/**
 * Role Management Utilities
 * Handles time-bound access for commission members and automatic role downgrades
 */

export interface UserAccessPeriod {
  userId: string;
  role: 'commission' | 'admin' | 'student';
  accessStartDate: string;
  accessEndDate?: string;
  originalRole?: 'student'; // Role to revert to after access expires
}

/**
 * Check if a user's commission access has expired
 */
export function hasAccessExpired(accessEndDate: string | null | undefined): boolean {
  if (!accessEndDate) return false;
  
  const endDate = new Date(accessEndDate);
  const now = new Date();
  
  return now > endDate;
}

/**
 * Check if a user's commission access is about to expire (within 7 days)
 */
export function isAccessExpiringSoon(accessEndDate: string | null | undefined): boolean {
  if (!accessEndDate) return false;
  
  const endDate = new Date(accessEndDate);
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return now < endDate && endDate <= sevenDaysFromNow;
}

/**
 * Get the number of days remaining until access expires
 */
export function getDaysUntilExpiration(accessEndDate: string | null | undefined): number {
  if (!accessEndDate) return Infinity;
  
  const endDate = new Date(accessEndDate);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Determine the effective role for a user based on access period
 * This should be called on every authentication check
 */
export function getEffectiveRole(
  user: {
    role: string;
    accessEndDate?: string | null;
    originalRole?: string | null;
  }
): 'admin' | 'commission' | 'student' | 'candidate' {
  // Admin access is permanent
  if (user.role === 'admin') {
    return 'admin';
  }
  
  // Check if commission access has expired
  if (user.role === 'commission' && hasAccessExpired(user.accessEndDate)) {
    // Return to original role (usually student)
    return (user.originalRole as any) || 'student';
  }
  
  // Return current role
  return user.role as any;
}

/**
 * Format access period for display
 */
export function formatAccessPeriod(startDate: string, endDate: string): string {
  const start = new Date(startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const end = new Date(endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  return `${start} - ${end}`;
}

/**
 * Get access status badge info
 */
export function getAccessStatusBadge(accessEndDate: string | null | undefined): {
  label: string;
  color: string;
  icon: string;
} {
  if (!accessEndDate) {
    return {
      label: 'Permanent',
      color: 'success',
      icon: 'CheckCircleIcon',
    };
  }
  
  if (hasAccessExpired(accessEndDate)) {
    return {
      label: 'Expired',
      color: 'error',
      icon: 'XCircleIcon',
    };
  }
  
  if (isAccessExpiringSoon(accessEndDate)) {
    return {
      label: 'Expiring Soon',
      color: 'warning',
      icon: 'ExclamationTriangleIcon',
    };
  }
  
  return {
    label: 'Active',
    color: 'success',
    icon: 'CheckCircleIcon',
  };
}

/**
 * Production: This function would be called by a scheduled job (cron/background worker)
 * to automatically downgrade expired commission members to student role
 */
export async function processExpiredAccess() {
  // In production, this would:
  // 1. Query database for users with expired commission access
  // 2. Update their role to 'student' (or their original role)
  // 3. Send notification email about role change
  // 4. Log the automatic downgrade in audit trail
  // 5. Revoke any commission-specific permissions
  
  console.log('Processing expired access...');
  
  // Example Supabase query:
  /*
  const { data: expiredUsers } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'commission')
    .lt('access_end_date', new Date().toISOString())
    .is('access_downgraded', false);
  
  for (const user of expiredUsers || []) {
    await supabase
      .from('users')
      .update({
        role: user.original_role || 'student',
        access_downgraded: true,
        downgraded_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    
    // Send notification email
    await sendEmail({
      to: user.email,
      subject: 'Commission Access Expired',
      template: 'access-expired',
      data: {
        firstName: user.first_name,
        endDate: user.access_end_date,
      },
    });
    
    // Log audit trail
    await supabase.from('audit_logs').insert({
      action: 'role_downgraded_automatic',
      user_id: user.id,
      details: {
        from_role: 'commission',
        to_role: user.original_role || 'student',
        reason: 'access_period_expired',
      },
    });
  }
  */
}

/**
 * Calculate suggested end date based on election cycle
 * Typically commission access is granted for one academic year or election cycle
 */
export function getSuggestedEndDate(startDate: string, durationMonths: number = 12): string {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setMonth(end.getMonth() + durationMonths);
  
  return end.toISOString().split('T')[0];
}
