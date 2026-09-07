import React, { useState } from 'react';
import {
  Rocket,
  TrendingUp,
  Laptop,
  Coffee,
  MapPin,
  Clock,
  CheckCircle2,
  Send,
  GraduationCap,
  Users,
  Code,
  Award,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { CAREER_PERKS, JOB_POSITIONS } from '../data/siteData';
import { Button } from '../components/ui/Button';
import { CyberCard } from '../components/ui/CyberCard';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { DynamicProjectsList } from '../components/modules/DynamicProjectsList';
import { JobApplicationFormData } from '../types';
import { useToast } from '../components/ui/Toast';

export const CareersPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>(JOB_POSITIONS[0]?.title || 'Backend Developer (Node.js)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<JobApplicationFormData>({
    position: JOB_POSITIONS[0]?.title || 'Backend Developer (Node.js)',
    name: '',
    email: '',
    phone: '',
    college: '',
    yearOfStudy: '4th Year',
    linkedinUrl: '',
    githubUrl: '',
    personalWebsite: '',
    projects: [
      {
        id: '1',
        title: '',
        liveUrl: '',
        githubUrl: '',
        description: '',
      },
    ],
    message: '',
  });

  const getPerkIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-cyan-400" />;
      case 'Users':
        return <Users className="w-5 h-5 text-purple-400" />;
      case 'Code':
        return <Code className="w-5 h-5 text-cyan-400" />;
      case 'Award':
        return <Award className="w-5 h-5 text-purple-400" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-cyan-400" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-purple-400" />;
      default:
        return <Rocket className="w-5 h-5 text-primary" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: 'Application Submitted!',
        description: `Thank you for your interest in the ${formData.position} position. We'll review your application and get back to you soon.`,
        variant: 'success',
      });
      setFormData({
        position: selectedRole,
        name: '',
        email: '',
        phone: '',
        college: '',
        yearOfStudy: '4th Year',
        linkedinUrl: '',
        githubUrl: '',
        personalWebsite: '',
        projects: [
          {
            id: '1',
            title: '',
            liveUrl: '',
            githubUrl: '',
            description: '',
          },
        ],
        message: '',
      });
    }, 1000);
  };

  return (
    <div className="relative pt-24 pb-16 space-y-20">
      {/* 1. HERO */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-3 animate-fade-up">
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight text-white leading-tight">
          Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-400">Innovex Arena</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Start your career journey with us. We&apos;re looking for passionate individuals who want to make an impact in the tech world.
        </p>
      </section>

      {/* 2. WHY JOIN US? */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
            Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Join Us?</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            We offer more than just jobs – we offer a launchpad for your career.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CAREER_PERKS.map((perk, i) => (
            <CyberCard key={i} glow="cyan" className="p-5 group">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {getPerkIcon(perk.iconName)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-base font-bold text-foreground mb-1.5">
                    {perk.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {perk.description}
                  </p>
                </div>
              </div>
            </CyberCard>
          ))}
        </div>
      </section>

      {/* 3. OPEN POSITIONS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
            Open <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Positions</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Explore our current openings managed by admin.
          </p>
        </div>

        <div className="space-y-5">
          {JOB_POSITIONS.map((role) => (
            <CyberCard key={role.id} glow="purple" className="p-5 sm:p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-white/[0.06]">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground mb-2">
                      {role.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{role.location}</span>
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{role.experience}</span>
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-400/20 text-purple-300 font-mono text-[11px]">
                        {role.type}
                      </span>
                    </div>
                  </div>
                  <a href="#apply-form" className="shrink-0">
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => {
                        setSelectedRole(role.title);
                        setFormData((prev) => ({ ...prev, position: role.title }));
                      }}
                    >
                      Apply Now
                    </Button>
                  </a>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed">
                  {role.description}
                </p>

                {/* Requirements & Responsibilities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                  <div>
                    <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
                      Requirements
                    </h4>
                    <ul className="space-y-2">
                      {role.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
                      Responsibilities
                    </h4>
                    <ul className="space-y-2">
                      {role.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CyberCard>
          ))}
        </div>
      </section>

      {/* 4. APPLICATION FORM */}
      <section id="apply-form" className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
            Apply for a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Position</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Fill out the form below and we&apos;ll get back to you shortly.
          </p>
        </div>

        <CyberCard glow="cyan" className="p-5 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                placeholder="Your name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Email *"
                type="email"
                placeholder="your@email.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number *"
                placeholder="+91 XXXXX XXXXX"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                  Position *
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.06] transition-all"
                >
                  {JOB_POSITIONS.map((r) => (
                    <option key={r.id} value={r.title} className="bg-slate-900 text-white">
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Academic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="College/University *"
                placeholder="Your college name"
                required
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              />
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                  Year of Study *
                </label>
                <select
                  value={formData.yearOfStudy}
                  onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.06] transition-all"
                >
                  <option value="1st Year" className="bg-slate-900 text-white">1st Year</option>
                  <option value="2nd Year" className="bg-slate-900 text-white">2nd Year</option>
                  <option value="3rd Year" className="bg-slate-900 text-white">3rd Year</option>
                  <option value="4th Year" className="bg-slate-900 text-white">4th Year</option>
                  <option value="Graduate" className="bg-slate-900 text-white">Graduate</option>
                </select>
              </div>
            </div>

            {/* Profile Links */}
            <div className="space-y-4 pt-3 border-t border-white/[0.06]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Profile Links
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="LinkedIn URL"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                />
                <Input
                  label="GitHub URL"
                  placeholder="https://github.com/yourusername"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                />
              </div>
              <Input
                label="Personal Website/Portfolio"
                placeholder="https://yourwebsite.com"
                value={formData.personalWebsite}
                onChange={(e) => setFormData({ ...formData, personalWebsite: e.target.value })}
              />
            </div>

            {/* Dynamic Projects Section */}
            <div className="pt-3 border-t border-white/[0.06]">
              <DynamicProjectsList
                projects={formData.projects}
                onChange={(projects) => setFormData({ ...formData, projects })}
              />
            </div>

            {/* Cover Letter */}
            <div className="pt-3 border-t border-white/[0.06]">
              <Textarea
                label="Why do you want to join? (Cover Letter)"
                placeholder="Tell us about yourself, your skills, and why you're interested in this position..."
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                variant="hero"
                size="lg"
                className="w-full justify-center"
                type="submit"
                disabled={isSubmitting}
                rightIcon={<Send className="w-4 h-4" />}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </CyberCard>
      </section>
    </div>
  );
};
