import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function SettingsPage() {
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
            <h1 className="text-2xl font-bold">設定</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>アカウント設定</CardTitle>
            <CardDescription>アカウントに関する設定を管理します</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">設定機能は開発中です</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>通知設定</CardTitle>
            <CardDescription>通知の受け取り方法を設定します</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">設定機能は開発中です</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>プライバシー設定</CardTitle>
            <CardDescription>プライバシーとセキュリティの設定</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">設定機能は開発中です</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}