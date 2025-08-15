import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  ArrowLeft,
  Moon,
  Sun,
  Link2,
  Link2Off
} from 'lucide-react';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';
import { MarkdownPreview } from '@/components/editor/MarkdownPreview';
import { ViewModeToggle } from '@/components/editor/ViewModeToggle';
import { EditorErrorBoundary } from '@/components/editor/EditorErrorBoundary';
import { DocumentEditorProps, ViewMode, EditorState } from '@/types/editor';
import { createScrollSyncService } from '@/services/scrollSync';
import { cn } from '@/lib/utils';

const AUTOSAVE_DELAY = 2000; // 2秒

export function DocumentEditor({ initialContent = '' }: DocumentEditorProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // エディター状態
  const [editorState, setEditorState] = useState<EditorState>({
    content: initialContent || '# 新しいドキュメント\n\nマークダウンで文書を作成しましょう。',
    viewMode: 'split-horizontal',
    scrollSyncEnabled: true,
    theme: 'light',
    isAutoSaveEnabled: true,
    lastSaved: null,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // スクロール同期サービス
  const [scrollSyncService] = useState(() => createScrollSyncService());

  // コンテンツ変更ハンドラー
  const handleContentChange = useCallback((newContent: string) => {
    setEditorState(prev => ({ ...prev, content: newContent }));
    setHasUnsavedChanges(true);
  }, []);

  // 保存処理
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // TODO: APIを使って実際の保存処理を実装
      await new Promise(resolve => setTimeout(resolve, 500)); // 仮の遅延
      
      setEditorState(prev => ({ ...prev, lastSaved: new Date() }));
      setHasUnsavedChanges(false);
      
      toast({
        title: '保存しました',
        description: '文書が正常に保存されました。',
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: '保存中にエラーが発生しました。',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // 自動保存
  useEffect(() => {
    if (!editorState.isAutoSaveEnabled || !hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      handleSave();
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timer);
  }, [editorState.content, editorState.isAutoSaveEnabled, hasUnsavedChanges, handleSave]);

  // ビューモード変更ハンドラー
  const handleViewModeChange = (mode: ViewMode['type']) => {
    setEditorState(prev => ({ ...prev, viewMode: mode }));
  };

  // テーマ切り替え
  const toggleTheme = () => {
    setEditorState(prev => ({ 
      ...prev, 
      theme: prev.theme === 'light' ? 'dark' : 'light' 
    }));
  };

  // スクロール同期切り替え
  const toggleScrollSync = () => {
    setEditorState(prev => ({ 
      ...prev, 
      scrollSyncEnabled: !prev.scrollSyncEnabled 
    }));
    
    if (!editorState.scrollSyncEnabled) {
      scrollSyncService.enableSync();
    } else {
      scrollSyncService.disableSync();
    }
  };

  // 自動保存切り替え
  const toggleAutoSave = () => {
    setEditorState(prev => ({ 
      ...prev, 
      isAutoSaveEnabled: !prev.isAutoSaveEnabled 
    }));
  };

  // スクロールハンドラー
  const handleEditorScroll = useCallback((scrollTop: number, scrollHeight: number) => {
    if (editorState.scrollSyncEnabled && scrollHeight > 0) {
      const scrollRatio = scrollTop / (scrollHeight - window.innerHeight);
      scrollSyncService.syncEditorToPreview(scrollRatio);
    }
  }, [editorState.scrollSyncEnabled, scrollSyncService]);

  const handlePreviewScroll = useCallback((scrollTop: number, scrollHeight: number) => {
    if (editorState.scrollSyncEnabled && scrollHeight > 0) {
      const scrollRatio = scrollTop / (scrollHeight - window.innerHeight);
      scrollSyncService.syncPreviewToEditor(scrollRatio);
    }
  }, [editorState.scrollSyncEnabled, scrollSyncService]);

  // レンダリング内容を決定
  const renderContent = () => {
    switch (editorState.viewMode) {
      case 'editor-only':
        return (
          <MarkdownEditor
            content={editorState.content}
            onChange={handleContentChange}
            theme={editorState.theme}
          />
        );
      
      case 'preview-only':
        return (
          <MarkdownPreview
            content={editorState.content}
            theme={editorState.theme}
          />
        );
      
      case 'split-horizontal':
        return (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50} minSize={30}>
              <MarkdownEditor
                content={editorState.content}
                onChange={handleContentChange}
                onScroll={handleEditorScroll}
                syncScroll={editorState.scrollSyncEnabled}
                theme={editorState.theme}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <MarkdownPreview
                content={editorState.content}
                onScroll={handlePreviewScroll}
                syncScroll={editorState.scrollSyncEnabled}
                theme={editorState.theme}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        );
      
      case 'split-vertical':
        return (
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={50} minSize={30}>
              <MarkdownEditor
                content={editorState.content}
                onChange={handleContentChange}
                onScroll={handleEditorScroll}
                syncScroll={editorState.scrollSyncEnabled}
                theme={editorState.theme}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <MarkdownPreview
                content={editorState.content}
                onScroll={handlePreviewScroll}
                syncScroll={editorState.scrollSyncEnabled}
                theme={editorState.theme}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        );
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-screen",
      editorState.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    )}>
      {/* ヘッダー */}
      <header className={cn(
        "flex items-center justify-between px-4 py-2 border-b",
        editorState.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      )}>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/documents')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <ViewModeToggle
            currentMode={editorState.viewMode}
            onModeChange={handleViewModeChange}
          />
        </div>

        <div className="flex items-center gap-4">
          {/* 保存状態 */}
          <div className="text-sm text-muted-foreground">
            {isSaving ? (
              '保存中...'
            ) : hasUnsavedChanges ? (
              '未保存の変更'
            ) : editorState.lastSaved ? (
              `最終保存: ${editorState.lastSaved.toLocaleTimeString()}`
            ) : (
              ''
            )}
          </div>

          {/* 保存ボタン */}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* 設定 */}
          <div className="flex items-center gap-4">
            {/* テーマ切り替え */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
            >
              {editorState.theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            {/* スクロール同期 */}
            {(editorState.viewMode === 'split-horizontal' || 
              editorState.viewMode === 'split-vertical') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleScrollSync}
                title={editorState.scrollSyncEnabled ? 'スクロール同期を無効化' : 'スクロール同期を有効化'}
              >
                {editorState.scrollSyncEnabled ? (
                  <Link2 className="h-4 w-4" />
                ) : (
                  <Link2Off className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* 自動保存 */}
            <div className="flex items-center gap-2">
              <Switch
                id="auto-save"
                checked={editorState.isAutoSaveEnabled}
                onCheckedChange={toggleAutoSave}
              />
              <Label htmlFor="auto-save" className="text-sm">
                自動保存
              </Label>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-hidden">
        <EditorErrorBoundary>
          {renderContent()}
        </EditorErrorBoundary>
      </main>
    </div>
  );
}