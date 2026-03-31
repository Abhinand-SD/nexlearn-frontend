import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify OTP',
  description: 'Enter the OTP sent to your mobile number to verify your identity on NexLearn.',
};

export default function VerifyOtpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
