import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const SAMPLE_JOBS_FILE = path.join(DATA_DIR, 'sample-jobs.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const RESUME_FILE = path.join(DATA_DIR, 'resume.txt');

// Ensure data directory exists
await fs.mkdir(DATA_DIR, { recursive: true });

// Initialize files if they don't exist
try {
  await fs.access(JOBS_FILE);
} catch {
  // Copy sample jobs to main jobs file
  try {
    const sampleJobs = await fs.readFile(SAMPLE_JOBS_FILE, 'utf8');
    await fs.writeFile(JOBS_FILE, sampleJobs);
  } catch {
    await fs.writeFile(JOBS_FILE, JSON.stringify([]));
  }
}

try {
  await fs.access(CONFIG_FILE);
} catch {
  await fs.writeFile(CONFIG_FILE, JSON.stringify({
    email: {
      service: 'gmail',
      user: '',
      password: ''
    },
    llm: {
      provider: 'groq',
      apiKey: '',
      model: 'llama3-8b-8192'
    },
    ocr: {
      provider: 'tesseract'
    },
    resume: {
      path: RESUME_FILE
    },
    jobSearch: {
      serpApiKey: '',
      defaultQuery: 'software engineer',
      defaultLocation: 'Toronto, ON',
      autoScrape: false,
      scrapeInterval: 24
    }
  }));
}

// Helper functions
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

const writeConfig = async (config) => {
  try {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error writing config:', error);
  }
};

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// API Routes

// Get all jobs
app.get('/api/jobs', asyncHandler(async (req, res) => {
  const jobs = await readJobs();
  res.json(jobs);
}));

// Add new job
app.post('/api/jobs', asyncHandler(async (req, res) => {
  const { title, company, url } = req.body;
  
  if (!title || !company || !url) {
    return res.status(400).json({ error: 'Missing required fields: title, company, and url are required' });
  }

  const jobs = await readJobs();
  const newJob = {
    id: Date.now().toString(),
    title,
    company,
    url,
    status: 'pending',
    dateAdded: new Date().toISOString()
  };

  jobs.push(newJob);
  await writeJobs(jobs);
  
  res.json(newJob);
}));

// Get configuration
app.get('/api/config', asyncHandler(async (req, res) => {
  const config = await readConfig();
  if (!config) {
    return res.status(500).json({ error: 'Failed to read configuration' });
  }
  res.json(config);
}));

// Save configuration
app.post('/api/config', asyncHandler(async (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid configuration data' });
  }
  
  await writeConfig(req.body);
  res.json({ success: true });
}));

// Process specific job
app.post('/api/process-job', asyncHandler(async (req, res) => {
  const { jobId, userEmail } = req.body;
  
  if (!jobId || !userEmail) {
    return res.status(400).json({ error: 'Missing jobId or userEmail' });
  }

  try {
    // Import and run the job processor for specific job
    const { processSpecificJob } = await import('./process-jobs.js');
    const result = await processSpecificJob(jobId, userEmail);
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error processing job:', error);
    res.status(500).json({ error: `Failed to process job: ${error.message}` });
  }
}));

// Process jobs
app.post('/api/process-jobs', asyncHandler(async (req, res) => {
  try {
    // Import and run the job processor
    const { processJobs } = await import('./process-jobs.js');
    await processJobs();
    res.json({ success: true });
  } catch (error) {
    console.error('Error processing jobs:', error);
    res.status(500).json({ error: `Failed to process jobs: ${error.message}` });
  }
}));

// Send email for a specific job
app.post('/api/send-email', asyncHandler(async (req, res) => {
  const { jobId } = req.body;
  
  if (!jobId) {
    return res.status(400).json({ error: 'Missing jobId' });
  }
  
  try {
    const { sendJobEmail } = await import('./email-service.js');
    await sendJobEmail(jobId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: `Failed to send email: ${error.message}` });
  }
}));

// Scrape jobs
app.post('/api/scrape-jobs', asyncHandler(async (req, res) => {
  const { query, location, sources } = req.body;
  
  if (!query || !location) {
    return res.status(400).json({ error: 'Missing required fields: query and location are required' });
  }
  
  try {
    const { autoAddScrapedJobs } = await import('./job-scraper.js');
    
    const searchParams = {
      query: query || 'software engineer',
      location: location || 'Toronto, ON',
      sources: sources || ['google', 'linkedin', 'indeed']
    };
    
    const newJobs = await autoAddScrapedJobs(searchParams);
    res.json({ success: true, jobsAdded: newJobs.length, jobs: newJobs });
  } catch (error) {
    console.error('Error scraping jobs:', error);
    res.status(500).json({ error: `Failed to scrape jobs: ${error.message}` });
  }
}));

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: `Internal server error: ${error.message}`,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});