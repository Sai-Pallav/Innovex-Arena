# 🧩 Comprehensive Component Requirements Document (CRD)
## Project: Innovex Arena Web Platform (High-Fidelity Clone)
**Document Version**: 2.0.0  
**Design Paradigm**: Atomic Cyberpunk Architecture with Glassmorphism  

---

## 1. Global Design System & Token Specifications

### 1.1 Palette & Color Variables (Tailwind & CSS Custom Properties)
```css
:root {
  /* Canvas & Containers */
  --background: #070a13;             /* Deep space canvas */
  --foreground: #f8fafc;             /* Primary text */
  --card: #0b101d;                   /* Primary card container */
  --card-foreground: #f8fafc;        /* Card title & text */
  --popover: #0b101d;
  --popover-foreground: #f8fafc;

  /* Cyberpunk Accents */
  --primary: #00d9ff;                /* High-voltage Neon Cyan */
  --primary-glow: rgba(0, 217, 255, 0.4);
  --primary-foreground: #070a13;     /* Dark contrasting label */
  
  --secondary: #8033e6;              /* Deep Neon Purple / Violet */
  --secondary-glow: rgba(128, 51, 230, 0.4);
  --secondary-foreground: #ffffff;

  /* Structure & Inputs */
  --muted: #161d2d;                  /* Subtle background fills */
  --muted-foreground: #94a3b8;       /* Secondary description text */
  --border: #232b3e;                 /* Default component borders */
  --border-glow: rgba(0, 217, 255, 0.25);
  --input: #111726;                  /* Text field background */
  --ring: #00d9ff;                   /* Focus outline */

  /* Radii */
  --radius-sm: 0.375rem;             /* 6px */
  --radius-md: 0.5rem;               /* 8px */
  --radius-lg: 0.75rem;              /* 12px */
  --radius-xl: 1rem;                 /* 16px */
  --radius-2xl: 1.5rem;              /* 24px */
}
```

### 1.2 Typography Hierarchy & Fonts
- **Heading / Display**: `"Orbitron", sans-serif` (Futuristic geometric styling, uppercase headers, tracking `0.05em`).
- **Body & Forms**: `"Inter", -apple-system, BlinkMacSystemFont, sans-serif` (High legibility, regular `400`, medium `500`, semi-bold `600`).
- **Monospace (Code / Tags)**: `"JetBrains Mono", "Fira Code", monospace`.

---

## 2. Component Directory & Hierarchy

```
src/
├── components/
│   ├── ui/                           # Primitives & Base Atoms
│   │   ├── Button.tsx                # Variants: primary (hero), secondary, outline, ghost, icon
│   │   ├── Input.tsx                 # Cyberpunk glowing input box with error state
│   │   ├── Textarea.tsx              # Resizable/styled textarea
│   │   ├── Badge.tsx                 # Glow pill badge (cyan, purple, status)
│   │   ├── Card.tsx                  # Base container with glassmorphic border & hover lift
│   │   ├── Dialog.tsx                # Accessible modal overlay (Event registration, CRUD)
│   │   ├── Tabs.tsx                  # Filterable tab list with sliding indicator
│   │   ├── Toast.tsx                 # Cyber notification toast popup
│   │   └── Select.tsx                # Custom styled dropdown
│   │
│   ├── layout/                       # Structural Layout
│   │   ├── Navbar.tsx                # Sticky glass navbar + Mobile navigation drawer
│   │   ├── Footer.tsx                # 4-Column footer with social links & newsletter
│   │   ├── BackgroundGlow.tsx        # Ambient radial gradient blurs (Cyan top-left, Purple bottom-right)
│   │   └── PageContainer.tsx         # Responsive container wrapper (`container mx-auto px-4`)
│   │
│   └── modules/                      # Feature-Specific Organisms
│       ├── home/
│       │   ├── HeroSection.tsx
│       │   ├── VisionMissionCards.tsx
│       │   ├── CoreServicesSection.tsx
│       │   ├── EventsPreviewSection.tsx
│       │   ├── TestimonialsSection.tsx
│       │   ├── NewsletterSection.tsx
│       │   └── BottomCTASection.tsx
│       │
│       ├── services/
│       │   ├── CorePillarsGrid.tsx
│       │   ├── WorkshopCard.tsx
│       │   └── InstitutionCTABanner.tsx
│       │
│       ├── products/
│       │   ├── ProductFilterTabs.tsx
│       │   ├── ProductCard.tsx
│       │   └── CustomSolutionCTA.tsx
│       │
│       ├── events/
│       │   ├── EventCard.tsx
│       │   ├── EventRegistrationDialog.tsx
│       │   └── EventStatusBadge.tsx
│       │
│       ├── applications/
│       │   ├── DynamicProjectCard.tsx     # Single project form card with delete button
│       │   ├── DynamicProjectsList.tsx    # "+ ADD PROJECT" manager component
│       │   ├── JobApplicationForm.tsx
│       │   └── InternApplicationForm.tsx
│       │
│       ├── contact/
│       │   ├── ContactInfoCard.tsx
│       │   ├── SocialMediaLinks.tsx
│       │   └── ContactForm.tsx
│       │
│       └── admin/
│           ├── AdminAuthCard.tsx
│           ├── AdminSidebar.tsx
│           └── AdminDataTable.tsx
```

---

## 3. Atomic Component Detailed Contracts

### 3.1 `Button` Component
```typescript
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'hero' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```
- **`hero` variant**: `bg-gradient-to-r from-[#00d9ff] to-[#8033e6] text-[#070a13] font-heading font-bold shadow-[0_0_25px_rgba(0,217,255,0.4)] hover:shadow-[0_0_35px_rgba(0,217,255,0.6)] hover:scale-[1.02] transition-all`.
- **`outline` variant**: `border border-border/80 bg-card/40 hover:border-primary/50 text-foreground hover:bg-primary/10 transition-all`.

### 3.2 `DynamicProjectsList` Component (For Job/Internship Applications)
- **State Definition**:
  ```typescript
  export interface ProjectEntry {
    id: string;
    title: string;
    liveUrl: string;
    githubUrl: string;
    description: string;
  }
  ```
- **UX Behavior**:
  - Renders a clean list of existing `DynamicProjectCard` items.
  - "+ ADD PROJECT" button creates a new empty project object with a unique UUID.
  - Delete button removes the entry from state with instantaneous UI update.
  - Validates URLs and prevents form submission if project title is present without description/URL.

### 3.3 `EventRegistrationDialog` Component
- **Props**:
  ```typescript
  export interface EventRegistrationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    event: EventItem | null;
    onSuccess: () => void;
  }
  ```
- **Fields**:
  - Event title & date banner.
  - Full Name (`Input`).
  - Phone Number (`Input`).
  - College / University Name (`Input`).
  - Year of Study (`Select` dropdown: 1st Year, 2nd Year, 3rd Year, 4th Year, Graduate).
  - Submit Button with animated spinner and Supabase insert call.

### 3.4 `Navbar` & `MobileDrawer`
- **Props**: `activePath: string`
- **Features**:
  - Desktop View: Horizontal menu with active glow indicator line under current route.
  - Mobile View: Hamburger icon toggling a full-height glassmorphic slide-out drawer (`fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl`).
  - Smooth page transitions and auto-closing drawer upon route selection.
