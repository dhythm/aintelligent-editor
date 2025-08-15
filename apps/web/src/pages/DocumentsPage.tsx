import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, MoreVertical, FileText, Calendar, Hash, Trash2, Copy, Edit3, Settings } from "lucide-react"
import { Link } from "react-router-dom"

const mockDocuments = [
  {
    id: "1",
    title: "AIライティングガイド",
    lastEdited: "2時間前",
    wordCount: 1250,
    tags: ["ガイド", "AI"],
    status: "Draft" as const,
    content: "AIを活用したライティングの基本的な手法について...",
  },
  {
    id: "2",
    title: "プロダクト仕様書",
    lastEdited: "1日前",
    wordCount: 3200,
    tags: ["仕様書", "開発"],
    status: "Review" as const,
    content: "新しいプロダクトの詳細な仕様について記載...",
  },
  {
    id: "3",
    title: "マーケティング戦略",
    lastEdited: "3日前",
    wordCount: 890,
    tags: ["マーケティング", "戦略"],
    status: "Final" as const,
    content: "2024年のマーケティング戦略と実行計画...",
  },
  {
    id: "4",
    title: "ブログ記事案",
    lastEdited: "1週間前",
    wordCount: 650,
    tags: ["ブログ", "コンテンツ"],
    status: "Draft" as const,
    content: "新機能についてのブログ記事の下書き...",
  },
]

const statusColors = {
  Draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Review: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Final: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
}

const statusLabels = {
  Draft: "下書き",
  Review: "レビュー中",
  Final: "完成",
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; documentId: string | null }>({
    open: false,
    documentId: null,
  })
  const { toast } = useToast()

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesTag = selectedTag === "all" || doc.tags.includes(selectedTag)
    const matchesStatus = selectedStatus === "all" || doc.status === selectedStatus

    return matchesSearch && matchesTag && matchesStatus
  })

  const allTags = Array.from(new Set(mockDocuments.flatMap((doc) => doc.tags)))

  const handleDeleteDocument = useCallback((documentId: string) => {
    setDeleteDialog({ open: true, documentId })
  }, [])

  const confirmDelete = useCallback(() => {
    if (deleteDialog.documentId) {
      toast({
        title: "文書を削除しました",
        description: "文書が正常に削除されました。",
      })
      setDeleteDialog({ open: false, documentId: null })
    }
  }, [deleteDialog.documentId, toast])

  const handleDuplicateDocument = useCallback(
    (documentId: string) => {
      toast({
        title: "文書を複製しました",
        description: "文書のコピーが作成されました。",
      })
    },
    [toast],
  )

  const totalDocs = mockDocuments.length
  const thisWeekEdits = mockDocuments.filter(
    (doc) => doc.lastEdited.includes("時間前") || doc.lastEdited.includes("日前"),
  ).length
  const avgLength = Math.round(mockDocuments.reduce((sum, doc) => sum + doc.wordCount, 0) / mockDocuments.length)

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">文書</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/editor">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新しい文書
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{totalDocs}</div>
              <div className="text-sm text-muted-foreground">総文書数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{thisWeekEdits}</div>
              <div className="text-sm text-muted-foreground">今週の編集</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{avgLength}</div>
              <div className="text-sm text-muted-foreground">平均文字数</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="文書を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="タグで絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのタグ</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="ステータスで絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのステータス</SelectItem>
              <SelectItem value="Draft">下書き</SelectItem>
              <SelectItem value="Review">レビュー中</SelectItem>
              <SelectItem value="Final">完成</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredDocuments.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">文書が見つかりません</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedTag !== "all" || selectedStatus !== "all"
                ? "検索条件に一致する文書がありません。フィルターを変更してみてください。"
                : "まだ文書がありません。新しい文書を作成して始めましょう。"}
            </p>
            <Link to="/editor">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新しい文書を作成
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{doc.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/documents/${doc.id}/edit`} className="flex items-center">
                            <Edit3 className="h-4 w-4 mr-2" />
                            開く
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateDocument(doc.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          複製
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteDocument(doc.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {doc.lastEdited}
                    </div>
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 mr-1" />
                      {doc.wordCount}文字
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Badge className={`text-xs ${statusColors[doc.status]}`}>{statusLabels[doc.status]}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">{doc.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, documentId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>文書を削除</DialogTitle>
            <DialogDescription>
              この文書を削除してもよろしいですか？この操作は元に戻すことができません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, documentId: null })}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}