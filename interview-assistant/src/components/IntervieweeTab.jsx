import React, { useState } from 'react'
import { Upload, Button, Card, Form, Input, message, Alert, Space, Typography, Divider } from 'antd'
import { UploadOutlined, PlayCircleOutlined, FileTextOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { extractResumeData, testResumeParsing } from '../utils/resumeParser'
import { addCandidate, updateCandidate, startInterview } from '../store/interviewSlice'
import ChatInterface from './ChatInterface'

const { Title, Text } = Typography
const { TextArea } = Input

const IntervieweeTab = () => {
  const dispatch = useDispatch()
  const { currentCandidate, candidates, currentSession } = useSelector(state => state.interview)
  const [resumeData, setResumeData] = useState(null)
  const [missingFields, setMissingFields] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [form] = Form.useForm()
  const [extractionResult, setExtractionResult] = useState(null)

  const candidate = candidates.find(c => c.id === currentCandidate)

  const handleResumeUpload = async (file) => {
    setIsUploading(true)
    setExtractionResult(null)
    
    try {
      console.log('Starting resume extraction for file:', file.name, file.type)
      const data = await extractResumeData(file)
      setResumeData(data)
      
      // Log what we found
      console.log('Resume extraction completed:', {
        foundName: !!data.name,
        foundEmail: !!data.email,
        foundPhone: !!data.phone,
        data: data
      })

      setExtractionResult({
        name: data.name,
        email: data.email,
        phone: data.phone,
        success: true
      })

      // Check for missing fields
      const missing = []
      if (!data.name || data.name.trim() === '') {
        missing.push('name')
        console.log('Name is missing')
      }
      if (!data.email || data.email.trim() === '') {
        missing.push('email')
        console.log('Email is missing')
      }
      if (!data.phone || data.phone.trim() === '') {
        missing.push('phone')
        console.log('Phone is missing')
      }
      
      setMissingFields(missing)
      console.log('Missing fields detected:', missing)
      
      // Pre-fill form with extracted data
      form.setFieldsValue({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
      })

      // If we found everything, auto-create candidate
      if (missing.length === 0 && data.name && data.email && data.phone) {
        const candidateData = {
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          resumeText: data.rawText
        }
        dispatch(addCandidate(candidateData))
        message.success(`Welcome ${data.name}! Resume processed successfully.`)
      } else if (missing.length > 0) {
        message.warning(`Resume uploaded! Found ${3 - missing.length}/3 fields. Please complete the missing information.`)
      } else {
        message.info('Resume uploaded. Please review your information.')
      }
      
    } catch (error) {
      console.error('Resume processing error:', error)
      setExtractionResult({
        success: false,
        error: error.message
      })
      message.error('Failed to process resume. Please try again or enter details manually.')
    }
    setIsUploading(false)
    return false // Prevent automatic upload
  }

  const handleFormSubmit = async (values) => {
    console.log('Form submitted with values:', values)
    
    // Use form data or fall back to extracted data
    const candidateData = {
      name: values.name?.trim() || resumeData?.name || '',
      email: values.email?.trim() || resumeData?.email || '',
      phone: values.phone?.trim() || resumeData?.phone || '',
      resumeText: resumeData?.rawText || ''
    }

    // Validate required fields
    if (!candidateData.name || !candidateData.email || !candidateData.phone) {
      message.error('Please fill in all required fields.')
      return
    }

    // Always add as new candidate when form is submitted
    dispatch(addCandidate(candidateData))
    setMissingFields([])
    setExtractionResult(null)
    message.success('Profile information saved! You can now start the interview.')
  }

  const startInterviewProcess = () => {
    if (!candidate) {
      message.error('No candidate data found. Please upload resume and save information first.')
      return
    }
    
    console.log('Starting interview for candidate:', candidate)
    dispatch(startInterview({ candidateId: candidate.id }))
    setShowChat(true)
  }

  const retryUpload = () => {
    setResumeData(null)
    setMissingFields([])
    setExtractionResult(null)
    form.resetFields()
  }

  // Test resume parsing (for debugging)
  const testParsing = () => {
    testResumeParsing()
  }

  if (currentSession || showChat) {
    return <ChatInterface />
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <Title level={2}>Candidate Interview</Title>
        
        {/* Debug button - remove in production */}
        <Button 
          type="dashed" 
          size="small" 
          onClick={testParsing}
          style={{ marginBottom: 16 }}
        >
          Test Resume Parser
        </Button>
        
        {!resumeData ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Title level={4}>Upload Your Resume</Title>
            <Text type="secondary">
              Upload your resume (PDF or DOCX) to automatically fill your information.
            </Text>
            
            <div style={{ marginTop: 24 }}>
              <Upload
                accept=".pdf,.docx"
                beforeUpload={handleResumeUpload}
                showUploadList={false}
              >
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<UploadOutlined />}
                  loading={isUploading}
                >
                  Upload Resume (PDF/DOCX)
                </Button>
              </Upload>
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">
                  <small>We'll extract your name, email, and phone number automatically</small>
                </Text>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Extraction Results */}
            {extractionResult && (
              <Alert 
                message={extractionResult.success ? "Resume Processed" : "Processing Failed"} 
                description={
                  extractionResult.success ? (
                    <div>
                      <Text>We found: </Text>
                      <ul>
                        <li><Text strong>Name:</Text> {extractionResult.name || 'Not found'}</li>
                        <li><Text strong>Email:</Text> {extractionResult.email || 'Not found'}</li>
                        <li><Text strong>Phone:</Text> {extractionResult.phone || 'Not found'}</li>
                      </ul>
                    </div>
                  ) : (
                    `Error: ${extractionResult.error}`
                  )
                }
                type={extractionResult.success ? 
                  (missingFields.length === 0 ? 'success' : 'warning') : 'error'
                }
                style={{ marginBottom: 24 }}
                action={
                  <Button size="small" onClick={retryUpload}>
                    Try Again
                  </Button>
                }
              />
            )}

            {/* Information Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFormSubmit}
              initialValues={{
                name: resumeData?.name || '',
                email: resumeData?.email || '',
                phone: resumeData?.phone || '',
              }}
            >
              <Form.Item
                label="Full Name"
                name="name"
                rules={[{ required: true, message: 'Please enter your full name' }]}
                validateStatus={missingFields.includes('name') ? 'warning' : ''}
                help={missingFields.includes('name') ? 'Name not found in resume' : ''}
              >
                <Input 
                  size="large" 
                  placeholder="Enter your full name" 
                  prefix={<FileTextOutlined />}
                />
              </Form.Item>
              
              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
                validateStatus={missingFields.includes('email') ? 'warning' : ''}
                help={missingFields.includes('email') ? 'Email not found in resume' : ''}
              >
                <Input 
                  size="large" 
                  placeholder="Enter your email address" 
                  prefix={<FileTextOutlined />}
                />
              </Form.Item>
              
              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[{ required: true, message: 'Please enter your phone number' }]}
                validateStatus={missingFields.includes('phone') ? 'warning' : ''}
                help={missingFields.includes('phone') ? 'Phone number not found in resume' : ''}
              >
                <Input 
                  size="large" 
                  placeholder="Enter your phone number" 
                  prefix={<FileTextOutlined />}
                />
              </Form.Item>
              
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" size="large">
                    Save Information & Continue
                  </Button>
                  <Button onClick={retryUpload}>
                    Upload Different Resume
                  </Button>
                </Space>
              </Form.Item>
            </Form>

            {/* Ready for Interview Section */}
            {candidate && missingFields.length === 0 && (
              <>
                <Divider />
                <div style={{ textAlign: 'center' }}>
                  <Alert 
                    message="Ready for Interview" 
                    description="All required information is complete. You can now start your interview."
                    type="success"
                    style={{ marginBottom: 24 }}
                  />
                  
                  <Space direction="vertical" size="large">
                    <div style={{ textAlign: 'left', display: 'inline-block' }}>
                      <Text strong>Name:</Text> {candidate.name}<br />
                      <Text strong>Email:</Text> {candidate.email}<br />
                      <Text strong>Phone:</Text> {candidate.phone}
                    </div>
                    
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<PlayCircleOutlined />}
                      onClick={startInterviewProcess}
                    >
                      Start Interview Now
                    </Button>
                    
                    <div>
                      <Text type="secondary">
                        The interview consists of 6 technical questions (2 Easy, 2 Medium, 2 Hard)
                      </Text>
                    </div>
                  </Space>
                </div>
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

export default IntervieweeTab