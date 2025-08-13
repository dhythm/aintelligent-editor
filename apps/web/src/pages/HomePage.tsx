import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useState, useRef, useMemo, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  MoreVertical,
  Bot,
  Save,
  Share2,
  List,
  Copy,
  Download,
  Camera,
  X,
  ChevronRight,
  ChevronLeft,
  Search,
  FileText,
  Plus,
  Wand2,
  FileEdit,
  ArrowRight,
  Settings,
} from "lucide-react"

export default function HomePage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [commandSearch, setCommandSearch] = useState("")
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0)

  const [writingFlowOpen, setWritingFlowOpen] = useState(false)
  const [writingFlowChecklist, setWritingFlowChecklist] = useState({
    draft: {
      items: [
        { id: "outline", text: "アウトラインを作成", checked: false },
        { id: "intro", text: "導入部を書く", checked: false },
        { id: "body", text: "本文を書く", checked: false },
        { id: "conclusion", text: "結論を書く", checked: false },
      ],
    },
    revise: {
      items: [
        { id: "structure", text: "構成を見直す", checked: false },
        { id: "flow", text: "文章の流れを確認", checked: false },
        { id: "clarity", text: "明確性を向上", checked: false },
        { id: "redundancy", text: "冗長性を削除", checked: false },
      ],
    },
    proofread: {
      items: [
        { id: "grammar", text: "文法をチェック", checked: false },
        { id: "spelling", text: "スペルをチェック", checked: false },
        { id: "punctuation", text: "句読点を確認", checked: false },
        { id: "consistency", text: "一貫性を確認", checked: false },
      ],
    },
    finalize: {
      items: [
        { id: "formatting", text: "フォーマットを整える", checked: false },
        { id: "metadata", text: "メタデータを設定", checked: false },
        { id: "final-review", text: "最終確認", checked: false },
        { id: "publish-ready", text: "公開準備完了", checked: false },
      ],
    },
  })

  const [content, setContent] = useState(
    "# サンプル文書\n\nこれはAIライティングアシスタントのサンプル文書です。\n\n## 概要\n\n文書の概要をここに記載します。\n\n## 詳細\n\n詳細な内容をここに記載します。",
  )
  const [keywords, setKeywords] = useState([
    { id: "1", text: "AI" },
    { id: "2", text: "ライティング" },
    { id: "3", text: "アシスタント" },
  ])
  const [documentTitle, setDocumentTitle] = useState("無題の文書")

  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [outlineOpen, setOutlineOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareAccess, setShareAccess] = useState("anyone")
  const [sharePermission, setSharePermission] = useState("view")
  const [specificEmails, setSpecificEmails] = useState("")

  const handleChecklistToggle = (step: string, itemId: string) => {
    setWritingFlowChecklist((prev) => ({
      ...prev,
      [step]: {
        ...prev[step],
        items: prev[step].items.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item)),
      },
    }))
  }

  const getStepProgress = (step: string) => {
    const stepData = writingFlowChecklist[step]
    const completed = stepData.items.filter((item) => item.checked).length
    const total = stepData.items.length
    return { completed, total, percentage: Math.round((completed / total) * 100) }
  }

  const getTotalProgress = () => {
    const allItems = Object.values(writingFlowChecklist).flatMap((step) => step.items)
    const completed = allItems.filter((item) => item.checked).length
    const total = allItems.length
    return { completed, total, percentage: Math.round((completed / total) * 100) }
  }

  const handleRunAIForStep = (step: string) => {
    setAiPanelOpen(true)

    const stepActions = {
      draft: () => {
        toast({
          title: "AI下書き支援",
          description: "アウトライン生成とコンテンツ作成機能を開きました",
        })
      },
      revise: () => {
        toast({
          title: "AI校正支援",
          description: "文章構成と明確性の改善機能を開きました",
        })
      },
      proofread: () => {
        toast({
          title: "AI校閲支援",
          description: "文法・スペルチェック機能を開きました",
        })
      },
      finalize: () => {
        toast({
          title: "AI最終確認",
          description: "フォーマット調整と品質確認機能を開きました",
        })
      },
    }

    stepActions[step]?.()
  }

  const commands = useMemo(() => {
    const allCommands = [
      {
        id: "new-doc",
        title: "新しい文書",
        description: "新しい文書を作成",
        icon: Plus,
        shortcut: "⌘N",
        action: () => {
          setContent("")
          setDocumentTitle("無題の文書")
          toast({ title: "新しい文書を作成しました" })
        },
      },
      {
        id: "open-doc",
        title: "文書を開く",
        description: "既存の文書を開く",
        icon: FileText,
        shortcut: "⌘O",
        action: () => {
          toast({ title: "文書を開く機能は開発中です" })
        },
      },
      {
        id: "save-doc",
        title: "文書を保存",
        description: "現在の文書を保存",
        icon: Save,
        shortcut: "⌘S",
        action: () => {
          handleSave()
        },
      },
      {
        id: "ai-rewrite",
        title: "AI: 書き換え",
        description: "選択したテキストを書き換え",
        icon: Wand2,
        shortcut: "⌘R",
        action: () => {
          setAiPanelOpen(true)
          toast({ title: "AI書き換えパネルを開きました" })
        },
      },
      {
        id: "ai-summarize",
        title: "AI: 要約",
        description: "文書を要約",
        icon: FileEdit,
        shortcut: "⌘U",
        action: () => {
          setAiPanelOpen(true)
          toast({ title: "AI要約パネルを開きました" })
        },
      },
      {
        id: "ai-continue",
        title: "AI: 続きを書く",
        description: "文章の続きを生成",
        icon: ArrowRight,
        shortcut: "⌘T",
        action: () => {
          toast({ title: "AI続き書き機能を実行しました" })
        },
      },
      {
        id: "toggle-outline",
        title: "アウトライン表示切替",
        description: "アウトラインパネルの表示/非表示",
        icon: List,
        shortcut: "⌘\\",
        action: () => {
          setOutlineOpen(!outlineOpen)
        },
      },
      {
        id: "toggle-ai-panel",
        title: "AIパネル表示切替",
        description: "AIアシスタントパネルの表示/非表示",
        icon: Bot,
        shortcut: "⌘J",
        action: () => {
          setAiPanelOpen(!aiPanelOpen)
        },
      },
      {
        id: "toggle-writing-flow",
        title: "ライティングフロー表示切替",
        description: "ライティングフローパネルの表示/非表示",
        icon: FileEdit,
        shortcut: "⌘W",
        action: () => {
          setWritingFlowOpen(!writingFlowOpen)
        },
      },
    ]

    if (!commandSearch) return allCommands

    return allCommands.filter(
      (command) =>
        command.title.toLowerCase().includes(commandSearch.toLowerCase()) ||
        command.description.toLowerCase().includes(commandSearch.toLowerCase()),
    )
  }, [commandSearch, outlineOpen, aiPanelOpen, writingFlowOpen])

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("ai-editor-onboarding-completed")
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    } else {
      setOnboardingCompleted(true)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandPaletteOpen(true)
        setCommandSearch("")
        setSelectedCommandIndex(0)
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "w") {
        e.preventDefault()
        setWritingFlowOpen(!writingFlowOpen)
        return
      }

      if (commandPaletteOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault()
          setSelectedCommandIndex((prev) => (prev + 1) % commands.length)
        } else if (e.key === "ArrowUp") {
          e.preventDefault()
          setSelectedCommandIndex((prev) => (prev - 1 + commands.length) % commands.length)
        } else if (e.key === "Enter") {
          e.preventDefault()
          if (commands[selectedCommandIndex]) {
            commands[selectedCommandIndex].action()
            setCommandPaletteOpen(false)
          }
        } else if (e.key === "Escape") {
          e.preventDefault()
          setCommandPaletteOpen(false)
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleSave()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [commandPaletteOpen, commands, selectedCommandIndex, writingFlowOpen])

  useEffect(() => {
    setSelectedCommandIndex(0)
  }, [commandSearch])

  const wordCount = content
    .replace(/[#*`_\-[\]()]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 0).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  const headings = useMemo(() => {
    const lines = content.split("\n")
    return lines
      .map((line, index) => {
        const match = line.match(/^(#{1,3})\s+(.+)/)
        if (match) {
          return {
            level: match[1].length,
            text: match[2],
            line: index + 1,
          }
        }
        return null
      })
      .filter(Boolean)
  }, [content])

  const keywordDensities = useMemo(() => {
    const calculateDensity = (keyword: string) => {
      const text = content.toLowerCase()
      const keywordLower = keyword.toLowerCase()
      const matches = (text.match(new RegExp(keywordLower, "g")) || []).length
      const totalWords = wordCount
      return totalWords > 0 ? ((matches / totalWords) * 100).toFixed(1) : "0.0"
    }

    return keywords.reduce(
      (acc, keyword) => {
        acc[keyword.id] = calculateDensity(keyword.text)
        return acc
      },
      {} as Record<string, string>,
    )
  }, [content, wordCount, keywords])

  const handleOnboardingNext = () => {
    if (onboardingStep < 2) {
      setOnboardingStep(onboardingStep + 1)
    } else {
      handleOnboardingComplete()
    }
  }

  const handleOnboardingPrev = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1)
    }
  }

  const handleOnboardingSkip = () => {
    handleOnboardingComplete()
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setOnboardingCompleted(true)
    localStorage.setItem("ai-editor-onboarding-completed", "true")
    toast({
      title: "オンボーディング完了",
      description: "AIライティングアシスタントへようこそ！",
    })
  }

  const onboardingSteps = [
    {
      title: "AIライティングエディターへようこそ",
      description:
        "強力なAI機能を備えた次世代のライティングツールです。文書作成、編集、共有のすべてを一つの場所で行えます。",
      illustration: "/ai-writing-editor-interface.png",
    },
    {
      title: "AIアシスタント機能",
      description:
        "文章の書き換え、要約、トーン調整など、AIがあなたのライティングをサポートします。下部のAIボタンからアクセスできます。",
      illustration: "/ai-assistant-panel.png",
    },
    {
      title: "保存とバージョン管理",
      description:
        "自動保存機能で作業を失うことはありません。バージョン履歴で過去の変更を確認し、必要に応じて復元できます。",
      illustration: "/document-versioning-save.png",
    },
  ]

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/document/shared/${Date.now()}`
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "リンクをコピーしました",
      description: "共有リンクがクリップボードにコピーされました。",
    })
  }

  const handleCreateSnapshot = () => {
    const snapshotUrl = `${window.location.origin}/document/snapshot/${Date.now()}`
    navigator.clipboard.writeText(snapshotUrl)
    toast({
      title: "読み取り専用スナップショットを作成しました",
      description: "スナップショットリンクがクリップボードにコピーされました。",
    })
  }

  const handleExport = (format: string) => {
    let exportContent = ""
    let filename = ""
    let mimeType = ""

    switch (format) {
      case "markdown":
        exportContent = content
        filename = `${documentTitle}.md`
        mimeType = "text/markdown"
        break
      case "html":
        exportContent = `<!DOCTYPE html>
<html>
<head>
  <title>${documentTitle}</title>
  <meta charset="utf-8">
</head>
<body>
  <pre>${content}</pre>
</body>
</html>`
        filename = `${documentTitle}.html`
        mimeType = "text/html"
        break
      case "pdf":
        toast({
          title: "PDF エクスポート",
          description: "PDF エクスポート機能は開発中です。",
        })
        return
    }

    const blob = new Blob([exportContent], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "エクスポート完了",
      description: `${format.toUpperCase()} ファイルをダウンロードしました。`,
    })
  }

  const handleSave = () => {
    toast({
      title: "保存完了",
      description: "文書が正常に保存されました。",
    })
  }

  const totalProgress = getTotalProgress()

  const handleBackClick = useCallback(() => {
    navigate("/documents")
  }, [navigate])

  return (
    <TooltipProvider>
      <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
        <DialogContent className="max-w-2xl p-0">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              value={commandSearch}
              onChange={(e) => setCommandSearch(e.target.value)}
              placeholder="コマンドを検索..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none border-none shadow-none focus-visible:ring-0 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              autoFocus
            />
            <div className="ml-auto flex items-center gap-1">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                ⌘K
              </kbd>
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1">
            {commands.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">コマンドが見つかりません</div>
            ) : (
              <div className="space-y-1">
                {commands.map((command, index) => {
                  const Icon = command.icon
                  return (
                    <div
                      key={command.id}
                      className={`flex items-center gap-3 rounded-sm px-2 py-2 text-sm cursor-pointer transition-colors ${
                        index === selectedCommandIndex
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                      onClick={() => {
                        command.action()
                        setCommandPaletteOpen(false)
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      <div className="flex-1">
                        <div className="font-medium">{command.title}</div>
                        <div className="text-xs text-muted-foreground">{command.description}</div>
                      </div>
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        {command.shortcut}
                      </kbd>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>↑↓ で移動</span>
              <span>Enter で実行</span>
              <span>Esc で閉じる</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/settings")} className="flex items-center gap-1">
              <Settings className="h-3 w-3" />
              すべてのショートカット
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showOnboarding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="relative">
              <Button variant="ghost" size="sm" className="absolute right-0 top-0" onClick={handleOnboardingSkip}>
                <X className="h-4 w-4" />
              </Button>
              <div className="flex justify-center mb-4">
                <div className="flex gap-2">
                  {onboardingSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === onboardingStep ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <CardTitle className="text-center text-xl">{onboardingSteps[onboardingStep].title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <img
                  src={onboardingSteps[onboardingStep].illustration || "/placeholder.svg"}
                  alt="オンボーディング図"
                  className="w-full max-w-sm h-48 object-cover rounded-lg bg-muted"
                />
              </div>
              <CardDescription className="text-center text-base leading-relaxed">
                {onboardingSteps[onboardingStep].description}
              </CardDescription>
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="ghost"
                  onClick={handleOnboardingPrev}
                  disabled={onboardingStep === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  戻る
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleOnboardingSkip}>
                    スキップ
                  </Button>
                  <Button onClick={handleOnboardingNext} className="flex items-center gap-2">
                    {onboardingStep === 2 ? "完了" : "次へ"}
                    {onboardingStep < 2 && <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col h-screen bg-background">
        <div className="hidden md:flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackClick} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Input
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="w-80 text-base font-medium border-none shadow-none focus-visible:ring-0 bg-transparent px-0"
              placeholder="文書タイトル"
            />
          </div>
          <Button variant="ghost" size="sm" className="p-2">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="md:hidden flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Button variant="ghost" size="sm" onClick={handleBackClick} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Input
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="flex-1 text-base font-medium border-none shadow-none focus-visible:ring-0 bg-transparent px-0"
            placeholder="文書タイトル"
          />
          <Button variant="ghost" size="sm" className="p-2">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 p-4 pb-20">
          <Card className="h-full">
            <CardContent className="p-4 h-full">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="ここに文章を入力してください..."
                className="w-full h-full resize-none border-none shadow-none focus-visible:ring-0 text-base leading-relaxed"
              />
            </CardContent>
          </Card>
        </div>

        <Sheet open={writingFlowOpen} onOpenChange={setWritingFlowOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="fixed top-32 right-4 z-40 rounded-full shadow-lg" variant="secondary">
              <FileEdit className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>ライティングフロー</SheetTitle>
              <SheetDescription>段階的な文書作成プロセスをガイドします</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">全体の進捗</span>
                    <span className="text-sm text-muted-foreground">
                      {totalProgress.completed}/{totalProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${totalProgress.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{totalProgress.percentage}% 完了</div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {[
                  { key: "draft", title: "下書き", icon: FileEdit, description: "アイデアを形にする" },
                  { key: "revise", title: "校正", icon: Wand2, description: "内容を改善する" },
                  { key: "proofread", title: "校閲", icon: Search, description: "エラーを修正する" },
                  { key: "finalize", title: "最終化", icon: Save, description: "公開準備を整える" },
                ].map((step) => {
                  const progress = getStepProgress(step.key)
                  const Icon = step.icon

                  return (
                    <Card key={step.key} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <CardTitle className="text-sm">{step.title}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {progress.completed}/{progress.total}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRunAIForStep(step.key)}
                              className="h-6 px-2 text-xs"
                            >
                              <Bot className="h-3 w-3 mr-1" />
                              AI実行
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="text-xs">{step.description}</CardDescription>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {writingFlowChecklist[step.key].items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`${step.key}-${item.id}`}
                                checked={item.checked}
                                onChange={() => handleChecklistToggle(step.key, item.id)}
                                className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 h-4 w-4"
                              />
                              <label
                                htmlFor={`${step.key}-${item.id}`}
                                className={`text-sm cursor-pointer transition-colors ${
                                  item.checked ? "text-muted-foreground line-through" : "text-foreground"
                                }`}
                              >
                                {item.text}
                              </label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="text-sm text-center">
                    <div className="font-medium mb-1">💡 ヒント</div>
                    <div className="text-muted-foreground text-xs leading-relaxed">
                      完璧を求めず、段階的に改善していきましょう。各ステップでAI機能を活用して効率的に作業を進められます。
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={outlineOpen} onOpenChange={setOutlineOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="fixed top-20 right-4 z-40 rounded-full shadow-lg" variant="secondary">
              <List className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>アウトライン</SheetTitle>
              <SheetDescription>文書の見出し構造を表示します</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-2">
              {headings.length === 0 ? (
                <p className="text-sm text-muted-foreground">見出しが見つかりません</p>
              ) : (
                headings.map((heading, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors ${
                      heading.level === 1 ? "font-semibold" : heading.level === 2 ? "ml-4 font-medium" : "ml-8"
                    }`}
                    onClick={() => {
                      toast({
                        title: "見出しに移動",
                        description: `"${heading.text}" に移動しました`,
                      })
                    }}
                  >
                    <div className="text-sm">{heading.text}</div>
                    <div className="text-xs text-muted-foreground">行 {heading.line}</div>
                  </div>
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>

        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
          <div className="flex items-center justify-around p-4">
            <Sheet open={aiPanelOpen} onOpenChange={setAiPanelOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="lg" className="flex-1 mx-1 bg-transparent">
                  <Bot className="h-5 w-5 mr-2" />
                  AI
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] p-6">
                <SheetHeader className="mb-6">
                  <SheetTitle>AIアシスタント</SheetTitle>
                  <SheetDescription>AIがあなたのライティングをサポートします</SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="rewrite" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="rewrite">書き換え</TabsTrigger>
                    <TabsTrigger value="summarize">要約</TabsTrigger>
                    <TabsTrigger value="tone">トーン</TabsTrigger>
                  </TabsList>

                  <TabsContent value="rewrite" className="space-y-6">
                    <div className="space-y-3">
                      <Label>選択したテキスト</Label>
                      <Textarea
                        placeholder="書き換えたいテキストを選択してください"
                        className="min-h-[100px]"
                        value="サンプルテキストです。"
                        readOnly
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>書き換えスタイル</Label>
                      <Select defaultValue="shorter">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="shorter">短く</SelectItem>
                          <SelectItem value="polite">丁寧に</SelectItem>
                          <SelectItem value="casual">カジュアルに</SelectItem>
                          <SelectItem value="simplify">簡潔に</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">適用</Button>
                  </TabsContent>

                  <TabsContent value="summarize" className="space-y-6">
                    <div className="space-y-3">
                      <Label>要約の長さ</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <Button variant="outline" size="sm">
                          箇条書き
                        </Button>
                        <Button variant="outline" size="sm">
                          段落
                        </Button>
                        <Button variant="outline" size="sm">
                          詳細
                        </Button>
                      </div>
                    </div>
                    <Button className="w-full">要約を生成</Button>
                    <div className="space-y-3">
                      <Label>生成された要約</Label>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm">要約結果がここに表示されます。</p>
                      </div>
                      <Button variant="outline" className="w-full bg-transparent">
                        カーソル位置に挿入
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="tone" className="space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label>フォーマル度</Label>
                        <input type="range" className="w-full" min="0" max="100" defaultValue="50" />
                      </div>
                      <div className="space-y-3">
                        <Label>熱意</Label>
                        <input type="range" className="w-full" min="0" max="100" defaultValue="50" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>プレビュー候補</Label>
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-4 bg-muted rounded-lg">
                            <p className="text-sm">バリエーション {i} のテキストです。</p>
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline">
                                置換
                              </Button>
                              <Button size="sm" variant="outline">
                                提案として挿入
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-8 space-y-3">
                  <Label className="text-sm font-medium">履歴</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {[
                      { action: "書き換え", time: "2分前" },
                      { action: "要約", time: "5分前" },
                      { action: "トーン調整", time: "10分前" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded text-xs">
                        <span>{item.action}</span>
                        <span className="text-muted-foreground">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button onClick={handleSave} size="lg" className="flex-1 mx-1">
              <Save className="h-5 w-5 mr-2" />
              保存
            </Button>

            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="flex-1 mx-1 bg-transparent">
                  <Share2 className="h-5 w-5 mr-2" />
                  共有
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>文書を共有</DialogTitle>
                  <DialogDescription>文書の共有設定を変更できます。</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="share" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="share">共有</TabsTrigger>
                    <TabsTrigger value="export">エクスポート</TabsTrigger>
                  </TabsList>

                  <TabsContent value="share" className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">アクセス権限</Label>
                      <RadioGroup value={shareAccess} onValueChange={setShareAccess}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="anyone" id="anyone" />
                          <Label htmlFor="anyone" className="text-sm">
                            リンクを知っている全員
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="org" id="org" />
                          <Label htmlFor="org" className="text-sm">
                            組織内のメンバーのみ
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">権限レベル</Label>
                      <Select value={sharePermission} onValueChange={setSharePermission}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">閲覧のみ</SelectItem>
                          <SelectItem value="comment">コメント可能</SelectItem>
                          <SelectItem value="edit">編集可能</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button onClick={handleCopyLink} size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        リンクをコピー
                      </Button>
                      <Button onClick={handleCreateSnapshot} variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        スナップショット作成
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="export" className="space-y-3">
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                        onClick={() => handleExport("markdown")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Markdown (.md)
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                        onClick={() => handleExport("html")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        HTML (.html)
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                        onClick={() => handleExport("pdf")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF (.pdf)
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>

          <div className="px-4 pb-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {wordCount}文字 • {readingTime}分
              </span>
              <span>最終保存: 2分前</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}