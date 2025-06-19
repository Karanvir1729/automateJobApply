import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onDismiss: () => void;
  darkMode?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onDismiss, darkMode = false }) => {
  return (
    <div className={`fixed top-4 right-4 max-w-md p-4 rounded-lg shadow-lg border z-50 ${
      darkMode 
        ? 'bg-red-900 border-red-700 text-red-100' 
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium mb-1">Error</h4>
          <p className="text-sm whitespace-pre-wrap break-words">{error}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;