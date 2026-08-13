import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  student_id: string;
  department: string;
  level: string;
  phone: string;
  avatar_url: string | null;
  role: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      // Get userId from localStorage as fallback
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

      // Use Supabase auth session as primary source
      const { data: { session } } = await supabase.auth.getSession();
      const authUserId = session?.user?.id || userId;

      if (!authUserId) {
        setError('No user credentials found');
        setLoading(false);
        return;
      }

      const { data: profileData, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUserId)
        .single();

      if (fetchError) {
        console.error('Error fetching profile by ID:', fetchError);
        // Fallback to email if stored in localStorage
        const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
        if (userEmail) {
          const { data: profileByEmail } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', userEmail)
            .single();
          if (profileByEmail) {
            setProfile(profileByEmail);
            setError(null);
            setLoading(false);
            return;
          }
        }
        setError('Failed to fetch profile');
        setLoading(false);
        return;
      }

      if (profileData) {
        setProfile(profileData);
        setError(null);
        setLoading(false);
      } else {
        setError('Profile not found');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('An error occurred');
      setLoading(false);
    }
  };

  const refreshProfile = () => {
    fetchUserProfile();
  };

  return { profile, loading, error, refreshProfile };
}
