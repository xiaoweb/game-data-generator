import { FC, ReactNode, useMemo, useState } from 'react'
import {
  Button,
  Checkbox,
  Divider,
  FloatButton,
  Form,
  Input,
  Progress,
  Space,
  Spin,
  Table,
  Upload
} from 'antd'
import { useBoolean, useDynamicList } from 'ahooks'
import { DragOutlined, MinusOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import styles from './index.module.less'
import ReactDragListView from 'react-drag-listview'
import GetEpicGameData from '../get-epic-game-data'
import ReactJson from 'react-json-view'
import papaparse from 'papaparse'
import { AbstractCheckboxGroupProps } from 'antd/es/checkbox/Group'

interface IIndex {
  children?: ReactNode
}

const Index: FC<IIndex> = () => {
  const { list, getKey, move, push, sortList, remove, resetList } = useDynamicList([
    { url: localStorage.getItem('urls') },
    {}
  ])
  const [jsonData, setJsonData] = useState()
  const [progress, setProgress] = useState()
  const [loading, { set }] = useBoolean(false)

  const [form] = Form.useForm()

  const [urls, setUrls] = useState<string[]>([])

  const options = useMemo<AbstractCheckboxGroupProps['options']>(() => {
    return [
      { value: 'zh-CN', label: '中文' },
      { value: 'en-US', label: '英文' }
    ]
  }, [])

  const columns = useMemo(
    () => [
      {
        title: 'Url',
        dataIndex: 'url',
        key: 'url',
        render: (text: string, row, index: number) => (
          <div className={styles.column}>
            <DragOutlined style={{ cursor: 'move', marginRight: 8 }} />
            <Form.Item
              style={{ flex: 1 }}
              name={['params', getKey(index), 'url']}
              initialValue={text}
              noStyle
              rules={[{ required: true }]}
            >
              <Input style={{ marginRight: 16 }} placeholder="url" />
            </Form.Item>
            <Button icon={<MinusOutlined />} onClick={() => remove(index)} />
          </div>
        )
      }
    ],
    []
  )

  return (
    <div className={styles.content}>
      <Form form={form} style={{ display: 'flex', gap: 10 }}>
        <div className={styles.left}>
          <Spin spinning={loading}>
            <div className={styles.form}>
              <ReactDragListView
                onDragEnd={(oldIndex: number, newIndex: number) => move(oldIndex, newIndex)}
                handleSelector={'span[aria-label="drag"]'}
              >
                <Table
                  columns={columns}
                  size="small"
                  dataSource={list}
                  rowKey={(r, index: number) => getKey(index).toString()}
                  pagination={false}
                  style={{ overflow: 'auto' }}
                />
              </ReactDragListView>
            </div>
          </Spin>
        </div>
        <div className={styles.center}>
          <Divider type="vertical" className={styles.divider} />
          <FloatButton.Group className={styles.add} shape="circle" style={{ insetInlineEnd: 24 }}>
            <FloatButton icon={<PlusOutlined />} onClick={() => push({ url: '' })} type="primary" />
            <FloatButton />
            <FloatButton.BackTop visibilityHeight={0} />
          </FloatButton.Group>
        </div>
        <div className={styles.right}>
          <Form.Item
            name={'lang'}
            label={'多语言'}
            style={{ marginTop: 16 }}
            initialValue={'zh-CN'}
          >
            <Checkbox.Group options={options} />
          </Form.Item>
          <Space style={{ marginTop: 16, textAlign: 'center' }} size={'large'}>
            <Button
              type="primary"
              onClick={() => {
                form
                  .validateFields()
                  .then((val) => {
                    const sortedResult: Record<string, string>[] = sortList(val.params)
                    setUrls(sortedResult.map((item) => item.url))
                  })
                  .catch(() => {})
              }}
            >
              Submit
            </Button>
            <Upload
              accept=".csv"
              showUploadList={false}
              customRequest={({ file }) => {
                papaparse.parse(file, {
                  complete: (results) => {
                    resetList(
                      results.data?.reduce((pre, next) => {
                        if (next?.[0]) {
                          pre.push({ url: next?.[0] })
                        }
                        return pre
                      }, [])
                    )
                  }
                })
              }}
            >
              <Button icon={<UploadOutlined />}>导入CSV</Button>
            </Upload>
          </Space>
          <GetEpicGameData
            urls={urls}
            onFinish={(data) => {
              setJsonData(data)
              set(false)
            }}
            onProgress={(e) => setProgress(e)}
            onStart={() => set(true)}
          />
          <Progress
            percentPosition={{ align: 'center', type: 'inner' }}
            style={{ marginTop: 20 }}
            percent={progress}
            status={loading ? 'active' : undefined}
            size={[Infinity, 20]}
          />
          <ReactJson
            style={{ marginTop: 16 }}
            src={jsonData}
            name={false}
            displayDataTypes={false}
            shouldCollapse={false}
          />
        </div>
      </Form>
    </div>
  )
}

export default Index
