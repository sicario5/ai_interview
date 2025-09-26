import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const initialState = {
  candidates: [],
  currentCandidate: null,
  currentSession: null,
  activeTab: 'interviewee',
}

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload
    },
    
    addCandidate: (state, action) => {
      const newCandidate = {
        id: uuidv4(),
        ...action.payload,
        createdAt: new Date().toISOString(),
        status: 'pending',
        score: 0,
        summary: '',
        chatHistory: [],
      }
      state.candidates.push(newCandidate)
      state.currentCandidate = newCandidate.id
    },
    
    updateCandidate: (state, action) => {
      const { id, updates } = action.payload
      const candidateIndex = state.candidates.findIndex(c => c.id === id)
      if (candidateIndex !== -1) {
        state.candidates[candidateIndex] = {
          ...state.candidates[candidateIndex],
          ...updates,
        }
      }
    },
    
    startInterview: (state, action) => {
      const { candidateId } = action.payload
      state.currentSession = {
        candidateId,
        currentQuestionIndex: 0,
        startTime: new Date().toISOString(),
        isPaused: false,
        questions: [],
        answers: [],
        timer: null,
      }
      
      // Update candidate status
      const candidateIndex = state.candidates.findIndex(c => c.id === candidateId)
      if (candidateIndex !== -1) {
        state.candidates[candidateIndex].status = 'in-progress'
      }
    },
    
    addQuestion: (state, action) => {
      if (state.currentSession) {
        state.currentSession.questions.push(action.payload)
      }
    },
    
    addAnswer: (state, action) => {
      if (state.currentSession) {
        state.currentSession.answers.push(action.payload)
        state.currentSession.currentQuestionIndex += 1
        
        // Add to candidate's chat history
        const candidateIndex = state.candidates.findIndex(c => c.id === state.currentSession.candidateId)
        if (candidateIndex !== -1) {
          const currentQuestion = state.currentSession.questions[state.currentSession.questions.length - 1]
          state.candidates[candidateIndex].chatHistory.push({
            question: currentQuestion.question,
            answer: action.payload.answer,
            score: action.payload.score,
            difficulty: currentQuestion.difficulty,
            feedback: action.payload.feedback,
            timestamp: action.payload.timestamp
          })
        }
      }
    },
    
    setTimer: (state, action) => {
      if (state.currentSession) {
        state.currentSession.timer = action.payload
      }
    },
    
    pauseInterview: (state) => {
      if (state.currentSession) {
        state.currentSession.isPaused = true
      }
    },
    
    resumeInterview: (state) => {
      if (state.currentSession) {
        state.currentSession.isPaused = false
      }
    },
    
    completeInterview: (state, action) => {
      const { candidateId, score, summary } = action.payload
      const candidateIndex = state.candidates.findIndex(c => c.id === candidateId)
      if (candidateIndex !== -1) {
        state.candidates[candidateIndex].status = 'completed'
        state.candidates[candidateIndex].score = score
        state.candidates[candidateIndex].summary = summary
        state.candidates[candidateIndex].completedAt = new Date().toISOString()
      }
      state.currentSession = null
    },
    
    resetCurrentSession: (state) => {
      state.currentSession = null
    },
  },
})

export const {
  setActiveTab,
  addCandidate,
  updateCandidate,
  startInterview,
  addQuestion,
  addAnswer,
  setTimer,
  pauseInterview,
  resumeInterview,
  completeInterview,
  resetCurrentSession,
} = interviewSlice.actions

export default interviewSlice.reducer