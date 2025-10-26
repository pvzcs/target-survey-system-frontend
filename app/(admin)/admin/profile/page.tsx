'use client';

import { useState } from 'react';
import { useAuthContext } from '@/lib/contexts/auth-context';
import { 
  Button, 
  Input, 
  Label, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Alert,
  AlertDescription 
} from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, updateProfile } = useAuthContext();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    old_password: '',
    new_password: '',
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // 构建更新对象，只包含非空字段
    const updates: Record<string, string> = {};
    if (formData.username.trim()) updates.username = formData.username.trim();
    if (formData.email.trim()) updates.email = formData.email.trim();
    if (formData.new_password) {
      updates.old_password = formData.old_password;
      updates.new_password = formData.new_password;
    }

    // 验证至少有一个字段要更新
    if (Object.keys(updates).length === 0) {
      setError('请至少填写一个要更新的字段');
      return;
    }

    // 如果要更新密码，验证旧密码已填写
    if (updates.new_password && !updates.old_password) {
      setError('修改密码需要提供旧密码');
      return;
    }

    setIsSubmitting(true);
    try {
      // 调试日志
      console.log('正在更新个人信息:', updates);
      console.log('当前 Token:', localStorage.getItem('auth_token'));
      
      await updateProfile(updates);
      setMessage('个人信息更新成功');
      
      // 清空表单
      setFormData({
        username: '',
        email: '',
        old_password: '',
        new_password: '',
      });
      
      // 如果修改了密码，建议重新登录
      if (updates.new_password) {
        setTimeout(() => {
          router.push('/admin/surveys');
        }, 2000);
      }
    } catch (err: any) {
      console.error('更新失败:', err);
      const errorMessage = err.message || err.code || '更新失败，请重试';
      const errorDetails = err.status ? ` (状态码: ${err.status})` : '';
      setError(errorMessage + errorDetails);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>个人信息设置</CardTitle>
          <CardDescription>
            更新您的用户名、邮箱或密码。留空表示不修改该项。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">当前用户名</p>
              <p className="font-medium">{user.username}</p>
              <p className="text-sm text-muted-foreground mt-2">当前邮箱</p>
              <p className="font-medium">{user.email}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">新用户名</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="留空表示不修改"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">新邮箱</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="留空表示不修改"
                disabled={isSubmitting}
              />
            </div>

            <div className="border-t pt-4 mt-6">
              <h3 className="text-sm font-medium mb-4">修改密码</h3>
              
              <div className="space-y-2">
                <Label htmlFor="old_password">旧密码</Label>
                <Input
                  id="old_password"
                  name="old_password"
                  type="password"
                  value={formData.old_password}
                  onChange={handleChange}
                  placeholder="修改密码时必填"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="new_password">新密码</Label>
                <Input
                  id="new_password"
                  name="new_password"
                  type="password"
                  value={formData.new_password}
                  onChange={handleChange}
                  placeholder="留空表示不修改密码"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {message && (
              <Alert className="bg-green-50 text-green-900 border-green-200">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '更新中...' : '更新信息'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
