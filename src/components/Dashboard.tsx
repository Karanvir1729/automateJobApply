import React from 'react';
import { 
  Eye, 
  Download, 
  Mail, 
  ExternalLink,
  Calendar,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

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
}

interface DashboardProps {
  jobs: Job[];
  onViewJob: (job: Job) => void;
  darkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ jobs, onViewJob, darkMode }) => {
  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'pending').length,
    processing: jobs.filter(j => j.status === 'processing').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          { label: 'Total Jobs', value: stats.total, color: 'blue', icon: Building },
          { label: 'Pending', value: stats.pending, color: 'gray', icon: AlertCircle },
          { label: 'Processing', value: stats.processing, color: 'yellow', icon: Clock },
          { label: 'Completed', value: stats.completed, color: 'green', icon: CheckCircle },
          { label: 'Failed', value: stats.failed, color: 'red', icon: XCircle }
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            className={`p-6 rounded-xl shadow-sm transition-colors ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
                <p className="text-2xl font-bold mt-1">{value}</p>
              </div>
              <Icon className={`w-8 h-8 text-${color}-500`} />
            </div>
          </div>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Jobs</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {jobs.length} total jobs
          </span>
        </div>

        {jobs.length === 0 ? (
          <div className={`text-center py-12 rounded-xl border-2 border-dashed transition-colors ${
            darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'
          }`}>
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium">No jobs yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding your first job application.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)}
                        <span className="ml-1 capitalize">{job.status}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <Building className="w-4 h-4" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(job.dateAdded).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {job.status === 'completed' && (
                      <div className="flex items-center space-x-4 text-sm">
                        {job.tailoredResume && (
                          <span className="text-green-600 dark:text-green-400">✓ Resume Tailored</span>
                        )}
                        {job.coverLetter && (
                          <span className="text-green-600 dark:text-green-400">✓ Cover Letter</span>
                        )}
                        {job.questions && job.questions.length > 0 && (
                          <span className="text-green-600 dark:text-green-400">
                            ✓ {job.questions.length} Questions Answered
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Open job posting"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    
                    <button
                      onClick={() => onViewJob(job)}
                      className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {job.status === 'completed' && (
                      <>
                        <button
                          className="p-2 text-gray-400 hover:text-purple-500 transition-colors"
                          title="Download files"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        
                        <button
                          className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                          title="Send email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;