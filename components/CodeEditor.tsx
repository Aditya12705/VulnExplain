import React from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export const CodeEditor: React.FC<Props> = ({ value, onChange, disabled }) => {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative">
        <div className="flex items-center justify-between bg-surfaceHighlight rounded-t-lg px-4 py-2 border-b border-gray-700">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          </div>
          <span className="text-xs text-gray-400 font-mono">input.js</span>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="// Paste your code here to audit..."
          className="w-full h-80 bg-surface text-gray-300 font-mono text-sm p-4 rounded-b-lg focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          spellCheck={false}
        />
      </div>
    </div>
  );
};