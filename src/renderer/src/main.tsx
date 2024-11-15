import ReactDOM from 'react-dom/client'
import { App, ConfigProvider } from 'antd'
import './index.css'
import Index from '@renderer/components/index'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ConfigProvider
    theme={{
      cssVar: true,
      components: {
        Spin: {
          contentHeight: 'auto'
        }
      }
    }}
  >
    <App>
      <Index />
    </App>
  </ConfigProvider>
)
