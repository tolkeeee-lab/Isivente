/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },
  async redirects() {
    return [
      {
        source: '/m',
        destination: '/p/microscope',
        permanent: true,
      },
      {
        source: '/microscope',
        destination: '/p/microscope',
        permanent: true,
      },
      {
        source: '/lave-linge',
        destination: '/p/mini-lave-linge',
        permanent: true,
      },
      {
        source: '/l',
        destination: '/p/mini-lave-linge',
        permanent: true,
      },
      {
        source: '/mandoline',
        destination: '/p/peeler',
        permanent: true,
      },
      {
        source: '/c',
        destination: '/p/peeler',
        permanent: true,
      },
      {
        source: '/matelas',
        destination: '/p/matelas',
        permanent: true,
      },
      {
        source: '/camping',
        destination: '/p/matelas',
        permanent: true,
      },
      {
        source: '/brosse',
        destination: '/p/umei',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
