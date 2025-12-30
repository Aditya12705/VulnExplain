import React from 'react';
import { Github, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  onAudit: () => void;
}

export const RepositoryAuditor: React.FC<Props> = ({ value, onChange, disabled, onAudit }) => {
  const examples = [
    'https://github.com/expressjs/express',
    'https://github.com/facebook/react',
    'https://github.com/nodejs/node',
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">GitHub Repository Audit</h2>
        <p className="text-gray-400">
          Audit an entire GitHub repository for security vulnerabilities, dependency issues, and compliance risks. VulnExplain will fetch the repo content and perform a comprehensive security assessment.
        </p>
      </div>

      {/* Input Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Repository URL</label>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              placeholder="https://github.com/owner/repository"
              className="w-full bg-surface text-gray-300 font-mono text-sm p-4 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Example Repos */}
      <div className="bg-surface/50 border border-gray-800 rounded-lg p-4">
        <p className="text-xs text-gray-400 mb-3">Try these examples:</p>
        <div className="space-y-2">
          {examples.map((repo, i) => (
            <button
              key={i}
              onClick={() => onChange(repo)}
              disabled={disabled}
              className="w-full text-left text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-mono"
            >
              {repo}
            </button>
          ))}
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="text-yellow-500 mt-0.5 flex-shrink-0" size={20} />
        <div className="text-sm text-yellow-400">
          <p className="font-semibold mb-1">Public Repositories Only</p>
          <p>VulnExplain can audit any public GitHub repository. For private repositories, ensure your GitHub token is configured.</p>
        </div>
      </div>

      {/* Audit Button */}
      <button
        onClick={onAudit}
        disabled={disabled || !value.trim()}
        className="w-full bg-primary hover:bg-primaryHover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
      >
        {disabled ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Analyzing Repository...</span>
          </>
        ) : (
          <>
            <Github size={20} />
            <span>Audit Repository</span>
          </>
        )}
      </button>

      {/* What We Check */}
      <div className="bg-surface border border-gray-800 rounded-xl p-5">
        <h3 className="text-gray-200 font-semibold mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          What We Analyze
        </h3>
        <ul className="space-y-3 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span><strong>Code Security:</strong> OWASP vulnerabilities, injection flaws, authentication issues</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span><strong>Dependency Analysis:</strong> Outdated packages, known CVEs, supply chain risks</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span><strong>Configuration Issues:</strong> Exposed secrets, insecure settings, misconfigurations</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <span><strong>Compliance Mapping:</strong> SOC 2, HIPAA, PCI-DSS control alignment</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
