import { FC, forwardRef, ReactNode, useEffect, useImperativeHandle, useRef } from 'react'
import styles from './index.module.less'
import { useBoolean, useMemoizedFn } from 'ahooks'
import { IGameData } from './type'
import { ILocalData } from '@renderer/components/index'
import { isEmpty } from 'radash'

export interface IGetEpicGameDataRef {
  start: (data: ILocalData) => Promise<void>
}

interface IGetEpicGameData {
  children?: ReactNode
  onStart?: () => void
  onFinish?: (data: Record<string, IGameData[]>) => void
  onError?: (error: string) => void
  onProgress?: (progress: number) => void
}

const GetEpicGameData: FC<IGetEpicGameData> = ({ onFinish, onProgress, onStart, onError }, ref) => {
  const webviewRef = useRef<Electron.WebviewTag>(null)
  const [isDomReady, { setTrue, setFalse }] = useBoolean(false)

  const start = useMemoizedFn(async (data: ILocalData) => {
    const webview = webviewRef.current
    const { urls, lang } = data
    if (urls?.length && webview && isDomReady) {
      const data: Record<string, IGameData[]> = {}
      onProgress?.(0)
      onStart?.()
      try {
        const totalLength = lang?.length * urls.length
        for (let i = 0; i < lang.length; i++) {
          const lan = lang[i]
          data[lan] = []
          for (let index = 0; index < urls.length; index++) {
            let gameData: IGameData = {} as IGameData
            const tmpUrl = urls[index]?.url?.replace(/\/[a-z]{2}-[A-Z]{2}\//, `/${lan}/`)
            await webview?.loadURL(tmpUrl)
            const jsonStr = await webview.executeJavaScript(
              `document.getElementById('_schemaOrgMarkup-Product')?.innerText`
            )
            const descriptionStr = await webview.executeJavaScript(
              `document.querySelector('.css-1myreog')?.innerText`
            )
            try {
              gameData = JSON.parse(jsonStr || '{}')
            } catch (err) {
              /* empty */
            }

            if (isEmpty(gameData)) {
              throw `从地址：${tmpUrl} 获取游戏数据出错，请检查！`
            }

            const [namespace, gameId] = gameData.sku.split(':')
            const descriptionData = gameData?.offers?.filter((item) =>
              RegExp(`${item.url}$`).test(gameData.url)
            )

            data[lan].push({
              namespace,
              gameId,
              image: gameData?.image,
              datePublished: gameData?.datePublished,
              description:
                descriptionStr || descriptionData?.[0]?.description || gameData?.description,
              gamePlatform: gameData?.gamePlatform,
              name: gameData?.name,
              brand: gameData?.brand,
              producer: gameData?.producer,
              publisher: gameData?.publisher,
              sku: gameData?.sku,
              url: gameData?.url
            })
            const currentIteration = i * urls?.length + index + 1
            const progress = (currentIteration / totalLength) * 100
            onProgress?.(Math.round(progress))
          }
        }
      } catch (error) {
        onError?.(error as string)
      }
      onFinish?.(data)
    }
  })

  useImperativeHandle(ref, () => ({
    start
  }))

  useEffect(() => {
    webviewRef?.current?.addEventListener('dom-ready', () => {
      setTrue()
    })
    return (): void => {
      webviewRef?.current?.removeEventListener('dom-ready', setTrue)
      setFalse()
    }
  }, [])

  return (
    <div className={styles.content}>
      <webview src="https://www.epicgames.com/" ref={webviewRef} className={styles.webview} />
    </div>
  )
}

export default forwardRef<IGetEpicGameDataRef, IGetEpicGameData>(GetEpicGameData)
