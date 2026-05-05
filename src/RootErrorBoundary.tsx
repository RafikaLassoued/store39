import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info.componentStack);
  }

  render(): ReactNode {
    const { error } = this.state;
    if (error) {
      return (
        <div dir="rtl" className="min-h-screen bg-stone-100 p-6 text-stone-900" style={{ fontFamily: 'system-ui, sans-serif' }}>
          <h1 className="text-xl font-bold text-red-800 mb-2">تعذّر تحميل الواجهة</h1>
          <p className="text-sm text-stone-600 mb-4">
            حدث خطأ أثناء التشغيل. افتح أدوات المطوّر (F12) ثم تبويب Console لمزيد من التفاصيل.
          </p>
          <pre className="text-xs bg-white border border-stone-200 rounded-lg p-4 overflow-auto max-h-[50vh] whitespace-pre-wrap">
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
