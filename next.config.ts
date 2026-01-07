// next.config.ts

const nextConfig = {
  // 🔽 新しいキー: サーバー側で外部パッケージをバンドルから除外する設定
  // (通常、Prisma Clientなどを指定するために使われます)
  serverExternalPackages: ['@prisma/client', 'bcrypt'],
  
  // 🔽 'experimental' ブロックから古いキーを削除します
  // experimental: {
  //   serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'], // この行を削除
  // },
};

export default nextConfig;