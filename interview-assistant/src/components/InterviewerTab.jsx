import React, { useState } from 'react'
import { Table, Card, Input, Space, Button, Modal, Typography, Tag, Collapse, List, Rate } from 'antd'
import { SearchOutlined, EyeOutlined, MessageOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'

const { Title, Text } = Typography
const { Search } = Input
const { Panel } = Collapse

const InterviewerTab = () => {
  const { candidates, currentSession } = useSelector(state => state.interview)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchText.toLowerCase())
  )

  // Get interview session data for a candidate
  const getCandidateInterviewData = (candidate) => {
    // In a real app, this would come from the database
    // For now, we'll simulate the interview data based on the candidate's info
    if (!candidate.chatHistory || candidate.chatHistory.length === 0) {
      // Create mock interview data for demonstration
      return [
        {
          question: "What is React and what problem does it solve?",
          answer: "React is a JavaScript library for building user interfaces, particularly web applications. It solves the problem of efficiently updating and rendering large datasets by using a virtual DOM.",
          score: 85,
          difficulty: "easy",
          timeSpent: "45s"
        },
        {
          question: "Explain the concept of virtual DOM in React.",
          answer: "The virtual DOM is a programming concept where an ideal representation of the UI is kept in memory and synced with the real DOM by a library such as ReactDOM.",
          score: 92,
          difficulty: "easy",
          timeSpent: "30s"
        },
        {
          question: "How would you optimize the performance of a React application?",
          answer: "I would use techniques like code splitting, memoization with React.memo and useMemo, lazy loading components, and optimizing bundle size.",
          score: 78,
          difficulty: "medium",
          timeSpent: "90s"
        },
        {
          question: "What are React hooks and when would you use them?",
          answer: "React hooks are functions that let you use state and other React features in functional components. I would use them for state management, side effects, and context.",
          score: 88,
          difficulty: "medium",
          timeSpent: "75s"
        },
        {
          question: "Explain the React fiber architecture and how it improves rendering.",
          answer: "Fiber is React's new reconciliation algorithm. It enables incremental rendering and better prioritization of updates, making the UI more responsive.",
          score: 72,
          difficulty: "hard",
          timeSpent: "150s"
        },
        {
          question: "How would you design a scalable microservices architecture?",
          answer: "I would design it with clear service boundaries, API gateways, service discovery, circuit breakers, and proper monitoring and logging.",
          score: 68,
          difficulty: "hard",
          timeSpent: "180s"
        }
      ]
    }
    return candidate.chatHistory
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'green'
      case 'medium': return 'orange'
      case 'hard': return 'red'
      default: return 'blue'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return '#52c41a'
    if (score >= 80) return '#73d13d'
    if (score >= 70) return '#faad14'
    if (score >= 60) return '#ff7a45'
    return '#ff4d4f'
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name?.localeCompare(b.name),
      render: (name) => name || 'N/A'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : status === 'in-progress' ? 'blue' : 'orange'}>
          {status ? status.toUpperCase() : 'PENDING'}
        </Tag>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      sorter: (a, b) => (a.score || 0) - (b.score || 0),
      render: (score) => score ? (
        <Tag color={getScoreColor(score)}>
          {score}/100
        </Tag>
      ) : 'N/A',
    },
    {
      title: 'Interview Date',
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Not completed',
      sorter: (a, b) => new Date(a.completedAt || a.createdAt) - new Date(b.completedAt || b.createdAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          icon={<EyeOutlined />} 
          onClick={() => showCandidateDetails(record)}
          type="primary"
          ghost
        >
          View Details
        </Button>
      ),
    },
  ]

  const showCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate)
    setIsModalVisible(true)
  }

  const handleModalClose = () => {
    setIsModalVisible(false)
    setSelectedCandidate(null)
  }

  const interviewData = selectedCandidate ? getCandidateInterviewData(selectedCandidate) : []

  const averageScore = interviewData.length > 0 
    ? Math.round(interviewData.reduce((sum, item) => sum + item.score, 0) / interviewData.length)
    : 0

  return (
    <div>
      <Card>
        <Title level={2}>Candidate Dashboard</Title>
        
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Search
            placeholder="Search candidates by name or email"
            allowClear
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
            prefix={<SearchOutlined />}
          />
          
          <Table 
            columns={columns} 
            dataSource={filteredCandidates.map(candidate => ({ ...candidate, key: candidate.id }))}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} candidates`
            }}
            scroll={{ x: 800 }}
          />
        </Space>
      </Card>

      <Modal
        title={
          <Space>
            <MessageOutlined />
            Interview Details for {selectedCandidate?.name}
          </Space>
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>
        ]}
        width={900}
        style={{ top: 20 }}
      >
        {selectedCandidate && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* Candidate Information */}
            <Card size="small" title="Candidate Information">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <div>
                    <Text strong>Name: </Text>{selectedCandidate.name || 'N/A'}
                  </div>
                  <div>
                    <Text strong>Email: </Text>{selectedCandidate.email || 'N/A'}
                  </div>
                  <div>
                    <Text strong>Phone: </Text>{selectedCandidate.phone || 'N/A'}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <div>
                    <Text strong>Status: </Text>
                    <Tag color={selectedCandidate.status === 'completed' ? 'green' : 'orange'}>
                      {selectedCandidate.status ? selectedCandidate.status.toUpperCase() : 'PENDING'}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Final Score: </Text>
                    <Tag color={getScoreColor(selectedCandidate.score)}>
                      {selectedCandidate.score || 0}/100
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Average Score: </Text>
                    <Tag color={getScoreColor(averageScore)}>
                      {averageScore}/100
                    </Tag>
                  </div>
                </div>
              </Space>
            </Card>

            {/* AI Summary */}
            {selectedCandidate.summary && (
              <Card size="small" title="AI Assessment Summary">
                <Text>{selectedCandidate.summary}</Text>
              </Card>
            )}

            {/* Interview Q&A */}
            <Card 
              size="small" 
              title={`Interview Questions & Answers (${interviewData.length} questions)`}
            >
              <Collapse accordion>
                {interviewData.map((item, index) => (
                  <Panel 
                    key={index}
                    header={
                      <Space>
                        <Text strong>Q{index + 1}:</Text>
                        <Text ellipsis={{ tooltip: item.question }} style={{ maxWidth: 400 }}>
                          {item.question}
                        </Text>
                        <Tag color={getDifficultyColor(item.difficulty)}>
                          {item.difficulty?.toUpperCase() || 'UNKNOWN'}
                        </Tag>
                        <Rate 
                          disabled 
                          value={Math.round(item.score / 20)} 
                          style={{ fontSize: 14 }} 
                        />
                        <Tag color={getScoreColor(item.score)}>
                          {item.score}/100
                        </Tag>
                      </Space>
                    }
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                      <div>
                        <Text strong>Question: </Text>
                        <Text>{item.question}</Text>
                      </div>
                      <div>
                        <Text strong>Candidate's Answer: </Text>
                        <Text style={{ 
                          backgroundColor: '#f0f0f0', 
                          padding: '8px', 
                          borderRadius: '4px',
                          display: 'block',
                          marginTop: '4px'
                        }}>
                          {item.answer}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <div>
                          <Text strong>Score: </Text>
                          <ProgressScore score={item.score} />
                        </div>
                        <div>
                          <Text strong>Difficulty: </Text>
                          <Tag color={getDifficultyColor(item.difficulty)}>
                            {item.difficulty?.toUpperCase() || 'UNKNOWN'}
                          </Tag>
                        </div>
                        {item.timeSpent && (
                          <div>
                            <Text strong>Time Spent: </Text>
                            <Text>{item.timeSpent}</Text>
                          </div>
                        )}
                      </div>
                      {item.feedback && (
                        <div>
                          <Text strong>AI Feedback: </Text>
                          <Text type="secondary" style={{ fontStyle: 'italic' }}>
                            {item.feedback}
                          </Text>
                        </div>
                      )}
                    </Space>
                  </Panel>
                ))}
              </Collapse>

              {/* Score Summary */}
              {interviewData.length > 0 && (
                <div style={{ marginTop: 16, padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  <Title level={5}>Performance Summary</Title>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Easy Questions Average:</Text>
                      <Text strong>
                        {Math.round(interviewData.filter(q => q.difficulty === 'easy').reduce((sum, q) => sum + q.score, 0) / interviewData.filter(q => q.difficulty === 'easy').length || 0)}/100
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Medium Questions Average:</Text>
                      <Text strong>
                        {Math.round(interviewData.filter(q => q.difficulty === 'medium').reduce((sum, q) => sum + q.score, 0) / interviewData.filter(q => q.difficulty === 'medium').length || 0)}/100
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Hard Questions Average:</Text>
                      <Text strong>
                        {Math.round(interviewData.filter(q => q.difficulty === 'hard').reduce((sum, q) => sum + q.score, 0) / interviewData.filter(q => q.difficulty === 'hard').length || 0)}/100
                      </Text>
                    </div>
                  </Space>
                </div>
              )}
            </Card>
          </Space>
        )}
      </Modal>
    </div>
  )
}

// Progress score component
const ProgressScore = ({ score }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ 
        width: 100, 
        height: 8, 
        backgroundColor: '#f0f0f0', 
        borderRadius: 4,
        overflow: 'hidden'
      }}>
        <div 
          style={{ 
            width: `${score}%`, 
            height: '100%', 
            backgroundColor: score >= 90 ? '#52c41a' : 
                           score >= 80 ? '#73d13d' : 
                           score >= 70 ? '#faad14' : 
                           score >= 60 ? '#ff7a45' : '#ff4d4f',
            transition: 'all 0.3s'
          }} 
        />
      </div>
      <Text strong style={{ 
        color: score >= 90 ? '#52c41a' : 
               score >= 80 ? '#73d13d' : 
               score >= 70 ? '#faad14' : 
               score >= 60 ? '#ff7a45' : '#ff4d4f',
        minWidth: 40
      }}>
        {score}/100
      </Text>
    </div>
  )
}

export default InterviewerTab