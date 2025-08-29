# 🤝 Contributing to VCell AI Platform

Thank you for your interest in contributing to the **VCell AI Platform**!
This guide will walk you through setting up the project, making changes, and opening a pull request (PR).

---

## Getting Started

### Prerequisites

Make sure you have these installed before contributing:

* **Docker and Docker Compose** (for running the full stack)
* **Node.js 18+** (for frontend development)
* **Python 3.12+** (for backend development)
* **Git** (for version control)

---

## Contribution Workflow

### 1. Fork the Repository

* Go to [VCell-AI](https://github.com/virtualcell/VCell-AI)
* Click **Fork** (top-right) to create your copy of the repo

### 2. Clone Your Fork

```bash
git clone https://github.com/<your-username>/VCell-AI.git
cd VCell-AI
```

### 3. Add the Upstream Remote

This lets you keep your fork up to date with the main project:

```bash
git remote add upstream https://github.com/virtualcell/VCell-AI.git
```

### 4. Create a Feature Branch

Always create a branch from `main`:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 5. Make Your Changes

Follow coding standards and test your changes locally.

### 6. Commit Your Changes

Use **conventional commits**:

```bash
git commit -m "feat: add new search filter functionality"
git commit -m "fix: resolve authentication token validation issue"
git commit -m "docs: update API endpoint documentation"
```

### 7. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 8. Open a Pull Request

1. Go to your fork on GitHub
2. You’ll see a **Compare & pull request** button — click it
3. Choose the base branch: `virtualcell/VCell-AI:main`
4. Fill in a clear PR description (what, why, how)
5. Submit your PR

---

## Development Setup

Check the Local setup guide: [SETUP.md](https://github.com/virtualcell/VCell-AI/blob/main/SETUP.md)

## Contribution Types

We welcome contributions in many forms:

* **Bug fixes** – improve stability
* **Features** – add new functionality
* **Docs** – improve documentation & examples
* **UI/UX** – enhance usability and design
* **Tests** – expand test coverage

---

## Guidelines

* Keep PRs **focused and small**
* Run tests before submitting
* Discuss major changes in an issue before starting
* Use clear commit messages and PR descriptions

---

🙌 Thank you for contributing to **VCell AI Platform**!
Your efforts help make this project better for the entire scientific community.
