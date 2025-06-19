import React from 'react';
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  ExternalLink, 
  FileText, 
  MessageSquare,
  Calendar,
  Building,
  Link as LinkIcon
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

interface JobDetailsProps {
  job: Job;
  onBack: () => void;
  darkMode: boolean;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job, onBack, darkMode }) => {
  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sendEmail = async () => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id })
      });
      alert('Email sent successfully!');
    } catch (error) {
      alert('Failed to send email');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{job.company}</p>
        </div>
      </div>

      {/* Job Info Card */}
      <div className={`p-6 rounded-xl shadow-sm border transition-colors ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <Building className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Company</p>
              <p className="font-medium">{job.company}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Date Added</p>
              <p className="font-medium">{new Date(job.dateAdded).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <LinkIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Application</p>
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
              >
                <span>View Job Posting</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {job.status === 'completed' && (
          <div className="mt-6 flex space-x-4">
            <button
              onClick={sendEmail}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Email Package</span>
            </button>
          </div>
        )}
      </div>

      {/* Screenshot */}
      {job.screenshot && (
        <div className={`p-6 rounded-xl shadow-sm border transition-colors ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className="text-lg font-semibold mb-4">Application Page Screenshot</h3>
          <div className="border rounded-lg overflow-hidden">
            <img
              src={job.screenshot}
              alt="Job application page"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}

      {/* Tailored Resume */}
      {job.tailoredResume && (
        <div className={`p-6 rounded-xl shadow-sm border transition-colors ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Tailored Resume</span>
            </h3>
            <button
              onClick={() => downloadFile(job.tailoredResume!, `${job.company}_resume.txt`)}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
          <div className={`p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto ${
            darkMode ? 'bg-gray-900 border border-gray-600' : 'bg-gray-50 border border-gray-200'
          }`}>
            <pre className="whitespace-pre-wrap">{job.tailoredResume}</pre>
          </div>
        </div>
      )}

      {/* Cover Letter */}
      {job.coverLetter && (
        <div className={`p-6 rounded-xl shadow-sm border transition-colors ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Cover Letter</span>
            </h3>
            <button
              onClick={() => downloadFile(job.coverLetter!, `${job.company}_cover_letter.txt`)}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
          <div className={`p-4 rounded-lg max-h-96 overflow-y-auto ${
            darkMode ? 'bg-gray-900 border border-gray-600' : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="whitespace-pre-wrap">{job.coverLetter}</div>
          </div>
        </div>
      )}

      {/* Application Questions */}
      {job.questions && job.questions.length > 0 && (
        <div className={`p-6 rounded-xl shadow-sm border transition-colors ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Application Questions & Answers</span>
            </h3>
            <button
              onClick={() => {
                const content = job.questions!.map(q => `Q: ${q.question}\nA: ${q.answer}\n\n`).join('');
                downloadFile(content, `${job.company}_questions.txt`);
              }}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
          <div className="space-y-4">
            {job.questions.map((qa, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <p className="font-medium text-blue-600 dark:text-blue-400 mb-2">
                  Question {index + 1}:
                </p>
                <p className="mb-3">{qa.question}</p>
                <p className="font-medium text-green-600 dark:text-green-400 mb-2">Answer:</p>
                <p className="whitespace-pre-wrap">{qa.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;