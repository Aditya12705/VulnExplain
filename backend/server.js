const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory cache for audit results (use Redis in production)
const auditCache = new Map();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Add request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Helper: Generate cache key from input
function generateCacheKey(input) {
  return crypto.createHash('md5').update(input).digest('hex');
}

// Helper: Get from cache
function getFromCache(key) {
  return auditCache.get(key);
}

// Helper: Set in cache
function setInCache(key, value, ttl = 3600000) { // 1 hour TTL
  auditCache.set(key, value);
  // Auto-clear after TTL
  setTimeout(() => auditCache.delete(key), ttl);
}

// Groq API configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Helper: Calculate realistic financial impact based on security score
function calculateFinancialImpact(riskScore, riskLevel, numVulnerabilities) {
  // Risk score is 0-100, where 100 = safe and 0 = critical
  // Convert to vulnerability score (0 = safe, 100 = critical)
  const vulnerabilityScore = 100 - riskScore;
  
  // Base costs in INR
  const baseCost = 50000; // Minimum for any issue
  
  // Calculate multiplier based on vulnerability score
  let multiplier = 1;
  if (vulnerabilityScore >= 80) multiplier = 15; // Critical: 15x base
  else if (vulnerabilityScore >= 60) multiplier = 8;  // High: 8x base
  else if (vulnerabilityScore >= 40) multiplier = 4;  // Medium: 4x base
  else if (vulnerabilityScore >= 20) multiplier = 2;  // Low: 2x base
  else multiplier = 0.5; // Safe: 0.5x base (minimal)
  
  // Adjust for number of vulnerabilities (diminishing returns)
  const vulnFactor = Math.min(numVulnerabilities, 10); // Cap at 10 vulnerabilities
  const vulnMultiplier = 1 + (vulnFactor * 0.1); // +10% per vulnerability, max +100%
  
  // Calculate final impact
  let impact = baseCost * multiplier * vulnMultiplier;
  
  // For a single code snippet with low risk, keep it realistic
  if (vulnerabilityScore < 30 && numVulnerabilities <= 2) {
    impact = Math.min(impact, 100000); // Cap at 1 lakh for low risk snippets
  }
  
  // Round to nearest 10,000 for clean numbers
  return Math.round(impact / 10000) * 10000;
}

// Helper function to call Groq API
async function callGroqAPI(prompt) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0,
      max_tokens: 2000,
      top_p: 1
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    throw new Error(`Groq API Error: ${error.response?.data?.error?.message || error.message}`);
  }
}


// Helper: Extract GitHub repo URL components
function parseGithubUrl(url) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (match) {
    return { owner: match[1], repo: match[2].replace('.git', '') };
  }
  return null;
}

// Helper: Get repository content from GitHub
async function getRepoContent(owner, repo) {
  try {
    const headers = {};
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Get default branch
    const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    const defaultBranch = repoRes.data.default_branch;

    let content = `# GitHub Repository Security Audit: ${owner}/${repo}\n\n`;
    content += `Default Branch: ${defaultBranch}\n`;
    content += `Repository URL: https://github.com/${owner}/${repo}\n\n`;

    // Get main code files
    const treeRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
    const codeFiles = treeRes.data.tree
      .filter(file => /\.(js|ts|py|java|cpp|c|go|rs|rb|php)$/.test(file.path))
      .slice(0, 10); // Limit to first 10 code files

    content += `## Found ${codeFiles.length} Code Files:\n\n`;

    for (const file of codeFiles) {
      try {
        const fileRes = await axios.get(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${file.path}`);
        content += `### ${file.path}\n\`\`\`\n${fileRes.data.substring(0, 500)}\n...\n\`\`\`\n\n`;
      } catch (e) {
        content += `### ${file.path}\n[Unable to fetch content]\n\n`;
      }
    }

    return content;
  } catch (error) {
    throw new Error(`Failed to fetch GitHub repository: ${error.message}`);
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'VulnExplain Backend - API Server',
    version: '1.0.0',
    healthCheck: 'GET /health',
    endpoints: {
      audit: 'POST /api/audit',
      auditRepo: 'POST /api/audit-repo',
      auditDependencies: 'POST /api/audit-dependencies'
    },
    documentation: 'https://github.com/Aditya12705/VulnExplain'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'VulnExplain Backend', aiProvider: 'Groq (llama-3.3-70b-versatile)' });
});

// POST /api/audit - Audit code snippet
app.post('/api/audit', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Code content cannot be empty' });
    }

    const prompt = `Act as a Senior Security Engineer and SOC 2 Compliance Officer. 
Audit the following code for security risks and respond ONLY with valid JSON.

Tasks:
1. Identify vulnerabilities (OWASP Top 10, CWE).
2. Map findings to SOC 2 Trust Services Criteria.
3. Provide remediation recommendations.

IMPORTANT: Do NOT estimate financial impact - we will calculate it separately based on risk score.

Return ONLY valid JSON in this exact format:
{
  "overallRiskScore": <0-100 where 100=safe 0=critical>,
  "riskLevel": "<Critical|High|Medium|Low|Safe>",
  "soc2Controls": ["<control>", ...],
  "vulnerabilities": [
    {
      "title": "<title>",
      "description": "<description>",
      "severity": "<Critical|High|Medium|Low>",
      "remediation": "<fix>",
      "lineNumber": <number or null>,
      "cweId": "<CWE-ID>",
      "owaspCategory": "<category>"
    }
  ],
  "executiveSummary": "<summary>"
}

Code to audit:
\`\`\`
${code}
\`\`\``;

    const responseText = await callGroqAPI(prompt);
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse audit result as JSON');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    // Calculate realistic financial impact based on risk score
    const numVulnerabilities = (result.vulnerabilities || []).length;
    result.estimatedFinancialImpactINR = calculateFinancialImpact(
      result.overallRiskScore,
      result.riskLevel,
      numVulnerabilities
    );
    
    res.json(result);
  } catch (error) {
    console.error('Audit Error:', error);
    res.status(500).json({ error: error.message || 'Failed to audit code' });
  }
});

// POST /api/audit-repo - Audit GitHub repository
app.post('/api/audit-repo', async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl || !repoUrl.trim()) {
      return res.status(400).json({ error: 'Repository URL cannot be empty' });
    }

    const parsed = parseGithubUrl(repoUrl);
    if (!parsed) {
      return res.status(400).json({ error: 'Invalid GitHub repository URL' });
    }

    // Check cache first
    const cacheKey = generateCacheKey(`repo:${repoUrl}`);
    const cachedResult = getFromCache(cacheKey);
    if (cachedResult) {
      console.log(`[CACHE HIT] Returning cached result for ${repoUrl}`);
      return res.json({ ...cachedResult, cached: true });
    }

    // Fetch repository content
    const repoContent = await getRepoContent(parsed.owner, parsed.repo);

    const prompt = `Act as a Senior Security Engineer and SOC 2 Compliance Officer. 
Perform a comprehensive security audit of the following GitHub repository and respond ONLY with valid JSON.

Tasks:
1. Identify all security vulnerabilities (OWASP Top 10, CWE, dependency issues).
2. Map findings to SOC 2 Trust Services Criteria.
3. Provide a remediation plan.

IMPORTANT: Do NOT estimate financial impact - we will calculate it separately based on risk score.

Return ONLY valid JSON in this format:
{
  "overallRiskScore": <0-100 where 100=safe 0=critical>,
  "riskLevel": "<Critical|High|Medium|Low|Safe>",
  "soc2Controls": ["<control>", ...],
  "vulnerabilities": [
    {
      "title": "<title>",
      "description": "<description>",
      "severity": "<Critical|High|Medium|Low>",
      "remediation": "<fix>",
      "lineNumber": <number or null>,
      "cweId": "<CWE-ID>",
      "owaspCategory": "<category>"
    }
  ],
  "executiveSummary": "<summary>",
  "sourceType": "GitHub Repository",
  "repository": "${repoUrl}"
}

Repository Information:
\`\`\`
${repoContent}
\`\`\``;

    const responseText = await callGroqAPI(prompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse audit result as JSON');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    // Calculate realistic financial impact based on risk score
    const numVulnerabilities = (result.vulnerabilities || []).length;
    result.estimatedFinancialImpactINR = calculateFinancialImpact(
      result.overallRiskScore,
      result.riskLevel,
      numVulnerabilities
    );
    
    // Cache the result
    setInCache(cacheKey, result);
    
    res.json(result);
  } catch (error) {
    console.error('Repository audit error:', error);
    res.status(500).json({ error: error.message || 'Failed to audit repository' });
  }
});

// POST /api/audit-dependencies - Audit npm dependencies
app.post('/api/audit-dependencies', async (req, res) => {
  try {
    const { packageJson } = req.body;

    if (!packageJson) {
      return res.status(400).json({ error: 'Package.json content is required' });
    }

    const prompt = `Act as a Security Expert specializing in dependency and supply chain security.
Analyze the following package.json file for security risks and respond ONLY with valid JSON.

Tasks:
1. Identify dependencies with known vulnerabilities.
2. Flag outdated or unmaintained packages.
3. Check for suspicious packages.
4. Assess supply chain risks.

Return ONLY valid JSON in this format:
{
  "vulnerablePackages": ["<package>", ...],
  "outdatedPackages": ["<package>", ...],
  "suspiciousPackages": ["<package>", ...],
  "supplyChainRisks": "<assessment>",
  "recommendations": ["<recommendation>", ...]
}

Package.json:
\`\`\`
${packageJson}
\`\`\``;

    const responseText = await callGroqAPI(prompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse audit result as JSON');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    res.json(result);
  } catch (error) {
    console.error('Dependency audit error:', error);
    res.status(500).json({ error: error.message || 'Failed to audit dependencies' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`VulnExplain Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Using AI Provider: Groq (llama-3.3-70b-versatile)`);
});
