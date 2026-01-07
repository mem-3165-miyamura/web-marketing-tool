// app/auth/signin/page.tsx

// 👈 ここでコンポーネントを正しくインポートしているか確認
import SignInForm from '@components/SignInForm'; 

// このページはServer Componentとしてレンダリングされます
export default function SignInPage() {
  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
      <h1>管理画面ログイン</h1>
      <p>メールアドレスとパスワードでサインイン</p>
      
      {/* 👈 ここでSignInFormを呼び出しているか確認 */}
      <SignInForm />
    </div>
  );
}