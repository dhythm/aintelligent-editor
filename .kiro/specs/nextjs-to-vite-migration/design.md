# 設計文書

## 概要

apps/webアプリケーションをNext.jsからViteに移行し、軽量で高速な開発環境を構築する。現在のReact + TypeScript + TailwindCSSの構成を維持しながら、Viteの高速ビルドとホットリロード機能を活用する。

## アーキテクチャ

### 現在の構成

- **フレームワーク**: Next.js 15.2.4 (App Router)
- **言語**: TypeScript 5
- **スタイリング**: TailwindCSS 4.1.9
- **UIライブラリ**: shadcn/ui (Radix UI ベース)
- **状態管理**: React hooks (useState, useEffect等)
- **フォント**: Geist Sans/Mono
- **テーマ**: next-themes

### 移行後の構成

- **ビルドツール**: Vite 5.x
- **フレームワーク**: React 19 (SPA)
- **ルーティング**: React Router v6
- **言語**: TypeScript 5
- **スタイリング**: TailwindCSS 4.1.9 (維持)
- **UIライブラリ**: shadcn/ui (維持)
- **状態管理**: React hooks (維持)
- **フォント**: Geist Sans/Mono (維持)
- **テーマ**: カスタムテーマプロバイダー

## コンポーネントとインターフェース

### ディレクトリ構造の変更

```
apps/web/
├── src/                    # 新規: ソースコード用ディレクトリ
│   ├── components/         # 移動: componentsディレクトリ
│   │   ├── ui/            # shadcn/uiコンポーネント
│   │   └── theme-provider.tsx
│   ├── pages/             # 新規: ページコンポーネント
│   │   ├── HomePage.tsx   # app/page.tsx から移行
│   │   ├── DocumentsPage.tsx # app/documents/page.tsx から移行
│   │   ├── SettingsPage.tsx  # app/settings/page.tsx から移行
│   │   ├── TemplatesPage.tsx # app/templates/page.tsx から移行
│   │   └── VersionsPage.tsx  # app/versions/page.tsx から移行
│   ├── hooks/             # 移動: hooksディレクトリ
│   ├── lib/               # 移動: libディレクトリ
│   ├── styles/            # 移動: stylesディレクトリ
│   │   └── globals.css
│   ├── App.tsx            # 新規: メインアプリケーションコンポーネント
│   ├── main.tsx           # 新規: エントリーポイント
│   └── router.tsx         # 新規: ルーティング設定
├── public/                # 維持: 静的ファイル
├── index.html             # 新規: HTMLテンプレート
├── vite.config.ts         # 新規: Vite設定
├── tailwind.config.ts     # 更新: Vite用設定
└── package.json           # 更新: 依存関係変更
```

### ルーティング設計

React Routerを使用したクライアントサイドルーティング:

```typescript
// src/router.tsx
import { createBrowserRouter } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DocumentsPage from './pages/DocumentsPage'
import SettingsPage from './pages/SettingsPage'
import TemplatesPage from './pages/TemplatesPage'
import VersionsPage from './pages/VersionsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/documents',
    element: <DocumentsPage />
  },
  {
    path: '/settings',
    element: <SettingsPage />
  },
  {
    path: '/templates',
    element: <TemplatesPage />
  },
  {
    path: '/versions',
    element: <VersionsPage />
  }
])
```

### テーマプロバイダーの移行

next-themesからカスタムテーマプロバイダーに移行:

```typescript
// src/components/theme-provider.tsx
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

const ThemeProviderContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: "system",
  setTheme: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  // テーマ管理ロジック
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
```

## データモデル

### API通信の維持

現在のgo-api呼び出しパターンを維持:

```typescript
// src/lib/api.ts
const API_BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error("API request failed");
    return response.json();
  },
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("API request failed");
    return response.json();
  },
};
```

### 環境変数の移行

Next.js環境変数からVite環境変数に移行:

```bash
# .env.example (更新)
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=AIライティングアシスタント
```

## エラーハンドリング

### エラーバウンダリーの実装

```typescript
// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">エラーが発生しました</h1>
            <p className="text-muted-foreground mb-4">
              アプリケーションでエラーが発生しました。ページを再読み込みしてください。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              再読み込み
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

## テスト戦略

### テスト環境の設定

```typescript
// vite.config.ts (テスト設定)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

### コンポーネントテスト

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '../ui/button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })
})
```

## パフォーマンス最適化

### バンドル分割

```typescript
// vite.config.ts (最適化設定)
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          router: ["react-router-dom"],
        },
      },
    },
  },
});
```

### 遅延読み込み

```typescript
// src/router.tsx (遅延読み込み)
import { lazy } from "react";

const HomePage = lazy(() => import("./pages/HomePage"));
const DocumentsPage = lazy(() => import("./pages/DocumentsPage"));
```

## セキュリティ考慮事項

### CSP設定

```html
<!-- index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
/>
```

### 環境変数の保護

```typescript
// src/lib/config.ts
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  appTitle: import.meta.env.VITE_APP_TITLE,
  isDevelopment: import.meta.env.DEV,
};
```

## 移行戦略

### 段階的移行アプローチ

1. **Phase 1**: Vite設定とビルドシステムの構築
2. **Phase 2**: ルーティングとページコンポーネントの移行
3. **Phase 3**: UIコンポーネントとスタイリングの移行
4. **Phase 4**: API統合とテストの実装
5. **Phase 5**: 最適化とデプロイ設定

### 互換性の確保

- shadcn/uiコンポーネントの完全互換性維持
- TailwindCSSクラスの100%互換性
- TypeScript型定義の維持
- 既存のhooksとユーティリティ関数の再利用

### パフォーマンス目標

- 開発サーバー起動時間: 3秒以内
- ホットリロード時間: 500ms以内
- プロダクションビルド時間: 現在の50%短縮
- バンドルサイズ: 30%削減
- node_modulesサイズ: 20%削減
