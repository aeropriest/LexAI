import { AppLogo } from "@/components/icons";
import type { ReactNode } from "react";

export function Header({children}: {children?: ReactNode}) {
  return (
    <header className="p-4 border-b bg-sidebar-background">
      <div className="container mx-auto flex items-center gap-3">
        {children}
        <AppLogo className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold text-foreground">LexiAI</h1>
      </div>
    </header>
  );
}
