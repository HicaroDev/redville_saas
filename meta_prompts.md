SKILLS NECESSÁRIAS PARA O PROJETO
1. Skill: Project Modeler
Name: Project Modeler

Purpose:
Define project structure and cost centers.

Inputs:
- Project name
- Phases

Outputs:
- Structured project JSON

Steps:
1. Create project
2. Define cost centers
3. Validate hierarchy

Constraints:
- Must follow hierarchical structure
2. Skill: Cost Engine
Name: Cost Engine

Purpose:
Handle financial entries and calculations.

Inputs:
- Cost value
- Category
- Project ID

Outputs:
- Updated financial records

Steps:
1. Validate input
2. Store cost
3. Update totals

Constraints:
- No orphan records
3. Skill: Dashboard Generator
Name: Dashboard Generator

Purpose:
Generate visual insights

Inputs:
- Financial data
- Progress data

Outputs:
- Charts
- KPIs

Steps:
1. Aggregate data
2. Calculate metrics
3. Render UI

Constraints:
- Real-time updates
4. Skill: Cash Flow Consolidator
Name: Cash Flow Consolidator

Purpose:
Centralize financial data

Inputs:
- All project transactions

Outputs:
- Global cash flow

Steps:
1. Merge data
2. Classify entries
3. Calculate balance
5. Skill: Progress Tracker
Name: Progress Tracker

Purpose:
Track physical and financial evolution

Inputs:
- Progress input
- Budget

Outputs:
- % completion

Steps:
1. Calculate ratios
2. Compare planned vs actual