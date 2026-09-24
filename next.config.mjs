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
    ];
  },
};

export default nextConfig;
