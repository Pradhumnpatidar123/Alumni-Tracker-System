import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_ALUMNI_URL } from '../../utils';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get('email');

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!email) {
        navigate('/signup', { state: { message: 'Missing email' } });
        return;
      }

      try {
        const res = await fetch(`${API_ALUMNI_URL}/alumniEmailVerify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        if (cancelled) return;

        if (res.ok) {
          navigate('/login', { state: { message: data?.message } });
        } else {
          navigate('/signup', { state: { message: 'Verification failed' } });
        }
      } catch {
        if (!cancelled) {
          navigate('/signup', { state: { message: 'Network error' } });
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [email, navigate]);

  return null;
}
