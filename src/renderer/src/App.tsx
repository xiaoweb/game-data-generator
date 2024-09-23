import type { ReactNode } from 'react'
import { FC } from 'react'
import { ConfigProvider } from 'antd'
import Index from './components/index'

interface IApp {
  children?: ReactNode
}

const App: FC<IApp> = () => (
  <ConfigProvider>
    <App>
      <Index />
    </App>
  </ConfigProvider>
)

export default App
