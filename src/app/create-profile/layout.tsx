import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Profile',
  description: 'Complete your NexLearn profile to get started with online assessments.',
};

export default function CreateProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
