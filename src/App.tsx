import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Search, 
  Upload, 
  Mail, 
  Eye, 
  Download,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  Moon,
  Sun,
  Globe,
  Send,
  Briefcase
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import JobForm from './components/JobForm';
import ConfigPanel from './components/ConfigPanel';
import JobDetails from './components/JobDetails';
import JobScraper from './components/JobScraper';
import QuickApply from './components/QuickApply';

interface Job {
  id: string;
  title: string;
  company: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  dateAdded: string;
  tailoredResume?: string;
  coverLetter?: string;
  questions?: Array<{ question: string; answer: string }>;
  screenshot?: string;
  source?: string;
  location?: string;
  description?: string;
  salary?: string;
  jobType?: string;
  postedDate?: string;
}

interface Config {
  email: {
    service: string;
    user: string;
    password: string;
  };
  llm: {
    provider: string;
    apiKey: string;
    model: string;
  };
  ocr: {
    provider: string;
    apiKey?: string;
  };
  resume: {
    path: string;
  };
  jobSearch?: {
    serpApiKey: string;
    defaultQuery: string;
    defaultLocation: string;
    autoScrape: boolean;
    scrapeInterval: number;
  };
}

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'add-job' | 'config' | 'job-details' | 'scraper' | 'quick-apply'>('quick-apply');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchConfig();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Failed to fetch config:', error);
    }
  };

  const addJob = async (jobData: Omit<Job, 'id' | 'status' | 'dateAdded'>) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });
      if (response.ok) {
        fetchJobs();
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.error('Failed to add job:', error);
    }
  };

  const processJobs = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/process-jobs', { method: 'POST' });
      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error('Failed to process jobs:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveConfig = async (newConfig: Config) => {
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (response.ok) {
        setConfig(newConfig);
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const viewJobDetails = (job: Job) => {
    setSelectedJob(job);
    setCurrentView('job-details');
  };

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const pendingJobs = jobs.filter(j => j.status === 'pending');

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`border-b transition-colors duration-200 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">Job Application Automator</h1>
              <div className="flex items-center space-x-2">
                {getStatusIcon('pending')}
                <span className="text-sm font-medium">
                  {pendingJobs.length} Available Jobs
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={processJobs}
                disabled={isProcessing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isProcessing ? 'Processing...' : 'Process All Jobs'}</span>
              </button>
              
              <button
                onClick={() => setCurrentView('add-job')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Job</span>
              </button>
              
              <button
                onClick={() => setCurrentView('config')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`border-b transition-colors duration-200 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'quick-apply', label: 'Quick Apply', icon: Send },
              { key: 'dashboard', label: 'Dashboard', icon: Search },
              { key: 'scraper', label: 'Job Scraper', icon: Globe },
              { key: 'add-job', label: 'Add Job', icon: Plus },
              { key: 'config', label: 'Configuration', icon: Settings }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setCurrentView(key as any)}
                className={`flex items-center space-x-2 px-3 py-4 border-b-2 font-medium text-sm transition-colors ${
                  currentView === key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'quick-apply' && (
          <QuickApply 
            jobs={pendingJobs} 
            onJobProcessed={fetchJobs}
            darkMode={darkMode}
          />
        )}
        
        {currentView === 'dashboard' && (
          <Dashboard 
            jobs={jobs} 
            onViewJob={viewJobDetails}
            darkMode={darkMode}
          />
        )}
        
        {currentView === 'scraper' && (
          <JobScraper 
            config={config}
            onJobsScraped={fetchJobs}
            darkMode={darkMode}
          />
        )}
        
        {currentView === 'add-job' && (
          <JobForm 
            onSubmit={addJob}
            onCancel={() => setCurrentView('dashboard')}
            darkMode={darkMode}
          />
        )}
        
        {currentView === 'config' && (
          <ConfigPanel 
            config={config}
            onSave={saveConfig}
            onCancel={() => setCurrentView('dashboard')}
            darkMode={darkMode}
          />
        )}
        
        {currentView === 'job-details' && selectedJob && (
          <JobDetails 
            job={selectedJob}
            onBack={() => setCurrentView('dashboard')}
            darkMode={darkMode}
          />
        )}
      </main>
    </div>
  );
}

export default App;