// components/SignInForm.tsx
"use client"; // 👈 これが必要です

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Credential Provider向けにsignInを呼び出す
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    
    setLoading(false);

    if (result?.error) {
      setError('サインインに失敗しました。メールアドレスまたはパスワードを確認してください。');
      console.error(result.error);
    } else if (result?.ok) {
      // ログイン成功: トップページにリダイレクト
      window.location.href = '/'; 
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      
      <input
        type="email"
        placeholder="メールアドレス"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
      />
      <input
        type="password"
        placeholder="パスワード"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
      />
      
      <button 
        type="submit" 
        disabled={loading}
        style={{ 
          padding: '10px', 
          backgroundColor: loading ? '#ccc' : 'darkgreen', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'サインイン中...' : 'サインイン'}
      </button>
      
      <hr style={{ margin: '20px 0' }} />
      
      {/* Googleサインインボタン */}
      <button 
        type="button" 
        onClick={() => signIn('google')} 
        style={{ 
          padding: '10px', 
          backgroundColor: '#db4437', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer'
        }}
      >
        Googleでサインイン (キー設定必要)
      </button>
    </form>
  );
}