'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DefaultLanding } from '@/components/DefaultLanding';
import { DesignV2Landing } from '@/components/DesignV2Landing';

function LandingPageSwitcher() {
  const searchParams = useSearchParams();
  // Case-insensitive check and trim whitespace
  const variant = searchParams.get('variant')?.toLowerCase().trim();

  console.log('LandingPageSwitcher variant:', variant);

  if (variant === 'designv2') {
    return <DesignV2Landing />;
  }

  return <DefaultLanding />;
}

export default function Page() {
  return (
    <Suspense fallback={<DefaultLanding />}>
      <LandingPageSwitcher />
    </Suspense>
  );
}