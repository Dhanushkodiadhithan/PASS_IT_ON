/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // keep already-visited pages in the browser for a while so back/forward and revisits are instant.
    // Server actions (upload, edit, delete, save, profile) call revalidatePath, which clears this cache.
    staleTimes: { dynamic: 60, static: 180 },
  },
};

export default nextConfig;