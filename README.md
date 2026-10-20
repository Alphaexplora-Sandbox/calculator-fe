# calculator-fe

Created by ALPHACI as a React app standalone repository.

This starter already includes source files, package scripts, TypeScript, ESLint, Jest coverage, SonarQube metadata, branch protections, and ALPHACI workflow files that match the selected stack. Use it as the first working baseline, then replace the starter code with your application code.

## Project structure

- `src/App.tsx` contains the starter React component.
- `src/main.tsx` and `index.html` provide the Vite app entrypoint; `npm run build` creates the static `dist/` site for Vercel or the container target.
- When Docker scaffolding is enabled, `Dockerfile` serves the same static build with unprivileged Nginx. The ALPHACI pipeline builds and publishes that image when an environment deploys to an on-prem host.
- Commit the `package-lock.json` created by `npm install` so container builds use the same dependency tree.
- `tests/unit/App.spec.tsx` renders the component with `react-dom/server`.

## Branch strategy

| Branch  | Purpose |
|---------|---------|
| main    | Production - pull request required |
| uat     | Integration and test - pull request required |
| dev     | Development integration - pull request required |

Nobody pushes to `dev`, `uat` or `main` directly: open a pull request from a feature branch into `dev`, and promote `dev` to `uat` with a pull request. `main` is reached only through the QA-approved merge in ALPHACI.

## CI/CD

Workflow files live in `.github/workflows/`. The CI pipeline runs on `dev`, `uat` and `main` and on pull requests into them. Open a pull request into `dev` to trigger your first run.

## Getting started

```bash
npm install
npm run lint
npm test
npm run build
```

Create a feature branch, open a pull request into `dev`, and let ALPHACI promote green changes through `uat` to `main`.