export interface NavItem {
  name: string;
  href: string;
}

export interface WorkshopItem {
  iconName: string;
  title: string;
  description: string;
  tags?: string[];
}

export interface CorePillar {
  iconName: string;
  title: string;
  description: string;
  points: string[];
}

export interface ProductItem {
  id: string;
  name: string;
  category: 'AI Solutions' | 'Cloud Tools' | 'IoT Projects' | 'All';
  tagline: string;
  description: string;
  techStack: string[];
  features: string[];
  badge?: string;
  demoUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: 'Workshop' | 'Hackathon' | 'Bootcamp' | 'Tech Talk';
  date: string;
  time: string;
  location: string;
  mode: 'Virtual' | 'In-Person' | 'Hybrid';
  availableSeats: number;
  totalSeats: number;
  description: string;
  registrationDeadline: string;
  isUpcoming: boolean;
  tags: string[];
}

export interface JobPosition {
  id: string;
  title: string;
  type: string;
  location: string;
  experience: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
}

export interface InternPosition {
  id: string;
  title: string;
  duration: string;
  location: string;
  type: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  companyOrCollege: string;
  content: string;
  rating: number;
  avatarUrl?: string;
}

export interface ProjectEntry {
  id: string;
  title: string;
  liveUrl: string;
  githubUrl: string;
  description: string;
}

export interface JobApplicationFormData {
  position: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  yearOfStudy: string;
  linkedinUrl: string;
  githubUrl: string;
  personalWebsite: string;
  projects: ProjectEntry[];
  message: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface EventRegistrationFormData {
  name: string;
  email: string;
  phone: string;
  college: string;
  yearOfStudy: string;
}

export type LearningModeType = 'online' | 'offline' | 'hybrid';

export interface LearningModeItem {
  id: LearningModeType;
  badge: string;
  badgeVariant: 'cyan' | 'purple' | 'emerald';
  title: string;
  tagline: string;
  description: string;
  idealFor: string;
  cohortSize: string;
  schedule: string;
  duration: string;
  highlights: string[];
  ctaText: string;
  secondaryCtaText?: string;
}

export interface ComparisonRow {
  dimension: string;
  online: string;
  offline: string;
  hybrid: string;
  importance?: 'high' | 'standard';
}

export interface CampusHubItem {
  id: string;
  city: string;
  area: string;
  address: string;
  metroConnectivity: string;
  amenities: string[];
  labHighlights: string[];
  seatsAvailable: number;
  imageAlt: string;
}

export interface LearningFaqItem {
  question: string;
  answer: string;
  category: 'Flexibility' | 'Classroom' | 'Career' | 'Admissions';
}

export interface ClassBookingFormData {
  bookingType: 'online-demo' | 'campus-tour';
  name: string;
  email: string;
  phone: string;
  track: string;
  campusCity?: string;
  preferredDate: string;
  timeSlot: string;
  questions?: string;
}

export interface GalleryItem {
  id: number;
  type: 'image' | 'video';
  title: string;
  category: string;
  description: string;
  thumbnail: string;
}

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  published_at: string;
}

