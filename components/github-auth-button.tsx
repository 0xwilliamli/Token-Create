"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { Icons } from "./icons";

export default function GoogleSignInButton() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const supabase = createClientComponentClient();
  const router = useRouter();

  async function signInWithGithub() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
    })
    if (!error) {
      return router.push('/dashboard')
    }
  }

  return (
    <Button
      className="w-full"
      variant="outline"
      type="button"
      onClick={signInWithGithub}
    >
      <Icons.gitHub className="mr-2 h-4 w-4" />
      Continue with Github
    </Button>
  );
}
