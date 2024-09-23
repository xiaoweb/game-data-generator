import ReactDOM from 'react-dom/client'
import App from './App'
import { ConfigProvider } from 'antd'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ConfigProvider>
    <App />
  </ConfigProvider>
)
