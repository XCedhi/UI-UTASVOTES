-- =====================================================
-- UPDATE ANNOUNCEMENTS WITH RELEVANT CONTENT
-- =====================================================

-- Clear existing announcements
DELETE FROM public.announcements;

-- Insert fresh, relevant announcements for UTASVotes
INSERT INTO public.announcements (type, title, message, priority, is_active, published_at) VALUES
  (
    'system',
    'UTASVotes Platform Now Live',
    'Welcome to the official UTASVotes Electoral System! Students can now participate in university elections digitally. Login with your @cktutas.edu.gh email to get started.',
    'high',
    true,
    NOW()
  ),
  (
    'election',
    'Student Union Elections 2026',
    'The 2026 Student Union Elections are now open. Check the dashboard to view available positions and cast your vote. Your participation matters!',
    'high',
    true,
    NOW() - INTERVAL '6 hours'
  ),
  (
    'deadline',
    'Candidate Registration Closes Soon',
    'Aspiring candidates have until February 15, 2026 to submit their applications. Upload all required documents and pay the application fee before the deadline.',
    'high',
    true,
    NOW() - INTERVAL '1 day'
  ),
  (
    'fee_update',
    'Application Fee Structure',
    'Application fees vary by position. Presidential candidates: GHS 50, Other positions: GHS 30. Payment is processed securely through our integrated gateway.',
    'medium',
    true,
    NOW() - INTERVAL '2 days'
  ),
  (
    'general',
    'Campaign Guidelines Available',
    'All candidates must review and comply with the official campaign guidelines. Visit the Election Guidelines page for complete rules and regulations.',
    'medium',
    true,
    NOW() - INTERVAL '3 days'
  ),
  (
    'result',
    'Live Results Dashboard',
    'Real-time election results are now available! Electoral Commission members and administrators can monitor voting progress and view detailed analytics.',
    'low',
    true,
    NOW() - INTERVAL '4 days'
  ),
  (
    'system',
    'Enhanced Security Features',
    'UTASVotes uses advanced security measures including encrypted voting, audit trails, and role-based access control to ensure election integrity.',
    'low',
    true,
    NOW() - INTERVAL '5 days'
  )
ON CONFLICT DO NOTHING;

-- Verify announcements were updated
SELECT 
  '✅ ANNOUNCEMENTS UPDATED' as status,
  COUNT(*) as total_announcements,
  COUNT(*) FILTER (WHERE is_active = true) as active_announcements
FROM public.announcements;

-- Show updated announcements
SELECT 
  id,
  type,
  title,
  LEFT(message, 60) || '...' as message_preview,
  priority,
  published_at
FROM public.announcements
ORDER BY published_at DESC;
