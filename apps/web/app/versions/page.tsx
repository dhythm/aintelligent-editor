"use client"

import { useState, useCallback } from "react"
import { ArrowLeft, Clock, User, Download, Copy, RotateCcw, Eye, GitCompare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

// Mock version data
const mockVersions = [
  {
    id: "v1.3",
    version: "1.3",
    author: "田中太郎",
    timestamp: "2024年1月15日 14:30",
    notes: "SEO最適化とメタディスクリプションの改善",
    content:
      "# AIライティングアシスタントの活用法\n\n人工知能を活用した文章作成は、現代のコンテンツ制作において革命的な変化をもたらしています。\n\n## 主な機能\n\n- 自動文章生成\n- 文体調整\n- SEO最適化\n\n効率的な文章作成を実現します。",
    wordCount: 156,
    changes: "+12 -3",
  },
  {
    id: "v1.2",
    version: "1.2",
    author: "佐藤花子",
    timestamp: "2024年1月14日 16:45",
    notes: "構成の見直しと新しいセクションの追加",
    content:
      "# AIライティングアシスタントの活用法\n\n人工知能を活用した文章作成は、現代において重要な技術です。\n\n## 基本機能\n\n- 文章生成\n- 校正支援\n\n便利なツールです。",
    wordCount: 98,
    changes: "+25 -8",
  },
  {
    id: "v1.1",
    version: "1.1",
    author: "田中太郎",
    timestamp: "2024年1月13日 10:20",
    notes: "初期ドラフトの作成",
    content: "# AIライティングアシスタント\n\n人工知能による文章作成支援ツールです。\n\n基本的な機能を提供します。",
    wordCount: 45,
    changes: "+45 -0",
  },
]

export default function VersionsPage() {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])
  const [compareMode, setCompareMode] = useState(false)
  const { toast } = useToast()

  const handleVersionSelect = useCallback(
    (versionId: string) => {
      if (compareMode) {
        setSelectedVersions((prev) => {
          if (prev.includes(versionId)) {
            return prev.filter((id) => id !== versionId)
          }
          if (prev.length >= 2) {
            return [prev[1], versionId]
          }
          return [...prev, versionId]
        })
      }
    },
    [compareMode],
  )

  const handleRestore = useCallback(
    (version: (typeof mockVersions)[0]) => {
      toast({
        title: "バージョンを復元しました",
        description: `バージョン ${version.version} を現在の文書として復元しました。`,
      })
    },
    [toast],
  )

  const handleCopy = useCallback(
    (content: string) => {
      navigator.clipboard.writeText(content)
      toast({
        title: "コンテンツをコピーしました",
        description: "クリップボードにコピーされました。",
      })
    },
    [toast],
  )

  const handleDownload = useCallback(
    (version: (typeof mockVersions)[0]) => {
      const blob = new Blob([version.content], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `document-v${version.version}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "ダウンロードを開始しました",
        description: `バージョン ${version.version} をMarkdownファイルとしてダウンロードしています。`,
      })
    },
    [toast],
  )

  const renderDiff = () => {
    if (selectedVersions.length !== 2) return null

    const version1 = mockVersions.find((v) => v.id === selectedVersions[0])
    const version2 = mockVersions.find((v) => v.id === selectedVersions[1])

    if (!version1 || !version2) return null

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            比較表示: v{version1.version} ⟷ v{version2.version}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">バージョン {version1.version}</h4>
              <div className="bg-muted/50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap">
                {version1.content.split("\n").map((line, i) => (
                  <div key={i} className={line.includes("基本機能") ? "bg-red-100 dark:bg-red-900/30" : ""}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">バージョン {version2.version}</h4>
              <div className="bg-muted/50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap">
                {version2.content.split("\n").map((line, i) => (
                  <div key={i} className={line.includes("主な機能") ? "bg-green-100 dark:bg-green-900/30" : ""}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (mockVersions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="flex h-16 items-center px-6">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              エディターに戻る
            </Button>
            <h1 className="text-xl font-semibold">バージョン履歴</h1>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">バージョン履歴がありません</h2>
            <p className="text-muted-foreground max-w-md">
              この文書にはまだバージョン履歴がありません。文書を保存すると、自動的にバージョンが作成されます。
            </p>
            <Button>エディターに戻る</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              エディターに戻る
            </Button>
            <h1 className="text-xl font-semibold">バージョン履歴</h1>
            <Badge variant="secondary" className="ml-3">
              {mockVersions.length}個のバージョン
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={compareMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCompareMode(!compareMode)
                setSelectedVersions([])
              }}
            >
              <GitCompare className="h-4 w-4 mr-2" />
              比較モード
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {compareMode && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              比較したい2つのバージョンを選択してください。選択済み: {selectedVersions.length}/2
            </p>
          </div>
        )}

        {/* Version Timeline */}
        <div className="space-y-4">
          {mockVersions.map((version, index) => (
            <Card
              key={version.id}
              className={`transition-all ${
                compareMode
                  ? selectedVersions.includes(version.id)
                    ? "ring-2 ring-blue-500 cursor-pointer"
                    : "cursor-pointer hover:shadow-md"
                  : ""
              }`}
              onClick={() => compareMode && handleVersionSelect(version.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={index === 0 ? "default" : "secondary"}>v{version.version}</Badge>
                      {index === 0 && <Badge variant="outline">最新</Badge>}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-3 w-3 mr-1" />
                        {version.author}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {version.timestamp}
                      </div>
                    </div>

                    <p className="text-sm mb-3">{version.notes}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{version.wordCount}文字</span>
                      <span>{version.changes}</span>
                    </div>
                  </div>

                  {!compareMode && (
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(version.content)}>
                        <Copy className="h-4 w-4" />
                      </Button>

                      <Button variant="ghost" size="sm" onClick={() => handleDownload(version)}>
                        <Download className="h-4 w-4" />
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>バージョン {version.version} のプレビュー</DialogTitle>
                            <DialogDescription>
                              {version.timestamp} - {version.author}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="bg-muted/50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap">
                            {version.content}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {index !== 0 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>バージョンの復元</DialogTitle>
                              <DialogDescription>
                                バージョン {version.version}{" "}
                                を現在の文書として復元しますか？現在の変更は新しいバージョンとして保存されます。
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline">キャンセル</Button>
                              <Button onClick={() => handleRestore(version)}>復元する</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Diff View */}
        {compareMode && renderDiff()}
      </div>
    </div>
  )
}
