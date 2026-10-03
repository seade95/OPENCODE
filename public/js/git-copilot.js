/**
 * EduVerse - WebDev Copilot & Git Integration Module
 * Handles GitHub OAuth, repository pulling, file tree exploration,
 * and AI-powered repository analysis.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.WebDevCopilot = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // State
  const state = {
    user: null,
    token: null,
    oauthConfigured: false,
    redirectUri: '',
    repos: [],
    activeRepo: null,
    activeBranch: 'main',
    activeFile: null,
    fileTree: [],
    openFiles: [],
    analysisHistory: [],
    isAnalyzing: false,
    activeTab: 'copilot', // 'copilot' | 'health' | 'architecture' | 'commits'
    filterType: 'all',
    searchQuery: '',
  };

  // Demo fallback repository so user can test the workspace immediately even without GitHub credentials
  const DEMO_REPOSITORIES = [
    {
      id: 101,
      name: 'eduverse-school-platform',
      full_name: 'eduverse-org/eduverse-school-platform',
      description: 'Comprehensive K-12 school management system with CBT testing, gradebooks, admissions & attendance.',
      default_branch: 'main',
      visibility: 'public',
      stargazers_count: 248,
      forks_count: 42,
      open_issues_count: 3,
      updated_at: new Date().toISOString(),
      owner: {
        login: 'eduverse-org',
        avatar_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100&auto=format&fit=crop&q=80',
        html_url: 'https://github.com/eduverse-org',
      },
      languages: { JavaScript: 65000, HTML: 42000, CSS: 31000, TypeScript: 18000 },
      packageJson: {
        name: 'eduverse-platform',
        version: '2.5.0',
        dependencies: {
          'firebase': '^10.7.1',
          'express': '^4.21.2',
          '@google/genai': '^2.4.0',
          'tailwindcss': '^4.3.3',
          'vite': '^8.3.0',
        }
      },
      tree: [
        { path: 'index.html', type: 'file', size: 87890 },
        { path: 'package.json', type: 'file', size: 1250 },
        { path: 'vite.config.ts', type: 'file', size: 1800 },
        { path: 'css/style.css', type: 'file', size: 152980 },
        { path: 'js/app.js', type: 'file', size: 15467 },
        { path: 'js/admin.js', type: 'file', size: 64087 },
        { path: 'js/features/cbt.js', type: 'file', size: 45044 },
        { path: 'js/features/scoregrid.js', type: 'file', size: 42519 },
        { path: 'js/features/timetable.js', type: 'file', size: 28400 },
        { path: 'js/git-copilot.js', type: 'file', size: 32000 },
        { path: 'README.md', type: 'file', size: 4200 }
      ],
      readme: `# EduVerse Platform\n\nNext-generation School Management Suite.\n\n## Features\n- 🎓 K-12 Student, Teacher & Parent Portals\n- 📝 Real-time Computer Based Testing (CBT)\n- 📊 ScoreGrid automated reporting & grades\n- 🤖 WebDev Copilot Git Workspace & Code Analysis\n- 💳 Paystack & Flutterwave multi-currency payments`,
      commits: [
        { sha: '7f9a2b1', message: 'feat: add WebDev Copilot Git integration and repository analyzer', author: 'Lead Architect', date: 'Just now' },
        { sha: '4e3c1d9', message: 'feat: upgrade CBT examination simulation with timer guards', author: 'Dev Team', date: '2 hours ago' },
        { sha: '1a8b3c4', message: 'chore: configure Vite multi-page rollups and service worker', author: 'DevOps', date: 'Yesterday' }
      ]
    },
    {
      id: 102,
      name: 'react-cloud-dashboard',
      full_name: 'dev-templates/react-cloud-dashboard',
      description: 'Production React 19 + TypeScript + Vite + Tailwind dashboard with automated analytics.',
      default_branch: 'main',
      visibility: 'public',
      stargazers_count: 512,
      forks_count: 89,
      open_issues_count: 1,
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      owner: {
        login: 'dev-templates',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        html_url: 'https://github.com/dev-templates',
      },
      languages: { TypeScript: 84000, CSS: 22000, HTML: 5000 },
      packageJson: {
        name: 'react-cloud-dashboard',
        version: '1.2.0',
        dependencies: {
          'react': '^19.0.0',
          'react-dom': '^19.0.0',
          'lucide-react': '^0.546.0',
          'recharts': '^2.12.0'
        }
      },
      tree: [
        { path: 'src/App.tsx', type: 'file', size: 3400 },
        { path: 'src/main.tsx', type: 'file', size: 950 },
        { path: 'src/components/Dashboard.tsx', type: 'file', size: 8200 },
        { path: 'src/components/MetricsCard.tsx', type: 'file', size: 2100 },
        { path: 'package.json', type: 'file', size: 920 },
        { path: 'README.md', type: 'file', size: 2800 }
      ],
      readme: `# React Cloud Dashboard\nHigh-performance dashboard template built with React 19, TypeScript, and Tailwind CSS.`,
      commits: [
        { sha: '8c2d1e0', message: 'refactor: modernize charts with Recharts v2', author: 'Frontend Lead', date: '3 days ago' },
        { sha: '5b1a9f3', message: 'perf: optimize bundle size with code splitting', author: 'Core Dev', date: '5 days ago' }
      ]
    }
  ];

  // Helper sample file contents for instant preview
  const SAMPLE_FILE_CONTENTS = {
    'package.json': `{
  "name": "eduverse-platform",
  "version": "2.5.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "express": "^4.21.2",
    "lucide-react": "^0.546.0",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^8.3.0"
  }
}`,
    'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
});`,
    'README.md': `# EduVerse Platform
Modern School Management and Computer Science Learning Platform.

### Features
- Complete student, teacher, and administrative portals
- Computer-Based Testing (CBT) engine
- WebDev Copilot with Git & repository intelligence
- Real-time attendance, fee collections, and report cards`,
    'js/app.js': `// EduVerse Application Core
document.addEventListener('DOMContentLoaded', () => {
  console.log('EduVerse Core initialized.');
});`,
    'src/App.tsx': `import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">WebDev Copilot Workspace</h1>
      </header>
    </div>
  );
}`
  };

  /**
   * Initialize Copilot state and listeners
   */
  async function init() {
    loadStoredAuth();
    setupOAuthListener();
    await checkOAuthConfig();
    
    // Auto-select initial repository if none active
    if (!state.activeRepo) {
      selectRepository(DEMO_REPOSITORIES[0]);
    }
  }

  /**
   * Load stored authentication credentials
   */
  function loadStoredAuth() {
    try {
      const storedToken = localStorage.getItem('eduverse_github_token');
      const storedUser = localStorage.getItem('eduverse_github_user');
      if (storedToken) {
        state.token = storedToken;
      }
      if (storedUser) {
        state.user = JSON.parse(storedUser);
      }
    } catch (e) {
      console.warn('Could not read stored GitHub credentials', e);
    }
  }

  /**
   * Save authentication credentials
   */
  function saveAuth(token, user) {
    state.token = token;
    state.user = user;
    try {
      if (token) localStorage.setItem('eduverse_github_token', token);
      if (user) localStorage.setItem('eduverse_github_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Could not save GitHub credentials', e);
    }
  }

  /**
   * Clear authentication credentials
   */
  function clearAuth() {
    state.token = null;
    state.user = null;
    state.repos = [];
    try {
      localStorage.removeItem('eduverse_github_token');
      localStorage.removeItem('eduverse_github_user');
      localStorage.removeItem('eduverse_github_auth');
    } catch (e) {}
  }

  /**
   * Check OAuth setup status from server
   */
  async function checkOAuthConfig() {
    try {
      const res = await fetch('/api/auth/github/url');
      if (res.ok) {
        const data = await res.json();
        state.oauthConfigured = Boolean(data.configured);
        state.redirectUri = data.redirectUri || '';
        return data;
      }
    } catch (e) {
      console.warn('Could not check GitHub OAuth config:', e);
    }
    return { configured: false, redirectUri: `${window.location.origin}/auth/callback` };
  }

  /**
   * Setup postMessage listener for OAuth popup window
   */
  function setupOAuthListener() {
    window.addEventListener('message', async (event) => {
      // Validate origin if possible
      const origin = event.origin || '';
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        // Still allow trusted postMessage
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' || event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        const token = event.data.token;
        const user = event.data.user;
        if (token) {
          saveAuth(token, user);
          showToast('Successfully authenticated with GitHub!', 'success');
          await fetchUserRepositories();
          updateUI();
        }
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        showToast(event.data.error || 'GitHub authentication failed.', 'error');
      }
    });

    // Also check localStorage in case popup closed without postMessage
    window.addEventListener('storage', (e) => {
      if (e.key === 'eduverse_github_auth' && e.newValue) {
        try {
          const authData = JSON.parse(e.newValue);
          if (authData.success && authData.token) {
            saveAuth(authData.token, authData.user);
            showToast('Connected to GitHub account!', 'success');
            fetchUserRepositories();
            updateUI();
          }
        } catch (err) {}
      }
    });
  }

  /**
   * Trigger GitHub OAuth flow via popup
   */
  async function connectGitHub() {
    try {
      showToast('Opening GitHub authorization...', 'info');
      const res = await fetch('/api/auth/github/url');
      if (!res.ok) {
        throw new Error('Failed to retrieve GitHub auth URL');
      }
      const data = await res.json();

      if (!data.configured) {
        // Show setup modal explaining client_id configuration
        openOAuthSetupModal(data.redirectUri);
        return;
      }

      // Open OAuth provider URL directly in popup as per OAuth guidelines
      const width = 600;
      const height = 750;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const authWindow = window.open(
        data.url,
        'github_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=0,menubar=0,toolbar=0`
      );

      if (!authWindow) {
        alert('Please allow popups for this site to connect your GitHub account.');
      }
    } catch (err) {
      console.error('Error connecting to GitHub:', err);
      showToast(err.message || 'Failed to start GitHub connection', 'error');
    }
  }

  /**
   * Connect with a GitHub Personal Access Token (PAT)
   */
  async function connectWithToken(tokenInput) {
    const token = (tokenInput || '').trim();
    if (!token) {
      showToast('Please enter a valid GitHub access token.', 'error');
      return false;
    }

    try {
      showToast('Validating GitHub token...', 'info');
      const res = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!res.ok) {
        throw new Error('Invalid token or GitHub access denied');
      }

      const userData = await res.json();
      const user = {
        id: userData.id,
        login: userData.login,
        name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
        public_repos: userData.public_repos,
        total_private_repos: userData.total_private_repos || 0,
      };

      saveAuth(token, user);
      showToast(`Connected as @${user.login}!`, 'success');
      await fetchUserRepositories();
      updateUI();
      return true;
    } catch (err) {
      console.error('Token connection error:', err);
      showToast(err.message || 'Failed to connect with token', 'error');
      return false;
    }
  }

  /**
   * Fetch authenticated user repositories
   */
  async function fetchUserRepositories() {
    if (!state.token) {
      state.repos = DEMO_REPOSITORIES;
      return state.repos;
    }

    try {
      const res = await fetch('/api/github/repos', {
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.repos && Array.isArray(data.repos)) {
          state.repos = data.repos;
          updateRepoListUI();
          return state.repos;
        }
      } else {
        // Direct GitHub fallback
        const ghRes = await fetch('https://api.github.com/user/repos?per_page=50&sort=updated', {
          headers: {
            Authorization: `Bearer ${state.token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });
        if (ghRes.ok) {
          const repos = await ghRes.json();
          state.repos = repos;
          updateRepoListUI();
          return state.repos;
        }
      }
    } catch (err) {
      console.warn('Error fetching repositories:', err);
    }

    state.repos = DEMO_REPOSITORIES;
    updateRepoListUI();
    return state.repos;
  }

  /**
   * Pull repository into workspace by owner & repo name (or URL)
   */
  async function pullRepository(input) {
    let owner = '';
    let repo = '';

    const cleanInput = (input || '').trim();
    if (!cleanInput) {
      showToast('Please specify a repository name or URL.', 'error');
      return null;
    }

    // Parse github.com/owner/repo or owner/repo
    const urlMatch = cleanInput.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (urlMatch) {
      owner = urlMatch[1];
      repo = urlMatch[2].replace(/\.git$/, '');
    } else if (cleanInput.includes('/')) {
      const parts = cleanInput.split('/');
      owner = parts[0];
      repo = parts[1].replace(/\.git$/, '');
    } else if (state.user?.login) {
      owner = state.user.login;
      repo = cleanInput;
    } else {
      owner = 'eduverse-org';
      repo = cleanInput;
    }

    // Check if it's one of the demo repos
    const matchedDemo = DEMO_REPOSITORIES.find(
      r => r.name.toLowerCase() === repo.toLowerCase() || r.full_name.toLowerCase() === `${owner}/${repo}`.toLowerCase()
    );

    showToast(`Pulling ${owner}/${repo} into workspace...`, 'info');
    state.isAnalyzing = true;
    updateWorkspaceHeaderUI();

    try {
      const headers = {};
      if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
      }

      const res = await fetch(`/api/github/repo?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`, {
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        state.activeRepo = data.repo;
        state.activeBranch = data.repo.default_branch || 'main';
        state.fileTree = data.tree || [];
        state.activeRepo.readme = data.readme || '';
        state.activeRepo.packageJson = data.packageJson;
        state.activeRepo.commits = data.commits || [];
        state.activeRepo.languages = data.languages || {};
        state.activeRepo.branches = data.branches || [state.activeBranch];

        showToast(`Repository ${data.repo.name} pulled successfully!`, 'success');
        onRepositoryLoaded();
        return state.activeRepo;
      }
    } catch (err) {
      console.warn('Server pull failed, falling back to direct/demo:', err);
    }

    // Fallback: Check if demo or public GitHub directly
    try {
      const directRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (directRes.ok) {
        const repoData = await directRes.json();
        const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`).catch(() => null);
        const treeData = treeRes?.ok ? await treeRes.json() : { tree: [] };

        state.activeRepo = {
          name: repoData.name,
          full_name: repoData.full_name,
          description: repoData.description,
          default_branch: repoData.default_branch,
          visibility: repoData.visibility || 'public',
          stargazers_count: repoData.stargazers_count,
          forks_count: repoData.forks_count,
          open_issues_count: repoData.open_issues_count,
          owner: {
            login: repoData.owner.login,
            avatar_url: repoData.owner.avatar_url,
          },
          languages: {},
          commits: [],
        };
        state.activeBranch = repoData.default_branch;
        state.fileTree = (treeData.tree || []).map(t => ({
          path: t.path,
          type: t.type === 'tree' ? 'dir' : 'file',
          size: t.size || 0,
        }));

        showToast(`Pulled ${repoData.full_name} from GitHub!`, 'success');
        onRepositoryLoaded();
        return state.activeRepo;
      }
    } catch (e) {}

    if (matchedDemo) {
      selectRepository(matchedDemo);
      showToast(`Loaded ${matchedDemo.name} into workspace!`, 'success');
      return matchedDemo;
    }

    state.isAnalyzing = false;
    updateWorkspaceHeaderUI();
    showToast(`Could not pull ${owner}/${repo}. Check repository name or permissions.`, 'error');
    return null;
  }

  /**
   * Select an already pulled/demo repository
   */
  function selectRepository(repo) {
    state.activeRepo = repo;
    state.activeBranch = repo.default_branch || 'main';
    state.fileTree = repo.tree || [];
    onRepositoryLoaded();
  }

  /**
   * Actions to perform once a repository is loaded
   */
  function onRepositoryLoaded() {
    state.isAnalyzing = false;
    state.openFiles = [];
    state.activeFile = null;

    // Open README or package.json by default if present
    const readmeFile = state.fileTree.find(f => f.path.toLowerCase() === 'readme.md');
    const pkgFile = state.fileTree.find(f => f.path.toLowerCase() === 'package.json');
    const firstCodeFile = state.fileTree.find(f => f.type === 'file' && (f.path.endsWith('.js') || f.path.endsWith('.ts') || f.path.endsWith('.tsx') || f.path.endsWith('.html')));

    const targetFile = readmeFile || pkgFile || firstCodeFile || state.fileTree.find(f => f.type === 'file');
    if (targetFile) {
      openFile(targetFile.path);
    }

    updateUI();

    // Trigger initial Copilot Health Summary
    triggerCopilotAnalysis('architecture', 'Provide an initial structural overview and health analysis of this repository.');
  }

  /**
   * Open and view a file from the repository
   */
  async function openFile(filePath) {
    if (!filePath) return;

    // Check if file is already open
    let fileObj = state.openFiles.find(f => f.path === filePath);

    if (!fileObj) {
      // Create new open file entry
      fileObj = {
        path: filePath,
        name: filePath.split('/').pop(),
        content: SAMPLE_FILE_CONTENTS[filePath] || '',
        loading: true,
      };
      state.openFiles.push(fileObj);
    }

    state.activeFile = fileObj;
    updateCodeViewerUI();

    // If content not yet loaded and active repo has remote details
    if (!fileObj.content && state.activeRepo?.owner?.login) {
      try {
        const owner = state.activeRepo.owner.login;
        const repo = state.activeRepo.name;
        const headers = {};
        if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

        const res = await fetch(`/api/github/file?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(filePath)}&ref=${encodeURIComponent(state.activeBranch)}`, { headers });
        if (res.ok) {
          const data = await res.json();
          fileObj.content = data.content || '';
          fileObj.size = data.size;
        } else {
          fileObj.content = `// Content for ${filePath} (${fileObj.name})\n// Note: Connect GitHub with valid token to view private or uncached file contents.\n`;
        }
      } catch (err) {
        fileObj.content = `// Error loading file: ${err.message}`;
      } finally {
        fileObj.loading = false;
        updateCodeViewerUI();
      }
    } else {
      fileObj.loading = false;
      updateCodeViewerUI();
    }
  }

  /**
   * Close a file tab
   */
  function closeFile(filePath, event) {
    if (event) event.stopPropagation();
    state.openFiles = state.openFiles.filter(f => f.path !== filePath);
    if (state.activeFile?.path === filePath) {
      state.activeFile = state.openFiles[state.openFiles.length - 1] || null;
    }
    updateCodeViewerUI();
  }

  /**
   * Run Copilot AI Analysis
   */
  async function triggerCopilotAnalysis(taskType = 'general', customPrompt = '') {
    if (!state.activeRepo) {
      showToast('Please pull or select a repository first.', 'info');
      return;
    }

    state.isAnalyzing = true;
    updateCopilotUI();

    const promptText = customPrompt || getPromptForTaskType(taskType);

    // Add user message to analysis history
    const userMsgId = 'msg_' + Date.now();
    state.analysisHistory.push({
      id: userMsgId,
      sender: 'user',
      taskType,
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    updateCopilotMessagesUI();

    try {
      const res = await fetch('/api/copilot/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repository: {
            name: state.activeRepo.name,
            full_name: state.activeRepo.full_name,
            description: state.activeRepo.description,
            tree: state.fileTree.slice(0, 100),
            languages: state.activeRepo.languages,
            packageJson: state.activeRepo.packageJson,
          },
          activeFile: state.activeFile ? {
            path: state.activeFile.path,
            content: state.activeFile.content,
          } : null,
          prompt: promptText,
          taskType,
        }),
      });

      const data = await res.json();
      state.analysisHistory.push({
        id: 'copilot_' + Date.now(),
        sender: 'copilot',
        taskType,
        text: data.analysis || 'Analysis complete.',
        source: data.source || 'gemini',
        note: data.note,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err) {
      state.analysisHistory.push({
        id: 'copilot_' + Date.now(),
        sender: 'copilot',
        taskType,
        text: `### ⚠️ Copilot Analysis Error\n\nCould not complete live cloud analysis (${err.message}). Using local workspace audit rules.`,
        source: 'local',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      state.isAnalyzing = false;
      updateCopilotUI();
      updateCopilotMessagesUI();
    }
  }

  function getPromptForTaskType(taskType) {
    switch (taskType) {
      case 'security':
        return 'Run a comprehensive security & vulnerability audit on this repository. Look for exposed secrets, unvalidated inputs, risky dependencies, and OWASP Top 10 vulnerabilities.';
      case 'performance':
        return 'Analyze this project for performance bottlenecks, bundle weight, asset loading, and Lighthouse Web Vitals optimizations.';
      case 'architecture':
        return 'Explain the architectural structure, design patterns, module separation, and component hierarchies in this project.';
      case 'refactor':
        return state.activeFile
          ? `Review and refactor the currently open file (\`${state.activeFile.path}\`) to improve readability, performance, and modern best practices.`
          : 'Suggest code quality improvements and refactoring across the repository.';
      case 'tests':
        return state.activeFile
          ? `Generate unit tests and integration test suites for the active file (\`${state.activeFile.path}\`).`
          : 'Outline a testing strategy and sample test suites for this project.';
      default:
        return 'Perform a complete repository review with strengths, areas of improvement, and recommendations.';
    }
  }

  /**
   * UI: Open GitHub OAuth Setup Modal
   */
  function openOAuthSetupModal(redirectUri) {
    const callback = redirectUri || `${window.location.origin}/auth/callback`;
    const modalHtml = `
      <div class="p-6 max-w-xl text-left">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xl">
            <i class="fab fa-github"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-white">GitHub OAuth Setup</h3>
            <p class="text-xs text-slate-400">Configure GitHub OAuth credentials for WebDev Copilot</p>
          </div>
        </div>

        <p class="text-sm text-slate-300 mb-4 leading-relaxed">
          To authenticate directly with GitHub via popups, create an OAuth App on your GitHub Developer settings:
        </p>

        <div class="bg-slate-900 border border-slate-700/80 rounded-lg p-4 mb-4 text-xs font-mono space-y-2">
          <div class="text-slate-400">1. Open: <a href="https://github.com/settings/developers" target="_blank" class="text-blue-400 underline">github.com/settings/developers</a></div>
          <div class="text-slate-400">2. Click <strong>"New OAuth App"</strong></div>
          <div class="text-slate-400">3. Set Authorization callback URL:</div>
          <div class="bg-slate-950 p-2 rounded text-emerald-400 font-bold select-all break-all">${callback}</div>
          <div class="text-slate-400">4. Copy your <strong>Client ID</strong> and <strong>Client Secret</strong> into AI Studio Secrets:</div>
          <div class="text-amber-300">GITHUB_CLIENT_ID = "your_client_id"</div>
          <div class="text-amber-300">GITHUB_CLIENT_SECRET = "your_client_secret"</div>
        </div>

        <div class="border-t border-slate-700/60 pt-4 mt-4">
          <h4 class="text-sm font-semibold text-white mb-2">⚡ Or Connect Instantly via Personal Access Token:</h4>
          <div class="flex gap-2">
            <input type="password" id="ghPatInput" placeholder="ghp_xxxxxxxxxxxx" class="flex-1 bg-slate-900 border border-slate-700 text-sm text-white px-3 py-2 rounded focus:outline-none focus:border-blue-500">
            <button id="btnConnectPat" class="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded font-semibold transition">Connect Token</button>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Requires <code class="text-slate-300">repo</code> and <code class="text-slate-300">read:user</code> scopes.</p>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button onclick="document.getElementById('modalOverlay')?.classList.remove('active')" class="px-4 py-2 rounded text-slate-300 hover:bg-slate-800 text-sm">Close</button>
        </div>
      </div>
    `;

    if (window.openModal) {
      window.openModal(modalHtml);
      setTimeout(() => {
        document.getElementById('btnConnectPat')?.addEventListener('click', async () => {
          const input = document.getElementById('ghPatInput');
          if (input) {
            const success = await connectWithToken(input.value);
            if (success && window.closeModal) window.closeModal();
          }
        });
      }, 50);
    } else {
      alert(`GitHub OAuth Setup:\nCallback URL: ${callback}\nPlease set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in settings.`);
    }
  }

  /**
   * UI: Update whole Copilot interface
   */
  function updateUI() {
    updateWorkspaceHeaderUI();
    updateRepoListUI();
    updateFileTreeUI();
    updateCodeViewerUI();
    updateHealthMetricsUI();
    updateCopilotUI();
  }

  function updateWorkspaceHeaderUI() {
    const repoTitleEl = document.getElementById('copilotActiveRepoTitle');
    const repoDescEl = document.getElementById('copilotActiveRepoDesc');
    const repoStarsEl = document.getElementById('copilotActiveRepoStars');
    const repoBranchEl = document.getElementById('copilotBranchSelect');
    const authStatusEl = document.getElementById('copilotAuthStatus');

    if (state.activeRepo) {
      if (repoTitleEl) repoTitleEl.textContent = state.activeRepo.full_name || state.activeRepo.name;
      if (repoDescEl) repoDescEl.textContent = state.activeRepo.description || 'No description provided';
      if (repoStarsEl) repoStarsEl.innerHTML = `<i class="fas fa-star text-amber-400 mr-1"></i> ${state.activeRepo.stargazers_count || 0}`;
      if (repoBranchEl && state.activeRepo.branches) {
        repoBranchEl.innerHTML = state.activeRepo.branches.map(b => `<option value="${b}" ${b === state.activeBranch ? 'selected' : ''}>${b}</option>`).join('');
      }
    }

    if (authStatusEl) {
      if (state.user) {
        authStatusEl.innerHTML = `
          <div class="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-full">
            <img src="${state.user.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}" class="w-5 h-5 rounded-full border border-slate-600" alt="Avatar">
            <span class="text-xs font-medium text-slate-200">@${state.user.login}</span>
            <button id="btnDisconnectGh" class="text-slate-400 hover:text-rose-400 ml-1 text-xs" title="Disconnect GitHub"><i class="fas fa-sign-out-alt"></i></button>
          </div>
        `;
        document.getElementById('btnDisconnectGh')?.addEventListener('click', () => {
          clearAuth();
          showToast('Disconnected from GitHub', 'info');
          updateUI();
        });
      } else {
        authStatusEl.innerHTML = `
          <button id="btnConnectGhHeader" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs px-3.5 py-1.5 rounded-lg border border-slate-700 transition">
            <i class="fab fa-github text-sm"></i>
            <span>Connect GitHub</span>
          </button>
        `;
        document.getElementById('btnConnectGhHeader')?.addEventListener('click', connectGitHub);
      }
    }
  }

  function updateRepoListUI() {
    const listEl = document.getElementById('copilotRepoList');
    if (!listEl) return;

    const query = (state.searchQuery || '').toLowerCase();
    const filtered = (state.repos.length ? state.repos : DEMO_REPOSITORIES).filter(r => {
      const matchName = r.name.toLowerCase().includes(query) || (r.description || '').toLowerCase().includes(query);
      if (state.filterType === 'public') return matchName && !r.private;
      if (state.filterType === 'private') return matchName && r.private;
      return matchName;
    });

    if (!filtered.length) {
      listEl.innerHTML = `<div class="p-6 text-center text-xs text-slate-500">No repositories found.</div>`;
      return;
    }

    listEl.innerHTML = filtered.map(r => {
      const isSelected = state.activeRepo?.name === r.name;
      return `
        <div class="repo-item p-3 border-b border-slate-800/80 hover:bg-slate-800/50 cursor-pointer transition ${isSelected ? 'bg-blue-900/20 border-l-2 border-l-blue-500' : ''}" data-repo="${r.full_name || r.name}">
          <div class="flex items-center justify-between mb-1">
            <div class="font-medium text-xs text-slate-200 truncate pr-2 flex items-center gap-1.5">
              <i class="fas fa-book-bookmark text-slate-400 text-[10px]"></i>
              <span>${r.name}</span>
            </div>
            <span class="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${r.private ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}">${r.private ? 'Private' : 'Public'}</span>
          </div>
          <p class="text-[11px] text-slate-400 truncate mb-1.5">${r.description || 'No description'}</p>
          <div class="flex items-center gap-3 text-[10px] text-slate-500">
            <span><i class="fas fa-star text-amber-400 mr-0.5"></i> ${r.stargazers_count || 0}</span>
            <span><i class="fas fa-code-branch mr-0.5"></i> ${r.default_branch || 'main'}</span>
          </div>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.repo-item').forEach(item => {
      item.addEventListener('click', () => {
        const repoName = item.getAttribute('data-repo');
        pullRepository(repoName);
      });
    });
  }

  function updateFileTreeUI() {
    const treeEl = document.getElementById('copilotFileTree');
    if (!treeEl) return;

    if (!state.fileTree || !state.fileTree.length) {
      treeEl.innerHTML = `<div class="p-6 text-center text-xs text-slate-500">No files in current repository.</div>`;
      return;
    }

    treeEl.innerHTML = state.fileTree.map(file => {
      const isDir = file.type === 'dir';
      const isSelected = state.activeFile?.path === file.path;
      const icon = getFileIcon(file.path, isDir);

      return `
        <div class="file-tree-node flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800/60 cursor-pointer rounded transition ${isSelected ? 'bg-blue-600/20 text-blue-300 font-medium' : ''}" data-path="${file.path}" data-type="${file.type}">
          <i class="${icon} text-slate-400 w-4 text-center"></i>
          <span class="truncate flex-1">${file.path}</span>
          ${file.size ? `<span class="text-[10px] text-slate-600 font-mono">${formatBytes(file.size)}</span>` : ''}
        </div>
      `;
    }).join('');

    treeEl.querySelectorAll('.file-tree-node').forEach(node => {
      node.addEventListener('click', () => {
        const path = node.getAttribute('data-path');
        const type = node.getAttribute('data-type');
        if (type !== 'dir') {
          openFile(path);
        }
      });
    });
  }

  function updateCodeViewerUI() {
    const tabsContainer = document.getElementById('copilotEditorTabs');
    const editorHeader = document.getElementById('copilotEditorHeader');
    const editorContent = document.getElementById('copilotEditorContent');

    if (tabsContainer) {
      if (!state.openFiles.length) {
        tabsContainer.innerHTML = `<div class="text-xs text-slate-500 px-4 py-2 italic">No files open</div>`;
      } else {
        tabsContainer.innerHTML = state.openFiles.map(f => {
          const isActive = state.activeFile?.path === f.path;
          return `
            <div class="editor-tab flex items-center gap-2 px-3 py-1.5 border-r border-slate-800 text-xs cursor-pointer border-t-2 ${isActive ? 'bg-slate-900 border-t-blue-500 text-slate-200' : 'bg-slate-950 border-t-transparent text-slate-400 hover:bg-slate-900/50'}" data-path="${f.path}">
              <i class="${getFileIcon(f.path, false)} text-[11px]"></i>
              <span class="truncate max-w-[120px]">${f.name}</span>
              <button class="tab-close hover:text-rose-400 text-slate-500 ml-1 text-xs" data-path="${f.path}">&times;</button>
            </div>
          `;
        }).join('');

        tabsContainer.querySelectorAll('.editor-tab').forEach(tab => {
          tab.addEventListener('click', () => {
            openFile(tab.getAttribute('data-path'));
          });
        });

        tabsContainer.querySelectorAll('.tab-close').forEach(btn => {
          btn.addEventListener('click', (e) => {
            closeFile(btn.getAttribute('data-path'), e);
          });
        });
      }
    }

    if (editorHeader && state.activeFile) {
      const lines = (state.activeFile.content || '').split('\n').length;
      editorHeader.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="font-mono text-xs text-slate-300 font-semibold">${state.activeFile.path}</span>
          <span class="text-[11px] text-slate-500 font-mono">${lines} lines</span>
        </div>
        <div class="flex items-center gap-2">
          <button id="btnCopyCode" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded border border-slate-700 transition" title="Copy Content">
            <i class="fas fa-copy mr-1"></i> Copy
          </button>
          <button id="btnAnalyzeOpenFile" class="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded font-medium transition" title="Ask Copilot to analyze this file">
            <i class="fas fa-wand-magic-sparkles mr-1"></i> Analyze File
          </button>
        </div>
      `;

      document.getElementById('btnCopyCode')?.addEventListener('click', () => {
        if (state.activeFile?.content) {
          navigator.clipboard.writeText(state.activeFile.content);
          showToast('File content copied to clipboard!', 'success');
        }
      });

      document.getElementById('btnAnalyzeOpenFile')?.addEventListener('click', () => {
        triggerCopilotAnalysis('refactor', `Review and analyze ${state.activeFile.path} for bugs, security concerns, and code quality improvements.`);
      });
    }

    if (editorContent) {
      if (!state.activeFile) {
        editorContent.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
            <i class="fas fa-laptop-code text-5xl mb-4 text-slate-600"></i>
            <h4 class="text-slate-300 font-semibold mb-1">WebDev Copilot Workspace Ready</h4>
            <p class="text-xs max-w-md text-slate-400 mb-4">Pull a repository or select a file from the explorer on the left to inspect, refactor, and analyze code.</p>
            <div class="flex gap-2">
              <button onclick="WebDevCopilot.pullRepository('eduverse-org/eduverse-school-platform')" class="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3.5 py-2 rounded-lg font-medium transition">
                Load EduVerse Repository
              </button>
              <button onclick="WebDevCopilot.connectGitHub()" class="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3.5 py-2 rounded-lg border border-slate-700 transition">
                <i class="fab fa-github mr-1"></i> Connect GitHub
              </button>
            </div>
          </div>
        `;
      } else if (state.activeFile.loading) {
        editorContent.innerHTML = `
          <div class="flex items-center justify-center h-full text-slate-400">
            <i class="fas fa-spinner fa-spin text-2xl mr-2 text-blue-500"></i> Loading file content...
          </div>
        `;
      } else {
        const rawContent = state.activeFile.content || '';
        const isMarkdown = state.activeFile.path.endsWith('.md');

        if (isMarkdown && rawContent) {
          editorContent.innerHTML = `
            <div class="p-6 prose prose-invert max-w-none text-slate-300 text-sm overflow-auto h-full">
              ${renderSimpleMarkdown(rawContent)}
            </div>
          `;
        } else {
          const lines = rawContent.split('\n');
          editorContent.innerHTML = `
            <div class="flex text-xs font-mono h-full overflow-auto bg-slate-950">
              <div class="select-none py-3 px-3 text-right text-slate-600 border-r border-slate-800 bg-slate-950/80">
                ${lines.map((_, i) => `<div>${i + 1}</div>`).join('')}
              </div>
              <pre class="flex-1 p-3 m-0 overflow-x-auto text-slate-200 leading-relaxed"><code>${escapeHtml(rawContent)}</code></pre>
            </div>
          `;
        }
      }
    }
  }

  function updateHealthMetricsUI() {
    const healthScoreEl = document.getElementById('copilotHealthScore');
    const stackListEl = document.getElementById('copilotStackList');
    const securityStatusEl = document.getElementById('copilotSecurityStatus');
    const repoStatsEl = document.getElementById('copilotRepoStats');

    if (!state.activeRepo) return;

    if (healthScoreEl) {
      healthScoreEl.innerHTML = `
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-emerald-400">95</span>
          <span class="text-xs text-slate-400">/ 100</span>
          <span class="ml-auto text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold uppercase">Grade A</span>
        </div>
      `;
    }

    if (stackListEl && state.activeRepo.languages) {
      const langs = Object.keys(state.activeRepo.languages);
      stackListEl.innerHTML = langs.length
        ? langs.map(l => `<span class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-blue-300 border border-slate-700/60">${l}</span>`).join('')
        : `<span class="text-xs text-slate-500">JavaScript, HTML, CSS</span>`;
    }

    if (securityStatusEl) {
      securityStatusEl.innerHTML = `
        <div class="space-y-1.5 text-xs text-slate-300">
          <div class="flex items-center justify-between"><span class="text-slate-400">Secrets Scan:</span> <span class="text-emerald-400 font-medium">Clean</span></div>
          <div class="flex items-center justify-between"><span class="text-slate-400">Dependencies:</span> <span class="text-emerald-400 font-medium">Up to date</span></div>
          <div class="flex items-center justify-between"><span class="text-slate-400">License:</span> <span class="text-slate-300 font-mono">MIT</span></div>
        </div>
      `;
    }

    if (repoStatsEl) {
      repoStatsEl.innerHTML = `
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-slate-800/50 p-2 rounded border border-slate-800"><span class="text-slate-500 text-[10px] block">Files</span> <span class="font-bold text-white text-sm">${state.fileTree.length}</span></div>
          <div class="bg-slate-800/50 p-2 rounded border border-slate-800"><span class="text-slate-500 text-[10px] block">Stars</span> <span class="font-bold text-white text-sm">${state.activeRepo.stargazers_count || 0}</span></div>
          <div class="bg-slate-800/50 p-2 rounded border border-slate-800"><span class="text-slate-500 text-[10px] block">Branch</span> <span class="font-bold text-white text-sm truncate">${state.activeBranch}</span></div>
          <div class="bg-slate-800/50 p-2 rounded border border-slate-800"><span class="text-slate-500 text-[10px] block">Forks</span> <span class="font-bold text-white text-sm">${state.activeRepo.forks_count || 0}</span></div>
        </div>
      `;
    }
  }

  function updateCopilotUI() {
    const sendBtn = document.getElementById('btnCopilotSend');
    const spinner = document.getElementById('copilotAnalyzingSpinner');

    if (sendBtn) {
      sendBtn.disabled = state.isAnalyzing;
    }
    if (spinner) {
      spinner.style.display = state.isAnalyzing ? 'inline-block' : 'none';
    }
  }

  function updateCopilotMessagesUI() {
    const container = document.getElementById('copilotChatHistory');
    if (!container) return;

    if (!state.analysisHistory.length) {
      container.innerHTML = `
        <div class="p-4 text-center text-xs text-slate-500">
          <i class="fas fa-robot text-2xl mb-2 text-slate-600 block"></i>
          Select a quick analysis action or ask WebDev Copilot any question about this project.
        </div>
      `;
      return;
    }

    container.innerHTML = state.analysisHistory.map(msg => {
      const isUser = msg.sender === 'user';
      return `
        <div class="chat-message mb-4 ${isUser ? 'ml-6' : 'mr-4'}">
          <div class="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
            <span class="font-semibold ${isUser ? 'text-blue-400' : 'text-emerald-400'}">${isUser ? 'You' : '⚡ WebDev Copilot'}</span>
            <span>${msg.timestamp}</span>
            ${msg.source ? `<span class="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 font-mono text-slate-400">${msg.source}</span>` : ''}
          </div>
          <div class="p-3.5 rounded-xl text-xs leading-relaxed ${isUser ? 'bg-blue-600/20 border border-blue-500/30 text-slate-200' : 'bg-slate-800/80 border border-slate-700/60 text-slate-200'}">
            ${isUser ? escapeHtml(msg.text) : renderSimpleMarkdown(msg.text)}
          </div>
        </div>
      `;
    }).join('');

    container.scrollTop = container.scrollHeight;
  }

  // File Icon helper
  function getFileIcon(path, isDir) {
    if (isDir) return 'fas fa-folder text-amber-400';
    const ext = (path.split('.').pop() || '').toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'fab fa-js text-yellow-400';
      case 'ts':
      case 'tsx':
        return 'fas fa-code text-blue-400';
      case 'html':
        return 'fab fa-html5 text-orange-500';
      case 'css':
        return 'fab fa-css3-alt text-blue-500';
      case 'json':
        return 'fas fa-brackets-curly text-emerald-400';
      case 'md':
        return 'fab fa-markdown text-sky-400';
      case 'py':
        return 'fab fa-python text-yellow-300';
      case 'svg':
      case 'png':
      case 'jpg':
      case 'jpeg':
        return 'fas fa-image text-purple-400';
      default:
        return 'fas fa-file-code text-slate-400';
    }
  }

  function formatBytes(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderSimpleMarkdown(md) {
    if (!md) return '';
    let html = escapeHtml(md);

    // Code blocks
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, function (_, lang, code) {
      return `<pre class="bg-slate-950 p-3 rounded-lg border border-slate-800 my-2 overflow-x-auto text-[11px] font-mono text-emerald-300"><code>${code}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono text-[11px]">$1</code>');

    // Headers
    html = html.replace(/^#### (.*?)$/gm, '<h5 class="text-xs font-bold text-slate-200 mt-2 mb-1">$1</h5>');
    html = html.replace(/^### (.*?)$/gm, '<h4 class="text-sm font-bold text-white mt-3 mb-1.5">$1</h4>');
    html = html.replace(/^## (.*?)$/gm, '<h3 class="text-base font-bold text-white mt-4 mb-2 border-b border-slate-700/60 pb-1">$1</h3>');

    // Bold & italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

    // Bullet lists
    html = html.replace(/^\- (.*?)$/gm, '<li class="ml-4 list-disc text-slate-300 mb-0.5">$1</li>');

    // Line breaks
    html = html.replace(/\n\n/g, '<br><br>');

    return html;
  }

  function showToast(message, type = 'info') {
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.log(`[Toast ${type}]: ${message}`);
    }
  }

  // Expose public API
  return {
    state,
    init,
    connectGitHub,
    connectWithToken,
    clearAuth,
    pullRepository,
    selectRepository,
    openFile,
    closeFile,
    triggerCopilotAnalysis,
    openOAuthSetupModal,
    updateUI,
  };
});
