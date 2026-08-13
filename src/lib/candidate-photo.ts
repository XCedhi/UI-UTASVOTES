/**
 * Resolve a candidate's application photo to a renderable URL.
 *
 * The `candidates` table stores the applicant's uploaded passport photo in
 * `photo_url`. Newer rows hold a full public Supabase storage URL, but older
 * rows may only contain a bare filename or a storage path. This helper returns
 * a working URL for both, and falls back to `avatar` / a neutral placeholder.
 */

const CANDIDATE_PHOTO_BUCKET_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/candidate-documents/`;

export const PLACEHOLDER_AVATAR = '/assets/images/no_image.png'; // Default profile image for students

export function resolveCandidatePhoto(url?: string | null): string {
  if (!url) return PLACEHOLDER_AVATAR;
  if (/^https?:\/\//i.test(url)) return url;
  // Legacy rows: bare filename or storage path → resolve against the public bucket.
  return `${CANDIDATE_PHOTO_BUCKET_URL}${url.replace(/^\/+/, '')}`;
}

export function isDefaultCandidatePhoto(url?: string | null): boolean {
  return !url || url === PLACEHOLDER_AVATAR;
}
