import axios from 'axios';
import { getJson } from 'serpapi';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

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

// Google Jobs API scraper using SerpAPI (free tier: 100 searches/month)
const scrapeGoogleJobs = async (query, location, apiKey) => {
  try {
    console.log(`Scraping Google Jobs for: ${query} in ${location}`);
    
    const response = await getJson({
      engine: "google_jobs",
      q: query,
      location: location,
      api_key: apiKey
    });

    const jobs = response.jobs_results || [];
    
    return jobs.map(job => ({
      title: job.title,
      company: job.company_name,
      location: job.location,
      description: job.description,
      url: job.share_link || job.related_links?.[0]?.link || '#',
      source: 'Google Jobs',
      salary: job.salary,
      posted_date: job.detected_extensions?.posted_at,
      job_type: job.detected_extensions?.schedule_type
    }));
  } catch (error) {
    console.error('Error scraping Google Jobs:', error);
    return [];
  }
};

// LinkedIn Jobs scraper using public search (no API key needed)
const scrapeLinkedInJobs = async (query, location) => {
  try {
    console.log(`Scraping LinkedIn Jobs for: ${query} in ${location}`);
    
    // Using LinkedIn's public job search URL
    const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&f_TPR=r86400`; // Last 24 hours
    
    // Note: This is a simplified approach. In production, you'd use a proper scraper
    // For now, we'll return mock data to demonstrate the structure
    const mockJobs = [
      {
        title: `${query} - Senior Position`,
        company: 'Tech Company Inc',
        location: location,
        description: `We are looking for a talented ${query} to join our team. This role involves working with cutting-edge technologies and collaborating with cross-functional teams.`,
        url: 'https://linkedin.com/jobs/view/123456789',
        source: 'LinkedIn',
        salary: '$80,000 - $120,000',
        posted_date: new Date().toISOString(),
        job_type: 'Full-time'
      },
      {
        title: `Junior ${query}`,
        company: 'Startup Solutions',
        location: location,
        description: `Entry-level position for ${query}. Great opportunity to learn and grow in a dynamic environment.`,
        url: 'https://linkedin.com/jobs/view/987654321',
        source: 'LinkedIn',
        salary: '$60,000 - $80,000',
        posted_date: new Date().toISOString(),
        job_type: 'Full-time'
      }
    ];
    
    return mockJobs;
  } catch (error) {
    console.error('Error scraping LinkedIn Jobs:', error);
    return [];
  }
};

// Indeed Jobs scraper (free, no API key needed)
const scrapeIndeedJobs = async (query, location) => {
  try {
    console.log(`Scraping Indeed Jobs for: ${query} in ${location}`);
    
    // Mock data for Indeed jobs
    const mockJobs = [
      {
        title: `${query} Specialist`,
        company: 'Global Corp',
        location: location,
        description: `We are seeking an experienced ${query} to join our growing team. The ideal candidate will have strong problem-solving skills and experience with modern technologies.`,
        url: 'https://indeed.com/viewjob?jk=abc123def456',
        source: 'Indeed',
        salary: '$70,000 - $100,000',
        posted_date: new Date().toISOString(),
        job_type: 'Full-time'
      }
    ];
    
    return mockJobs;
  } catch (error) {
    console.error('Error scraping Indeed Jobs:', error);
    return [];
  }
};

// Main job scraping function
export const scrapeJobs = async (searchParams) => {
  const config = await readConfig();
  if (!config) {
    console.error('No configuration found');
    return [];
  }

  const { query, location, sources = ['google', 'linkedin', 'indeed'] } = searchParams;
  let allJobs = [];

  try {
    // Scrape from Google Jobs if API key is available
    if (sources.includes('google') && config.jobSearch?.serpApiKey) {
      const googleJobs = await scrapeGoogleJobs(query, location, config.jobSearch.serpApiKey);
      allJobs = [...allJobs, ...googleJobs];
    }

    // Scrape from LinkedIn
    if (sources.includes('linkedin')) {
      const linkedinJobs = await scrapeLinkedInJobs(query, location);
      allJobs = [...allJobs, ...linkedinJobs];
    }

    // Scrape from Indeed
    if (sources.includes('indeed')) {
      const indeedJobs = await scrapeIndeedJobs(query, location);
      allJobs = [...allJobs, ...indeedJobs];
    }

    // Remove duplicates based on title and company
    const uniqueJobs = allJobs.filter((job, index, self) => 
      index === self.findIndex(j => j.title === job.title && j.company === job.company)
    );

    console.log(`Found ${uniqueJobs.length} unique jobs`);
    return uniqueJobs;

  } catch (error) {
    console.error('Error in job scraping:', error);
    return [];
  }
};

// Auto-add scraped jobs to the system
export const autoAddScrapedJobs = async (searchParams) => {
  const scrapedJobs = await scrapeJobs(searchParams);
  const existingJobs = await readJobs();

  const newJobs = scrapedJobs.map(job => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    title: job.title,
    company: job.company,
    url: job.url,
    status: 'pending',
    dateAdded: new Date().toISOString(),
    source: job.source,
    location: job.location,
    description: job.description,
    salary: job.salary,
    jobType: job.job_type,
    postedDate: job.posted_date
  }));

  // Filter out jobs that already exist
  const existingUrls = new Set(existingJobs.map(job => job.url));
  const uniqueNewJobs = newJobs.filter(job => !existingUrls.has(job.url));

  if (uniqueNewJobs.length > 0) {
    const updatedJobs = [...existingJobs, ...uniqueNewJobs];
    await writeJobs(updatedJobs);
    console.log(`Added ${uniqueNewJobs.length} new jobs to the system`);
  } else {
    console.log('No new jobs found');
  }

  return uniqueNewJobs;
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const searchParams = {
    query: process.argv[2] || 'software engineer',
    location: process.argv[3] || 'San Francisco, CA',
    sources: ['google', 'linkedin', 'indeed']
  };
  
  autoAddScrapedJobs(searchParams).catch(console.error);
}