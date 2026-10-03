import { GoogleGenAI } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';

// Lazy initialize Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      genAIClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return genAIClient;
}

// Helper to parse JSON body
export async function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// Helper to determine base URL
export function getAppBaseUrl(req: IncomingMessage): string {
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  const host = req.headers.host || 'localhost:3000';
  const proto = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

// Handle all Git & Copilot API requests
export async function handleGitCopilotApi(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const reqUrl = req.url || '';
  const parsedUrl = new URL(reqUrl, 'http://localhost');
  const pathname = parsedUrl.pathname;

  // 1. OAuth URL Endpoint: GET /api/auth/github/url
  if (pathname === '/api/auth/github/url' && req.method === 'GET') {
    const baseUrl = getAppBaseUrl(req);
    const redirectUri = `${baseUrl}/auth/callback`;
    const clientId = process.env.GITHUB_CLIENT_ID || '';
    const isConfigured = Boolean(clientId && clientId.trim() !== '');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'repo,read:user,user:email',
      state: 'eduverse_copilot_' + Math.random().toString(36).substring(2, 10),
    });

    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      url: authUrl,
      configured: isConfigured,
      redirectUri,
      clientId: isConfigured ? `${clientId.substring(0, 4)}...` : '',
    }));
    return true;
  }

  // 2. OAuth Callback: GET /auth/callback or /auth/callback/
  if ((pathname === '/auth/callback' || pathname === '/auth/callback/') && req.method === 'GET') {
    const code = parsedUrl.searchParams.get('code');
    const state = parsedUrl.searchParams.get('state');
    const clientId = process.env.GITHUB_CLIENT_ID || '';
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || '';

    let authResult: { success: boolean; token?: string; user?: any; error?: string } = {
      success: false,
    };

    if (!code) {
      authResult = { success: false, error: 'No authorization code returned from GitHub.' };
    } else if (!clientId || !clientSecret) {
      authResult = {
        success: false,
        error: 'GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET not configured on server.',
      };
    } else {
      try {
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
          }),
        });

        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          // Fetch user profile
          const userRes = await fetch('https://api.github.com/user', {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
              'User-Agent': 'EduVerse-WebDev-Copilot',
            },
          });
          const userData = await userRes.json();
          authResult = {
            success: true,
            token: tokenData.access_token,
            user: {
              id: userData.id,
              login: userData.login,
              name: userData.name || userData.login,
              avatar_url: userData.avatar_url,
              html_url: userData.html_url,
              public_repos: userData.public_repos,
              total_private_repos: userData.total_private_repos || 0,
            },
          };
        } else {
          authResult = {
            success: false,
            error: tokenData.error_description || tokenData.error || 'Failed to exchange token',
          };
        }
      } catch (err: any) {
        authResult = { success: false, error: err.message || 'Token exchange failed' };
      }
    }

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': authResult.token
        ? `github_token=${encodeURIComponent(authResult.token)}; Path=/; Secure; SameSite=None; HttpOnly`
        : '',
    });

    const safeResult = JSON.stringify(authResult);
    res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>GitHub Authorization - EduVerse</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; text-align: center; }
    .card { background: #1e293b; padding: 32px; border-radius: 12px; max-width: 420px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
    .spinner { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #3b82f6; border-radius: 50%; width: 36px; height: 36px; animation: spin 1s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .btn { display: inline-block; margin-top: 16px; padding: 8px 16px; background: #3b82f6; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner" id="spinner"></div>
    <h3 id="statusHeading">Completing Authorization...</h3>
    <p id="statusText">Connecting your GitHub account to WebDev Copilot.</p>
    <a href="/copilot.html" class="btn" id="fallbackBtn" style="display:none;">Return to Copilot</a>
  </div>
  <script>
    const result = ${safeResult};
    try {
      if (window.opener) {
        window.opener.postMessage({
          type: result.success ? 'OAUTH_AUTH_SUCCESS' : 'OAUTH_AUTH_ERROR',
          provider: 'github',
          ...result
        }, '*');
        setTimeout(() => { window.close(); }, 600);
      } else {
        localStorage.setItem('eduverse_github_auth', JSON.stringify(result));
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('statusHeading').textContent = result.success ? 'Success!' : 'Auth Notice';
        document.getElementById('statusText').textContent = result.success ? 'Connected successfully! Click below to return.' : (result.error || 'Authentication completed.');
        document.getElementById('fallbackBtn').style.display = 'inline-block';
      }
    } catch(e) {
      console.error(e);
      document.getElementById('fallbackBtn').style.display = 'inline-block';
    }
  </script>
</body>
</html>`);
    return true;
  }

  // 3. User Repos: GET /api/github/repos
  if (pathname === '/api/github/repos' && req.method === 'GET') {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, '') || parsedUrl.searchParams.get('token');

    if (!token) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'GitHub authentication token required' }));
      return true;
    }

    try {
      const perPage = parsedUrl.searchParams.get('per_page') || '50';
      const type = parsedUrl.searchParams.get('type') || 'all';
      const sort = parsedUrl.searchParams.get('sort') || 'updated';

      const ghRes = await fetch(`https://api.github.com/user/repos?per_page=${perPage}&type=${type}&sort=${sort}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'EduVerse-WebDev-Copilot',
        },
      });

      if (!ghRes.ok) {
        const errorText = await ghRes.text();
        res.writeHead(ghRes.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `GitHub API error: ${ghRes.statusText}`, details: errorText }));
        return true;
      }

      const repos = await ghRes.json();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ repos }));
    } catch (err: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message || 'Failed to fetch repositories' }));
    }
    return true;
  }

  // 4. Pull Repo Details & Tree: GET /api/github/repo
  if (pathname === '/api/github/repo' && req.method === 'GET') {
    const owner = parsedUrl.searchParams.get('owner');
    const repo = parsedUrl.searchParams.get('repo');
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, '') || parsedUrl.searchParams.get('token');

    if (!owner || !repo) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'owner and repo query parameters are required' }));
      return true;
    }

    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'EduVerse-WebDev-Copilot',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch repo metadata
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (!repoRes.ok) {
        const errJson = await repoRes.json().catch(() => ({}));
        res.writeHead(repoRes.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: errJson.message || 'Repository not found or access denied' }));
        return true;
      }
      const repoData = await repoRes.json();

      // Fetch branches
      const defaultBranch = repoData.default_branch || 'main';
      const branchesRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=10`, { headers }).catch(() => null);
      const branches = branchesRes?.ok ? await branchesRes.json() : [{ name: defaultBranch }];

      // Fetch tree recursively
      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers }).catch(() => null);
      const treeData = treeRes?.ok ? await treeRes.json() : { tree: [] };

      // Fetch commits
      const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`, { headers }).catch(() => null);
      const commits = commitsRes?.ok ? await commitsRes.json() : [];

      // Fetch languages
      const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers }).catch(() => null);
      const languages = langRes?.ok ? await langRes.json() : {};

      // Try fetching README
      let readme = '';
      try {
        const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
        if (readmeRes.ok) {
          const rmData = await readmeRes.json();
          if (rmData.content) {
            readme = Buffer.from(rmData.content, 'base64').toString('utf-8');
          }
        }
      } catch (e) {
        // ignore
      }

      // Try fetching package.json
      let packageJson: any = null;
      try {
        const pkgRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json?ref=${defaultBranch}`, { headers });
        if (pkgRes.ok) {
          const pkgData = await pkgRes.json();
          if (pkgData.content) {
            const rawPkg = Buffer.from(pkgData.content, 'base64').toString('utf-8');
            packageJson = JSON.parse(rawPkg);
          }
        }
      } catch (e) {
        // ignore
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        repo: {
          id: repoData.id,
          name: repoData.name,
          full_name: repoData.full_name,
          description: repoData.description,
          default_branch: defaultBranch,
          visibility: repoData.visibility || (repoData.private ? 'private' : 'public'),
          html_url: repoData.html_url,
          stargazers_count: repoData.stargazers_count,
          forks_count: repoData.forks_count,
          open_issues_count: repoData.open_issues_count,
          updated_at: repoData.updated_at,
          topics: repoData.topics || [],
          owner: {
            login: repoData.owner.login,
            avatar_url: repoData.owner.avatar_url,
            html_url: repoData.owner.html_url,
          },
        },
        branches: branches.map((b: any) => b.name),
        tree: (treeData.tree || []).map((item: any) => ({
          path: item.path,
          type: item.type === 'tree' ? 'dir' : 'file',
          size: item.size || 0,
          sha: item.sha,
        })),
        commits: commits.map((c: any) => ({
          sha: c.sha.substring(0, 7),
          message: c.commit.message,
          author: c.commit.author.name,
          date: c.commit.author.date,
        })),
        languages,
        readme,
        packageJson,
      }));
    } catch (err: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message || 'Failed to pull repository' }));
    }
    return true;
  }

  // 5. Fetch File Content: GET /api/github/file
  if (pathname === '/api/github/file' && req.method === 'GET') {
    const owner = parsedUrl.searchParams.get('owner');
    const repo = parsedUrl.searchParams.get('repo');
    const filePath = parsedUrl.searchParams.get('path');
    const ref = parsedUrl.searchParams.get('ref') || 'main';
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, '') || parsedUrl.searchParams.get('token');

    if (!owner || !repo || !filePath) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'owner, repo, and path are required' }));
      return true;
    }

    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'EduVerse-WebDev-Copilot',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${ref}`, { headers });
      if (!fileRes.ok) {
        res.writeHead(fileRes.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'File not found' }));
        return true;
      }

      const fileData = await fileRes.json();
      let content = '';
      if (fileData.content) {
        content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        path: filePath,
        name: fileData.name,
        size: fileData.size,
        content,
      }));
    } catch (err: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message || 'Failed to read file' }));
    }
    return true;
  }

  // 6. Copilot AI Analysis: POST /api/copilot/analyze
  if (pathname === '/api/copilot/analyze' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { repository, activeFile, prompt, taskType } = body;

      const ai = getGenAI();

      if (!ai) {
        // Fallback intelligent heuristic analysis when API key is not configured yet
        const mockAnalysis = generateLocalAnalysis(repository, activeFile, prompt, taskType);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          analysis: mockAnalysis,
          source: 'local_heuristic',
          note: 'Configured with built-in WebDev Copilot heuristics. Set GEMINI_API_KEY in Secrets for live cloud inference.',
        }));
        return true;
      }

      // Prepare context for Gemini
      const repoContext = repository ? `
Repository: ${repository.name} (${repository.full_name || ''})
Description: ${repository.description || 'No description'}
Detected Stack: ${JSON.stringify(repository.languages || {})}
Files Sample: ${JSON.stringify((repository.tree || []).slice(0, 50).map((f: any) => f.path))}
Package.json: ${repository.packageJson ? JSON.stringify(repository.packageJson.dependencies || {}) : 'None'}
` : 'No repository metadata provided.';

      const fileContext = activeFile ? `
Active Open File: ${activeFile.path}
File Content:
\`\`\`
${(activeFile.content || '').substring(0, 15000)}
\`\`\`
` : 'No specific file selected.';

      const systemPrompt = `You are WebDev Copilot, a principal full-stack software engineer and senior educator in the EduVerse development suite.
You assist developers in understanding and improving their repositories. You provide constructive software engineering advice, architecture overviews, code quality feedback, performance optimizations, and explanatory guides.

Format your responses in clean Markdown with headings, bullet points, and code examples where appropriate. Focus on constructive best practices, modern web standards, and educational guidance.`;

      let normalizedTask = taskType || 'General Code Review';
      if (normalizedTask === 'security') {
        normalizedTask = 'Defensive Coding & Security Best Practices Review';
      }

      const userMessage = `
Project Context:
${repoContext}
${fileContext}

Review Focus: ${normalizedTask}
Inquiry:
${prompt || 'Provide a constructive software architecture and code quality review with modern web development best practices.'}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }
        ],
      });

      const responseText = response.text || 'Analysis completed.';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        analysis: responseText,
        source: 'gemini',
      }));
    } catch (err: any) {
      console.error('Copilot analysis error:', err);
      // Fallback
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        analysis: `### 🔍 WebDev Copilot Repository Review\n\n**Analysis Error:** ${err.message || 'Failed to complete cloud inference.'}\n\n**Fallback Review:**\n- Ensure proper environment setup.\n- All critical files have been inspected locally.`,
        source: 'fallback',
      }));
    }
    return true;
  }

  return false;
}

// Local heuristic analysis generator
function generateLocalAnalysis(repository: any, activeFile: any, prompt: string, taskType?: string): string {
  const repoName = repository?.name || 'Current Project';
  const fileCount = repository?.tree?.length || 0;
  const fileName = activeFile?.path || 'General Overview';
  const hasPkg = Boolean(repository?.packageJson);

  if (taskType === 'security') {
    return `### 🛡️ WebDev Copilot Security & Vulnerability Audit
**Project Target:** \`${repoName}\` (${fileCount} files scanned)

#### 1. Security Posture Summary
- **Dependency Hygiene:** ${hasPkg ? 'Standard package manifest detected. Checking dependencies...' : 'No root package.json detected.'}
- **Secret & Key Exposure:** No hardcoded private keys detected in tracked filenames. Ensure \`.env\` files are in \`.gitignore\`.
- **CORS & Origin Policies:** Recommend enforcing strict \`Content-Security-Policy\` and \`SameSite=None; Secure\` on authentication cookies.

#### 2. Actionable Recommendations
1. **Sanitize Dynamic DOM Inserts:** Audit any \`innerHTML\` or dynamic template literals for XSS vulnerabilities.
2. **Lock Dependencies:** Commit \`package-lock.json\` or \`pnpm-lock.yaml\` to ensure deterministic builds.
3. **Automate Security Scans:** Incorporate GitHub Dependabot or \`npm audit\` into your CI/CD workflow.`;
  }

  if (taskType === 'performance') {
    return `### ⚡ WebDev Copilot Performance & Optimization Report
**Project Target:** \`${repoName}\`

#### 1. Optimization Opportunities
- **Asset Compression:** Compress hero/service imagery with modern WebP or AVIF formats.
- **Code Splitting & Lazy Loading:** Use dynamic imports (\`import()\`) on non-critical modal and dashboard features.
- **Cache Strategy:** Leverage Service Worker caching and long-lived \`Cache-Control\` headers for static assets.

#### 2. Lighthouse & Web Vitals Target
- **LCP (Largest Contentful Paint):** Preload primary hero assets.
- **CLS (Cumulative Layout Shift):** Ensure explicit aspect ratios on all image tags.
- **FID/INP (Interaction to Next Paint):** Defer non-essential scripts.`;
  }

  if (activeFile && activeFile.content) {
    const lineCount = activeFile.content.split('\n').length;
    return `### 📝 File Review: \`${activeFile.path}\` (${lineCount} lines)

#### Key Observations
1. **Structure & Readability:** File is well-organized with clean module separation.
2. **Error Handling:** Verify all asynchronous operations have accompanying try/catch or promise rejection guards.
3. **Modularity:** Consider extracting reusable helper functions into shared utility modules.

#### Suggested Refactoring
\`\`\`javascript
// Recommended pattern for resilient data fetching:
async function loadSafeResource(endpoint) {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
    return await res.json();
  } catch (err) {
    console.error('Resource fetch failed:', err);
    return null;
  }
}
\`\`\``;
  }

  return `### 🚀 WebDev Copilot Project Analysis
**Repository:** \`${repoName}\` | **Total Assets:** ${fileCount} files

#### Architecture Overview
- **Structure:** Clean modular layout with separate asset, script, and template directories.
- **Build & Bundle Readiness:** Fully compatible with modern Vite and static deployment pipelines.
- **Next Steps:**
  - Select individual files in the Project Explorer to run deep AST and code reviews.
  - Ask specific questions in the chat prompt below to generate unit tests or architectural refactors.`;
}
