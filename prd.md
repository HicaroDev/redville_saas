# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Product Name
Redville Obras SaaS

## Objective
Build a SaaS platform to replace spreadsheet-based construction management with a centralized system for cost control, work progress tracking, and financial consolidation.

## Core Problem
Construction companies manage each project using isolated spreadsheets, leading to:
- Lack of financial visibility
- Errors and rework
- No real-time decision capability

## Target Users
- Construction managers
- Engineers
- Financial/admin staff

## Core Modules (MVP)

### 1. Project Management
- Create and manage construction projects
- Status tracking (planned, ongoing, completed)

### 2. Cost Center Structure
- Hierarchical structure (phase-based)
- Example:
  - Foundation
  - Structure
  - Finishing

### 3. Cost Tracking
- Register expenses:
  - Material
  - Labor
  - Equipment
- Link to:
  - Project
  - Cost center

### 4. Global Cashbook
- Consolidated financial overview
- Income vs expenses
- Cash balance

### 5. Progress Tracking
- Physical progress (%)
- Financial progress (%)
- Planned vs actual comparison

## Future Modules (NOT MVP)
- Inventory management
- Purchase management
- Daily Work Report (RDO)
- BI dashboards

## Functional Requirements

- User authentication
- Multi-project support
- Cost input forms
- Dashboard visualization
- Data persistence (database)

## Non-Functional Requirements

- Simple UI (low learning curve)
- Mobile responsive
- Scalable architecture
- Secure data storage

## Success Metrics

- 90% of projects managed inside system
- Reduction of spreadsheet usage
- Financial accuracy improvement

## Constraints

- Must be simple
- Must work offline-friendly (future)
- Must support incremental evolution

## Tech Suggestion

- Frontend: React + Tailwind
- Backend: Supabase (PostgreSQL + Auth)
- Hosting: Vercel
