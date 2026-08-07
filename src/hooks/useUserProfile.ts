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
      
      // Get userId from localStorage
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
      
      if (!userId && !userEmail) {
        setError('No user credentials found');
        setLoading(false);
        return;
      }

      // Fetch user profile
      let profileData = null;
      
      if (userId) {
        const { data, error: fetchError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (fetchError) {
          console.error('Error fetching profile by ID:', fetchError);
        } else {
          profileData = data;
        }
      }
      
      // Fallback to email if userId didn't work
      if (!profileData && userEmail) {
        const { data, error: fetchError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', userEmail)
          .single();
        
        if (fetchError) {
          console.error('Error fetching profile by email:', fetchError);
          setError('Failed to fetch profile');
        } else {
          profileData = data;
        }
      }

      if (profileData) {
        setProfile(profileData);
        setError(null);
      } else {
        setError('Profile not found');
      }

      setLoading(false);
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
