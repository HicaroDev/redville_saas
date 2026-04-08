# REDVILLE DESIGN SYSTEM – TOKENS & COMPONENTS

## 🎨 DESIGN TOKENS

### Colors (Minimalist Palette)
- **Primary (Accent):** `#2563eb` (Blue 600 - "Redville Blue")
- **Background:** `#f8fafc` (Slate 50)
- **Surface (Cards):** `#ffffff` (White)
- **Text Primary:** `#0f172a` (Slate 900)
- **Text Secondary:** `#64748b` (Slate 500)
- **Border:** `#e2e8f0` (Slate 200)

### Status Colors (Meaningful)
- **Success:** `#10b981` (Emerald 500) - OK / No Prazo
- **Warning:** `#f59e0b` (Amber 500) - Atenção
- **Danger:** `#ef4444` (Red 500) - Risco / Estouro

### Typography
- **Font Family:** 'Inter', system-ui, sans-serif.
- **Sizes:** 
  - Display: 24px (Bold)
  - Subtitle: 16px (Medium)
  - Body: 14px (Regular)
  - Caption: 12px (Medium)

### Shadows & Radius
- **Shadow:** `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` (Soft)
- **Radius:** `12px` (Standard) / `16px` (Large Containers)

---

## 🧱 COMPONENT LIBRARY (Tailwind Classes)

### Card Container
`bg-white border border-slate-200 rounded-xl p-6 shadow-sm`

### Primary Button
`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all`

### Data Table
`w-full text-left border-separate border-spacing-0`
- Header: `bg-slate-50 text-slate-500 font-medium py-3 px-4 uppercase text-xs border-b border-slate-200`
- Cell: `py-4 px-4 border-b border-slate-100 text-sm`

### KPI Widget
`flex flex-col gap-1`
- Label: `text-slate-500 text-xs font-medium uppercase tracking-wider`
- Value: `text-2xl font-bold tracking-tight`

---

## 🧭 NAVIGATION LOGIC

- **Sidebar Width:** 260px (Fixed)
- **Topbar Height:** 64px (Fixed)
- **Content Area:** Responsive (Max-width: 1440px centered)
