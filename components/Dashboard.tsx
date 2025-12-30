import React from 'react';
import { AuditResult } from '../types';
import { FinancialImpactChart } from './FinancialImpactChart';
import { RiskBadge } from './RiskBadge';
import { AlertTriangle, ShieldCheck, DollarSign, FileText, CheckCircle } from 'lucide-react';

interface Props {
  result: AuditResult;
}

export const Dashboard: React.FC<Props> = ({ result }) => {
  const isSecure = result.overallRiskScore > 80;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Security Score */}
        <div className="bg-surface border border-gray-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck size={64} className="text-primary" />
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Security Score</h3>
          <div className="flex items-end gap-2">
            <span className={`text-4xl font-bold ${isSecure ? 'text-green-500' : 'text-primary'}`}>
              {result.overallRiskScore}
            </span>
            <span className="text-gray-500 mb-1">/ 100</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <RiskBadge level={result.riskLevel} />
            <span className="text-xs text-gray-500">Overall Status</span>
          </div>
        </div>

        {/* Financial Impact */}
        <div className="bg-surface border border-gray-800 rounded-xl p-5 shadow-lg relative overflow-hidden md:col-span-2">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign size={64} className="text-red-500" />
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Est. Financial Impact (INR)</h3>
              <div className="text-3xl font-bold text-gray-200">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(result.estimatedFinancialImpactINR || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1 max-w-md">
                Potential liability based on data exposure, downtime, and compliance fines.
              </p>
            </div>
            <div className="w-1/2 -mt-4">
               <FinancialImpactChart impact={result.estimatedFinancialImpactINR || 0} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Detailed Vulnerabilities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
              <AlertTriangle size={20} className="text-yellow-500" />
              Detected Vulnerabilities
            </h2>
            <span className="text-sm text-gray-500">{result.vulnerabilities.length} issues found</span>
          </div>

          <div className="space-y-3">
            {result.vulnerabilities.length === 0 ? (
               <div className="p-8 text-center border border-gray-800 rounded-lg bg-surface/50">
                 <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                 <p className="text-gray-300">No major vulnerabilities detected. Good job!</p>
               </div>
            ) : (
              result.vulnerabilities.map((vuln, idx) => (
                <div key={idx} className="bg-surface border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-200">{vuln.title}</span>
                      {vuln.lineNumber && (
                        <span className="text-xs font-mono bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">
                          Ln {vuln.lineNumber}
                        </span>
                      )}
                    </div>
                    <RiskBadge level={vuln.severity} />
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{vuln.description}</p>
                  
                  <div className="bg-surfaceHighlight/50 rounded p-3 border-l-2 border-primary">
                    <h4 className="text-xs font-bold text-primary uppercase mb-1">Remediation</h4>
                    <p className="text-sm text-gray-300 font-mono">{vuln.remediation}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: SOC 2 & Executive Summary */}
        <div className="space-y-6">
          
          {/* SOC 2 Mapping */}
          <div className="bg-surface border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-200 font-semibold mb-4 flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              SOC 2 Controls
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.soc2Controls.length > 0 ? (
                result.soc2Controls.map((control, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-sm text-gray-300 font-mono">
                    {control}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500 italic">No specific controls mapped.</span>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-surface border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-200 font-semibold mb-3">Executive Summary</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {result.executiveSummary}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};