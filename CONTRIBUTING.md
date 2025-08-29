# Contributing to VCell AI Platform

Thank you for your interest in contributing to the VCell AI Platform! This document provides guidelines and information for contributors to help make the contribution process smooth and effective.

## Getting Started

### Prerequisites
- **Docker and Docker Compose** (for running the full stack)
- **Node.js 18+** (for frontend development)
- **Python 3.12+** (for backend development)
- **Git** (for version control)

### Quick Setup
1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/VCell-AI.git
   cd VCell-AI
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Frontend
   cp frontend/.env.example frontend/.env.local
   ```

3. **Start with Docker (recommended for first-time contributors)**
   ```bash
   docker compose up --build -d
   ```

## Project Structure

The VCell AI Platform is a monolithic repository with the following structure:

```
VCell-AI/
├── frontend/               # Next.js frontend application
│   ├── app/               # App router pages and components
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and configurations
│   └── styles/           # Global styles and CSS
├── backend/              # FastAPI backend application
│   ├── app/              # Main application code
│   │   ├── routes/       # API route definitions
│   │   ├── controllers/  # Business logic controllers
│   │   ├── services/     # External service integrations
│   │   ├── schemas/      # Pydantic data models
│   │   └── utils/        # Utility functions
│   └── tests/            # Backend test suite
└── docker-compose.yml    # Multi-service container orchestration
```

## Development Setup

### Backend Development

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install Python dependencies**
   ```bash
   poetry install --no-root
   ```

3. **Start development server**
   ```bash
   poetry run uvicorn app.main:app --reload
   ```

4. **Access API documentation**
   - Swagger UI: http://localhost:8000/docs
   - OpenAPI schema: http://localhost:8000/openapi.json

### Frontend Development

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to http://localhost:3000

## Contributing Guidelines

### Before You Start

1. **Check existing issues** - Look for open issues that match your interests
2. **Discuss major changes** - Open an issue to discuss significant features or changes
3. **Check the roadmap** - Ensure your contribution aligns with project goals

### Types of Contributions

We welcome various types of contributions:

- 🐛 **Bug fixes** - Help squash bugs and improve stability
- ✨ **New features** - Add new functionality to the platform
- 📚 **Documentation** - Improve docs, add examples, or fix typos
- 🎨 **UI/UX improvements** - Enhance the user interface and experience
- 🧪 **Tests** - Add or improve test coverage
- 🔧 **Infrastructure** - Improve build processes, CI/CD, or deployment
- 📖 **Examples** - Create tutorials or example implementations

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes** - Follow the coding standards below

3. **Test your changes** - Ensure all tests pass and new functionality works

4. **Commit your changes** - Use conventional commit format
   ```bash
   git commit -m "feat: add new search filter functionality"
   git commit -m "fix: resolve authentication token validation issue"
   git commit -m "docs: update API endpoint documentation"
   ```

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Standards

### General Principles

- **Readability** - Write code that's easy to understand and maintain
- **Consistency** - Follow existing patterns and conventions
- **Documentation** - Document complex logic and public APIs
- **Error handling** - Implement proper error handling and validation

### Backend (Python/FastAPI)

- **Python 3.12+** - Use modern Python features and type hints
- **Pydantic** - Use Pydantic models for data validation
- **Async/await** - Prefer async operations for I/O-bound tasks
- **Type hints** - Include type annotations for all functions and variables
- **Docstrings** - Use Google-style docstrings for public functions

```python
from typing import List, Optional
from pydantic import BaseModel

class BiomodelResponse(BaseModel):
    """Response model for biomodel data."""
    id: str
    name: str
    description: Optional[str] = None
    simulations: List[str] = []

async def get_biomodel(biomodel_id: str) -> Optional[BiomodelResponse]:
    """Retrieve a biomodel by ID.
    
    Args:
        biomodel_id: The unique identifier for the biomodel
        
    Returns:
        BiomodelResponse if found, None otherwise
    """
    # Implementation here
    pass
```

### Frontend (TypeScript/React)

- **TypeScript** - Use strict TypeScript with proper type definitions
- **React Hooks** - Prefer functional components with hooks
- **Component structure** - Follow the established component patterns
- **State management** - Use appropriate state management patterns
- **Accessibility** - Ensure components are accessible

```typescript
interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
}

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onSendMessage,
  isLoading = false
}) => {
  // Component implementation
};
```

### Styling

- **Tailwind CSS** - Use Tailwind utility classes for styling
- **Component consistency** - Follow the established design system
- **Responsive design** - Ensure components work on all screen sizes
- **Dark mode** - Support both light and dark themes

## Testing

### Backend Testing

- **Pytest** - Use pytest for all backend tests
- **Async testing** - Use pytest-asyncio for async function testing
- **Test coverage** - Aim for high test coverage on new features
- **Mocking** - Mock external dependencies appropriately

```bash
# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=app

# Run specific test file
poetry run pytest tests/test_biomodel.py
```

### Frontend Testing

- **Component testing** - Test React components in isolation
- **Integration testing** - Test component interactions
- **Accessibility testing** - Ensure components meet accessibility standards

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Submitting Changes

### Pull Request Guidelines

1. **Title** - Use a clear, descriptive title
2. **Description** - Explain what the PR does and why it's needed
3. **Related issues** - Link to any related issues
4. **Screenshots** - Include screenshots for UI changes
5. **Testing** - Describe how you tested the changes

### Pull Request Template

```markdown
## Description
Brief description of what this PR accomplishes.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have tested this change locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] All existing tests pass

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

## Issue Reporting

### Before Creating an Issue

1. **Search existing issues** - Check if your problem has already been reported
2. **Check documentation** - Ensure the issue isn't covered in the docs
3. **Reproduce the issue** - Make sure you can consistently reproduce the problem

### Issue Template

```markdown
## Bug Description
A clear and concise description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
A clear and concise description of what you expected to happen.

## Actual Behavior
A clear and concise description of what actually happened.

## Environment
- OS: [e.g. Windows 10, macOS 12.0]
- Browser: [e.g. Chrome 120, Firefox 119]
- Version: [e.g. 1.0.0]

## Additional Context
Add any other context about the problem here.
```

## Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- **Be respectful** - Treat all contributors with respect and dignity
- **Be inclusive** - Welcome people from all backgrounds and experience levels
- **Be collaborative** - Work together to solve problems and improve the project
- **Be constructive** - Provide constructive feedback and suggestions

### Communication

- **GitHub Issues** - Use issues for bug reports and feature requests
- **GitHub Discussions** - Use discussions for questions and general conversation
- **Pull Requests** - Use PRs for code changes and improvements
- **Be patient** - Maintainers and contributors are volunteers with limited time

### Getting Help

If you need help or have questions:

1. **Check the documentation** - Start with the README files
2. **Search existing issues** - Look for similar problems
3. **Ask in discussions** - Create a discussion for general questions
4. **Be specific** - Provide clear details about your problem

## Recognition

Contributors will be recognized in several ways:

- **Contributors list** - All contributors are listed in the project README
- **Release notes** - Contributors are credited in release notes
- **Community appreciation** - Recognition in project discussions and updates

## License

By contributing to VCell AI Platform, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to VCell AI Platform! Your contributions help make this project better for everyone in the scientific community.

If you have any questions about contributing, please don't hesitate to ask in the GitHub discussions or create an issue.
