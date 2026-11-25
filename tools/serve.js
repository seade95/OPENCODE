#!/usr/bin/env node
// Minimal dependency-free static server for local EduVerse development.
// Usage: node tools/serve.js [port]   (default 4173)
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.argv[2]) || 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

function send(res, status, body, type) {
  res.writeHead(status, {
    'Content-Type': type || 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function resolveFile(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0]);
  } catch (e) {
    return null;
  }
  if (decoded.indexOf('\0') !== -1) return null;

  const target = path.resolve(ROOT, '.' + decoded);
  if (target !== ROOT && !target.startsWith(ROOT + path.sep)) return null;

  const candidates = [];
  if (decoded.endsWith('/')) {
    candidates.push(path.join(target, 'index.html'));
  } else {
    candidates.push(target);
    candidates.push(target + '.html');
    candidates.push(path.join(target, 'index.html'));
  }

  for (const candidate of candidates) {
    try {
      const stat = fs.statSync(candidate);
      if (stat.isFile()) return candidate;
    } catch (e) { /* try next */ }
  }
  return null;
}

const server = http.createServer(function(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed');
  }

  const file = resolveFile(req.url || '/');
  if (file) {
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    fs.readFile(file, function(err, buf) {
      if (err) return send(res, 500, 'Internal Server Error');
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : buf);
    });
    return;
  }

  // SPA-style fallback to the landing page for unknown routes.
  fs.readFile(path.join(ROOT, 'index.html'), function(err, buf) {
    if (err) return send(res, 404, 'Not Found');
    res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : buf);
  });
});

server.listen(PORT, '127.0.0.1', function() {
  console.log(`EduVerse dev server running at http://127.0.0.1:${PORT}/`);
});
