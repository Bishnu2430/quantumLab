/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["quantum-schema"],
  // Emits a self-contained server bundle carrying only traced dependencies,
  // which is what the Docker runtime stage copies in.
  output: "standalone",
};

export default nextConfig;
