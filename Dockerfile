# 多阶段构建 Dockerfile for Next.js

# 第一阶段：依赖安装
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate
WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
# 安装依赖
RUN pnpm install --frozen-lockfile

# 第二阶段：构建应用
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate
WORKDIR /app

# 从 deps 阶段复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1

# 构建应用
RUN pnpm build

# 第三阶段：运行应用
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置文件所有者
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
