#!/bin/bash

# 测试个人信息更新 API
# 使用方法: ./scripts/test-profile-api.sh <JWT_TOKEN>

if [ -z "$1" ]; then
  echo "错误: 请提供 JWT Token"
  echo "使用方法: $0 <JWT_TOKEN>"
  exit 1
fi

TOKEN=$1
API_URL="http://localhost:8080/api/v1/auth/profile"

echo "=== 测试个人信息更新 API ==="
echo "API URL: $API_URL"
echo "Token: ${TOKEN:0:20}..."
echo ""

echo "1. 测试只更新用户名"
curl -X PUT "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"username": "testuser"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -v

echo ""
echo "2. 检查 API 端点是否存在"
curl -X OPTIONS "$API_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n" \
  -v
