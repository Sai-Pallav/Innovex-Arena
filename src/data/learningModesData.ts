import {
  LearningModeItem,
  ComparisonRow,
  CampusHubItem,
  LearningFaqItem,
} from '../types';

export const LEARNING_MODES: LearningModeItem[] = [
  {
    id: 'online',
    badge: '100% Live Interactive',
    badgeVariant: 'cyan',
    title: 'Live Online Academy',
    tagline: 'World-class tech training from the comfort of your desk, anywhere.',
    description:
      'Engineered for university students, working professionals, and global tech builders who value peak scheduling flexibility without compromising on live mentorship, code reviews, or hiring support.',
    idealFor: 'Working professionals, outstation students, and self-directed developers',
    cohortSize: '30 - 35 Learners per batch',
    schedule: 'Mon, Wed, Fri (8:00 PM - 10:00 PM IST) OR Weekend Batches',
    duration: '16 to 24 Weeks (Track dependent)',
    highlights: [
      'Interactive 2-way live video classes with instant polls & screen sharing',
      '24/7 AI Code Tutor + human TA ticket queue (< 15 min resolution)',
      'Browser-based cloud sandbox IDE with automated test assertions',
      'Searchable video recording archives with lifetime access',
      'Virtual breakout rooms, pair programming sprints, and online hackathons',
      '1-on-1 resume reviews and remote video mock technical interviews',
    ],
    ctaText: 'Book Free Live Demo',
    secondaryCtaText: 'Download Online Syllabus',
  },
  {
    id: 'offline',
    badge: 'Campus Immersion Hub',
    badgeVariant: 'purple',
    title: 'In-Person Campus Classroom',
    tagline: 'High-energy physical labs, high-spec rigs, and desk-side instructors.',
    description:
      'Immerse yourself in a distraction-free campus environment with dedicated high-spec workstation rigs, direct shoulder-to-shoulder mentor debugging, peer whiteboarding jams, and direct hiring walk-ins.',
    idealFor: 'Fresh graduates, career pivoters, and learners who thrive in structured lab discipline',
    cohortSize: 'Strictly capped at 20 Learners per lab',
    schedule: 'Mon - Fri (10:00 AM - 4:00 PM IST) OR Weekend Bootcamps',
    duration: '16 to 24 Weeks (Track dependent)',
    highlights: [
      'Dedicated campus workstation rig with dual monitors & RTX GPU compute',
      'Instant desk-side mentor support for real-time debugging & code reviews',
      'Physical whiteboard architectural design sprints and daily standups',
      'Direct on-campus hiring drives and company recruiter meet-and-greets',
      'Maker hardware station with IoT sensor kits and microcontrollers',
      'High-speed 1 Gbps enterprise fiber, developer lounge, and cafeteria access',
    ],
    ctaText: 'Schedule Campus Lab Tour',
    secondaryCtaText: 'View Campus Centers',
  },
  {
    id: 'hybrid',
    badge: 'Hybrid Flex Track',
    badgeVariant: 'emerald',
    title: 'Hybrid Flex Program',
    tagline: 'Weekday online flexibility + Saturday campus build & hack sprints.',
    description:
      'The sweet spot of modern tech education. Attend core architectural lectures online during weekday evenings, then join peers at your local campus on Saturdays for collaborative hackathons and networking.',
    idealFor: 'Hybrid workers and local students wanting community connection without the daily commute',
    cohortSize: '25 Learners per cohort',
    schedule: 'Weekday evenings online + Saturday on-campus intensive (10 AM - 5 PM)',
    duration: '16 to 24 Weeks (Track dependent)',
    highlights: [
      'Attend weekday lectures online from home with full recording backups',
      'Saturday in-person intensive build sessions & mentor feedback circles',
      'Access both online Discord developer channels and physical campus facilities',
      'Smoothly transition between online and on-campus as your commitments shift',
      'Participate in both remote virtual hiring rounds and campus walk-in drives',
      'Best-in-class peer accountability paired with remote lifestyle freedom',
    ],
    ctaText: 'Explore Hybrid Track',
    secondaryCtaText: 'Talk to Academic Counselor',
  },
];

export const COMPARISON_MATRIX: ComparisonRow[] = [
  {
    dimension: 'Learning Environment',
    online: 'Anywhere with high-speed internet (Home, dorm, or office)',
    offline: 'Physical Innovex Arena Campus Labs with dedicated personal desk',
    hybrid: 'Online from home on weekdays + Campus Lab workspace on Saturdays',
    importance: 'high',
  },
  {
    dimension: 'Instruction & Delivery',
    online: 'Live 2-way HD stream with interactive code sharing & screen control',
    offline: 'Physical instructor on auditorium whiteboards & desk walk-arounds',
    hybrid: 'Live streaming lectures on weekdays + in-person mentor sprint Saturdays',
    importance: 'high',
  },
  {
    dimension: 'Doubt Clearing & Debugging',
    online: 'Real-time live chat queue + 24/7 AI tutor + dedicated Discord TAs (<15m)',
    offline: 'Immediate desk-side instructor assistance — mentor looks right at your screen',
    hybrid: 'Discord queue on weekdays + comprehensive face-to-face debugging on Saturdays',
    importance: 'high',
  },
  {
    dimension: 'Hardware & Lab Setup',
    online: 'Browser-based cloud IDE sandbox & automated GitHub PR evaluation',
    offline: 'Pre-configured campus workstation (Dual 27" screens, RTX GPU, 1Gbps Fiber)',
    hybrid: 'Cloud IDE for remote days + full campus workstation access on lab days',
    importance: 'standard',
  },
  {
    dimension: 'Peer Collaboration & Networking',
    online: 'Global Discord voice pods, virtual study groups, and digital hackathons',
    offline: 'Physical coding pods, coffee lounge discussions, and whiteboard brainstorms',
    hybrid: 'Global online community + intimate local campus circle & team projects',
    importance: 'standard',
  },
  {
    dimension: 'Missed Class Policy',
    online: '100% recorded in 4K HD with timestamped bookmarks & searchable notes',
    offline: 'Audio-video backup recordings + dedicated weekend mentor makeup hour',
    hybrid: 'Full online recording access + Saturday in-person catch-up review',
    importance: 'standard',
  },
  {
    dimension: 'Recruitment & Placement Drives',
    online: 'Curated virtual hiring portal, remote tech interviews, and company referrals',
    offline: 'Direct on-campus recruiter walk-ins, physical demo days, & hiring fairs',
    hybrid: 'Eligible for both physical campus recruiter walk-ins and virtual hiring rounds',
    importance: 'high',
  },
  {
    dimension: 'Final Certification & Showcase',
    online: 'Cryptographically verifiable digital credential & live GitHub portfolio showcase',
    offline: 'Official physical certificate, convocation ceremony, and live project expo',
    hybrid: 'Both physical certificate and verifiable digital badge credentials',
    importance: 'standard',
  },
];

export const UNIVERSAL_PILLARS = [
  {
    title: 'Identical Rigorous Curriculum',
    description:
      'Curated by senior engineers from Tier-1 tech giants. Covers deep architecture, system design, modern AI, and scalable cloud stacks.',
    metric: '100% Shared Syllabus',
  },
  {
    title: 'Production-Grade Capstones',
    description:
      'Build 4+ industry-grade portfolio projects with automated CI/CD pipelines, containerization, and public documentation.',
    metric: '4+ Live Deployments',
  },
  {
    title: '1-on-1 Career Mentorship',
    description:
      'Individual portfolio reviews, LinkedIn/GitHub optimization, and comprehensive mock technical & HR interview rounds.',
    metric: '5+ Mock Interviews',
  },
  {
    title: '150+ Hiring Partner Network',
    description:
      'Direct placement referrals to startups, enterprise tech companies, and product studios actively hiring Innovex graduates.',
    metric: '92% Placement Rate',
  },
];

export const CAMPUS_HUBS: CampusHubItem[] = [
  {
    id: 'hub-hyderabad',
    city: 'Hyderabad',
    area: 'Hi-Tech City / Madhapur',
    address: '4th Floor, Cyber Gateway Innovation Park, Hi-Tech City, Hyderabad - 500081',
    metroConnectivity: '2 mins walk from Raidurg Metro Station',
    seatsAvailable: 6,
    imageAlt: 'Innovex Arena Hyderabad Campus Lab',
    amenities: [
      'Dual-Monitor RTX Workstations',
      '1 Gbps Dedicated Fiber Line',
      'Whiteboard War-Rooms',
      'Maker IoT Hardware Bench',
      'Cafeteria & Lounge',
    ],
    labHighlights: [
      'Lab timings: 8:00 AM to 9:00 PM',
      'Dedicated mentor desks for 1-on-1 code reviews',
      'Weekend open hack space for all active students',
    ],
  },
  {
    id: 'hub-bengaluru',
    city: 'Bengaluru',
    area: 'Koramangala 4th Block',
    address: 'Plot 42, 80 Feet Road, Near Sony World Signal, Koramangala, Bengaluru - 560034',
    metroConnectivity: 'Quick bus transit from Silk Board / Indiranagar Metro',
    seatsAvailable: 4,
    imageAlt: 'Innovex Arena Bengaluru Campus Lab',
    amenities: [
      'High-Performance Linux/Mac Rigs',
      'Gigabit Fiber & Mesh Wi-Fi 6',
      'Acoustic Meeting Pods',
      'Hardware Prototyping Lab',
      'Rooftop Tech Community Terrace',
    ],
    labHighlights: [
      'Lab timings: 8:00 AM to 10:00 PM',
      'Host to weekly Saturday Tech Talks & Meetups',
      'Direct recruiter interview rooms on-site',
    ],
  },
  {
    id: 'hub-pune',
    city: 'Pune',
    area: 'Viman Nagar / Kalyani Nagar',
    address: 'Level 3, Apex Tech Tower, Near World Trade Center, Viman Nagar, Pune - 411014',
    metroConnectivity: '5 mins from Kalyani Nagar Metro Station',
    seatsAvailable: 8,
    imageAlt: 'Innovex Arena Pune Campus Lab',
    amenities: [
      'High-Speed Dev Terminals',
      'Low-Latency Fiber Internet',
      'Collaborative Scrum Pods',
      'Embedded Systems Bench',
      'Chillout Café & Library',
    ],
    labHighlights: [
      'Lab timings: 8:30 AM to 8:30 PM',
      'Bi-weekly hackathon marathons and code sprints',
      'Direct alumni mentorship drop-in hours',
    ],
  },
];

export const LEARNING_FAQS: LearningFaqItem[] = [
  {
    question: 'Can I switch between Online and Offline modes after starting?',
    answer:
      'Yes! We understand schedules evolve. Because both delivery formats follow the exact same weekly curriculum milestones, you can submit a switch request within the first 4 weeks of your batch without losing academic progress or credit.',
    category: 'Flexibility',
  },
  {
    question: 'What happens if I miss an in-person offline classroom session?',
    answer:
      'You will never fall behind. All classroom lectures have synchronized digital backups and HD recordings available on your student portal within 2 hours. Furthermore, our mentors host dedicated weekend makeup hours to answer doubts face-to-face.',
    category: 'Classroom',
  },
  {
    question: 'Do online students receive the exact same placement opportunities as offline students?',
    answer:
      'Absolutely. Our 150+ corporate hiring partners recruit from both pools indiscriminately. Online students participate in scheduled virtual hiring drives, automated code assessments, and remote interviews with full counselor support.',
    category: 'Career',
  },
  {
    question: 'Do I need to bring my own laptop to the campus classroom lab?',
    answer:
      'While bringing your personal laptop is welcomed for note-taking and homework, it is not mandatory for classroom work. Every student desk in our campus lab is equipped with a high-performance workstation rig with pre-installed developer tools, compilers, and IDEs.',
    category: 'Classroom',
  },
  {
    question: 'Can I attend a free demo session or visit the campus before paying fees?',
    answer:
      'Yes, 100%! You can reserve a free 60-minute live online trial masterclass, or book an in-person campus walk-through with our academic advisors to inspect the workstations, meet instructors, and experience the lab culture firsthand.',
    category: 'Admissions',
  },
  {
    question: 'Are the tuition fees different between Online and Offline formats?',
    answer:
      'Online training has a lower fee structure due to zero facility overhead. In-person offline classrooms incorporate dedicated high-spec hardware rigs, campus amenities, and physical lab maintenance. Flexible EMI and scholarship options are available for both.',
    category: 'Admissions',
  },
];

export const MODE_RECOMMENDER_QUESTIONS = {
  schedule: {
    title: '1. What is your current availability and daily schedule?',
    options: [
      {
        id: 'working-pro',
        label: 'Working Professional (9-to-5 Job / Fixed Hours)',
        recommendedMode: 'online',
        hint: 'Best with evening & weekend live online sessions',
      },
      {
        id: 'full-time-learner',
        label: 'Full-Time Student or Dedicated Job Seeker',
        recommendedMode: 'offline',
        hint: 'Best with full immersion in daily campus lab discipline',
      },
      {
        id: 'hybrid-balanced',
        label: 'College Student or Hybrid Worker needing balance',
        recommendedMode: 'hybrid',
        hint: 'Best with weekday online lectures + Saturday campus labs',
      },
    ],
  },
  environment: {
    title: '2. Where do you learn most effectively and stay motivated?',
    options: [
      {
        id: 'self-desk',
        label: 'At my personal desk / home office with flexible autonomy',
        recommendedMode: 'online',
      },
      {
        id: 'campus-lab',
        label: 'In a structured physical lab surrounded by peers & instant mentor access',
        recommendedMode: 'offline',
      },
      {
        id: 'flexible-mix',
        label: 'Online during the week, but craving in-person hackathons on weekends',
        recommendedMode: 'hybrid',
      },
    ],
  },
};

export const LEARNER_TESTIMONIALS_SPLIT = [
  {
    name: 'Ananya Sharma',
    mode: '100% Live Online Graduate',
    role: 'Cloud Engineer at RapidScale',
    quote:
      'Being based in Jaipur, I couldn’t relocate. The live online sessions with interactive code reviews and Discord TA support felt as responsive as being in the same room. Transitioned from support to cloud in 5 months!',
    avatarInitial: 'A',
  },
  {
    name: 'Rohan Deshmukh',
    mode: 'Campus Classroom Graduate (Hyderabad)',
    role: 'Full-Stack SDE at QuantPulse',
    quote:
      'Having a dedicated workstation with dual monitors and sitting right next to instructors completely transformed my speed. Any time my build broke, the mentor walked over and helped me understand the memory leak.',
    avatarInitial: 'R',
  },
  {
    name: 'Kavita Nair',
    mode: 'Hybrid Flex Track Graduate (Bengaluru)',
    role: 'AI Engineer at SynthLogic',
    quote:
      'The hybrid track was perfect for my university schedule. Weekday nights online kept me on track, and Saturday hackathons at the Koramangala hub built the connections that landed me my current AI role.',
    avatarInitial: 'K',
  },
];
