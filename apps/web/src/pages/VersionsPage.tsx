import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { ArrowLeft, Clock, RotateCcw } from "lucide-react"

const versions = [
  {
    id: "1",
    timestamp: "2024年1月15日 14:30",
    author: "現在のユーザー",
    changes: "導入部を追加し、結論を修正",
    wordCount: 1250,
  },
  {
    id: "2",
    timestamp: "2024年1月15日 10:15",
    author: "現在のユーザー",
    changes: "初回ドラフト作成",
    wordCount: 890,
  },
  {
    id: "3",
    timestamp: "2024年1月14日 16:45",
    author: "現在のユーザー",
    changes: "アウトライン作成",
    wordCount: 320,
  },
]

export default function VersionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">バージョン履歴</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>文書のバージョン</CardTitle>
            <CardDescription>過去のバージョンを確認し、必要に応じて復元できます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div key={version.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{version.timestamp}</span>
                      {index === 0 && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">現在</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{version.author}</p>
                    <p className="text-sm">{version.changes}</p>
                    <p className="text-xs text-muted-foreground mt-1">{version.wordCount}文字</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      プレビュー
                    </Button>
                    {index !== 0 && (
                      <Button size="sm" variant="outline">
                        <RotateCcw className="h-4 w-4 mr-1" />
                        復元
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}