import { redirect } from "next/navigation";

export default function Home() {
  // Currently redirecting to /login by default until we wire up Supabase SSR auth
  redirect('/login');
}
