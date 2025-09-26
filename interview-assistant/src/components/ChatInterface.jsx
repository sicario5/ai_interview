import React, { useState, useEffect, useRef } from 'react'
import { Card, Input, Button, Space, Typography, Alert, Progress, Modal } from 'antd'
import { SendOutlined, PauseCircleOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { addQuestion, addAnswer, setTimer, pauseInterview, completeInterview } from '../store/interviewSlice'

const { TextArea } = Input
const { Title, Text } = Typography

const ChatInterface = () => {
  const dispatch = useDispatch()
  const { currentSession, candidates } = useSelector(state => state.interview)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messagesEndRef = useRef(null)
  
  const candidate = candidates.find(c => c.id === currentSession?.candidateId)
  const currentQuestion = currentSession?.questions[currentSession.currentQuestionIndex]

  useEffect(() => {
    if (currentSession && currentSession.questions.length === 0) {
      generateNextQuestion()
    }
  }, [currentSession])

  useEffect(() => {
    if (currentQuestion && !currentSession.isPaused) {
      startTimer()
    }
  }, [currentQuestion, currentSession?.isPaused])

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.questions, currentSession?.answers])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const startTimer = () => {
    if (!currentQuestion) return

    const timeLimits = { easy: 20, medium: 60, hard: 120 }
    const timeLimit = timeLimits[currentQuestion.difficulty] * 1000
    setTimeLeft(timeLimit)

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          clearInterval(timer)
          handleTimeUp()
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    dispatch(setTimer(timer))
  }

  const handleTimeUp = () => {
    if (currentAnswer.trim()) {
      handleSubmitAnswer()
    } else {
      handleSubmitAnswer('No answer provided within time limit.')
    }
  }

  const generateNextQuestion = async () => {
    const difficultyLevels = ['easy', 'easy', 'medium', 'medium', 'hard', 'hard']
    const nextIndex = currentSession?.questions.length || 0
    
    if (nextIndex >= 6) {
      completeInterviewProcess()
      return
    }

    const difficulty = difficultyLevels[nextIndex]
    const question = await generateAIQuestion(difficulty, 'fullstack')
    
    dispatch(addQuestion({
      ...question,
      index: nextIndex,
      timestamp: new Date().toISOString()
    }))
  }

  const handleSubmitAnswer = async (answerText = null) => {
    const answer = answerText || currentAnswer.trim()
    if (!answer && !answerText) return

    setIsSubmitting(true)
    
    const evaluation = await evaluateAIAnswer(
      currentQuestion.question,
      answer,
      currentQuestion.difficulty
    )

    dispatch(addAnswer({
      questionId: currentQuestion.id,
      answer: answer,
      timestamp: new Date().toISOString(),
      score: evaluation.score,
      feedback: evaluation.feedback
    }))

    setCurrentAnswer('')
    setIsSubmitting(false)

    setTimeout(() => {
      generateNextQuestion()
    }, 1000)
  }

  const completeInterviewProcess = async () => {
    const allAnswers = currentSession.answers
    const totalScore = allAnswers.reduce((sum, answer) => sum + answer.score, 0) / allAnswers.length
    
    const summary = await generateAISummary(candidate, allAnswers)
    
    dispatch(completeInterview({
      candidateId: candidate.id,
      score: Math.round(totalScore),
      summary
    }))

    Modal.success({
      title: 'Interview Completed!',
      content: `Your interview has been completed. Final score: ${Math.round(totalScore)}/100`,
    })
  }

  const handlePause = () => {
    dispatch(pauseInterview())
    Modal.info({
      title: 'Interview Paused',
      content: 'Your interview has been paused. You can resume later.',
    })
  }

  const formatTime = (milliseconds) => {
    const seconds = Math.ceil(milliseconds / 1000)
    return `${seconds}s`
  }

  const getProgress = () => {
    const totalQuestions = 6
    const answered = currentSession?.answers.length || 0
    return (answered / totalQuestions) * 100
  }

  const chatHistory = []
  currentSession?.questions.forEach((question, index) => {
    chatHistory.push({
      type: 'question',
      content: question.question,
      timestamp: question.timestamp,
      difficulty: question.difficulty
    })

    if (currentSession.answers[index]) {
      chatHistory.push({
        type: 'answer',
        content: currentSession.answers[index].answer,
        timestamp: currentSession.answers[index].timestamp,
        score: currentSession.answers[index].score
      })
    }
  })

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3}>Interview in Progress</Title>
            <Button icon={<PauseCircleOutlined />} onClick={handlePause}>
              Pause Interview
            </Button>
          </div>
          
          <Progress percent={getProgress()} status="active" />
          
          <div style={{ height: 400, overflowY: 'auto', border: '1px solid #d9d9d9', borderRadius: 8, padding: 16 }}>
            {chatHistory.map((message, index) => (
              <div key={index} style={{ marginBottom: 16 }}>
                <div style={{ 
                  padding: 12, 
                  borderRadius: 8, 
                  backgroundColor: message.type === 'question' ? '#f0f2f5' : '#e6f7ff',
                  marginLeft: message.type === 'answer' ? 40 : 0
                }}>
                  <Text strong>{message.type === 'question' ? 'AI Interviewer' : 'You'}:</Text>
                  <div>{message.content}</div>
                  {message.score && (
                    <Text type="secondary">Score: {message.score}/100</Text>
                  )}
                </div>
              </div>
            ))}
            
            {currentQuestion && !currentSession.answers[currentSession.currentQuestionIndex] && (
              <div style={{ padding: 12, borderRadius: 8, backgroundColor: '#f0f2f5' }}>
                <Text strong>AI Interviewer:</Text>
                <div>{currentQuestion.question}</div>
                <Alert 
                  message={`Time left: ${formatTime(timeLeft)} (${currentQuestion.difficulty} question)`}
                  type="info" 
                  style={{ marginTop: 8 }}
                />
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {currentQuestion && !currentSession.answers[currentSession.currentQuestionIndex] && (
            <Space.Compact style={{ width: '100%' }}>
              <TextArea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={3}
                disabled={isSubmitting}
              />
              <Button 
                type="primary" 
                icon={<SendOutlined />}
                onClick={() => handleSubmitAnswer()}
                loading={isSubmitting}
                style={{ height: 'auto' }}
              >
                Submit
              </Button>
            </Space.Compact>
          )}
        </Space>
      </Card>
    </div>
  )
}

// Mock AI service functions
const generateAIQuestion = async (difficulty, role) => {
  const questions = {
    easy: [
      "What is React and what problem does it solve?",
      "Explain the concept of virtual DOM in React.",
      "What are the main features of Node.js?",
      "What is the difference between let, const, and var in JavaScript?"
    ],
    medium: [
      "How would you optimize the performance of a React application?",
      "Explain the difference between client-side and server-side rendering.",
      "What are React hooks and when would you use them?",
      "How do you handle authentication in a Node.js application?"
    ],
    hard: [
      "Explain the React fiber architecture and how it improves rendering.",
      "How would you design a scalable microservices architecture?",
      "What are the security best practices for a full-stack application?",
      "How do you implement real-time features using WebSockets?"
    ]
  }

  const difficultyQuestions = questions[difficulty] || questions.easy
  const randomQuestion = difficultyQuestions[Math.floor(Math.random() * difficultyQuestions.length)]

  return {
    id: Math.random().toString(36).substr(2, 9),
    question: randomQuestion,
    difficulty,
    role
  }
}

const evaluateAIAnswer = async (question, answer, difficulty) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const baseScore = { easy: 80, medium: 70, hard: 60 }[difficulty] || 70
  const variation = Math.random() * 20 - 10
  const score = Math.max(0, Math.min(100, baseScore + variation))
  
  return {
    score: Math.round(score),
    feedback: "Good answer! You demonstrated understanding of the concept."
  }
}

const generateAISummary = async (candidate, answers) => {
  const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0) / answers.length
  
  return `Candidate ${candidate.name} demonstrated ${totalScore >= 70 ? 'strong' : 'adequate'} knowledge in full-stack development. ${totalScore >= 70 ? 'Recommended for next round.' : 'Needs improvement in some areas.'}`
}

export default ChatInterface