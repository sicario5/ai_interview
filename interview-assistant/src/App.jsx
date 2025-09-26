import React from 'react'
import { ConfigProvider } from 'antd'
import InterviewAssistant from './pages/InterviewAssistant'
import './App.css'

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <div className="App">
        <InterviewAssistant />
      </div>
    </ConfigProvider>
  )
}

export default App