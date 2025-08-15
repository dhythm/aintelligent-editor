import { useEffect, useRef, useState } from 'react';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import DOMPurify from 'dompurify';
import { MarkdownPreviewProps } from '@/types/editor';
import { cn } from '@/lib/utils';

export function MarkdownPreview({
  content,
  onScroll,
  theme = 'light',
}: MarkdownPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [processedContent, setProcessedContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // マークダウンをHTMLに変換
  const processMarkdown = async (markdown: string): Promise<string> => {
    try {
      const result = await remark()
        .use(remarkGfm)
        .use(remarkHtml, { 
          sanitize: false // DOMPurifyでサニタイズするので、ここではfalse
        })
        .process(markdown);
      
      return result.toString();
    } catch (error) {
      console.error('Markdown processing error:', error);
      return '<p class="text-red-500">マークダウンの処理中にエラーが発生しました。</p>';
    }
  };

  // コンテンツが変更されたときの処理
  useEffect(() => {
    const updatePreview = async () => {
      setIsProcessing(true);
      try {
        const html = await processMarkdown(content);
        // DOMPurifyでサニタイズ
        const cleanHtml = DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'hr',
            'ul', 'ol', 'li',
            'blockquote',
            'a',
            'img',
            'code', 'pre',
            'em', 'strong',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'del', 'ins',
            'sup', 'sub'
          ],
          ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target'],
          ALLOW_DATA_ATTR: false,
        });
        setProcessedContent(cleanHtml);
      } finally {
        setIsProcessing(false);
      }
    };

    // デバウンス処理（300ms）
    const timer = setTimeout(updatePreview, 300);
    return () => clearTimeout(timer);
  }, [content]);

  // スクロールハンドラー
  const handleScroll = () => {
    if (onScroll && previewRef.current) {
      const { scrollTop, scrollHeight } = previewRef.current;
      onScroll(scrollTop, scrollHeight);
    }
  };

  // コードブロックの処理
  useEffect(() => {
    if (!previewRef.current) return;

    const codeBlocks = previewRef.current.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
      const code = block.textContent || '';
      const language = block.className.replace('language-', '') || 'plaintext';
      
      // prism-react-rendererでシンタックスハイライト
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      
      // TODO: 後でprism-react-rendererを使ったハイライト処理を追加
      block.parentElement?.replaceWith(wrapper);
      wrapper.innerHTML = `<pre class="overflow-x-auto"><code class="language-${language}">${code}</code></pre>`;
    });
  }, [processedContent]);

  const previewClasses = cn(
    'prose max-w-none h-full overflow-y-auto p-8',
    theme === 'dark' ? 'prose-invert bg-gray-900 text-gray-100' : 'bg-white text-gray-900',
    'prose-headings:font-semibold',
    'prose-h1:text-3xl prose-h1:mb-4',
    'prose-h2:text-2xl prose-h2:mb-3',
    'prose-h3:text-xl prose-h3:mb-2',
    'prose-p:mb-4 prose-p:leading-7',
    'prose-ul:mb-4 prose-ul:list-disc prose-ul:pl-6',
    'prose-ol:mb-4 prose-ol:list-decimal prose-ol:pl-6',
    'prose-li:mb-1',
    'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic',
    'prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
    'prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto',
    'prose-img:rounded-lg prose-img:shadow-md',
    'prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800',
    'prose-table:w-full prose-table:border-collapse',
    'prose-th:border prose-th:border-gray-300 prose-th:px-4 prose-th:py-2 prose-th:bg-gray-100',
    'prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2'
  );

  return (
    <div className="h-full relative">
      {isProcessing && (
        <div className="absolute top-2 right-2 text-sm text-gray-500">
          処理中...
        </div>
      )}
      <div
        ref={previewRef}
        className={previewClasses}
        onScroll={handleScroll}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </div>
  );
}