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
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Ensure data directory exists
await fs.mkdir(DATA_DIR, { recursive: true });

// Initialize files if they don't exist
try {
  await fs.access(JOBS_FILE);
} catch {
  await fs.writeFile(JOBS_FILE, JSON.stringify([]));
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
      path: ''
    },
    jobSearch: {
      serpApiKey: '',
      defaultQuery: 'software engineer',
      defaultLocation: 'San Francisco, CA',
      autoScrape: false,
      scrapeInterval: 24 // hours
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

// API Routes

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  const jobs = await readJobs();
  res.json(jobs);
});

// Add new job
app.post('/api/jobs', async (req, res) => {
  const { title, company, url } = req.body;
  
  if (!title || !company || !url) {
    return res.status(400).json({ error: 'Missing required fields' });
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
});

// Get configuration
app.get('/api/config', async (req, res) => {
  const config = await readConfig();
  res.json(config);
});

// Save configuration
app.post('/api/config', async (req, res) => {
  await writeConfig(req.body);
  res.json({ success: true });
});

// Scrape jobs
app.post('/api/scrape-jobs', async (req, res) => {
  try {
    const { query, location, sources } = req.body;
    const { autoAddScrapedJobs } = await import('./job-scraper.js');
    
    const searchParams = {
      query: query || 'software engineer',
      location: location || 'San Francisco, CA',
      sources: sources || ['google', 'linkedin', 'indeed']
    };
    
    const newJobs = await autoAddScrapedJobs(searchParams);
    res.json({ success: true, jobsAdded: newJobs.length, jobs: newJobs });
  } catch (error) {
    console.error('Error scraping jobs:', error);
    res.status(500).json({ error: 'Failed to scrape jobs' });
  }
});

// Process jobs
app.post('/api/process-jobs', async (req, res) => {
  try {
    // Import and run the job processor
    const { processJobs } = await import('./process-jobs.js');
    await processJobs();
    res.json({ success: true });
  } catch (error) {
    console.error('Error processing jobs:', error);
    res.status(500).json({ error: 'Failed to process jobs' });
  }
});

// Send email for a specific job
app.post('/api/send-email', async (req, res) => {
  try {
    const { jobId } = req.body;
    const { sendJobEmail } = await import('./email-service.js');
    await sendJobEmail(jobId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
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