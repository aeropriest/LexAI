import { AppLogo } from "@/components/icons";

export function Header() {
  return (
    <header className="p-4 border-b bg-card">
      <div className="container mx-auto flex items-center gap-3">
        <AppLogo className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold text-foreground">LexiAI</h1>
      </div>
    </header>
  );
}
