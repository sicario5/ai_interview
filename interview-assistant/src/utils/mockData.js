// src/utils/mockData.js
export const mockCandidates = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    status: 'completed',
    score: 82,
    summary: 'John demonstrated strong knowledge in React fundamentals and good problem-solving skills. Shows potential for intermediate full-stack roles.',
    createdAt: '2024-01-15T10:30:00Z',
    completedAt: '2024-01-15T11:15:00Z',
    chatHistory: [
      {
        question: "What is React and what problem does it solve?",
        answer: "React is a JavaScript library for building user interfaces, particularly web applications. It solves the problem of efficiently updating and rendering large datasets by using a virtual DOM.",
        score: 85,
        difficulty: "easy",
        feedback: "Excellent understanding of React's core purpose.",
        timestamp: "2024-01-15T10:35:00Z"
      },
      {
        question: "Explain the concept of virtual DOM in React.",
        answer: "The virtual DOM is a programming concept where an ideal representation of the UI is kept in memory and synced with the real DOM by a library such as ReactDOM.",
        score: 92,
        difficulty: "easy",
        feedback: "Very clear and concise explanation.",
        timestamp: "2024-01-15T10:40:00Z"
      },
      {
        question: "How would you optimize the performance of a React application?",
        answer: "I would use techniques like code splitting, memoization with React.memo and useMemo, lazy loading components, and optimizing bundle size.",
        score: 78,
        difficulty: "medium",
        feedback: "Good awareness of optimization techniques.",
        timestamp: "2024-01-15T10:50:00Z"
      },
      {
        question: "What are React hooks and when would you use them?",
        answer: "React hooks are functions that let you use state and other React features in functional components. I would use them for state management, side effects, and context.",
        score: 88,
        difficulty: "medium",
        feedback: "Solid understanding of hooks and their practical applications.",
        timestamp: "2024-01-15T11:00:00Z"
      },
      {
        question: "Explain the React fiber architecture and how it improves rendering.",
        answer: "Fiber is React's new reconciliation algorithm. It enables incremental rendering and better prioritization of updates, making the UI more responsive.",
        score: 72,
        difficulty: "hard",
        feedback: "Basic understanding but could benefit from deeper knowledge.",
        timestamp: "2024-01-15T11:08:00Z"
      },
      {
        question: "How would you design a scalable microservices architecture?",
        answer: "I would design it with clear service boundaries, API gateways, service discovery, circuit breakers, and proper monitoring and logging.",
        score: 68,
        difficulty: "hard",
        feedback: "Understands the concepts but lacks practical implementation details.",
        timestamp: "2024-01-15T11:15:00Z"
      }
    ]
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@techcompany.com',
    phone: '+1 (555) 987-6543',
    status: 'completed',
    score: 91,
    summary: 'Sarah shows exceptional knowledge across all areas. Strong candidate for senior full-stack developer position.',
    createdAt: '2024-01-16T09:00:00Z',
    completedAt: '2024-01-16T09:45:00Z',
    chatHistory: [
      {
        question: "What is React and what problem does it solve?",
        answer: "React addresses the challenge of building complex, interactive UIs by providing a component-based architecture with efficient re-rendering through the virtual DOM.",
        score: 95,
        difficulty: "easy",
        feedback: "Exceptional answer showing deep understanding.",
        timestamp: "2024-01-16T09:05:00Z"
      },
      {
        question: "Explain the concept of virtual DOM in React.",
        answer: "Virtual DOM is a lightweight copy of the real DOM. React uses it to perform diffing algorithms that minimize direct DOM manipulation, leading to better performance.",
        score: 94,
        difficulty: "easy",
        feedback: "Comprehensive explanation with technical depth.",
        timestamp: "2024-01-16T09:10:00Z"
      },
      // ... more questions for Sarah
    ]
  }
]

// Function to initialize mock data
export const initializeMockData = (dispatch, addCandidate, updateCandidate) => {
  mockCandidates.forEach(candidate => {
    dispatch(addCandidate(candidate))
  })
}