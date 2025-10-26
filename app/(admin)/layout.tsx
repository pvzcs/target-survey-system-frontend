'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAuthContext();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center min-w-0">
              <h1 className="text-base sm:text-xl font-semibold text-foreground truncate">
                问卷管理系统
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* User Info - Hidden on mobile, shown on tablet+ */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="text-sm">
                  <p className="text-foreground font-medium">{user?.username}</p>
                  <p className="text-muted-foreground text-xs">{user?.email}</p>
                </div>
              </div>

              {/* Profile Settings Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/profile')}
                className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
              >
                <span className="hidden sm:inline">个人设置</span>
                <span className="sm:hidden">设置</span>
              </Button>

              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
              >
                <span className="hidden sm:inline">登出</span>
                <span className="sm:hidden">退出</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
}
