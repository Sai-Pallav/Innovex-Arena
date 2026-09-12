import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight, Users, Sparkles } from 'lucide-react';
import { EVENTS_DATA, PAST_EVENTS_DATA } from '../data/siteData';
import { Button } from '../components/ui/Button';
import { CyberCard } from '../components/ui/CyberCard';
import { EventRegistrationDialog } from '../components/modules/EventRegistrationDialog';
import { EventItem } from '../types';
import { PageAtmosphere } from '../components/layout/PageAtmosphere';

export const EventsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const filterTabs = ['All', 'Workshop', 'Hackathon', 'Bootcamp', 'Tech Talk'];

  const filteredEvents =
    activeFilter === 'All'
      ? EVENTS_DATA
      : EVENTS_DATA.filter((e) => e.category === activeFilter);

  return (
    <div className="relative pt-24 pb-16 space-y-16">
      <PageAtmosphere />

      {/* 1. HERO */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-3 animate-fade-up">
        <h1 className="font-rebond font-medium text-3xl sm:text-5xl tracking-tight text-white leading-tight">
          Events & <span className="cosmic-text-gradient">Programs</span>
        </h1>
        <p className="text-sm sm:text-base text-[#9b96b0] max-w-2xl mx-auto leading-relaxed">
          Join our workshops, hackathons, and training programs to learn, build, and grow with the tech community.
        </p>
      </section>

      {/* 2. FILTER TABS - Wope 999px Glass Pills */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex justify-center animate-fade-up">
        <div className="inline-flex flex-wrap justify-center p-1.5 rounded-full bg-white/[0.04] border border-white/[0.12] backdrop-blur-md gap-1.5">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                activeFilter === tab
                  ? 'bg-white/[0.08] text-white font-medium border border-[#9382ff]/50 shadow-[inset_0_-7px_11px_rgba(164,143,255,0.18),0_0_15px_rgba(147,130,255,0.2)]'
                  : 'text-[#9b96b0] border border-transparent hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {tab === 'All' ? 'All Events' : tab}
            </button>
          ))}
        </div>
      </section>

      {/* 3. UPCOMING EVENTS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="font-rebond font-medium text-2xl sm:text-3xl text-white tracking-tight">
            Upcoming <span className="cosmic-text-gradient">Events</span>
          </h2>
          <p className="text-sm text-[#9b96b0] max-w-2xl mx-auto">
            Don&apos;t miss out on these exciting opportunities to learn and grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <CyberCard
              key={evt.id}
              glow="cyan"
              className="p-5 group flex flex-col"
            >
              <div className="flex-1 space-y-4">
                {/* Title */}
                <h3 className="font-rebond font-medium text-lg text-white group-hover:text-[#b7a4fb] transition-colors leading-tight">
                  {evt.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#9b96b0] leading-relaxed line-clamp-2">
                  {evt.description}
                </p>

                {/* Event Details */}
                <div className="p-3.5 rounded-[16px] bg-white/[0.03] border border-white/[0.08] group-hover:border-[#9382ff]/30 group-hover:bg-white/[0.05] transition-all duration-300 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#b7a4fb] shrink-0" />
                    <span>{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#9b96b0]">
                    <Clock className="w-3.5 h-3.5 text-[#b7a4fb] shrink-0" />
                    <span>{evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#9b96b0]">
                    <MapPin className="w-3.5 h-3.5 text-[#b7a4fb] shrink-0" />
                    <span>{evt.location}</span>
                  </div>
                </div>

                {/* Tags - 999px Pills */}
                {evt.tags && evt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {evt.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.04] border border-white/[0.1] text-[#9b96b0]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Register Button */}
              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                <Button
                  variant="hero"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedEvent(evt)}
                >
                  Register Now
                </Button>
              </div>
            </CyberCard>
          ))}
        </div>
      </section>

      {/* 4. PAST EVENTS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="font-rebond font-medium text-2xl sm:text-3xl text-white tracking-tight">
            Past <span className="cosmic-text-gradient">Events</span>
          </h2>
          <p className="text-sm text-[#9b96b0] max-w-2xl mx-auto">
            A look back at our successful events and programs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PAST_EVENTS_DATA.map((evt, i) => (
            <CyberCard key={i} glow="purple" className="p-5">
              <div className="space-y-3">
                {/* Title */}
                <h3 className="font-rebond text-base font-medium text-white leading-tight">
                  {evt.title}
                </h3>

                {/* Event Info */}
                <div className="p-3 rounded-[16px] bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs text-[#9b96b0]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#b7a4fb] shrink-0" />
                    <span className="text-[#f4f0ff]">{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#b7a4fb] shrink-0" />
                    <span>{evt.attendees}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#b7a4fb] shrink-0" />
                    <span>{evt.location}</span>
                  </div>
                </div>
              </div>
            </CyberCard>
          ))}
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="relative rounded-2xl p-8 sm:p-12 overflow-hidden border border-white/[0.12] bg-[#0a0118] backdrop-blur-xl shadow-[inset_0_0_24px_rgba(255,255,255,0.04),0_24px_60px_rgba(0,0,0,0.8)] text-center space-y-4 hover:border-[#9382ff]/40 transition-all">
          <div className="aurora-divider-line absolute top-0 left-0 right-0" />
          <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#9382ff]/50 to-transparent pointer-events-none" />

          <h2 className="font-rebond font-medium text-2xl sm:text-3xl text-white tracking-tight">
            Want to <span className="cosmic-text-gradient">Host an Event?</span>
          </h2>
          <p className="text-sm text-[#9b96b0] max-w-xl mx-auto leading-relaxed">
            Partner with us to bring workshops, hackathons, or training programs to your institution or organization.
          </p>
          <div className="pt-2">
            <Link to="/contact">
              <Button variant="hero" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Registration Dialog */}
      <EventRegistrationDialog
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
      />
    </div>
  );
};
