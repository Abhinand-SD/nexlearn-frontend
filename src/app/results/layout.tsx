import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Results',
  description: 'View your NexLearn assessment results and performance summary.',
  robots: { index: false, follow: false }, // Private results pages should not be indexed
};

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
