import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, type Plugin} from 'vite';
import { handleGitCopilotApi } from './src/server/git-copilot.ts';

function gitCopilotPlugin(): Plugin {
  return {
    name: 'git-copilot-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const handled = await handleGitCopilotApi(req, res);
          if (!handled) {
            next();
          }
        } catch (err) {
          console.error('Git Copilot middleware error:', err);
          next();
        }
      });
    },
  };
}

export default defineConfig(() => {
  const potentialInputs: Record<string, string> = {
    main: path.resolve(__dirname, 'index.html'),
    copilot: path.resolve(__dirname, 'copilot.html'),
    admin: path.resolve(__dirname, 'admin.html'),
    apply: path.resolve(__dirname, 'apply.html'),
    cookiePolicy: path.resolve(__dirname, 'cookie-policy.html'),
    demo: path.resolve(__dirname, 'demo.html'),
    directory: path.resolve(__dirname, 'directory.html'),
    gdprCompliance: path.resolve(__dirname, 'gdpr-compliance.html'),
    login: path.resolve(__dirname, 'login.html'),
    loginAdmin: path.resolve(__dirname, 'login/admin.html'),
    loginAdmission: path.resolve(__dirname, 'login/admission.html'),
    loginParent: path.resolve(__dirname, 'login/parent.html'),
    loginStudent: path.resolve(__dirname, 'login/student.html'),
    loginTeacher: path.resolve(__dirname, 'login/teacher.html'),
    offline: path.resolve(__dirname, 'offline.html'),
    pricing: path.resolve(__dirname, 'pricing.html'),
    privacyPolicy: path.resolve(__dirname, 'privacy-policy.html'),
    schoolDashboard: path.resolve(__dirname, 'school-dashboard.html'),
    schoolPortal: path.resolve(__dirname, 'school-portal.html'),
    superadmin: path.resolve(__dirname, 'superadmin.html'),
    termsOfService: path.resolve(__dirname, 'terms-of-service.html'),
  };

  const input: Record<string, string> = {};
  for (const [key, filePath] of Object.entries(potentialInputs)) {
    if (fs.existsSync(filePath)) {
      input[key] = filePath;
    }
  }

  return {
    plugins: [react(), tailwindcss(), gitCopilotPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'es2020',
      cssMinify: true,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        input,
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
