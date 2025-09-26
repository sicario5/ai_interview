import React from 'react'
import { Modal, Button, Typography } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { resumeInterview } from '../store/interviewSlice'

const { Title, Text } = Typography

const WelcomeBackModal = () => {
  const dispatch = useDispatch()
  const { currentSession, candidates } = useSelector(state => state.interview)
  
  const candidate = candidates.find(c => c.id === currentSession?.candidateId)
  const isModalVisible = currentSession?.isPaused

  const handleResume = () => {
    dispatch(resumeInterview())
  }

  const handleRestart = () => {
    // For now, just resume. In a real app, you might want different logic
    dispatch(resumeInterview())
  }

  if (!isModalVisible) return null

  return (
    <Modal
      title="Welcome Back!"
      open={isModalVisible}
      footer={[
        <Button key="restart" onClick={handleRestart}>
          Start New Interview
        </Button>,
        <Button key="resume" type="primary" onClick={handleResume}>
          Resume Interview
        </Button>,
      ]}
    >
      <div style={{ textAlign: 'center' }}>
        <Title level={4}>Hi {candidate?.name}!</Title>
        <Text>
          You have an interview in progress. You've completed {
            currentSession?.answers.length || 0
          } out of 6 questions.
        </Text>
        <br />
        <Text>Would you like to resume where you left off?</Text>
      </div>
    </Modal>
  )
}

export default WelcomeBackModal