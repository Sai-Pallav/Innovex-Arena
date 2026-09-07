# 📄 Comprehensive Product Requirements Document (PRD)
## Project: Innovex Arena Web Platform (High-Fidelity Clone)
**Source URL**: [https://innovexarena.in/](https://innovexarena.in/)  
**Version**: 2.0.0 (Exhaustive Reverse-Engineered Edition)  
**Theme**: Futuristic Cyberpunk / Dark Glassmorphic Neon (`#00D9FF` Cyan & `#8033E6` Purple)  

---

## 1. Executive Summary & Value Proposition
**Innovex Arena** is a full-scale startup ecosystem web platform built to bridge the gap between academic education and modern industry demands. The platform serves as a hub for:
1. **AI & Cloud Technology Solutions**: Showcasing enterprise products and consulting services.
2. **Student & Developer Empowerment**: Practical workshops, hackathons, coding bootcamps, and tech summits.
3. **Talent Acquisition & Training**: Active career listings, internship recruitment, and dynamic candidate project portfolios.
4. **Community & Content Publishing**: Technical blog articles, verified testimonials, and institutional partnerships.

---

## 2. Exhaustive Route & Screen Breakdown

### 2.1 Route Map
| URL Path | Screen Name | Access Level | Primary Features & Modules |
| :--- | :--- | :--- | :--- |
| `/` | **Home** | Public | Hero with glow badges, Mission/Vision cards, Core Pillars, Live Event cards, Testimonials, Newsletter subscription, CTAs. |
| `/services` | **Services** | Public | 3 Core Pillars (Hackathons, Training, Student Dev) + 9 Workshop Specialization cards + Institution Partnership CTA. |
| `/products` | **Products** | Public | Dynamic Category Filter (`All`, `AI Solutions`, `Cloud Tools`, `IoT Projects`) + Product Cards (e.g. EduFlow LMS) + Consultation CTA. |
| `/events` | **Events** | Public | Live/Upcoming events grid, category badges, event dates/times, seat availability counters, Event Registration Modal, Past event archives. |
| `/careers` | **Careers** | Public | "Why Join Us" perks grid, Active Job Listings, Dynamic Multi-Project Job Application Form. |
| `/interns` | **Internships** | Public | Internship Benefits grid, Active Internship Positions, Dynamic Multi-Project Internship Application Form. |
| `/contact` | **Contact** | Public | Direct channels (Email, Phone, Website, Pan-India info), Social links, Interactive inquiry form with real-time feedback. |
| `/admin/login` | **Admin Auth** | Protected | Cyberpunk-styled authentication card with Email/Password fields, eye toggle, Sign In/Up switch, and redirect to Admin Dashboard. |
| `/admin` | **Admin Dashboard** | Role: `admin` | Full CRUD portal for Events, Career Positions, Internship Positions, Product Listings, Blog Posts, Registrations, and Contact Submissions. |

---

## 3. Detailed Section-by-Section Feature Specifications

### 3.1 Homepage (`/`)
1. **Header / Navbar**:
   - Brand Logo: Glowing cyan hexagon container with icon + `"INNOVEX ARENA"`.
   - Links: `Home`, `Services`, `Products`, `Events`, `Careers`, `Internships`, `Contact`.
   - Actions: `Admin Login` icon button, Primary `"GET STARTED"` glow button.
   - Behavior: Transparent at scroll 0, transitions to `backdrop-blur-xl bg-background/80` upon scrolling.
2. **Hero Section**:
   - Tag Badge: `🚀 Fueling the Future of Creators` (Glowing pill).
   - Headline: `Pioneering AI & Cloud Innovations`.
   - Subtitle: *"Empowering students, developers, and businesses with cutting-edge technology solutions, hands-on workshops, and transformative hackathons."*
   - CTAs: Primary `"Explore Services"` (Neon Cyan) + Secondary `"Join Community"` (Outlined).
3. **Vision & Mission Section**:
   - **Our Vision**: *"To become a global innovation hub that builds intelligent and scalable technology solutions using Artificial Intelligence, Cloud Computing, and emerging technologies — empowering industries and individuals to create a smarter, connected future."*
   - **Our Mission**:
     1. Build next-generation AI and cloud-based products.
     2. Provide hands-on learning in trending technologies.
     3. Bridge the gap between academia and industry.
     4. Foster an ecosystem of continuous innovation.
4. **Core Services Preview**:
   - 4 Interactive Cyber Cards with hover borders and spotlight gradients.
5. **Upcoming Events Preview**:
   - Real-time fetched event cards displaying status, date, location, seat counters, and quick register action.
6. **Community Testimonials**:
   - Verified feedback grid with 5-star ratings, reviewer name, role, and organization.
7. **Newsletter Subscription Section**:
   - Headline: *"Stay Ahead of the Curve"*.
   - Subtitle: *"Subscribe to our newsletter for exclusive tech updates, upcoming hackathons, and early workshop access."*
   - Input: Email with instant regex validation, duplicate check (HTTP 23505 handling), and confirmation toast.
8. **Bottom CTA Banner**:
   - Headline: *"Ready to Elevate Your Tech Journey?"*.
   - Buttons: `"Join Our Team"` (routes to `/careers`) and `"Get in Touch"` (routes to `/contact`).

---

### 3.2 Services Page (`/services`)
1. **Core Pillars**:
   - **Hackathons & Ideathons**: Intense problem-solving sprints, industry problem statements, mentoring from seasoned architects.
   - **Training Programs & Bootcamps**: Immersive curricula designed for zero-to-production mastery.
   - **Student & Developer Empowerment**: Internship incubation, open-source project exposure, and placement enablement.
2. **9 Technical Workshop Specializations**:
   1. **Web/App Dev**: Full-stack development with modern frameworks (React, Next.js, Node.js).
   2. **AI & ML**: Artificial Intelligence and Machine Learning fundamentals, deep learning models.
   3. **Cloud Computing**: AWS, Azure, GCP platforms, serverless architectures, DevOps CI/CD.
   4. **IoT (Internet of Things)**: Embedded systems, sensor integration, ESP32/Raspberry Pi architectures.
   5. **Generative AI**: LLM fine-tuning, RAG pipelines, Prompt Engineering, ChatGPT/DALL-E APIs.
   6. **Cybersecurity**: Ethical hacking, penetration testing, network defense, threat modeling.
   7. **Data Science**: Exploratory data analysis, statistical modeling, Pandas/NumPy, visualization dashboards.
   8. **Blockchain**: Smart contracts, Ethereum, Web3 dApps, decentralized protocols.
   9. **AR/VR**: Extended reality, Unity 3D, Spatial Computing, immersive metaverse environments.
3. **Institution Collaboration CTA**:
   - Callout: *"Partner with us to bring workshops, hackathons, or training programs to your institution or organization."*
   - Button: `"Get in Touch"`.

---

### 3.3 Products Page (`/products`)
1. **Category Filter Tabs**:
   - `All Products` | `AI Solutions` | `Cloud Tools` | `IoT Projects`.
2. **Flagship Product — EduFlow LMS**:
   - Category: `AI Solutions` & `Cloud Tools`.
   - Tagline: *"Next-Generation AI-Powered Learning Management System"*.
   - Description: *"EduFlow LMS revolutionizes digital learning by incorporating real-time AI tutoring, personalized student progress analytics, and automated assignment evaluation."*
   - Tech Stack: `React`, `Node.js`, `Python`, `FastAPI`, `PostgreSQL`, `TailwindCSS`, `OpenAI API`, `AWS S3`.
   - Feature Highlights:
     - Real-Time AI Tutor & Adaptive Assessments.
     - Automated Code Grading & Plagiarism Detection.
     - Multi-Tenant Institutional Cloud Deployment.
3. **Product Consultation CTA**:
   - *"Looking for a Custom Product or Tailored Cloud Solution?"* → Direct Contact Link.

---

### 3.4 Events Page (`/events`) & Registration Modal
1. **Event Listings**:
   - Categorized by `Workshop`, `Hackathon`, `Bootcamp`, `Tech Talk`.
   - Metadata: Title, Date, Time, Venue (`Virtual` / `In-Person`), Max Participants, Available Seats, Registration Deadline.
2. **Interactive Event Registration Modal**:
   - Triggered upon clicking `"Register Now"`.
   - Fields: Full Name, Email, Phone Number, College/Organization, Year of Study.
   - Behavior: Enforces deadline checks; records registration into `event_registrations` table; triggers confirmation toast.

---

### 3.5 Careers (`/careers`) & Internships (`/interns`)
1. **Why Join Us (Perks & Benefits)**:
   - *Real-World Impact*: Work on production systems used by thousands.
   - *Fast-Paced Growth*: Mentorship from industry leads and rapid career advancement.
   - *Cutting-Edge Tech*: Daily hands-on exposure to GenAI, Cloud, and distributed architectures.
   - *Flexible Work Culture*: Remote/Hybrid flexibility with outcome-oriented milestones.
2. **Open Positions**:
   - **Backend Developer** (Full-Time | Remote/Hybrid | Node.js, Express, PostgreSQL, Redis, Docker).
   - **Full Stack Developer** (Full-Time | Hybrid | React, TypeScript, Node.js, Tailwind, AWS).
   - **Frontend Developer Intern** (3-6 Months | Remote/Hybrid | React, TypeScript, Tailwind, Git).
3. **Dynamic Interactive Application Form**:
   - **Candidate Profile**: Full Name, Email, Phone, College/Institution, Year of Study, LinkedIn URL, GitHub URL, Portfolio Website.
   - **Dynamic "+ ADD PROJECT" Module**:
     - Users can dynamically add $N$ project cards to their application.
     - Fields per project: `Project Title`, `Live Demo URL`, `GitHub Repository URL`, `Brief Description`.
     - Individual "Remove Project" button with smooth exit animation.
   - **Cover Letter / Message**: Rich textarea.
   - **Submission**: Validates URLs & required fields, saves application payload into `career_applications` or `internship_applications`.

---

### 3.6 Contact Page (`/contact`)
1. **Direct Official Coordinates**:
   - **Email**: `info@innovexarena.in`
   - **Phone**: `+91 93926 02264`
   - **Website**: `www.innovexarena.in`
   - **Presence**: Pan-India Educational & Corporate Outreach
2. **Social Channels**:
   - Instagram: `@innovex_arena` (`https://www.instagram.com/innovex_arena`)
   - YouTube: `@innovexarena` (`https://youtube.com/@innovexarena`)
   - LinkedIn: `innovex_arena` (`https://linkedin.com/company/innovex-arena`)
3. **Contact Submission Form**:
   - Fields: Full Name, Email Address, Subject, Message.
   - Saves record to `contact_submissions` table; displays: *"Message Sent! Thank you for reaching out. We'll respond within 24 hours."*

---

### 3.7 Admin Portal (`/admin/login` & `/admin`)
1. **Authentication**:
   - Clean cyberpunk credentials container with security shield badge.
   - Email & Password with show/hide password toggle.
   - Role-based authorization verification (`user_roles.role == 'admin'`).
2. **Admin Management Modules**:
   - Event Creator & Registration Reviewer.
   - Job & Internship Position Creator / Applicant Reviewer.
   - Product Showcase Publisher.
   - Contact Form Inquiries Viewer.
