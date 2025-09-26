import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import interviewReducer from './interviewSlice'
import { mockCandidates } from '../utils/mockData'

const persistConfig = {
  key: 'interview-assistant',
  storage,
  version: 1,
}

const persistedReducer = persistReducer(persistConfig, interviewReducer)

export const store = configureStore({
  reducer: {
    interview: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

// Add mock data if no candidates exist (for testing)
const initializeStore = () => {
  const state = store.getState()
  if (state.interview.candidates.length === 0) {
    // Store will be populated with actual data during usage
    console.log('No candidates found. The app is ready for new interviews.')
  }
}

// Initialize after store is created
setTimeout(initializeStore, 100)

export const persistor = persistStore(store)