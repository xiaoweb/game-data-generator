import { useState } from 'react'
import { useMemoizedFn } from 'ahooks'

const useCopy = (): [boolean, (text: string) => Promise<void>] => {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = useMemoizedFn<(text: string) => Promise<void>>(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000) // 2秒后重置复制状态
    } catch (error) {
      console.error('Failed to copy: ', error)
      setIsCopied(false)
    }
  })

  return [isCopied, copyToClipboard]
}

export default useCopy
