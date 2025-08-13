"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { FileText, Mail, BookOpen, FileBarChart, Scroll, Plus, Eye } from "lucide-react"

interface Template {
  id: string
  title: string
  description: string
  category: "blog" | "report" | "email" | "release" | "docs"
  structure: string[]
  content: string
  isCustom?: boolean
}

const templates: Template[] = [
  {
    id: "1",
    title: "ブログ記事テンプレート",
    description: "読者を引きつける構造化されたブログ記事",
    category: "blog",
    structure: ["導入", "問題提起", "解決策の提示", "具体例", "結論とCTA"],
    content: `# ブログ記事タイトル

## 導入
読者の関心を引く導入文を書きます。

## 問題提起
読者が抱える課題や疑問を明確にします。

## 解決策の提示
具体的な解決方法を説明します。

## 具体例
実際の事例やデータを示します。

## 結論とCTA
まとめと次のアクションを促します。`,
  },
  {
    id: "2",
    title: "ビジネスレポート",
    description: "包括的な分析と提案を含むレポート",
    category: "report",
    structure: ["エグゼクティブサマリー", "現状分析", "課題の特定", "提案", "実装計画"],
    content: `# ビジネスレポート

## エグゼクティブサマリー
レポートの要点をまとめます。

## 現状分析
現在の状況を詳細に分析します。

## 課題の特定
主要な問題点を明確にします。

## 提案
解決策と改善案を提示します。

## 実装計画
具体的な実行ステップを説明します。`,
  },
  {
    id: "3",
    title: "プロフェッショナルメール",
    description: "ビジネス用途の丁寧なメールテンプレート",
    category: "email",
    structure: ["件名", "宛先への挨拶", "本文", "依頼・提案", "締めの挨拶"],
    content: `件名: [具体的で明確な件名]

[相手の名前]様

いつもお世話になっております。
[あなたの名前]です。

[本文の内容]

[依頼や提案の内容]

ご確認のほど、よろしくお願いいたします。

[あなたの名前]`,
  },
  {
    id: "4",
    title: "リリースノート",
    description: "製品アップデートの詳細な説明",
    category: "release",
    structure: ["バージョン情報", "新機能", "改善点", "バグ修正", "既知の問題"],
    content: `# リリースノート v1.0.0

## 新機能
- 新しい機能の説明

## 改善点
- パフォーマンスの向上
- ユーザビリティの改善

## バグ修正
- 修正されたバグの一覧

## 既知の問題
- 現在確認されている問題`,
  },
  {
    id: "5",
    title: "API ドキュメント",
    description: "開発者向けの技術文書",
    category: "docs",
    structure: ["概要", "エンドポイント", "パラメータ", "レスポンス例", "エラーコード"],
    content: `# API ドキュメント

## 概要
APIの基本的な説明

## エンドポイント
\`\`\`
GET /api/endpoint
\`\`\`

## パラメータ
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| param1    | string | Yes | パラメータの説明 |

## レスポンス例
\`\`\`json
{
  "status": "success",
  "data": {}
}
\`\`\`

## エラーコード
- 400: Bad Request
- 401: Unauthorized`,
  },
]

const myTemplates: Template[] = [
  {
    id: "custom1",
    title: "カスタムテンプレート",
    description: "ユーザーが作成したテンプレート",
    category: "blog",
    structure: ["カスタム構造1", "カスタム構造2", "カスタム構造3"],
    content: "# カスタムテンプレートの内容",
    isCustom: true,
  },
]

const categoryIcons = {
  blog: BookOpen,
  report: FileBarChart,
  email: Mail,
  release: Scroll,
  docs: FileText,
}

const categoryLabels = {
  blog: "ブログ",
  report: "レポート",
  email: "メール",
  release: "リリースノート",
  docs: "ドキュメント",
}

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const { toast } = useToast()

  const filteredTemplates =
    selectedCategory === "all" ? templates : templates.filter((template) => template.category === selectedCategory)

  const handleUseTemplate = (template: Template) => {
    // Create new document with template content
    toast({
      title: "テンプレートを使用しました",
      description: `「${template.title}」で新しい文書を作成しました。`,
    })
    setPreviewTemplate(null)
  }

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">テンプレートギャラリー</h1>
          <p className="text-muted-foreground">プロジェクトを素早く開始するためのテンプレートを選択してください</p>
        </div>

        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="templates">テンプレート</TabsTrigger>
            <TabsTrigger value="my-templates">マイテンプレート</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                すべて
              </Button>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => {
                const IconComponent = categoryIcons[template.category]
                return (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5 text-primary" />
                          <Badge variant="secondary">{categoryLabels[template.category]}</Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">構造:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {template.structure.map((item, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(template)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            プレビュー
                          </Button>
                          <Button size="sm" onClick={() => handleUseTemplate(template)} className="flex-1">
                            使用する
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="my-templates" className="space-y-6">
            {myTemplates.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">カスタムテンプレートがありません</h3>
                  <p className="text-muted-foreground mb-4">独自のテンプレートを作成して、作業を効率化しましょう</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    新しいテンプレートを作成
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTemplates.map((template) => {
                  const IconComponent = categoryIcons[template.category]
                  return (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5 text-primary" />
                            <Badge variant="secondary">{categoryLabels[template.category]}</Badge>
                            <Badge variant="outline">カスタム</Badge>
                          </div>
                        </div>
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">構造:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {template.structure.map((item, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreview(template)}
                              className="flex-1"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              プレビュー
                            </Button>
                            <Button size="sm" onClick={() => handleUseTemplate(template)} className="flex-1">
                              使用する
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Preview Dialog */}
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {previewTemplate && (
                  <>
                    {(() => {
                      const IconComponent = categoryIcons[previewTemplate.category]
                      return <IconComponent className="h-5 w-5" />
                    })()}
                    {previewTemplate.title}
                  </>
                )}
              </DialogTitle>
              <DialogDescription>{previewTemplate?.description}</DialogDescription>
            </DialogHeader>

            {previewTemplate && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">テンプレート構造:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                    {previewTemplate.structure.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">プレビュー:</h4>
                  <Card>
                    <CardContent className="p-4">
                      <pre className="whitespace-pre-wrap text-sm font-mono">{previewTemplate.content}</pre>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                キャンセル
              </Button>
              <Button onClick={() => previewTemplate && handleUseTemplate(previewTemplate)}>
                このテンプレートを使用
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
