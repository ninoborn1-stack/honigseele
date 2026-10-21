'use client';
import { useRouter } from 'next/navigation';
import { LoginCard } from '@/features/account/login-card';

export default function LoginPage() {
  const router = useRouter();
  return (
    <div className="honey-light px-5 py-16 md:py-24">
      <LoginCard onDone={() => router.push('/konto/')} />
    </div>
  );
}
