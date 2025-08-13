"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Search, Wifi, Bot, Plus, RefreshCw } from "lucide-react"

interface EmptyStateProps {
  variant: "no-documents" | "no-results" | "network-error" | "no-ai-response"
  onAction?: () => void
  className?: string
}

const variants = {
  "no-documents": {
    icon: FileText,
    title: "文書がありません",
    description: "まだ文書が作成されていません。最初の文書を作成して執筆を始めましょう。",
    actionLabel: "文書を作成",
    actionIcon: Plus,
  },
  "no-results": {
    icon: Search,
    title: "結果が見つかりません",
    description: "検索条件に一致する項目がありませんでした。別のキーワードで検索してみてください。",
    actionLabel: "検索をクリア",
    actionIcon: RefreshCw,
  },
  "network-error": {
    icon: Wifi,
    title: "接続エラー",
    description: "ネットワークに接続できませんでした。インターネット接続を確認して再試行してください。",
    actionLabel: "再試行",
    actionIcon: RefreshCw,
  },
  "no-ai-response": {
    icon: Bot,
    title: "AI応答がありません",
    description: "AIアシスタントからの応答を取得できませんでした。しばらく待ってから再試行してください。",
    actionLabel: "再試行",
    actionIcon: RefreshCw,
  },
}

export function EmptyState({ variant, onAction, className }: EmptyStateProps) {
  const config = variants[variant]
  const IconComponent = config.icon
  const ActionIconComponent = config.actionIcon

  return (
    <Card className={`border-dashed ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="mb-6 rounded-full bg-muted p-4">
          <IconComponent className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">{config.title}</h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground leading-relaxed">{config.description}</p>
        {onAction && (
          <Button onClick={onAction} className="gap-2">
            <ActionIconComponent className="h-4 w-4" />
            {config.actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
