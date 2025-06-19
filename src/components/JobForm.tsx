import React, { useState } from 'react';
import { Link, Save, X } from 'lucide-react';

interface JobFormProps {
  onSubmit: (job: { title: string; company: string; url: string }) => void;
  onCancel: () => void;
  darkMode: boolean;
}

const JobForm: React.FC<JobFormProps> = ({ onSubmit, onCancel, darkMode }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    url: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'Job URL is required';
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`rounded-xl shadow-lg border transition-colors ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <Link className="w-5 h-5" />
            <span>Add New Job Application</span>
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Enter the job details to start the automation process
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Job Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : darkMode
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white'
              }`}
              placeholder="e.g., Senior Software Engineer"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium mb-2">
              Company Name *
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.company
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : darkMode
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white'
              }`}
              placeholder="e.g., Google"
            />
            {errors.company && (
              <p className="text-red-500 text-sm mt-1">{errors.company}</p>
            )}
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-2">
              Job Application URL *
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.url
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : darkMode
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white'
              }`}
              placeholder="https://example.com/jobs/apply"
            />
            {errors.url && (
              <p className="text-red-500 text-sm mt-1">{errors.url}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This tool will screenshot the page and extract application questions using OCR
            </p>
          </div>

          <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Add Job</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;