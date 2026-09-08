import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

/** 渲染错误边界：捕获未处理的渲染异常，避免整页空白 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('页面渲染出错：', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>😵</div>
          <h3 style={{ marginBottom: 8 }}>页面出错了</h3>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', wordBreak: 'break-all' }}>
            {this.state.error.message}
          </p>
          <button
            className="btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => {
              this.setState({ error: null })
              window.location.hash = '#/'
            }}
          >
            返回首页
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
