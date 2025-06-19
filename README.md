# Job Application Automation Tool

An intelligent tool that automates job applications using OCR, LLMs, and email automation. It screenshots job application pages, extracts questions using OCR, tailors your resume and cover letter using AI, and emails you the complete application package.

## Features

- **Job Management**: Add and track multiple job applications
- **Screenshot Capture**: Automatically captures job application pages
- **OCR Processing**: Extracts text from job pages using Tesseract (free) or Google Vision API
- **AI-Powered Tailoring**: Uses free LLM APIs to customize resumes and cover letters
- **Question Answering**: Automatically answers common application questions
- **Email Automation**: Sends complete application packages via email
- **Dark/Light Theme**: Modern, responsive interface

## Free APIs Used

### LLM Providers (Choose one):
- **Groq** (Recommended): Fast inference with Llama models - Get API key at [console.groq.com](https://console.groq.com)
- **Together AI**: Free tier available - Get API key at [api.together.xyz](https://api.together.xyz)
- **Hugging Face**: Free inference API - Get API key at [huggingface.co](https://huggingface.co/settings/tokens)

### OCR Providers (Choose one):
- **Tesseract** (Default): Completely free, runs locally
- **Google Cloud Vision**: Free tier (1000 requests/month) - Get API key at [Google Cloud Console](https://console.cloud.google.com/)

### Email:
- **Gmail SMTP**: Free with app passwords
- **Outlook SMTP**: Free with app passwords

## Setup Instructions

### 1. Clone and Install
```bash
git clone <repository-url>
cd job-automation-tool
npm install
```

### 2. Get Your API Keys

#### For Groq (Recommended - Fast and Free):
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up/login
3. Go to API Keys section
4. Create a new API key

#### For Gmail Email (Recommended):
1. Enable 2-factor authentication on your Google account
2. Go to Google Account settings > Security > App passwords
3. Generate an app password for "Mail"
4. Use your email and the app password (not your regular password)

### 3. Prepare Your Resume
- Save your master resume as a text file (.txt)
- Place it somewhere accessible (e.g., `/path/to/your/resume.txt`)

### 4. Start the Application
```bash
# Start the backend server
npm run server

# In another terminal, start the frontend
npm run dev
```

### 5. Configure the Application
1. Open the application in your browser
2. Click the gear icon (⚙️) to open Configuration
3. Fill in your API keys and settings:
   - **Email**: Your Gmail address and app password
   - **LLM Provider**: Choose Groq and enter your API key
   - **OCR Provider**: Keep Tesseract (default, free)
   - **Resume Path**: Path to your resume file

### 6. Add Jobs and Process
1. Click "Add Job" and enter job details
2. Click "Process Jobs" to start automation
3. Check your email for the application packages!

## How It Works

1. **Job Capture**: Takes a full-page screenshot of the job application
2. **OCR Processing**: Extracts all text content from the screenshot
3. **AI Analysis**: LLM analyzes the job description and requirements
4. **Resume Tailoring**: Customizes your resume to highlight relevant skills
5. **Cover Letter Generation**: Creates a personalized cover letter
6. **Question Answering**: Identifies and answers application questions
7. **Email Delivery**: Sends everything to your email with attachments

## Configuration File Structure

Your API keys are stored in `server/data/config.json`:

```json
{
  "email": {
    "service": "gmail",
    "user": "your-email@gmail.com",
    "password": "your-app-password"
  },
  "llm": {
    "provider": "groq",
    "apiKey": "your-groq-api-key",
    "model": "llama3-8b-8192"
  },
  "ocr": {
    "provider": "tesseract"
  },
  "resume": {
    "path": "/path/to/your/resume.txt"
  }
}
```

## Security Notes

- API keys are stored locally only
- Never commit config files to version control
- Use app passwords, not your main email password
- All processing happens on your machine

## Troubleshooting

### Common Issues:

**"Email sending failed"**
- Check your Gmail app password (not regular password)
- Ensure 2-factor authentication is enabled

**"OCR processing failed"**
- Tesseract might need time to install/initialize
- Try Google Vision API if Tesseract fails

**"LLM API error"**
- Check your API key is correct
- Verify you have credits/free tier available
- Try switching to a different provider

### Getting Help:

1. Check the browser console for errors
2. Check the server logs in your terminal
3. Verify all API keys are correctly formatted
4. Ensure your resume file exists and is readable

## Adding More Job Sites

The tool works with any job application page. Some sites that work particularly well:
- LinkedIn Jobs
- Indeed
- Company career pages
- Greenhouse applications
- Workday applications

## License

MIT License - Feel free to modify and use for your job search!