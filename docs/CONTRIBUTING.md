# Contributing to knowDev AI

Thank you for your interest in contributing to **knowDev AI**! We welcome bug reports, feature requests, documentation additions, and codebase contributions.

---

## 1. Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](file:///c:/Users/STAR/Documents/CodeEngine/CODE_OF_CONDUCT.md). Please read it before contributing.

---

## 2. Getting Started

1. **Fork the Repository**: Create a personal copy of the codebase on GitHub.
2. **Clone Locally**:
   ```bash
   git clone https://github.com/your-username/knowdev-ai.git
   cd knowdev-ai
   ```
3. **Configure Upstream Remote**:
   ```bash
   git remote add upstream https://github.com/username/knowdev-ai.git
   ```
4. **Create a Development Branch**:
   Ensure you create branches off the `develop` (or `main`) branch following a semantic naming convention:
   * `feat/your-feature-name` (new features)
   * `fix/bug-fix-description` (bug fixes)
   * `docs/documentation-additions` (docs updates)

---

## 3. Coding Guidelines & Styles

To maintain code readability and prevent linting failures in CI/CD, verify that your code adheres to:

### 3.1. Python (Backend)
* **Formatting**: Python files must be styled using **Black** format, and checked with **Flake8** or **Ruff**.
* **Type Hints**: Explicit type signatures should be provided on all function parameters and return types.
* **Docstrings**: Adhere to PEP-257 docstring conventions for API routes and services.

### 3.2. TypeScript/React (Frontend)
* **Formatting**: Format TSX/TypeScript files using ESLint.
* **Typing**: Avoid using `any` type annotations unless absolutely necessary.
* **Reusability**: Build UI components using React hooks and modular modular layout structures.

---

## 4. Submitting a Pull Request (PR)

Before proposing code changes:

1. **Run Unit Tests**: Confirm that all tests pass:
   * Backend: `cd backend && pytest`
   * Frontend: `cd frontend && npm run test`
2. **Run Lints & Types checks**:
   * Frontend compile: `cd frontend && npm run build`
   * Backend syntax: `cd backend && flake8`
3. **Write Detailed PR Descriptions**: Use the provided [Pull Request Template](file:///c:/Users/STAR/Documents/CodeEngine/.github/pull_request_template.md) to detail your changes.
4. **Link Issues**: Reference any resolved issues (e.g. `Closes #12`).
5. **Request Code Reviews**: Ensure at least one maintainer approves your PR before merging.
