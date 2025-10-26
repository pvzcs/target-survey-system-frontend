'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface ErrorPageProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  showBackButton?: boolean;
}

function ErrorPage({ title, description, actionLabel, onAction, showBackButton = true }: ErrorPageProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="text-red-600">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardFooter className="flex gap-2">
          {showBackButton && (
            <Button onClick={() => router.back()} variant="outline">
              返回
            </Button>
          )}
          {actionLabel && onAction && (
            <Button onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export function UnauthorizedError() {
  const router = useRouter();
  
  return (
    <ErrorPage
      title="未授权"
      description="您需要登录才能访问此页面。"
      actionLabel="前往登录"
      onAction={() => router.push('/login')}
      showBackButton={false}
    />
  );
}

export function ForbiddenError() {
  return (
    <ErrorPage
      title="权限不足"
      description="您没有权限访问此资源。请联系管理员获取访问权限。"
    />
  );
}

export function NotFoundError({ resourceName = '资源' }: { resourceName?: string }) {
  return (
    <ErrorPage
      title="未找到"
      description={`请求的${resourceName}不存在或已被删除。`}
    />
  );
}

export function ServerError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorPage
      title="服务器错误"
      description="服务器遇到了一个错误，请稍后重试。如果问题持续存在，请联系技术支持。"
      actionLabel={onRetry ? "重试" : undefined}
      onAction={onRetry}
    />
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorPage
      title="网络错误"
      description="无法连接到服务器，请检查您的网络连接后重试。"
      actionLabel="重试"
      onAction={onRetry || (() => window.location.reload())}
    />
  );
}
