AI-Powered Interview Assistant
A comprehensive React application that automates technical interviews for full-stack developer positions. This application provides an AI-powered interview experience with resume parsing, automated questioning, and candidate evaluation.

For Candidates (Interviewee Tab)
Upload Resume: Click "Upload Resume" and select your PDF or DOCX file

Complete Information: Review and complete any missing fields

Start Interview: Click "Start Interview" to begin the AI-powered interview

Answer Questions: Respond to 6 technical questions (2 Easy, 2 Medium, 2 Hard)

Review Results: Receive immediate feedback and final score

For Interviewers (Interviewer Tab)
View Dashboard: See all candidates with their scores and status

Search Candidates: Use the search bar to find specific candidates

View Details: Click "View Details" to see complete interview history

Analyze Performance: Review AI-generated scores and feedback

Resume Processing
Supported Formats: PDF, DOCX

Data Extraction: Name, Email, Phone Number

Smart Parsing: Multiple extraction strategies with fallbacks

Error Handling: Graceful degradation with manual input options

Interview Flow
Question Types: 6 questions (Easy ×2, Medium ×2, Hard ×2)

Time Limits: Easy (20s), Medium (60s), Hard (120s)

Auto-submission: Automatic progression when time expires

Real-time Scoring: Immediate feedback after each answer

Data Persistence
Local Storage: All data persists across browser sessions

Session Recovery: "Welcome Back" modal for interrupted interviews

State Management: Redux with persistence for reliable data handling