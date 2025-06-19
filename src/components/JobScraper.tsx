import React, { useState } from 'react';
import { Globe, Search, Plus, CheckCircle, AlertCircle } from 'lucide-react';

interface Config {
  jobSearch?: {
    serpApiKey: string;
    defaultQuery: string;
    defaultLocation: string;
    autoScrape: boolean;
    scrapeInterval: number;
  };
}

interface JobScraperProps {
  config: Config | null;
  onJobsScraped: () => void;
  onError: (error: string) => void;
  darkMode: boolean;
}

const JobScraper: React.FC<JobScraperProps> = ({ config, onJobsScraped, onError, darkMode }) => {
  const [searchParams, setSearchParams] = useState({
    query: config?.jobSearch?.defaultQuery || 'software engineer',
    location: config?.jobSearch?.defaultLocation || 'San Francisco, CA',
    sources: ['google', 'linkedin', 'indeed']
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{ jobsAdded: number; message: string } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  const handleSourceToggle = (source: string) => {
    setSearchParams(prev => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source]
    }));
  };

  const handleScrape = async () => {
    if (searchParams.sources.length === 0) {
      onError('Please select at least one job source');
      return;
    }

    setIsLoading(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/scrape-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setLastResult({
          jobsAdded: result.jobsAdded,
          message: `Successfully found and added ${result.jobsAdded} new jobs!`
        });
        onJobsScraped();
      } else {
        const errorMsg = result.error || 'Failed to scrape jobs. Please check your configuration.';
        onError(`Job scraping failed: ${errorMsg}`);
        setLastResult({
          jobsAdded: 0,
          message: errorMsg
        });
      }
    } catch (error) {
      console.error('Error scraping jobs:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred while scraping jobs';
      onError(`Job scraping error: ${errorMsg}`);
      setLastResult({
        jobsAdded: 0,
        message: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  const jobSources = [
    {
      id: 'google',
      name: 'Google Jobs',
      description: 'Search Google\'s job aggregator',
      requiresApi: true,
      apiName: 'SerpAPI',
      free: true,
      limit: '100 searches/month'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Jobs',
      description: 'Search LinkedIn job postings',
      requiresApi: false,
      free: true,
      limit: 'Unlimited'
    },
    {
      id: 'indeed',
      name: 'Indeed Jobs',
      description: 'Search Indeed job listings',
      requiresApi: false,
      free: true,
      limit: 'Unlimited'
    }
  ];

  const hasGoogleApiKey = config?.jobSearch?.serpApiKey && config.jobSearch.serpApiKey.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl shadow-sm border transition-colors ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className="text-2xl font-bold flex items-center space-x-3 mb-2">
          <Globe className="w-8 h-8 text-purple-600" />
          <span>Job Scraper</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Automatically search and import jobs from multiple sources using free APIs
        </p>
      </div>

      {/* Search Parameters */}
      <div className={`p-6 rounded-xl shadow-sm border transition-colors ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className="text-lg font-semibold mb-4">Search Parameters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Job Title / Keywords</label>
            <input
              type="text"
              value={searchParams.query}
              onChange={(e) => handleInputChange('query', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
              }`}
              placeholder="e.g., software engineer, data scientist, product manager"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              value={searchParams.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
              }`}
              placeholder="e.g., San Francisco, CA, New York, NY, Remote"
            />
          </div>
        </div>

        {/* Job Sources */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3">Job Sources</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {jobSources.map((source) => {
              const isSelected = searchParams.sources.includes(source.id);
              const isDisabled = source.requiresApi && !hasGoogleApiKey;
              
              return (
                <div
                  key={source.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-600'
                      : isSelected
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400'
                  }`}
                  onClick={() => !isDisabled && handleSourceToggle(source.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{source.name}</h5>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => {}}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {source.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded ${
                      source.free 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {source.free ? 'Free' : 'Paid'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {source.limit}
                    </span>
                  </div>
                  {source.requiresApi && !hasGoogleApiKey && (
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                      Requires {source.apiName} key in configuration
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={handleScrape}
            disabled={isLoading || searchParams.sources.length === 0}
            className="flex items-center space-x-2 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Scraping Jobs...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Scrape Jobs</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {lastResult && (
        <div className={`p-6 rounded-xl shadow-sm border transition-colors ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3 mb-3">
            {lastResult.jobsAdded > 0 ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            )}
            <h3 className="text-lg font-semibold">Scraping Results</h3>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {lastResult.message}
          </p>

          {lastResult.jobsAdded > 0 && (
            <div className="flex items-center space-x-2 text-sm">
              <Plus className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">
                {lastResult.jobsAdded} new jobs added to your pipeline
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className={`p-6 rounded-xl shadow-sm border transition-colors ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className="text-lg font-semibold mb-3">💡 Tips for Better Results</h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>• Use specific job titles for more targeted results (e.g., "Senior React Developer" vs "Developer")</li>
          <li>• Include multiple keywords separated by commas (e.g., "Python, Django, AWS")</li>
          <li>• Try different location formats: "Remote", "San Francisco, CA", "United States"</li>
          <li>• Get a free SerpAPI key at <a href="https://serpapi.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">serpapi.com</a> for Google Jobs access</li>
          <li>• Run scraping regularly to catch new job postings</li>
        </ul>
      </div>
    </div>
  );
};

export default JobScraper;