import { AppLogo } from "@/components/icons";
import type { ReactNode } from "react";
import { getAuth, signOut } from "firebase/auth";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

export function Header({children}: {children?: ReactNode}) {
  const auth = getAuth();
  
  const handleSignOut = () => {
    signOut(auth);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-3 flex-1">
          {children}
          <AppLogo className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">LexiAI</h1>
        </div>
        {auth.currentUser && !auth.currentUser.isAnonymous && (
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        )}
      </div>
    </header>
  );
}
