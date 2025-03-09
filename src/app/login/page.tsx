"use client"

import { Dog } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useEffect, useState } from "react"
import { createClient } from "~/lib/supabase/client"
import { redirect } from 'next/navigation';
import { oAuthOptions } from "~/lib/utils";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  // Redirect to inbox if user is already logged in
  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        redirect('/inbox');
      }
    }

    checkAuth();
  }, [supabase.auth]);

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: oAuthOptions(),
      });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="flex flex-col items-center space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <Dog className="h-16 w-16 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Chompymail</h1>
          <p className="text-muted-foreground">Fetching your emails, chasing away spam</p>
        </div>

        <Button size="lg" className="w-full cursor-pointer min-w-[200px] text-lg" onClick={handleLogin} disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </div>

      <footer className="fixed bottom-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Chompymail. All rights reserved.
      </footer>
    </div>
  );
}

