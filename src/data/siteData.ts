import {
  NavItem,
  WorkshopItem,
  CorePillar,
  ProductItem,
  EventItem,
  JobPosition,
  InternPosition,
  TestimonialItem,
  GalleryItem,
  BlogPostItem,
} from '../types';

export const NAVIGATION_LINKS: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/#about' },
  { name: 'Services', href: '/services' },
  { name: 'Products', href: '/products' },
  { name: 'Classes', href: '/classes' },
  { name: 'Events', href: '/events' },
  { name: 'Careers', href: '/careers' },
  { name: 'Internships', href: '/interns' },
  { name: 'Contact', href: '/contact' },
];

export const HERO_DATA = {
  badge: 'Building the Future with AI & Cloud',
  brandName: 'INNOVEX ARENA',
  tagline: 'Fueling the Future of Creators',
  headline: 'Welcome to INNOVEX ARENA',
  subtitle:
    'A tech-driven startup building AI-based products, cloud solutions, and empowering the next generation through workshops, hackathons, and training programs.',
  featurePills: [
    'AI Products',
    'Cloud Solutions',
    'Workshops & Events',
    'Training Programs',
  ],
  stats: [
    { label: 'Learners Empowered', value: '5,000+' },
    { label: 'Workshops Hosted', value: '50+' },
    { label: 'Hackathons Organized', value: '20+' },
    { label: 'Partner Colleges', value: '30+' },
  ],
};

export const VISION_MISSION = {
  vision: {
    title: 'Our Vision',
    description:
      'To become a global innovation hub that builds intelligent and scalable technology solutions using Artificial Intelligence, Cloud Computing, and emerging technologies — empowering industries and individuals to create a smarter, connected future.',
  },
  mission: {
    title: 'Our Mission',
    points: [
      'Build next-generation AI and cloud-based products',
      'Provide hands-on learning in trending technologies',
      'Bridge the gap between academic learning and industry needs',
      'Empower students to become industry-ready professionals',
    ],
  },
};

export const CORE_SERVICES_HOME = [
  {
    iconName: 'Layout',
    title: 'Web & App Dev',
    description:
      'Full-stack development training covering modern frameworks and best practices.',
  },
  {
    iconName: 'Brain',
    title: 'AI & ML Workshops',
    description:
      'Hands-on learning in Artificial Intelligence, Machine Learning, and Generative AI technologies.',
  },
  {
    iconName: 'Cloud',
    title: 'Cloud Computing',
    description:
      'Master cloud platforms and build scalable solutions with AWS, Azure, and GCP.',
  },
  {
    iconName: 'Trophy',
    title: 'Hackathons',
    description:
      'College hackathons, innovation challenges, and idea pitch competitions.',
  },
  {
    iconName: 'GraduationCap',
    title: 'Training Programs',
    description:
      '1-day bootcamps to 30-day certification programs for comprehensive learning.',
  },
  {
    iconName: 'Users',
    title: 'Student Development',
    description:
      'Resume building, interview prep, projects, and internship opportunities.',
  },
];

// 4 Main Pillars of Services from live site
export const SERVICE_SECTIONS = [
  {
    id: 'hackathons',
    title: 'Hackathons',
    description: 'Competitive events that challenge participants to innovate and create solutions.',
    items: [
      {
        iconName: 'Trophy',
        title: 'College Hackathons',
        description: 'Campus-wide coding competitions and challenges',
      },
      {
        iconName: 'Target',
        title: 'Innovation Challenges',
        description: 'Problem-solving competitions for real-world issues',
      },
      {
        iconName: 'Lightbulb',
        title: 'Idea Pitches',
        description: 'Startup idea presentation and validation events',
      },
    ],
  },
  {
    id: 'training',
    title: 'Training Programs',
    description: 'Structured programs designed for comprehensive skill development.',
    items: [
      {
        iconName: 'Zap',
        title: '1-2 Day Bootcamps',
        description: 'Intensive short-term skill-building sessions',
      },
      {
        iconName: 'BookOpen',
        title: '1-Week Intensives',
        description: 'Deep-dive programs for comprehensive learning',
      },
      {
        iconName: 'Award',
        title: '30-Day Certifications',
        description: 'Complete certification courses with projects',
      },
    ],
  },
  {
    id: 'development',
    title: 'Student Development',
    description: 'Comprehensive support to prepare students for successful careers.',
    items: [
      {
        iconName: 'FileText',
        title: 'Resume Building',
        description: 'Professional resume creation and optimization',
      },
      {
        iconName: 'MessageSquare',
        title: 'Interview Prep',
        description: 'Mock interviews and communication skills',
      },
      {
        iconName: 'FolderGit2',
        title: 'Projects',
        description: 'Real-world project experience and portfolio building',
      },
      {
        iconName: 'Briefcase',
        title: 'Internships',
        description: 'Industry internship opportunities and placements',
      },
    ],
  },
  {
    id: 'workshops',
    title: 'Workshops',
    description: 'Hands-on workshops covering the latest technologies and industry practices.',
    items: [
      {
        iconName: 'Layout',
        title: 'Web/App Dev',
        description: 'Full-stack development with modern frameworks',
      },
      {
        iconName: 'Brain',
        title: 'AI & ML',
        description: 'Artificial Intelligence and Machine Learning fundamentals',
      },
      {
        iconName: 'Cloud',
        title: 'Cloud Computing',
        description: 'AWS, Azure, GCP platforms and services',
      },
      {
        iconName: 'Radio',
        title: 'IoT',
        description: 'Internet of Things and embedded systems',
      },
      {
        iconName: 'Cpu',
        title: 'Generative AI',
        description: 'ChatGPT, DALL-E, and creative AI applications',
      },
      {
        iconName: 'Shield',
        title: 'Cybersecurity',
        description: 'Security practices and ethical hacking',
      },
      {
        iconName: 'BarChart3',
        title: 'Data Science',
        description: 'Data analysis, visualization, and insights',
      },
      {
        iconName: 'Blocks',
        title: 'Blockchain',
        description: 'Distributed ledger and Web3 technologies',
      },
      {
        iconName: 'Glasses',
        title: 'AR/VR',
        description: 'Augmented and Virtual Reality development',
      },
    ],
  },
];

// Backwards-compatible CORE_PILLARS
export const CORE_PILLARS: CorePillar[] = [
  {
    iconName: 'Trophy',
    title: 'Hackathons',
    description:
      'Competitive events that challenge participants to innovate and create solutions.',
    points: [
      'College Hackathons with campus-wide coding competitions',
      'Innovation Challenges solving real-world corporate problems',
      'Startup Idea Pitches and investor presentation events',
      'Mentorship from senior software architects & cash prizes',
    ],
  },
  {
    iconName: 'BookOpen',
    title: 'Training Programs',
    description:
      'Structured programs designed for comprehensive skill development.',
    points: [
      '1-2 Day Bootcamps for intensive short-term skill building',
      '1-Week Intensives deep-dive programs for comprehensive learning',
      '30-Day Certifications with end-to-end hands-on capstone projects',
      'Industry-recognized verified certification and portfolio reviews',
    ],
  },
  {
    iconName: 'Users',
    title: 'Student Development',
    description:
      'Comprehensive support to prepare students for successful careers.',
    points: [
      'Professional resume creation and ATS optimization',
      'Mock technical and behavioral interviews with mentors',
      'Real-world project experience and portfolio building',
      'Industry internship opportunities and PPO placement tracks',
    ],
  },
];

export const WORKSHOPS: WorkshopItem[] = [
  {
    iconName: 'Layout',
    title: 'Web/App Dev',
    description: 'Full-stack development with modern frameworks',
    tags: ['React', 'Next.js', 'Node.js', 'REST APIs'],
  },
  {
    iconName: 'Brain',
    title: 'AI & ML',
    description: 'Artificial Intelligence and Machine Learning fundamentals',
    tags: ['Python', 'TensorFlow', 'PyTorch', 'Computer Vision'],
  },
  {
    iconName: 'Cloud',
    title: 'Cloud Computing',
    description: 'AWS, Azure, GCP platforms and services',
    tags: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
  },
  {
    iconName: 'Radio',
    title: 'IoT',
    description: 'Internet of Things and embedded systems',
    tags: ['ESP32', 'Raspberry Pi', 'MQTT', 'Sensors'],
  },
  {
    iconName: 'Cpu',
    title: 'Generative AI',
    description: 'ChatGPT, DALL-E, and creative AI applications',
    tags: ['LangChain', 'OpenAI', 'RAG', 'Vector DBs'],
  },
  {
    iconName: 'Shield',
    title: 'Cybersecurity',
    description: 'Security practices and ethical hacking',
    tags: ['Ethical Hacking', 'OWASP', 'PenTesting', 'Network Security'],
  },
  {
    iconName: 'BarChart3',
    title: 'Data Science',
    description: 'Data analysis, visualization, and insights',
    tags: ['Pandas', 'NumPy', 'Data Visualization', 'SQL'],
  },
  {
    iconName: 'Blocks',
    title: 'Blockchain',
    description: 'Distributed ledger and Web3 technologies',
    tags: ['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts'],
  },
  {
    iconName: 'Glasses',
    title: 'AR/VR',
    description: 'Augmented and Virtual Reality development',
    tags: ['Unity', 'Unreal Engine', 'WebXR', '3D Modeling'],
  },
];

export const PRODUCTS: ProductItem[] = [
  {
    id: 'eduflow-lms',
    name: 'EduFlow LMS',
    category: 'Cloud Tools',
    tagline: 'Next-gen college LMS platform',
    description:
      'A modern learning management system designed for colleges and universities. Features AI-powered personalized learning paths, virtual classrooms, and comprehensive analytics for educators.',
    techStack: ['Next.js', 'TypeScript', 'PostgreSQL', 'OpenAI'],
    features: [
      'AI-Powered Personalized Learning Paths',
      'Interactive Virtual Classrooms & Code Sandbox',
      'Comprehensive Student Performance Analytics for Educators',
      'Multi-Tenant Scalable Cloud Infrastructure',
      'Automated Assignment Grading and Instant Feedback',
    ],
    badge: 'Featured',
    imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800',
    demoUrl: '#',
    githubUrl: '#',
  },
  {
    id: 'cloud-sentinel',
    name: 'CloudSentinel AI',
    category: 'Cloud Tools',
    tagline: 'Intelligent Multi-Cloud Cost & Security Optimizer',
    description:
      'An automated DevOps assistant that continuously monitors AWS/Azure infrastructures, detects security vulnerabilities, and optimizes cloud spending through ML anomaly detection.',
    techStack: ['Python', 'Docker', 'AWS Lambda', 'Terraform', 'FastAPI', 'React'],
    features: [
      'Automated Idle Resource Cleanup',
      'Security Compliance Audit (CIS Benchmarks)',
      'Real-Time Cost Anomaly Alerts via Slack/Discord',
    ],
    badge: 'Enterprise',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    demoUrl: '#',
  },
  {
    id: 'smart-campus-iot',
    name: 'SmartSense Campus',
    category: 'IoT Projects',
    tagline: 'Smart Campus Energy & Environmental Monitoring System',
    description:
      'An IoT mesh network that monitors campus ambient temperature, occupancy, air quality, and electricity consumption in real time.',
    techStack: ['ESP32', 'MQTT', 'Node.js', 'InfluxDB', 'Grafana', 'React'],
    features: [
      'Sub-second Sensor Telemetry Streaming',
      'Automated HVAC & Lighting Scheduling',
      'Emergency Environmental Hazard Alarms',
    ],
    badge: 'IoT Solution',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    demoUrl: '#',
  },
];

export const EVENTS_DATA: EventItem[] = [
  {
    id: 'cloud-computing-workshop',
    title: 'Cloud Computing Workshop',
    category: 'Workshop',
    date: 'January 20, 2026',
    time: '10:00 AM - 4:00 PM IST',
    location: 'Virtual Event',
    mode: 'Virtual',
    availableSeats: 85,
    totalSeats: 150,
    description:
      'Hands-on workshop covering cloud architecture, AWS services, and scalable deployment strategies.',
    registrationDeadline: '2026-01-18',
    isUpcoming: true,
    tags: ['Cloud Computing', 'AWS', 'DevOps', 'Architecture'],
  },
  {
    id: 'tech-talk-web3',
    title: 'Tech Talk: Future of Web3',
    category: 'Tech Talk',
    date: 'February 25, 2026',
    time: '3:00 PM - 6:00 PM IST',
    location: 'Virtual Event',
    mode: 'Virtual',
    availableSeats: 320,
    totalSeats: 500,
    description:
      'Industry experts discuss the future of decentralized technologies, blockchain, and Web3 applications.',
    registrationDeadline: '2026-02-24',
    isUpcoming: true,
    tags: ['Web3', 'Blockchain', 'Smart Contracts', 'Decentralization'],
  },
  {
    id: 'ai-innovation-hackathon',
    title: 'AI Innovation Hackathon 2024',
    category: 'Hackathon',
    date: 'June 16, 2026',
    time: '48-Hour Live Sprint',
    location: 'Innovex Arena Campus, Bangalore',
    mode: 'In-Person',
    availableSeats: 65,
    totalSeats: 200,
    description:
      'Join us for a 48-hour hackathon where teams will build innovative AI solutions. Compete for prizes worth ₹1,00,000 and get mentored by industry experts.',
    registrationDeadline: '2026-06-10',
    isUpcoming: true,
    tags: ['AI/ML', 'Hackathon', 'Cash Prize', 'Mentorship'],
  },
  {
    id: 'ml-bootcamp',
    title: 'Machine Learning Bootcamp',
    category: 'Bootcamp',
    date: 'March 01, 2026',
    time: '9:00 AM - 5:00 PM IST',
    location: 'Innovex Arena Hub, Chennai',
    mode: 'In-Person',
    availableSeats: 24,
    totalSeats: 60,
    description:
      'Comprehensive bootcamp covering ML algorithms, deep learning, and hands-on real-world industry projects.',
    registrationDeadline: '2026-02-25',
    isUpcoming: true,
    tags: ['Machine Learning', 'Python', 'Deep Learning', 'Certification'],
  },
  {
    id: 'fullstack-dev-workshop',
    title: 'Full Stack Development Workshop',
    category: 'Workshop',
    date: 'February 08, 2026',
    time: '10:00 AM - 4:00 PM IST',
    location: 'Innovex Arena Campus, Hyderabad',
    mode: 'In-Person',
    availableSeats: 40,
    totalSeats: 100,
    description:
      'Master full stack development with modern web frameworks, API design, and deployment best practices.',
    registrationDeadline: '2026-02-05',
    isUpcoming: true,
    tags: ['React', 'Node.js', 'PostgreSQL', 'Full-Stack'],
  },
];

export const PAST_EVENTS_DATA = [
  {
    title: 'Cybersecurity Workshop',
    date: 'December 2024',
    attendees: '150+ Attendees',
    location: 'Bangalore',
    category: 'Workshop',
  },
  {
    title: 'Tech Innovators Hackathon',
    date: 'November 2024',
    attendees: '300+ Attendees',
    location: 'Multiple Cities',
    category: 'Hackathon',
  },
  {
    title: 'Data Science Bootcamp',
    date: 'October 2024',
    attendees: '100+ Attendees',
    location: 'Chennai',
    category: 'Bootcamp',
  },
  {
    title: 'IoT Workshop Series',
    date: 'September 2024',
    attendees: '120+ Attendees',
    location: 'Hyderabad',
    category: 'Workshop',
  },
];

// Exact perks from bundle g6
export const CAREER_PERKS = [
  {
    iconName: 'GraduationCap',
    title: 'Learning',
    description: 'Hands-on training with latest technologies',
  },
  {
    iconName: 'Users',
    title: 'Mentorship',
    description: 'Guidance from industry experts',
  },
  {
    iconName: 'Code',
    title: 'Real Projects',
    description: 'Work on actual client projects',
  },
  {
    iconName: 'Award',
    title: 'Certificate',
    description: 'Internship completion certificate',
  },
  {
    iconName: 'Laptop',
    title: 'Flexibility',
    description: 'Remote & hybrid work options',
  },
  {
    iconName: 'Briefcase',
    title: 'Full-time Opportunity',
    description: 'PPO for top performers',
  },
];

// Exact roles from live Supabase career_positions
export const JOB_POSITIONS: JobPosition[] = [
  {
    id: 'backend-developer-nodejs',
    title: 'Backend Developer (Node.js)',
    type: 'Full-time',
    location: 'Remote',
    experience: '3+ Years',
    description: 'Build scalable APIs and microservices with Node.js.',
    responsibilities: [
      'Design API architecture',
      'Write unit/integration tests',
      'Database optimization',
      'CI/CD pipelines',
    ],
    requirements: [
      '3+ years Node.js/Express experience',
      'PostgreSQL/MongoDB database design and optimization',
      'REST/GraphQL APIs integration',
      'Docker basics and containerization',
      'Authentication (JWT/OAuth)',
    ],
  },
  {
    id: 'fullstack-developer',
    title: 'Full Stack Developer',
    type: 'Full-time',
    location: 'Hybrid (Bangalore)',
    experience: '2+ Years',
    description: 'End-to-end development of web applications.',
    responsibilities: [
      'Build complete features',
      'End-to-end testing',
      'Deploy to production',
      'Monitor performance',
    ],
    requirements: [
      'React + Node.js experience',
      'Database design (SQL/NoSQL)',
      'API development',
      'Deployment (Vercel/AWS)',
      'Git & Agile workflows',
    ],
  },
];

// Exact internship from live Supabase internship_positions
export const INTERN_POSITIONS: InternPosition[] = [
  {
    id: 'frontend-developer-intern',
    title: 'Frontend Developer Intern',
    duration: '3-6 Months',
    location: 'Remote / Hybrid',
    type: 'Internship',
    description:
      'Build beautiful, responsive user interfaces using React, TypeScript, and modern CSS frameworks. Join our team to create pixel-perfect UIs.',
    responsibilities: [
      'Develop frontend components',
      'Implement responsive designs',
      'Collaborate with designers',
      'Write clean code',
      'Participate in code reviews',
    ],
    requirements: [
      'Currently pursuing B.Tech/BE in Computer Science',
      'Proficiency in HTML, CSS, JavaScript',
      'Experience with React.js',
      'Understanding of responsive design',
      'Basic Git knowledge',
    ],
  },
];

// Exact testimonials from live Supabase testimonials
export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    role: 'Software Engineer',
    companyOrCollege: 'Google',
    content:
      'The AI Hackathon at Innovex Arena was an incredible experience. The mentorship and resources provided helped our team build a winning solution. Highly recommend!',
    rating: 5,
  },
  {
    id: '2',
    name: 'Rahul Verma',
    role: 'Data Scientist',
    companyOrCollege: 'Microsoft',
    content:
      'Innovex Arena\'s Machine Learning bootcamp gave me the practical skills I needed to transition into AI. The hands-on approach was exactly what I was looking for.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Ananya Patel',
    role: 'Product Manager',
    companyOrCollege: 'Amazon',
    content:
      'Attending the Cloud Computing workshop was a game-changer for my career. The instructors were knowledgeable and the content was up-to-date with industry standards.',
    rating: 5,
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    role: 'Frontend Developer Intern',
    companyOrCollege: 'Innovex Arena',
    content:
      'My internship at Innovex Arena was the best decision I made. I learned more in 3 months than I did in 2 years of college!',
    rating: 5,
  },
  {
    id: '5',
    name: 'Vikram Singh',
    role: 'Startup Founder',
    companyOrCollege: 'TechStartup',
    content:
      'Innovex Arena helped us build our MVP during their incubation program. Their network and technical expertise are unmatched.',
    rating: 5,
  },
  {
    id: '6',
    name: 'Karthik Nair',
    role: 'Full Stack Engineer',
    companyOrCollege: 'Infosys',
    content:
      'The modern full-stack engineering workshops bridged the gap between academic theory and high-scale production systems. Truly transformative curriculum!',
    rating: 5,
  },
  {
    id: '7',
    name: 'Divya Krishnan',
    role: 'Cloud Solutions Architect',
    companyOrCollege: 'AWS',
    content:
      'The hands-on DevOps and cloud architecture bootcamps provided realistic infrastructure simulations that prepared our batch for enterprise challenges.',
    rating: 5,
  },
  {
    id: '8',
    name: 'Arjun Mehta',
    role: 'DevOps Specialist',
    companyOrCollege: 'Razorpay',
    content:
      'From Docker orchestration to CI/CD automation, the mentors at Innovex Arena provided masterclass insights that directly accelerated my career trajectory.',
    rating: 5,
  },
];

export const CONTACT_DETAILS = {
  email: 'info@innovexarena.in',
  phone: '+91 93926 02264',
  website: 'www.innovexarena.in',
  presence:
    'We operate across India with virtual and hybrid programs. Contact us to bring our workshops and events to your location.',
  presenceLabel: 'Pan-India Operations',
  socials: [
    { name: 'Instagram', handle: '@innovex_arena', href: 'https://www.instagram.com/innovex_arena' },
    { name: 'YouTube', handle: '@innovexarena', href: 'https://youtube.com/@innovexarena' },
    { name: 'LinkedIn', handle: 'innovex_arena', href: 'https://linkedin.com/company/innovex-arena' },
  ],
};

// Exact gallery items w0 from live bundle
export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    type: 'image',
    title: 'AI & ML Workshop 2024',
    category: 'Workshop',
    description: 'Participants learning machine learning fundamentals',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop',
  },
  {
    id: 2,
    type: 'image',
    title: 'Innovation Hackathon',
    category: 'Hackathon',
    description: 'Teams brainstorming innovative solutions',
    thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop',
  },
  {
    id: 3,
    type: 'image',
    title: 'Cloud Computing Bootcamp',
    category: 'Bootcamp',
    description: 'Hands-on AWS training session',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop',
  },
  {
    id: 4,
    type: 'image',
    title: 'Team Collaboration',
    category: 'Hackathon',
    description: 'Students working on their projects',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
  },
  {
    id: 5,
    type: 'image',
    title: 'Cybersecurity Session',
    category: 'Workshop',
    description: 'Learning about ethical hacking',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop',
  },
  {
    id: 6,
    type: 'image',
    title: 'Award Ceremony',
    category: 'Event',
    description: 'Recognizing top performers',
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
  },
  {
    id: 7,
    type: 'image',
    title: 'Web Development Sprint',
    category: 'Workshop',
    description: 'Building full-stack applications',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
  },
  {
    id: 8,
    type: 'image',
    title: 'Networking Session',
    category: 'Event',
    description: 'Industry experts meeting students',
    thumbnail: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=400&fit=crop',
  },
];

// Exact blog posts from live Supabase blog_posts
export const BLOG_POSTS: BlogPostItem[] = [
  {
    id: '18b80f58-fc46-471a-afdf-1580a19b7f21',
    title: 'Building Scalable Cloud Applications: Best Practices for 2024',
    slug: 'scalable-cloud-apps-2024',
    excerpt: 'Learn the essential best practices for building scalable cloud applications using modern architectures and cloud services.',
    content: 'As businesses grow, their applications need to scale seamlessly. Cloud computing provides the infrastructure needed for this growth, but building truly scalable applications requires careful planning and implementation.\n\nKey Principles of Scalability:\n1. Microservices Architecture: Break down monolithic applications into smaller, independent services\n2. Containerization: Use Docker and Kubernetes for consistent deployment\n3. Auto-scaling: Implement dynamic resource allocation based on demand\n4. Database Optimization: Choose the right database strategy for your workload',
    cover_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    category: 'Technology',
    published_at: '2024-12-13',
  },
  {
    id: '3fc37054-fecd-4347-aab3-f745907c5cf7',
    title: 'Innovex Arena Hosts Successful Hackathon with 500+ Participants',
    slug: 'hackathon-success-2024',
    excerpt: 'Innovex Arena successfully concluded its flagship hackathon with 500+ participants building innovative solutions.',
    content: 'Last weekend, Innovex Arena successfully concluded its flagship hackathon event, bringing together over 500 talented developers, designers, and innovators from across the country to build real-world AI and cloud applications in a 48-hour sprint.',
    cover_image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    category: 'Events',
    published_at: '2024-12-14',
  },
  {
    id: '50e18195-ea57-4592-aa0b-33777d540203',
    title: 'Introduction to IoT: Connecting the Physical and Digital Worlds',
    slug: 'intro-to-iot-2024',
    excerpt: 'Explore the fundamentals of IoT and discover how connected devices are transforming industries worldwide.',
    content: 'The Internet of Things (IoT) is revolutionizing how we interact with physical objects. From smart homes to industrial automation, connected devices generate valuable data that drives efficiency and innovation.',
    cover_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    category: 'Technology',
    published_at: '2024-12-15',
  },
  {
    id: '61474813-f661-4648-9366-419b4898b17b',
    title: 'Career Tips: How to Land Your First Tech Internship',
    slug: 'first-tech-internship-tips',
    excerpt: 'Essential tips and strategies to help you land your first tech internship and kickstart your career in technology.',
    content: 'Landing your first technical internship can feel daunting, but with the right preparation and mindset, you can stand out among hundreds of candidates. Build real projects, optimize your GitHub profile, and participate actively in hackathons.',
    cover_image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    category: 'Careers',
    published_at: '2024-12-16',
  },
  {
    id: '2771d996-5e58-45be-9a99-b1d542385b2e',
    title: 'The Rise of AI in Agriculture: Transforming Farming for the Future',
    slug: 'ai-in-agriculture-2024',
    excerpt: 'Discover how AI is transforming agriculture with smart farming technologies, precision agriculture, and sustainable practices.',
    content: 'Artificial Intelligence is addressing global food security challenges by optimizing crop yields, predicting weather patterns, and automating farm machinery for sustainable agricultural practices.',
    cover_image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800',
    category: 'Technology',
    published_at: '2024-12-17',
  },
];

// Footer links structure matching live site
export const FOOTER_SECTIONS = {
  company: [
    { href: '/', label: 'Home' },
    { href: '/#about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/products', label: 'Products' },
    { href: '/classes', label: 'Classes' },
    { href: '/events', label: 'Events' },
    { href: '/careers', label: 'Careers' },
    { href: '/interns', label: 'Internships' },
  ],
  services: [
    { href: '/services#workshops', label: 'Workshops' },
    { href: '/services#hackathons', label: 'Hackathons' },
    { href: '/services#training', label: 'Training Programs' },
    { href: '/services#development', label: 'Student Development' },
  ],
  resources: [
    { href: '/gallery', label: 'Gallery' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
    { href: '/careers', label: 'Apply Now' },
  ],
};
