import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NexLearn | Futuristic Learning Platform',
    short_name: 'NexLearn',
    description: 'Next-generation online assessments and skill development platform.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#040D1B',
    theme_color: '#0993ba',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
