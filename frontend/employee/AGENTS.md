<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Employee Portal

## Commands

| Command | Script |
|---------|--------|
| dev | `npm run dev` |
| build | `npm run build` (typechecks + builds) |
| lint | `npm run lint` |

## Stack

Next.js 16 App Router + React 19 + Tailwind CSS v4 (via `@tailwindcss/postcss`) + TypeScript. Separate `package.json` from other apps.

## Features

Employees can:

- View assigned projects
- Manage tasks
- Upload files
- Update project status
- Mark attendance
- Request leave
