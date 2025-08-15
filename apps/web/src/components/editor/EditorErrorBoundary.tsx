import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorBoundaryState } from '@/types/editor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

export class EditorErrorBoundary extends Component<Props, ErrorBoundaryState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorType: 'unknown',
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // エラータイプを判定
    let errorType: ErrorBoundaryState['errorType'] = 'unknown';
    
    if (error.message.includes('parse') || error.message.includes('markdown')) {
      errorType = 'parser';
    } else if (error.message.includes('editor') || error.message.includes('monaco')) {
      errorType = 'editor';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorType = 'network';
    }

    return {
      hasError: true,
      errorType,
      errorMessage: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Editor error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      errorType: 'unknown',
      errorMessage: '',
    });
  };

  render() {
    if (this.state.hasError) {
      const errorMessages = {
        parser: {
          title: 'マークダウン処理エラー',
          description: 'マークダウンの処理中にエラーが発生しました。文書の形式を確認してください。',
        },
        editor: {
          title: 'エディターエラー',
          description: 'エディターの初期化中にエラーが発生しました。ページを再読み込みしてください。',
        },
        network: {
          title: 'ネットワークエラー',
          description: 'ネットワーク接続に問題があります。接続を確認してください。',
        },
        unknown: {
          title: '予期しないエラー',
          description: 'エラーが発生しました。ページを再読み込みしてください。',
        },
      };

      const { title, description } = errorMessages[this.state.errorType];

      return (
        <div className="flex items-center justify-center h-full p-8">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="mt-2">
              <p>{description}</p>
              {this.state.errorMessage && (
                <p className="text-xs mt-2 font-mono">{this.state.errorMessage}</p>
              )}
            </AlertDescription>
            <Button
              onClick={this.handleReset}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              再試行
            </Button>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}