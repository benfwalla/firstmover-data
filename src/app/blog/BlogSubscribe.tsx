'use client';

import { useState } from 'react';

type State = 'idle' | 'loading' | 'success' | 'error';

export function BlogSubscribe() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<State>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const endpoint =
        process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT ||
        (process.env.NODE_ENV === 'development' ? '/api/newsletter' : undefined);
      if (!endpoint) throw new Error('Not configured');
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="blog-subscribe">
        <span className="blog-subscribe-label">Check your email to confirm.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="blog-subscribe">
      <span className="blog-subscribe-label">Subscribe to our feed</span>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="blog-subscribe-input"
      />
      <button type="submit" className="blog-subscribe-btn" disabled={status === 'loading'}>
        {status === 'loading' ? '...' : 'Subscribe'}
      </button>
    </form>
  );
}
