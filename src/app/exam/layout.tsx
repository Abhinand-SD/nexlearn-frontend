import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Exam',
  description: 'Start your NexLearn assessment. Answer all questions within the time limit.',
  robots: { index: false, follow: false }, // Private exam pages should not be indexed
};

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
