export interface Vulnerability {
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  remediation: string;
  lineNumber?: number;
  cweId?: string;
  owaspCategory?: string;
}

export interface AuditResult {
  overallRiskScore: number; // 0-100 (100 is safe)
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low' | 'Safe';
  estimatedFinancialImpactINR: number;
  soc2Controls: string[];
  vulnerabilities: Vulnerability[];
  executiveSummary: string;
  sourceType?: 'Code Snippet' | 'GitHub Repository' | 'Dependencies';
  repository?: string;
  analyzedAt?: string;
  cached?: boolean;
}

export interface ScanHistoryItem {
  id: string;
  timestamp: Date;
  summary: string;
  score: number;
  type: 'code' | 'repo' | 'dependencies';
}

export interface DependencyAuditResult {
  vulnerablePackages: string[];
  outdatedPackages: string[];
  suspiciousPackages: string[];
  supplyChainRisks: string;
  recommendations: string[];
  estimatedImpactUSD?: number;
  analyzedAt?: string;
}