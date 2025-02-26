/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['*'], // 本番環境では適切なドメインに制限することを推奨
  },
}

module.exports = nextConfig
