import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { BrassTabBar } from "@/components/skeuomorphic/BrassTabBar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }
  return (
    <>
      <div style={{ flex: 1, paddingBottom: '70px' }}>
        {children}
      </div>
      <BrassTabBar />
    </>
  );
}
