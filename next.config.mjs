import pkg from './next-i18next.config.js'
const { i18n } = pkg

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
