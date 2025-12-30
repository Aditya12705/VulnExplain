/// <reference types="vite/client" />

import { AuditResult } from "../types";

// Backend API URL (set via environment variable)
const BACKEND_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Audit code using backend service (API key stays on backend only)
export const auditCode = async (code: string): Promise<AuditResult> => {
  if (!code.trim()) {
    throw new Error("Code cannot be empty");
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/api/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend error: ${response.statusText}`);
    }

    const result = await response.json();
    return result as AuditResult;
  } catch (error: any) {
    console.error("Code Audit Error:", error);
    
    // If backend is not available, suggest running it
    if (error.message.includes('Failed to fetch') || error.message.includes('ERR_FAILED')) {
      throw new Error('Backend service is not running. Please start it with: npm run dev (in backend directory)');
    }
    
    throw new Error(error.message || "Failed to audit code. Please try again.");
  }
};

// Audit repository using backend service
export const auditRepository = async (repoUrl: string): Promise<AuditResult> => {
  if (!repoUrl.trim()) {
    throw new Error("Repository URL cannot be empty");
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/api/audit-repo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ repoUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Backend error: ${response.statusText}`);
    }

    const result = await response.json();
    return result as AuditResult;
  } catch (error: any) {
    console.error("Repository Audit Error:", error);
    
    // If backend is not available, suggest running it
    if (error.message.includes('Failed to fetch') || error.message.includes('ERR_FAILED')) {
      throw new Error('Backend service is not running. Please start it with: npm run dev (in backend directory)');
    }
    
    throw new Error(error.message || "Failed to audit repository. Please try again.");
  }
};

// Audit dependencies from package.json
export const auditDependencies = async (packageJson: string): Promise<any> => {
  if (!packageJson.trim()) {
    throw new Error("Package.json content cannot be empty");
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/api/audit-dependencies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ packageJson }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Backend error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Dependency Audit Error:", error);
    throw new Error(error.message || "Failed to audit dependencies.");
  }
};
