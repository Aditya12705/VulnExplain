import React, { useState } from 'react';
import { Shield, Sparkles, AlertCircle, Play, Github } from 'lucide-react';
import { CodeEditor } from './components/CodeEditor';
import { Dashboard } from './components/Dashboard';
import { RepositoryAuditor } from './components/RepositoryAuditor';
import { auditCode, auditRepository } from './services/auditService';
import { AuditResult } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'code' | 'repo'>('code');
  const [code, setCode] = useState<string>('');
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCodeAudit = async () => {
    if (!code.trim()) {
      setError("Please enter some code to audit.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const auditData = await auditCode(code);
      setResult(auditData);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during the audit.");
    } finally {
      setLoading(false);
    }
  };

  const handleRepoAudit = async () => {
    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const auditData = await auditRepository(repoUrl);
      setResult(auditData);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during the repository audit.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setRepoUrl('');
    setResult(null);
    setError(null);
  };

  const sampleCode = `
// Sample vulnerable code for testing
const express = require('express');
const app = express();
const db = require('./db');

app.get('/user', (req, res) => {
  const id = req.query.id;
  // Vulnerable to SQL Injection
  const query = "SELECT * FROM users WHERE id = " + id;
  
  db.query(query, (err, result) => {
    if(err) {
      // Sensitive info exposure
      res.status(500).send(err.stack);
    } else {
      res.json(result);
    }
  });
});
`;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="border-b border-gray-800 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Shield className="text-primary h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">VulnExplain</h1>
              <p className="text-xs text-gray-500">B2B Security SaaS Prototype</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <a 
               href="https://github.com/adityaprakash-work/VulnExplain" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-sm text-gray-400 hover:text-white transition"
             >
               Documentation
             </a>
             <button 
               onClick={() => alert('Profile feature coming soon!')}
               className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-primary hover:opacity-80 transition cursor-pointer"
             ></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {!result ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Input */}
            <div className="flex-1 space-y-6">
              {/* Tabs */}
              <div className="flex gap-4 border-b border-gray-800">
                <button
                  onClick={() => { setActiveTab('code'); setError(null); }}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                    activeTab === 'code' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Sparkles className="inline mr-2" size={16} />
                  Code Audit
                </button>
                <button
                  onClick={() => { setActiveTab('repo'); setError(null); }}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                    activeTab === 'repo' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Github className="inline mr-2" size={16} />
                  GitHub Repository
                </button>
              </div>

              {activeTab === 'code' ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Secure Code Audit</h2>
                    <p className="text-gray-400">
                      Paste your source code below. Our AI engine will analyze it for OWASP vulnerabilities, estimate financial risks, and map findings to SOC 2 controls.
                    </p>
                  </div>

                  <CodeEditor 
                    value={code} 
                    onChange={setCode} 
                    disabled={loading}
                  />

                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleCodeAudit}
                      disabled={loading || !code.trim()}
                      className="flex-1 bg-primary hover:bg-primaryHover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Analyzing Security Posture...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} />
                          <span>Run Security Audit</span>
                        </>
                      )}
                    </button>
                    <button
                       onClick={() => setCode(sampleCode.trim())}
                       disabled={loading}
                       className="px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-surfaceHighlight transition flex items-center gap-2"
                    >
                      <Play size={16} /> Load Sample
                    </button>
                  </div>
                </div>
              ) : (
                <RepositoryAuditor
                  value={repoUrl}
                  onChange={setRepoUrl}
                  disabled={loading}
                  onAudit={handleRepoAudit}
                />
              )}
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="text-red-500 mt-0.5" size={20} />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Right Column: Value Prop */}
            <div className="lg:w-1/3 space-y-6 hidden lg:block">
              <div className="bg-surface border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Why VulnExplain?</h3>
                <ul className="space-y-4">
                  {[
                    { title: 'Instant SOC 2 Mapping', desc: 'Automatically tag vulnerabilities with relevant compliance controls.' },
                    { title: 'Financial Risk Estimation', desc: 'Translate technical debt into potential USD loss figures for stakeholders.' },
                    { title: 'AI-Driven Remediation', desc: 'Get context-aware fix suggestions powered by Llama 3.3 70B model.' },
                    { title: 'GitHub Integration', desc: 'Audit entire repositories in one click for comprehensive security assessment.' }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="mt-1">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                      <div>
                        <h4 className="text-gray-200 font-medium text-sm">{item.title}</h4>
                        <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div>
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Audit Report</h2>
                <button 
                  onClick={handleClear}
                  className="text-gray-400 hover:text-white text-sm underline"
                >
                  Run New Audit
                </button>
             </div>
             <Dashboard result={result} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;