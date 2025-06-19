import React, { useState, useEffect } from 'react';
import { Settings, Save, X, Upload, Eye, EyeOff, Search } from 'lucide-react';

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

interface ConfigPanelProps {
  config: Config | null;
  onSave: (config: Config) => void;
  onCancel: () => void;
  darkMode: boolean;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onSave, onCancel, darkMode }) => {
  const [formData, setFormData] = useState<Config>({
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
      scrapeInterval: 24
    }
  });

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (config) {
      setFormData({
        ...config,
        jobSearch: {
          serpApiKey: '',
          defaultQuery: 'software engineer',
          defaultLocation: 'San Francisco, CA',
          autoScrape: false,
          scrapeInterval: 24,
          ...config.jobSearch
        }
      });
    }
  }, [config]);

  const handleChange = (section: keyof Config, field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const providers = {
    llm: [
      { value: 'groq', label: 'Groq (Free)', models: ['llama3-8b-8192', 'mixtral-8x7b-32768'] },
      { value: 'together', label: 'Together AI (Free Tier)', models: ['meta-llama/Llama-2-7b-chat-hf'] },
      { value: 'huggingface', label: 'Hugging Face (Free)', models: ['microsoft/DialoGPT-medium'] }
    ],
    ocr: [
      { value: 'tesseract', label: 'Tesseract (Completely Free)' },
      { value: 'google', label: 'Google Vision API (Free Tier)' }
    ],
    email: [
      { value: 'gmail', label: 'Gmail SMTP' },
      { value: 'outlook', label: 'Outlook SMTP' }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className={`rounded-xl shadow-lg border transition-colors ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Configuration</span>
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configure your API keys and settings for automation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Job Search Configuration */}
          <section>
            <h3 className="text-md font-semibold mb-4 text-indigo-600 dark:text-indigo-400 flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Job Search Configuration</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">SerpAPI Key (Google Jobs)</label>
                <div className="relative">
                  <input
                    type={showPasswords.serpApiKey ? 'text' : 'password'}
                    value={formData.jobSearch?.serpApiKey || ''}
                    onChange={(e) => handleChange('jobSearch', 'serpApiKey', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                      darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Free tier: 100 searches/month"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('serpApiKey')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.serpApiKey ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Get free API key at <a href="https://serpapi.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">serpapi.com</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Default Job Query</label>
                <input
                  type="text"
                  value={formData.jobSearch?.defaultQuery || ''}
                  onChange={(e) => handleChange('jobSearch', 'defaultQuery', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="e.g., software engineer, data scientist"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Default Location</label>
                <input
                  type="text"
                  value={formData.jobSearch?.defaultLocation || ''}
                  onChange={(e) => handleChange('jobSearch', 'defaultLocation', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Scrape Interval (hours)</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={formData.jobSearch?.scrapeInterval || 24}
                  onChange={(e) => handleChange('jobSearch', 'scrapeInterval', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.jobSearch?.autoScrape || false}
                    onChange={(e) => handleChange('jobSearch', 'autoScrape', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Enable automatic job scraping</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Automatically search for new jobs based on your default query and location
                </p>
              </div>
            </div>
          </section>

          {/* Email Configuration */}
          <section>
            <h3 className="text-md font-semibold mb-4 text-blue-600 dark:text-blue-400">
              Email Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Service</label>
                <select
                  value={formData.email.service}
                  onChange={(e) => handleChange('email', 'service', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}
                >
                  {providers.email.map(provider => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email.user}
                  onChange={(e) => handleChange('email', 'user', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">App Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.emailPassword ? 'text' : 'password'}
                    value={formData.email.password}
                    onChange={(e) => handleChange('email', 'password', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                      darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="App-specific password (not your regular password)"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('emailPassword')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.emailPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  For Gmail, generate an app password in your Google Account settings
                </p>
              </div>
            </div>
          </section>

          {/* LLM Configuration */}
          <section>
            <h3 className="text-md font-semibold mb-4 text-green-600 dark:text-green-400">
              LLM Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">LLM Provider</label>
                <select
                  value={formData.llm.provider}
                  onChange={(e) => {
                    const provider = providers.llm.find(p => p.value === e.target.value);
                    handleChange('llm', 'provider', e.target.value);
                    if (provider && provider.models[0]) {
                      handleChange('llm', 'model', provider.models[0]);
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}
                >
                  {providers.llm.map(provider => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Model</label>
                <select
                  value={formData.llm.model}
                  onChange={(e) => handleChange('llm', 'model', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}
                >
                  {providers.llm.find(p => p.value === formData.llm.provider)?.models.map(model => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">API Key</label>
                <div className="relative">
                  <input
                    type={showPasswords.llmApiKey ? 'text' : 'password'}
                    value={formData.llm.apiKey}
                    onChange={(e) => handleChange('llm', 'apiKey', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                      darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Your LLM API key"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('llmApiKey')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.llmApiKey ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* OCR Configuration */}
          <section>
            <h3 className="text-md font-semibold mb-4 text-purple-600 dark:text-purple-400">
              OCR Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">OCR Provider</label>
                <select
                  value={formData.ocr.provider}
                  onChange={(e) => handleChange('ocr', 'provider', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}
                >
                  {providers.ocr.map(provider => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.ocr.provider === 'google' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Google Vision API Key</label>
                  <div className="relative">
                    <input
                      type={showPasswords.ocrApiKey ? 'text' : 'password'}
                      value={formData.ocr.apiKey || ''}
                      onChange={(e) => handleChange('ocr', 'apiKey', e.target.value)}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                        darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Google Cloud Vision API key"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('ocrApiKey')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPasswords.ocrApiKey ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Resume Configuration */}
          <section>
            <h3 className="text-md font-semibold mb-4 text-orange-600 dark:text-orange-400">
              Resume Configuration
            </h3>
            <div>
              <label className="block text-sm font-medium mb-2">Resume File Path</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.resume.path}
                  onChange={(e) => handleChange('resume', 'path', e.target.value)}
                  className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                    darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="/path/to/your/resume.pdf"
                />
                <button
                  type="button"
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Browse</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Upload your master resume (PDF format recommended)
              </p>
            </div>
          </section>

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
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigPanel;