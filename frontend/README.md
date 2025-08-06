# VCell Frontend
A modern, responsive web application built with Next.js for the VCell AI Explorer platform. This frontend provides an intuitive interface for discovering, analyzing, and exploring biomodels with AI-powered capabilities.

## Architecture
The frontend follows Next.js App Router architecture with the following structure:
```
frontend/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Landing page
│   ├── chat/                # AI chatbot interface
│   ├── search/              # Biomodel search and results
│   ├── analyze/             # Model analysis tools
│   ├── diagrams/            # Visual diagram viewer
│   ├── sbml/                # SBML file viewer
│   ├── vcml/                # VCML file viewer
│   ├── admin/               # Admin dashboard
│   ├── signin/              # Authentication pages
│   └── signup/              # User registration
├── components/              # Reusable UI components
│   ├── ui/                  # Base UI components (Radix UI)
│   ├── ChatBox.tsx          # Chat interface component
│   ├── app-sidebar.tsx      # Application sidebar
│   ├── markdown-renderer.tsx # Markdown content renderer
│   └── ...                  # Other custom components
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and configurations
├── styles/                  # Global styles and CSS
└── public/                  # Static assets
```

## Features
### Core Functionality
- **AI Chatbot Interface**: Interactive chat with LLM-powered responses
- **Advanced Search**: Comprehensive biomodel search with filters
- **File Viewers**: Support for VCML, SBML, and BNGL file formats
- **Visual Diagrams**: Interactive biomodel diagram display
- **Responsive Design**: Mobile-first, responsive interface
- **Authentication**: Secure user authentication with Auth0

### Key Components
#### Chat Interface (`/chat`)
- Natural language conversation with AI
- Message history 
- Markdown rendering with math support

#### Search Interface (`/search`)
- Advanced filtering and sorting
- Search results
- Biomodel metadata display
- Quick access to files and diagrams

#### File Viewers
- **VCML Viewer**: XML-based model format display
- **SBML Viewer**: Systems Biology Markup Language support
- **Diagram Viewer**: Interactive visual representations

#### Admin Dashboard (`/admin`)
- Knowledge base management
- User management
- System monitoring

## Tech Stack
### Core Framework
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **React 19**: Latest React features and hooks

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **ShadCN**: simple components
- **Framer Motion**: Animation library
- **Lucide React**: Icon library

### Content & Data
- **React Markdown**: Markdown rendering
- **KaTeX**: Mathematical expression rendering
- **React XML Viewer**: XML file display

### Development Tools
- **Prettier**: Code formatting
- **ESLint**: Code linting
- **PostCSS**: CSS processing

## 🚀 Quick Start
### Prerequisites
- Node.js 18+
- pnpm or npm

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to http://localhost:3000

### Using Docker

1. **Build the container**
   ```bash
   docker build -t vcell-frontend .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up frontend
   ```

## Building for Production

### Build Application
```bash
pnpm build
# or
npm run build
```

### Start Production Server
```bash
pnpm start
# or
npm start
```

### Docker Production Build
```bash
docker build -t vcell-frontend:prod --target production .
```
