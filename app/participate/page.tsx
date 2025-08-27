import { redirect } from 'next/navigation';

// Redirect /participate to /pajama-party as part of content consolidation
export default function ParticipateRedirect() {
  redirect('/pajama-party');
}