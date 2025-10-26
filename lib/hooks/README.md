# Custom Hooks 使用指南

## useApiError

处理 API 错误并显示用户友好的错误消息。

```typescript
import { useApiError } from '@/lib/hooks';

function MyComponent() {
  const { handleError } = useApiError();

  const fetchData = async () => {
    try {
      const data = await api.getData();
    } catch (error) {
      handleError(error); // 自动显示错误提示
    }
  };
}
```

## useLoading

管理加载状态。

```typescript
import { useLoading } from '@/lib/hooks';

function MyComponent() {
  const { isLoading, withLoading } = useLoading();

  const fetchData = async () => {
    await withLoading(async () => {
      const data = await api.getData();
      // 处理数据
    });
  };

  return <Button loading={isLoading}>加载数据</Button>;
}
```

## useAsync

结合加载状态和错误处理的完整异步操作 Hook。

```typescript
import { useAsync } from '@/lib/hooks';

function MyComponent() {
  const { isLoading, execute } = useAsync({
    successMessage: '操作成功',
    errorMessage: '操作失败',
    onSuccess: (data) => {
      console.log('Success:', data);
    },
  });

  const handleSubmit = async () => {
    await execute(() => api.submitData(formData));
  };

  return <Button loading={isLoading} onClick={handleSubmit}>提交</Button>;
}
```

## Button with Loading State

Button 组件现在支持 loading 属性。

```typescript
<Button loading={isLoading} onClick={handleClick}>
  点击我
</Button>
```

## Error Boundary

全局错误边界已在根布局中配置，会自动捕获组件错误。

## Error Pages

使用预定义的错误页面组件：

```typescript
import { NotFoundError, ServerError, NetworkError } from '@/components/error-pages';

// 404 错误
<NotFoundError resourceName="问卷" />

// 服务器错误
<ServerError onRetry={handleRetry} />

// 网络错误
<NetworkError onRetry={handleRetry} />
```

## Loading Indicators

```typescript
import { LoadingSpinner, LoadingOverlay, LoadingPage } from '@/components/loading-indicator';

// 小型加载指示器
<LoadingSpinner size="sm" />

// 全屏遮罩加载
<LoadingOverlay message="正在保存..." />

// 页面级加载
<LoadingPage message="正在加载数据..." />
```
