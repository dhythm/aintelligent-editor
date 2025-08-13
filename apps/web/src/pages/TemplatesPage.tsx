import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { ArrowLeft, FileText, Plus } from "lucide-react"

const templates = [
  {
    id: "1",
    title: "ブログ記事",
    description: "SEOに最適化されたブログ記事のテンプレート",
    icon: "📝",
  },
  {
    id: "2",
    title: "プレスリリース",
    description: "企業向けプレスリリースのテンプレート",
    icon: "📢",
  },
  {
    id: "3",
    title: "製品仕様書",
    description: "詳細な製品仕様書のテンプレート",
    icon: "📋",
  },
  {
    id: "4",
    title: "マーケティングメール",
    description: "効果的なマーケティングメールのテンプレート",
    icon: "📧",
  },
]

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Link to="/documents">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">テンプレート</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-3xl">{template.icon}</div>
                  <Link to="/">
                    <Button size="sm" variant="outline">
                      使用する
                    </Button>
                  </Link>
                </div>
                <CardTitle className="text-lg">{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}

          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardHeader className="flex items-center justify-center h-full">
              <div className="text-center">
                <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <CardTitle className="text-lg">新しいテンプレート</CardTitle>
                <CardDescription>カスタムテンプレートを作成</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}