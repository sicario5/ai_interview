import pdfParse from 'pdf-parse/lib/pdf-parse'

export const extractResumeData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result
        let text = ''

        if (file.type === 'application/pdf') {
          try {
            const pdfData = new Uint8Array(arrayBuffer)
            const result = await pdfParse(pdfData)
            text = result.text
            console.log('Raw PDF text:', text)
          } catch (pdfError) {
            console.error('PDF parsing error:', pdfError)
            text = 'PDF content extraction failed. Please enter details manually.'
          }
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          text = 'DOCX file uploaded. Please enter your details below.'
        } else {
          throw new Error('Unsupported file type. Please upload PDF or DOCX.')
        }

        const extractedData = parseResumeText(text)
        console.log('Extracted data:', extractedData)
        resolve(extractedData)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('File reading failed'))
    reader.readAsArrayBuffer(file)
  })
}

const parseResumeText = (text) => {
  // Clean up the text - remove extra spaces, normalize line breaks
  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n+/g, '\n')
    .replace(/\s+/g, ' ')
    .trim()

  console.log('Cleaned text:', cleanText)

  const data = {
    name: extractName(cleanText),
    email: extractEmail(cleanText),
    phone: extractPhone(cleanText),
    rawText: cleanText
  }

  // If we found data, log it
  if (data.name || data.email || data.phone) {
    console.log('Successfully extracted:', {
      name: data.name,
      email: data.email,
      phone: data.phone
    })
  } else {
    console.log('No data extracted from resume')
  }

  return data
}

const extractName = (text) => {
  // Multiple strategies to extract name
  
  // Strategy 1: Look for typical name patterns at the beginning
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  // Check first few lines for name-like patterns
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i]
    
    // Pattern: First Last or First Middle Last (2-4 words, capitalized)
    const namePattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/
    const match = line.match(namePattern)
    if (match && match[1].length > 4) {
      console.log('Found name via pattern match:', match[1])
      return match[1]
    }
    
    // Pattern: Typical resume header format
    if (line.toUpperCase() === line && line.split(' ').length >= 2 && line.split(' ').length <= 4) {
      // Convert to proper case
      const properCase = line.split(' ').map(word => 
        word.charAt(0) + word.slice(1).toLowerCase()
      ).join(' ')
      console.log('Found name via uppercase header:', properCase)
      return properCase
    }
  }

  // Strategy 2: Look for common name indicators
  const nameIndicators = [
    /(?:^|\n)([A-Z][a-z]+ [A-Z][a-z]+)(?:\n|$)/,
    /Resume[:\s-]*([A-Z][a-z]+ [A-Z][a-z]+)/i,
    /CV[:\s-]*([A-Z][a-z]+ [A-Z][a-z]+)/i,
    /^([A-Z][a-z]+ [A-Z][a-z]+)/m
  ]

  for (const pattern of nameIndicators) {
    const match = text.match(pattern)
    if (match && match[1]) {
      console.log('Found name via indicator:', match[1])
      return match[1]
    }
  }

  // Strategy 3: Look for email and extract name from it
  const email = extractEmail(text)
  if (email) {
    const nameFromEmail = email.split('@')[0]
    // Convert john.doe -> John Doe
    const formattedName = nameFromEmail
      .split(/[._]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')
    
    if (formattedName.length > 3) {
      console.log('Extracted name from email:', formattedName)
      return formattedName
    }
  }

  console.log('No name found in resume')
  return null
}

const extractEmail = (text) => {
  // More comprehensive email regex
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const emails = text.match(emailRegex)
  
  if (emails && emails.length > 0) {
    // Prefer professional-looking emails
    const professionalEmail = emails.find(email => 
      !email.includes('example') && 
      !email.includes('test') &&
      email.includes('.')
    )
    
    const foundEmail = professionalEmail || emails[0]
    console.log('Found email:', foundEmail)
    return foundEmail
  }
  
  console.log('No email found in resume')
  return null
}

const extractPhone = (text) => {
  // Comprehensive phone number patterns
  const phonePatterns = [
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, // International format
    /\(\d{3}\)\s?\d{3}[-.\s]?\d{4}/g, // (123) 456-7890
    /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g, // 123-456-7890
    /\d{10}/g // 1234567890
  ]

  for (const pattern of phonePatterns) {
    const phones = text.match(pattern)
    if (phones && phones.length > 0) {
      // Clean up the phone number
      let phone = phones[0]
      phone = phone.replace(/\D/g, '') // Remove non-digits
      
      // Format as (123) 456-7890 if it's 10 digits
      if (phone.length === 10) {
        phone = `(${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6)}`
      }
      
      console.log('Found phone:', phone)
      return phone
    }
  }

  // Look for phone indicators
  const phoneIndicators = [
    /Phone[:\s]+([^\n]+)/i,
    /Tel[:\s]+([^\n]+)/i,
    /Mobile[:\s]+([^\n]+)/i,
    /Contact[:\s]+([^\n]+)/i
  ]

  for (const pattern of phoneIndicators) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const phone = match[1].trim()
      console.log('Found phone via indicator:', phone)
      return phone
    }
  }

  console.log('No phone found in resume')
  return null
}

// Test function to simulate resume parsing
export const testResumeParsing = () => {
  const testResumes = [
    `John Doe
     Software Developer
     john.doe@email.com
     (123) 456-7890
     
     EXPERIENCE
     Senior Developer at Tech Company`,

    `RESUME
     Sarah Johnson
     sarah.j@company.com
     Phone: 555-987-6543
     
     EDUCATION
     MIT Computer Science`,

    `MICHAEL SMITH
     michael.smith@tech.org
     +1-555-123-4567
     
     SKILLS
     JavaScript, React, Node.js`
  ]

  testResumes.forEach((resume, index) => {
    console.log(`\n=== Testing Resume ${index + 1} ===`)
    const result = parseResumeText(resume)
    console.log('Result:', result)
  })
}