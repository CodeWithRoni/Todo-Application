# Taskflow — Modern Todo Application

A responsive, local-first task manager built with React 19 and Vite. No account or server is needed.

## Features

- Premium dashboard, mobile-first layout, light and dark themes
- Add, edit, complete, delete and clear completed tasks
- Priorities (low, medium, high), optional due dates, overdue labels
- Search, filters (all, active, completed, due today, high priority) and sorting
- Completion statistics and progress indicator
- Device-local persistence using localStorage
- Accessible labels, semantic controls, keyboard navigation and reduced-motion support
- GitHub Actions CI and automatic GitHub Pages deployments

## Run locally

Requires Node.js 22 or later.

\`\`\`bash
npm ci
npm run dev
\`\`\`

## Quality checks

\`\`\`bash
npm run lint
npm test
npm run build
\`\`\`

## Deployment

**Live URL:** https://codewithroni.github.io/Todo-Application/

Every push to \`main\` triggers the **Deploy Taskflow to GitHub Pages** workflow. The workflow builds with Vite's \`pages\` mode to apply the correct \`/Todo-Application/\` asset base.

**One-time repository setting:** Settings → Pages → Build and deployment → Source → **GitHub Actions**. The repository owner must enable Pages if it is not already enabled.

## Privacy

Tasks are stored in your current browser's localStorage. They are not synchronized between devices and will disappear if you clear site storage. This is not a cloud backup service.

## Technology

React 19 · Vite 7 · react-icons · CSS · Node.js built-in test runner

GitHub Pages is deployed automatically after each push to `main` once Pages is enabled under repository settings.
