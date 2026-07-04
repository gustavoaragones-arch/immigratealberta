/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.immigratealberta.ca" }],
        destination: "https://immigratealberta.ca/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
