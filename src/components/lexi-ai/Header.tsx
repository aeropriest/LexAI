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
    <header className="p-4 border-b bg-sidebar-background">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {children}
          <AppLogo className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold text-foreground">LexiAI</h1>
        </div>
        {auth.currentUser && (
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
            <LogOut />
          </Button>
        )}
      </div>
    </header>
  );
}
