import { useCallback, useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { MarkdownEditorProps } from '@/types/editor';
import { Bold, Italic, Link, List, ListOrdered, Image, Code, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function MarkdownEditor({
  content,
  onChange,
  onScroll,
  theme = 'light',
}: MarkdownEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // エディターがマウントされたときの処理
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // スクロールイベントのリスナー設定
    if (onScroll) {
      editor.onDidScrollChange(() => {
        const scrollTop = editor.getScrollTop();
        const scrollHeight = editor.getScrollHeight();
        onScroll(scrollTop, scrollHeight);
      });
    }

    // エディターの設定
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 24,
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderWhitespace: 'none',
      lineNumbers: 'off',
      glyphMargin: false,
      folding: false,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 0,
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      scrollbar: {
        vertical: 'visible',
        horizontal: 'hidden',
        verticalScrollbarSize: 10,
      },
      overviewRulerBorder: false,
    });
  };

  // ツールバーのアクション
  const insertMarkdown = useCallback((before: string, after: string = '') => {
    if (!editorRef.current) return;
    
    const selection = editorRef.current.getSelection();
    if (!selection) return;
    
    const selectedText = editorRef.current.getModel()?.getValueInRange(selection) || '';
    const newText = before + selectedText + after;
    
    editorRef.current.executeEdits('', [{
      range: selection,
      text: newText,
    }]);
    
    // カーソル位置を調整
    if (!selectedText) {
      const position = selection.getStartPosition();
      const newPosition = {
        lineNumber: position.lineNumber,
        column: position.column + before.length,
      };
      editorRef.current.setPosition(newPosition);
    }
    
    editorRef.current.focus();
  }, []);

  // ツールバーボタンのハンドラー
  const handleBold = () => insertMarkdown('**', '**');
  const handleItalic = () => insertMarkdown('*', '*');
  const handleLink = () => insertMarkdown('[', '](url)');
  const handleUnorderedList = () => insertMarkdown('- ');
  const handleOrderedList = () => insertMarkdown('1. ');
  const handleImage = () => insertMarkdown('![alt text](', ')');
  const handleCode = () => insertMarkdown('`', '`');
  const handleBlockquote = () => insertMarkdown('> ');
  const handleCodeBlock = () => insertMarkdown('```\n', '\n```');
  const handleHeading = (level: number) => insertMarkdown('#'.repeat(level) + ' ');

  return (
    <div className="h-full flex flex-col">
      {/* エディターツールバー */}
      <div className={cn(
        "flex items-center gap-1 p-2 border-b",
        theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBold}
          title="太字 (Ctrl+B)"
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleItalic}
          title="斜体 (Ctrl+I)"
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleHeading(1)}
          title="見出し1"
          className="h-8 px-2"
        >
          H1
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleHeading(2)}
          title="見出し2"
          className="h-8 px-2"
        >
          H2
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleHeading(3)}
          title="見出し3"
          className="h-8 px-2"
        >
          H3
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLink}
          title="リンク (Ctrl+K)"
          className="h-8 w-8 p-0"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImage}
          title="画像"
          className="h-8 w-8 p-0"
        >
          <Image className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUnorderedList}
          title="箇条書き"
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOrderedList}
          title="番号付きリスト"
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCode}
          title="インラインコード"
          className="h-8 w-8 p-0"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCodeBlock}
          title="コードブロック"
          className="h-8 px-2"
        >
          {'</>'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBlockquote}
          title="引用"
          className="h-8 w-8 p-0"
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          value={content}
          onChange={(value) => onChange(value || '')}
          onMount={handleEditorDidMount}
          language="markdown"
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            automaticLayout: true,
            fontSize: 14,
            lineHeight: 24,
            wordWrap: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            renderWhitespace: 'none',
            lineNumbers: 'off',
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'hidden',
              verticalScrollbarSize: 10,
            },
            overviewRulerBorder: false,
          }}
        />
      </div>
    </div>
  );
}