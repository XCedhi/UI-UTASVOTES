import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AdminProfile {
  full_name: string;
  avatar_url?: string;
  email: string;
}

export function useAdminProfile() {
  const [userProfile, setUserProfile] = useState<AdminProfile | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();

    // Set up real-time subscription for profile changes
    const profileSubscription = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
        },
        (payload) => {
          console.log('🔄 Profile updated via real-time subscription:', payload);
          // Refetch profile when it changes
          fetchAdminData();
        }
      )
      .subscribe();

    return () => {
      profileSubscription.unsubscribe();
    };
  }, []);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Get current user from Supabase auth (primary method)
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      let userId: string | null = null;
      
      if (!authError && user) {
        console.log('✅ Authenticated user ID:', user.id);
        userId = user.id;
      } else {
        console.log('⚠️ No authenticated user, falling back to localStorage');
        
        // Fallback to localStorage for backward compatibility
        const userEmail = localStorage.getItem('userEmail');
        
        if (!userEmail) {
          console.log('❌ No email in localStorage either');
          setIsLoading(false);
          return;
        }

        console.log('✅ Using email from localStorage:', userEmail);

        // Fetch user ID using email
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('email', userEmail)
          .single();

        if (userError || !userData) {
          console.error('❌ Error getting user ID from email:', userError);
          setIsLoading(false);
          return;
        }

        userId = userData.id;
        console.log('✅ Got user ID from email:', userId);
      }

      // Fetch user profile from database using user ID
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name, avatar_url, email, id')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        setIsLoading(false);
        return;
      }

      if (profile) {
        console.log('✅ Profile loaded from database (via user ID):', {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url_length: profile.avatar_url ? profile.avatar_url.length : 0
        });
        setUserProfile(profile);

        // Fetch notification count
        const { count, error: notifError } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .eq('is_read', false);

        if (!notifError && count !== null) {
          setNotificationCount(count);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('💥 Error fetching admin data:', error);
      setIsLoading(false);
    }
  };

  return {
    userProfile,
    notificationCount,
    isLoading,
    userName: userProfile?.full_name || 'System Administrator',
    userAvatar: userProfile?.avatar_url,
  };
}
