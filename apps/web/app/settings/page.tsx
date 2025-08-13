"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Settings, Palette, Zap, Keyboard, Save, RotateCcw, ArrowLeft } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()

  // General settings state
  const [language, setLanguage] = useState("ja")
  const [autosaveInterval, setAutosaveInterval] = useState(30)
  const [theme, setTheme] = useState("system")

  // AI settings state
  const [aiModel, setAiModel] = useState("gpt-4")
  const [defaultFormality, setDefaultFormality] = useState([50])
  const [defaultEnthusiasm, setDefaultEnthusiasm] = useState([50])
  const [safetyLevel, setSafetyLevel] = useState("medium")

  // Shortcuts state
  const [shortcuts, setShortcuts] = useState({
    save: "Ctrl+S",
    runAi: "Ctrl+Enter",
    toggleOutline: "Ctrl+Shift+O",
    toggleAiPanel: "Ctrl+Shift+A",
  })

  const [editingShortcut, setEditingShortcut] = useState<string | null>(null)

  const handleSaveSettings = () => {
    // Save settings logic would go here
    toast({
      title: "設定を保存しました",
      description: "すべての設定が正常に保存されました。",
    })
  }

  const handleResetSettings = () => {
    // Reset to defaults
    setLanguage("ja")
    setAutosaveInterval(30)
    setTheme("system")
    setAiModel("gpt-4")
    setDefaultFormality([50])
    setDefaultEnthusiasm([50])
    setSafetyLevel("medium")
    setShortcuts({
      save: "Ctrl+S",
      runAi: "Ctrl+Enter",
      toggleOutline: "Ctrl+Shift+O",
      toggleAiPanel: "Ctrl+Shift+A",
    })

    toast({
      title: "設定をリセットしました",
      description: "すべての設定がデフォルト値に戻されました。",
    })
  }

  const handleShortcutEdit = (key: string, value: string) => {
    setShortcuts((prev) => ({
      ...prev,
      [key]: value,
    }))
    setEditingShortcut(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                戻る
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">設定</h1>
          </div>
          <p className="text-muted-foreground">アプリケーションの動作をカスタマイズできます</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              一般
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              AI
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              ショートカット
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>一般設定</CardTitle>
                <CardDescription>言語、自動保存、テーマなどの基本設定</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language">言語</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="ko">한국어</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="autosave">自動保存間隔（秒）</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[autosaveInterval]}
                      onValueChange={(value) => setAutosaveInterval(value[0])}
                      max={300}
                      min={10}
                      step={10}
                      className="flex-1"
                    />
                    <Badge variant="secondary" className="min-w-[60px] justify-center">
                      {autosaveInterval}秒
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">テーマ</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">システム設定に従う</SelectItem>
                      <SelectItem value="light">ライト</SelectItem>
                      <SelectItem value="dark">ダーク</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI設定</CardTitle>
                <CardDescription>AIモデル、デフォルトトーン、安全レベルの設定</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="model">AIモデル</Label>
                  <Select value={aiModel} onValueChange={setAiModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4 (推奨)</SelectItem>
                      <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude">Claude 3</SelectItem>
                      <SelectItem value="gemini">Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>デフォルト敬語レベル</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground min-w-[60px]">カジュアル</span>
                      <Slider
                        value={defaultFormality}
                        onValueChange={setDefaultFormality}
                        max={100}
                        min={0}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground min-w-[60px]">フォーマル</span>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      {defaultFormality[0]}%
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label>デフォルト熱意レベル</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground min-w-[60px]">控えめ</span>
                      <Slider
                        value={defaultEnthusiasm}
                        onValueChange={setDefaultEnthusiasm}
                        max={100}
                        min={0}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground min-w-[60px]">積極的</span>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      {defaultEnthusiasm[0]}%
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="safety">安全レベル</Label>
                  <Select value={safetyLevel} onValueChange={setSafetyLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">低（創造性重視）</SelectItem>
                      <SelectItem value="medium">中（バランス）</SelectItem>
                      <SelectItem value="high">高（安全性重視）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shortcuts Tab */}
          <TabsContent value="shortcuts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>キーボードショートカット</CardTitle>
                <CardDescription>よく使う機能のキーボードショートカットをカスタマイズ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries({
                  save: "保存",
                  runAi: "AI実行",
                  toggleOutline: "アウトライン表示切替",
                  toggleAiPanel: "AIパネル表示切替",
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">{label}</Label>
                      <p className="text-xs text-muted-foreground">
                        {key === "save" && "文書を保存します"}
                        {key === "runAi" && "AI機能を実行します"}
                        {key === "toggleOutline" && "アウトラインパネルの表示を切り替えます"}
                        {key === "toggleAiPanel" && "AIアシストパネルの表示を切り替えます"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingShortcut === key ? (
                        <Input
                          value={shortcuts[key as keyof typeof shortcuts]}
                          onChange={(e) => handleShortcutEdit(key, e.target.value)}
                          onBlur={() => setEditingShortcut(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setEditingShortcut(null)
                            }
                          }}
                          className="w-32 text-center"
                          autoFocus
                        />
                      ) : (
                        <Badge
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80 min-w-[100px] justify-center"
                          onClick={() => setEditingShortcut(key)}
                        >
                          {shortcuts[key as keyof typeof shortcuts]}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <Button variant="outline" onClick={handleResetSettings} className="flex items-center gap-2 bg-transparent">
            <RotateCcw className="h-4 w-4" />
            リセット
          </Button>
          <Button onClick={handleSaveSettings} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            保存
          </Button>
        </div>
      </div>
    </div>
  )
}
