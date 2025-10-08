import { ConfigProvider } from 'antd'
import MysiteRouter from './components/router'

function App() {

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#10b981',

          colorBgLayout: '#fcfcfe'

          // colorBgContainer: '#122447ff',
          // colorBgBase: '#122447ff'
        }
      }}
    >
      <MysiteRouter/>
    </ConfigProvider>
  )
}

export default App
