import { useState, useEffect } from 'react';
import { signIn, getUser } from './api/supabaseClient';
import { useRouter } from 'next/router';


export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Redirect to /stats if user is already logged in
    const checkUser = async () => {
      const { user } = await getUser();
      if (user) {
        router.push('/stats');
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async () => {
    const { data, error } = await signIn(email, password);
    if (error) {
      setErrorMessage(error.message);
    } else {
      router.push('/stats');
    }
  };

  return (
    <div>
      <h1>Welcome to the RASLO Project</h1>
      <p>Please log in to access RASLO's WiFi statistics.</p>
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>
    </div>
  );
}