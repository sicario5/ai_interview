import React, { useEffect } from 'react'
import { Tabs, Layout } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import IntervieweeTab from '../components/IntervieweeTab'
import InterviewerTab from '../components/InterviewerTab'
import WelcomeBackModal from '../components/WelcomeBackModal'
import { setActiveTab } from '../store/interviewSlice'

const { Header, Content } = Layout
const { TabPane } = Tabs

const InterviewAssistant = () => {
  const dispatch = useDispatch()
  const { activeTab, currentSession } = useSelector(state => state.interview)

  useEffect(() => {
    // Check for existing session on component mount
    if (currentSession && currentSession.isPaused) {
      // Show welcome back modal will be handled by WelcomeBackModal component
    }
  }, [])

  const handleTabChange = (key) => {
    dispatch(setActiveTab(key))
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, color: '#1890ff' }}>
          AI-Powered Interview Assistant
        </h1>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          type="card"
          size="large"
        >
          <TabPane tab="Interviewee" key="interviewee">
            <IntervieweeTab />
          </TabPane>
          <TabPane tab="Interviewer" key="interviewer">
            <InterviewerTab />
          </TabPane>
        </Tabs>
        
        <WelcomeBackModal />
      </Content>
    </Layout>
  )
}

export default InterviewAssistant