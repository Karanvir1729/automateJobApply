import puppeteer from 'puppeteer';
import { createWorker } from 'tesseract.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const SCREENSHOTS_DIR = path.join(DATA_DIR, 'screenshots');

// Ensure screenshots directory exists
await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });

const readJobs = async () => {
  try {
    const data = await fs.readFile(JOBS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading jobs:', error);
    return [];
  }
};

const writeJobs = async (jobs) => {
  try {
    await fs.writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2));
  } catch (error) {
    console.error('Error writing jobs:', error);
  }
};

const readConfig = async () => {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading config:', error);
    return null;
  }
};

const readResume = async (resumePath) => {
  try {
    const data = await fs.readFile(resumePath, 'utf8');
    return data;
  } catch (error) {
    console.error('Error reading resume:', error);
    return 'Resume content not available';
  }
};

// OCR Processing
const processWithTesseract = async (imagePath) => {
  const worker = await createWorker('eng');
  try {
    const { data: { text } } = await worker.recognize(imagePath);
    return text;
  } finally {
    await worker.terminate();
  }
};

const processWithGoogleVision = async (imagePath, apiKey) => {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        requests: [{
          image: {
            content: base64Image
          },
          features: [{
            type: 'TEXT_DETECTION'
          }]
        }]
      }
    );

    return response.data.responses[0]?.textAnnotations?.[0]?.description || '';
  } catch (error) {
    console.error('Google Vision API error:', error);
    throw error;
  }
};

// LLM Processing
const callGroqAPI = async (prompt, apiKey, model) => {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
};

const callTogetherAPI = async (prompt, apiKey, model) => {
  try {
    const response = await axios.post(
      'https://api.together.xyz/v1/completions',
      {
        model: model,
        prompt: prompt,
        max_tokens: 2000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].text;
  } catch (error) {
    console.error('Together API error:', error);
    throw error;
  }
};

const callHuggingFaceAPI = async (prompt, apiKey, model) => {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        inputs: prompt,
        parameters: {
          max_length: 2000,
          temperature: 0.7
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data[0].generated_text;
  } catch (error) {
    console.error('Hugging Face API error:', error);
    throw error;
  }
};

const callLLM = async (prompt, config) => {
  const { provider, apiKey, model } = config.llm;
  
  switch (provider) {
    case 'groq':
      return await callGroqAPI(prompt, apiKey, model);
    case 'together':
      return await callTogetherAPI(prompt, apiKey, model);
    case 'huggingface':
      return await callHuggingFaceAPI(prompt, apiKey, model);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
};

// Main processing function
const processJob = async (job, config) => {
  console.log(`Processing job: ${job.title} at ${job.company}`);
  
  let browser;
  try {
    // Launch browser and take screenshot
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log(`Navigating to: ${job.url}`);
    await page.goto(job.url, { waitUntil: 'networkidle2' });
    
    // Take screenshot
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${job.id}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    console.log('Screenshot taken, processing with OCR...');
    
    // Process screenshot with OCR
    let ocrText = '';
    if (config.ocr.provider === 'tesseract') {
      ocrText = await processWithTesseract(screenshotPath);
    } else if (config.ocr.provider === 'google' && config.ocr.apiKey) {
      ocrText = await processWithGoogleVision(screenshotPath, config.ocr.apiKey);
    }
    
    console.log('OCR completed, generating tailored documents...');
    
    // Read resume
    const resumeContent = await readResume(config.resume.path);
    
    // Generate tailored resume
    const resumePrompt = `
    Based on this job posting and my current resume, create a tailored version that highlights relevant skills and experience.
    
    Job Title: ${job.title}
    Company: ${job.company}
    Job Description (from OCR): ${ocrText.substring(0, 2000)}
    
    My Current Resume:
    ${resumeContent}
    
    Please provide a tailored resume that emphasizes the most relevant qualifications for this specific role.
    `;
    
    const tailoredResume = await callLLM(resumePrompt, config);
    
    // Generate cover letter
    const coverLetterPrompt = `
    Write a professional cover letter for this job application.
    
    Job Title: ${job.title}
    Company: ${job.company}
    Job Description (from OCR): ${ocrText.substring(0, 2000)}
    
    My Resume: ${resumeContent.substring(0, 1000)}
    
    Create a compelling cover letter that shows enthusiasm for the role and highlights how my experience matches their needs.
    `;
    
    const coverLetter = await callLLM(coverLetterPrompt, config);
    
    // Extract and answer questions
    const questionsPrompt = `
    Analyze this job application page content and identify any application questions that might need to be answered.
    
    Page Content: ${ocrText}
    
    For each question you identify, provide a professional answer based on this resume: ${resumeContent.substring(0, 1000)}
    
    Format your response as JSON with this structure:
    [
      {
        "question": "Question text here",
        "answer": "Your answer here"
      }
    ]
    
    If no questions are found, return an empty array.
    `;
    
    let questions = [];
    try {
      const questionsResponse = await callLLM(questionsPrompt, config);
      // Try to parse JSON response
      const jsonMatch = questionsResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing questions response:', error);
    }
    
    // Update job with results
    return {
      ...job,
      status: 'completed',
      tailoredResume,
      coverLetter,
      questions,
      screenshot: `/screenshots/${job.id}.png`
    };
    
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);
    return {
      ...job,
      status: 'failed'
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export const processJobs = async () => {
  console.log('Starting job processing...');
  
  const config = await readConfig();
  if (!config) {
    console.error('No configuration found');
    return;
  }
  
  const jobs = await readJobs();
  const pendingJobs = jobs.filter(job => job.status === 'pending');
  
  console.log(`Found ${pendingJobs.length} pending jobs`);
  
  for (const job of pendingJobs) {
    // Update status to processing
    const jobIndex = jobs.findIndex(j => j.id === job.id);
    jobs[jobIndex].status = 'processing';
    await writeJobs(jobs);
    
    // Process the job
    const processedJob = await processJob(job, config);
    
    // Update with results
    jobs[jobIndex] = processedJob;
    await writeJobs(jobs);
    
    console.log(`Completed processing job: ${job.title}`);
  }
  
  console.log('Job processing completed');
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  processJobs().catch(console.error);
}