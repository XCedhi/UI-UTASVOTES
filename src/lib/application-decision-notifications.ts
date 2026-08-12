/**
 * Sends the per-student in-app notification when the Electoral Commission
 * approves or rejects a candidate application.
 *
 * The notification is scoped to the candidate's `user_id`, so only that
 * specific student receives it in their Header bell / Notifications centre.
 * `action_url` stays null so tapping the bell item opens the full-message
 * page at `/notifications/:id`.
 */
import { supabase } from '@/lib/supabase';

export type ApplicationDecision = 'approved' | 'rejected';

export interface DecisionNotificationResult {
  candidate: { id: string; user_id: string; position: string | null } | null;
  notificationId: string | null;
  error: Error | null;
}

export async function notifyCandidateOfDecision(
  candidateId: string,
  decision: ApplicationDecision,
  options?: { position?: string; reason?: string }
): Promise<DecisionNotificationResult> {
  try {
    // 1. Resolve the applicant's user profile id from the candidate row.
    const { data: candidate, error: fetchError } = await supabase
      .from('candidates')
      .select('id, user_id, position, full_name, student_id')
      .eq('id', candidateId)
      .single();

    if (fetchError || !candidate?.user_id) {
      console.error('Unable to resolve candidate for notification:', candidateId, fetchError);
      return {
        candidate: null,
        notificationId: null,
        error: fetchError ?? new Error('candidate.user_id is missing'),
      };
    }

    const position = options?.position ?? candidate.position ?? 'the position';

    const title =
      decision === 'approved' ? 'Application Approved' : 'Application Not Approved';

    const message =
      decision === 'approved'
        ? `Congratulations! Your application for the position of ${position} has been approved by the Electoral Commission. You are now an official candidate for the election.`
        : `Thank you for applying for the position of ${position}. Unfortunately, your application was not approved${
            options?.reason ? ` for the following reason: ${options.reason}` : ''
          }. You can re-apply during the next application window.`;

    // 2. Insert a notification targeted only at this student.
    const { data: inserted, error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: candidate.user_id,
        type: decision === 'approved' ? 'application_approved' : 'application_rejected',
        title,
        message,
        action_url: null,
        is_read: false,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error inserting decision notification:', insertError);
      return { candidate, notificationId: null, error: insertError };
    }

    console.log(
      `Notification ${inserted.id} (${decision}) sent to student ${candidate.user_id}`
    );
    return { candidate, notificationId: inserted.id, error: null };
  } catch (error) {
    console.error('Unexpected error sending decision notification:', error);
    return { candidate: null, notificationId: null, error: error as Error };
  }
}
