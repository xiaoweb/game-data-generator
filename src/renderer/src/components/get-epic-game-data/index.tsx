import { FC, ReactNode, useEffect, useRef } from 'react'
import styles from './index.module.less'
import { useAsyncEffect, useBoolean } from 'ahooks'
import { IGameData } from './type'

interface IGetEpicGameData {
  urls: string[]
  children?: ReactNode
  onStart?: () => void
  onFinish?: (data: IGameData[]) => void
  onError?: (err: unknown) => void
  onProgress?: (progress: number) => void
}

const GetEpicGameData: FC<IGetEpicGameData> = ({
  urls,
  onFinish,
  onProgress,
  onStart,
  onError
}) => {
  const webviewRef = useRef<Electron.WebviewTag>(null)
  const [isDomReady, { setTrue, setFalse }] = useBoolean(false)

  useAsyncEffect(async () => {
    const webview = webviewRef.current
    if (urls?.length && webview && isDomReady) {
      const data: IGameData[] = []
      onProgress?.(0)
      onStart?.()
      try {
        for (let index = 0; index < urls.length; index++) {
          let gameData: IGameData = {} as IGameData
          await webview?.loadURL(urls[index])
          const jsonStr = await webview.executeJavaScript(
            `document.getElementById('_schemaOrgMarkup-Product').innerText`
          )
          try {
            gameData = JSON.parse(jsonStr || '{}') || ({} as IGameData)
          } catch (err) {
            gameData = {} as IGameData
          }

          const [namespace, gameId] = gameData.sku.split(':')
          const descriptionData = gameData?.offers?.filter((item) =>
            RegExp(`${item.url}$`).test(gameData.url)
          )

          data.push({
            namespace,
            gameId,
            image: gameData?.image,
            datePublished: gameData?.datePublished,
            description: descriptionData?.[0]?.description || gameData?.description,
            gamePlatform: gameData?.gamePlatform,
            name: gameData?.name,
            brand: gameData?.brand,
            producer: gameData?.producer,
            publisher: gameData?.publisher,
            sku: gameData?.sku,
            url: gameData?.url
          })
          onProgress?.(Math.round((100 / urls?.length) * (index + 1)))
        }
      } catch (err) {
        onError?.(err)
      }
      onFinish?.(data)
    }
  }, [urls, isDomReady])

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

export default GetEpicGameData
