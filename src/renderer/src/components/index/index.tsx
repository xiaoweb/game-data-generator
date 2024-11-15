import { FC, ReactNode, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  FloatButton,
  Form,
  Input,
  notification,
  Popconfirm,
  Progress,
  Space,
  Spin,
  Table,
  Tooltip,
  Upload
} from 'antd'
import { useBoolean, useDynamicList, useLocalStorageState } from 'ahooks'
import {
  CaretRightOutlined,
  CheckOutlined,
  CopyOutlined,
  DragOutlined,
  MinusOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons'
import styles from './index.module.less'
import ReactDragListView from 'react-drag-listview'
import GetEpicGameData, { IGetEpicGameDataRef } from '../get-epic-game-data'
import ReactJson from 'react-json-view'
import papaparse from 'papaparse'
import { AbstractCheckboxGroupProps } from 'antd/es/checkbox/Group'
import useCopy from '@renderer/hooks/use-copy'
import { IGameData } from '@renderer/components/get-epic-game-data/type'

interface IIndex {
  children?: ReactNode
}

interface UrlType {
  url: string
}

export interface ILocalData {
  lang: string[]
  urls: UrlType[]
}

const Index: FC<IIndex> = () => {
  const [localData, setLocalData] = useLocalStorageState<ILocalData>('local-store-data', {
    defaultValue: {
      lang: [],
      urls: []
    }
  })
  const { list, move, push, remove, getKey, resetList } = useDynamicList<UrlType>(localData!.urls)
  const [jsonData, setJsonData] = useState<Record<string, IGameData[]>>()
  const [progress, setProgress] = useState<number>()
  const [loading, { set }] = useBoolean(false)
  const ref = useRef<IGetEpicGameDataRef>(null)
  const [api, contextHolder] = notification.useNotification()
  const [isCopied, copyToClipboard] = useCopy()
  const [errorInfo, setErrorInfo] = useState<string>()

  const [form] = Form.useForm()

  const options = useMemo<AbstractCheckboxGroupProps['options']>(() => {
    return [
      {
        label: 'English',
        value: 'en-US'
      },
      {
        label: 'العربية',
        value: 'ar'
      },
      {
        label: 'Deutsch',
        value: 'de'
      },
      {
        label: 'Español',
        value: 'es-ES'
      },
      {
        label: 'Español (LA)',
        value: 'es-MX'
      },
      {
        label: 'Français',
        value: 'fr'
      },
      {
        label: 'Italiano',
        value: 'it'
      },
      {
        label: '日本語',
        value: 'ja'
      },
      {
        label: '한국어',
        value: 'ko'
      },
      {
        label: 'Polski',
        value: 'pl'
      },
      {
        label: 'Português (Brasil)',
        value: 'pt-BR'
      },
      {
        label: 'Русский',
        value: 'ru'
      },
      {
        label: 'ไทย',
        value: 'th'
      },
      {
        label: 'Türkçe',
        value: 'tr'
      },
      {
        label: '简体中文',
        value: 'zh-CN'
      },
      {
        label: '繁體中文',
        value: 'zh-Hant'
      }
    ]
    /* return [
      { value: 'zh_CN', label: '简体中文' },
      { value: 'zh_Hant', label: '繁体中文' },
      { value: 'en_US', label: '英文' },
      { value: 'ja', label: '日本语' },
      { value: 'ko', label: '韩语' },
      { value: 'de', label: '德语' }
    ]*/
  }, [])

  const columns = useMemo(
    () => [
      {
        title: 'Url',
        dataIndex: 'url',
        key: 'url',
        render: (text: string, __row, index: number): ReactNode => (
          <div className={styles.column}>
            <div style={{ display: 'flex', alignItems: 'center', marginRight: 10 }}>
              {index + 1}.
            </div>
            <DragOutlined style={{ cursor: 'move', marginRight: 8 }} />
            <Form.Item
              style={{ flex: 1 }}
              name={['urls', getKey(index), 'url']}
              initialValue={text}
              noStyle
              rules={[{ required: true, message: `请输入正确的url，位置${index + 1}` }]}
            >
              <Input autoFocus={!text} style={{ marginRight: 16 }} placeholder="url" />
            </Form.Item>
            <Button icon={<MinusOutlined />} onClick={() => remove(index)} />
          </div>
        )
      }
    ],
    []
  )

  const spinTip = useMemo(
    () => (
      <div className={styles.tip}>
        <Progress percent={progress} type="circle" status={errorInfo ? 'exception' : 'normal'} />
      </div>
    ),
    [progress, errorInfo]
  )

  return (
    <div className={styles.content}>
      <Form form={form} style={{ display: 'flex', gap: 15 }} scrollToFirstError>
        <div className={styles.left}>
          <Spin
            spinning={loading}
            size="large"
            tip={spinTip}
            indicator={<div />}
            style={{ maxHeight: 'auto', minHeight: 'calc(100vh - 30px)' }}
          >
            <div className={styles.form}>
              <ReactDragListView
                onDragEnd={(oldIndex: number, newIndex: number) => move(oldIndex, newIndex)}
                handleSelector={'span[aria-label="drag"]'}
              >
                <Table
                  columns={columns}
                  size="small"
                  dataSource={list}
                  pagination={false}
                  style={{ overflow: 'auto' }}
                  rowKey={(__R, index) => getKey(index as number).toString()}
                />
              </ReactDragListView>
            </div>
          </Spin>
        </div>
        <div className={styles.center}>
          <Divider type="vertical" className={styles.divider} />
          <Space
            direction="vertical"
            className={styles.add}
            style={{
              marginTop: 16,
              textAlign: 'center',
              background: '#fff',
              padding: '5px 0'
            }}
            size={'large'}
          >
            <Tooltip title={'上传'} placement="right">
              <Upload
                accept=".csv"
                showUploadList={false}
                customRequest={({ file }) => {
                  papaparse.parse(file, {
                    complete: (results) => {
                      const urls = results.data?.reduce((pre, next) => {
                        if (next?.[0]) {
                          pre.push({ url: next?.[0] })
                        }
                        return pre
                      }, [])
                      resetList(urls)
                    }
                  })
                }}
              >
                <Button size="large" shape="circle" icon={<UploadOutlined />} disabled={loading} />
              </Upload>
            </Tooltip>
            <Tooltip title={'添加'} placement="right">
              <Button
                disabled={loading}
                onClick={() => push({ url: '' })}
                size="large"
                shape="circle"
                type="primary"
                icon={<PlusOutlined />}
              />
            </Tooltip>
            <Popconfirm
              title="请勾选要生成的语言"
              okText="确定"
              cancelText="取消"
              description={
                <Form.Item
                  rules={[{ required: true, message: '请选择语言' }]}
                  initialValue={localData?.lang ?? undefined}
                  required
                  name={'lang'}
                  style={{ marginTop: 16 }}
                >
                  <Checkbox.Group options={options} />
                </Form.Item>
              }
              onConfirm={() =>
                form
                  .validateFields({})
                  .then((val) => {
                    const data = {
                      ...val,
                      urls: val?.urls?.filter(Boolean)
                    }

                    setLocalData(data)
                    setErrorInfo(undefined)
                    ref.current?.start(data)
                  })
                  .catch((error) => {
                    form.scrollToField(error?.errorFields?.[0]?.name, {
                      behavior: 'smooth'
                    })
                    api.warning({
                      message: error?.errorFields?.[0]?.errors?.toString()
                    })
                    return Promise.reject(error)
                  })
              }
            >
              <Tooltip title={'开始'} placement="right">
                <Button
                  disabled={loading}
                  shape="circle"
                  type="primary"
                  size="large"
                  icon={<CaretRightOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        </div>
        <div className={styles.right}>
          <GetEpicGameData
            ref={ref}
            onFinish={(data) => {
              setJsonData(data)
              setTimeout(() => set(false), 1000)
            }}
            onProgress={(e) => setProgress(e)}
            onStart={() => set(true)}
            onError={(err) => {
              setErrorInfo(err)
            }}
          />
          {errorInfo && (
            <Alert message="获取数据出错" description={errorInfo} type="error" showIcon />
          )}
          <ReactJson
            style={{ marginTop: 16, flex: 1 }}
            src={jsonData as object}
            name={false}
            displayDataTypes={false}
            shouldCollapse={false}
          />
          <FloatButton.Group shape="circle" style={{ insetInlineEnd: 24 }}>
            <Button
              disabled={loading}
              shape="round"
              icon={isCopied ? <CheckOutlined /> : <CopyOutlined />}
              onClick={async () => {
                await copyToClipboard(JSON.stringify(jsonData))
                api.success({
                  message: '复制成功'
                })
              }}
              type={isCopied ? 'default' : 'primary'}
            >
              {isCopied ? '已复制' : '复制结果'}
            </Button>
          </FloatButton.Group>
        </div>
      </Form>
      {contextHolder}
    </div>
  )
}

export default Index
