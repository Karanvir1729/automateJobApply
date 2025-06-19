import React, { useState } from 'react';
import { 
  Send, 
  Mail, 
  Building, 
  MapPin, 
  DollarSign, 
  Calendar,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  dateAdded: string;
  source?: string;
  location?: string;
  description?: string;
  salary?: string;
  jobType?: string;
  postedDate?: string;
}

interface QuickApplyProps {
  jobs: Job[];
  onJobProcessed: () => void;
  onError: (error: string) => void;
  darkMode: boolean;
}

const QuickApply: React.FC<QuickApplyProps> = ({ jobs, onJobProcessed, onError, darkMode }) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedJobs, setProcessedJobs] = useState<Set<string>>(new Set());
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setShowEmailModal(true);
  };

  const handleApply = async () => {
    if (!selectedJob || !userEmail) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/process-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          jobId: selectedJob.id, 
          userEmail: userEmail 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setProcessedJobs(prev => new Set([...prev, selectedJob.id]));
        onJobProcessed();
        setShowEmailModal(false);
        setSelectedJob(null);
      } else {
        const errorMsg = result.error || 'Failed to process job';
        onError(`Job processing failed: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error processing job:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred while processing job';
      onError(`Job processing error: ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl shadow-sm border transition-colors ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className="text-2xl font-bold flex items-center space-x-3 mb-2">
          <Send className="w-8 h-8 text-blue-600" />
          <span>Quick Apply</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Click any job below to instantly generate a tailored resume, cover letter, and application answers. 
          We'll email you the complete package within minutes!
        </p>
      </div>

      {/* Jobs Grid */}
      {jobs.length === 0 ? (
        <div className={`text-center py-12 rounded-xl border-2 border-dashed transition-colors ${
          darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'
        }`}>
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium">No jobs available</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add some jobs or use the job scraper to find opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const isProcessed = processedJobs.has(job.id);
            
            return (
              <div
                key={job.id}
                onClick={() => !isProcessed && handleJobClick(job)}
                className={`p-6 rounded-xl shadow-sm border transition-all cursor-pointer ${
                  isProcessed 
                    ? 'opacity-75 cursor-not-allowed' 
                    : 'hover:shadow-md hover:scale-105'
                } ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                {/* Job Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1 line-clamp-2">{job.title}</h3>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Building className="w-4 h-4" />
                      <span className="font-medium">{job.company}</span>
                    </div>
                  </div>
                  
                  {isProcessed ? (
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  ) : (
                    <Send className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  )}
                </div>

                {/* Job Details */}
                <div className="space-y-2 mb-4">
                  {job.location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  
                  {job.salary && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-4 h-4" />
                      <span>{job.salary}</span>
                    </div>
                  )}
                  
                  {job.postedDate && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Posted {formatDate(job.postedDate)}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {job.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                    {job.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    job.source === 'Featured Jobs' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {job.source || 'Manual'}
                  </span>
                  
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Status Overlay */}
                {isProcessed && (
                  <div className="absolute inset-0 bg-green-500 bg-opacity-10 rounded-xl flex items-center justify-center">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Application Sent!
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-xl shadow-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Apply to {selectedJob.company}</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Position: <span className="font-medium">{selectedJob.title}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We'll generate a tailored resume, cover letter, and answer application questions, 
                  then email you the complete package.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Your Email Address
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEmailModal(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={!userEmail || isProcessing}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Apply Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickApply;