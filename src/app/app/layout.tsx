import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'LexiAI App',
  description: 'AI-powered legal document analysis',
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
