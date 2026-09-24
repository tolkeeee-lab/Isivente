/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ];
  },
};

export default nextConfig;
