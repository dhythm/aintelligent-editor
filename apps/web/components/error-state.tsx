"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react"

interface ErrorStateProps {
  variant: "general" | "not-found" | "permission-denied" | "server-error"
  onRetry?: () => void
  onGoBack?: () => void
  onGoHome?: () => void
  className?: string
}

const variants = {
  general: {
    title: "エラーが発生しました",
    description: "予期しないエラーが発生しました。しばらく待ってから再試行してください。",
    showRetry: true,
    showGoBack: false,
    showGoHome: false,
  },
  "not-found": {
    title: "ページが見つかりません",
    description: "お探しのページは存在しないか、移動された可能性があります。",
    showRetry: false,
    showGoBack: true,
    showGoHome: true,
  },
  "permission-denied": {
    title: "アクセス権限がありません",
    description: "このリソースにアクセスする権限がありません。管理者にお問い合わせください。",
    showRetry: false,
    showGoBack: true,
    showGoHome: true,
  },
  "server-error": {
    title: "サーバーエラー",
    description: "サーバーで問題が発生しています。しばらく待ってから再試行してください。",
    showRetry: true,
    showGoBack: false,
    showGoHome: true,
  },
}

export function ErrorState({ variant, onRetry, onGoBack, onGoHome, className }: ErrorStateProps) {
  const config = variants[variant]

  return (
    <Card className={`border-destructive/20 ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="mb-6 rounded-full bg-destructive/10 p-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">{config.title}</h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground leading-relaxed">{config.description}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          {config.showRetry && onRetry && (
            <Button onClick={onRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              再試行
            </Button>
          )}
          {config.showGoBack && onGoBack && (
            <Button variant="outline" onClick={onGoBack} className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              戻る
            </Button>
          )}
          {config.showGoHome && onGoHome && (
            <Button variant="outline" onClick={onGoHome} className="gap-2 bg-transparent">
              <Home className="h-4 w-4" />
              ホームに戻る
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
