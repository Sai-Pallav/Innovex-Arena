import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { CAREER_PERKS, JOB_POSITIONS } from '../data/siteData';
import { Button } from '../components/ui/Button';
import { CyberCard } from '../components/ui/CyberCard';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { DynamicProjectsList } from '../components/modules/DynamicProjectsList';
import { JobApplicationFormData } from '../types';
import { useToast } from '../components/ui/Toast';
import { IconRenderer } from '../components/ui/IconRenderer';
import { PageAtmosphere } from '../components/layout/PageAtmosphere';

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
    <div className="relative isolate overflow-hidden pt-24 sm:pt-28 pb-16 space-y-14 sm:space-y-20">
      <PageAtmosphere />

      {/* 1. HERO */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-5 animate-fade-up">
        <h1 className="type-display text-white">
          Join <span className="cosmic-text-gradient">Innovex Arena</span>
        </h1>
        <p className="type-lead text-[#c8bfec] max-w-2xl mx-auto font-normal">
          Start your career journey with us. We&apos;re looking for passionate individuals who want to make an impact in the tech world.
        </p>
      </section>

      {/* 2. WHY JOIN US? */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="type-heading-lg text-white">
            Why <span className="cosmic-text-gradient">Join Us?</span>
          </h2>
          <p className="type-body text-[#9b96b0] max-w-2xl mx-auto">
            We offer more than just jobs – we offer a launchpad for your career.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAREER_PERKS.map((perk, i) => (
            <CyberCard key={i} glow="cyan" className="p-5 group">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-buttons bg-white/[0.04] border border-white/[0.12] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-[#9382ff]/60 group-hover:shadow-[0_0_15px_rgba(147,130,255,0.25)] transition-all text-[#b7a4fb]">
                  <IconRenderer name={perk.iconName} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="type-card-title text-white mb-1.5">
                    {perk.title}
                  </h3>
                  <p className="type-body-sm text-[#9b96b0]">
                    {perk.description}
                  </p>
                </div>
              </div>
            </CyberCard>
          ))}
        </div>
      </section>

      {/* 3. OPEN POSITIONS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="type-heading-lg text-white">
            Open <span className="cosmic-text-gradient">Positions</span>
          </h2>
          <p className="type-body text-[#9b96b0] max-w-2xl mx-auto">
            Explore our current openings managed by admin.
          </p>
        </div>

        <div className="space-y-5">
          {JOB_POSITIONS.map((role) => (
            <CyberCard key={role.id} glow="purple" hoverEffect={false} className="p-5 sm:p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-white/[0.06]">
                  <div className="flex-1 min-w-0">
                    <h3 className="type-heading-sm text-white mb-2">
                      {role.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#9b96b0]">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#b7a4fb] shrink-0" />
                        <span>{role.location}</span>
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#b7a4fb] shrink-0" />
                        <span>{role.experience}</span>
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="px-3 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.12] text-[#ba9cff] font-mono text-[11px] shadow-[inset_0_-7px_11px_rgba(164,143,255,0.12)]">
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
                <p className="type-body text-[#9b96b0]">
                  {role.description}
                </p>

                {/* Requirements & Responsibilities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                  <div>
                    <h4 className="type-overline text-white mb-3">
                      Requirements
                    </h4>
                    <ul className="space-y-2">
                      {role.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#9b96b0]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#b7a4fb] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="type-overline text-white mb-3">
                      Responsibilities
                    </h4>
                    <ul className="space-y-2">
                      {role.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#9b96b0]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#ba9cff] shrink-0 mt-0.5" />
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
      <section id="apply-form" className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="type-heading-lg text-white">
            Apply for a <span className="cosmic-text-gradient">Position</span>
          </h2>
          <p className="type-body text-[#9b96b0] max-w-2xl mx-auto">
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
              <div className="space-y-1.5">
                <label className="type-overline text-[#9b96b0] block">
                  Position <span className="text-[#b7a4fb] font-medium">*</span>
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-5 py-2.5 rounded-inputs bg-white/[0.04] border border-white/[0.12] type-body-sm text-white shadow-[inset_0_0_16px_rgba(255,255,255,0.02)] focus:outline-none focus:border-[#9382ff]/60 focus:ring-2 focus:ring-[#9382ff]/20 focus:shadow-[0_0_20px_rgba(147,130,255,0.15)] focus:bg-white/[0.07] hover:border-white/[0.22] transition-all duration-200 cursor-pointer"
                >
                  {JOB_POSITIONS.map((r) => (
                    <option key={r.id} value={r.title} className="bg-[#0a0118] text-white">
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
              <div className="space-y-1.5">
                <label className="type-overline text-[#9b96b0] block">
                  Year of Study <span className="text-[#b7a4fb] font-medium">*</span>
                </label>
                <select
                  value={formData.yearOfStudy}
                  onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                  className="w-full px-5 py-2.5 rounded-inputs bg-white/[0.04] border border-white/[0.12] type-body-sm text-white shadow-[inset_0_0_16px_rgba(255,255,255,0.02)] focus:outline-none focus:border-[#9382ff]/60 focus:ring-2 focus:ring-[#9382ff]/20 focus:shadow-[0_0_20px_rgba(147,130,255,0.15)] focus:bg-white/[0.07] hover:border-white/[0.22] transition-all duration-200 cursor-pointer"
                >
                  <option value="1st Year" className="bg-[#0a0118] text-white">1st Year</option>
                  <option value="2nd Year" className="bg-[#0a0118] text-white">2nd Year</option>
                  <option value="3rd Year" className="bg-[#0a0118] text-white">3rd Year</option>
                  <option value="4th Year" className="bg-[#0a0118] text-white">4th Year</option>
                  <option value="Graduate" className="bg-[#0a0118] text-white">Graduate</option>
                </select>
              </div>
            </div>

            {/* Profile Links */}
            <div className="space-y-4 pt-4 border-t border-white/[0.06]">
              <h4 className="type-overline text-[#9b96b0]">
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
            <div className="pt-4 border-t border-white/[0.06]">
              <DynamicProjectsList
                projects={formData.projects}
                onChange={(projects) => setFormData({ ...formData, projects })}
              />
            </div>

            {/* Cover Letter */}
            <div className="pt-4 border-t border-white/[0.06]">
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
