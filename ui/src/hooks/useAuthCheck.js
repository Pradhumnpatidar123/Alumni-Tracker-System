import { useEffect, useState } from 'react';

export function useAuthCheck() {
  const [state, setState] = useState({
    loading: true,
    user: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('http://localhost:5000/auth/api/me', {
          method: 'GET',
          credentials: 'include', // send HttpOnly cookie with request
          headers: { Accept: 'application/json' },
        });

        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          console.log(data);
          setState({ loading: false, user: data.user || null, error: null });
        } else {
          setState({ loading: false, user: null, error: 'unauthorized' });
        }
      } catch (err) {
        if (!cancelled) setState({ loading: false, user: null, error: 'network' });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state; // { loading, user, error }
}
