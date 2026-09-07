import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight, Users, Sparkles } from 'lucide-react';
import { EVENTS_DATA, PAST_EVENTS_DATA } from '../data/siteData';
import { Button } from '../components/ui/Button';
import { CyberCard } from '../components/ui/CyberCard';
import { EventRegistrationDialog } from '../components/modules/EventRegistrationDialog';
import { EventItem } from '../types';

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
      {/* 1. HERO */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-3 animate-fade-up">
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight text-white leading-tight">
          Events & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-400">Programs</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Join our workshops, hackathons, and training programs to learn, build, and grow with the tech community.
        </p>
      </section>

      {/* 2. FILTER TABS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex justify-center animate-fade-up">
        <div className="inline-flex flex-wrap justify-center p-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md gap-1">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                activeFilter === tab
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-[0_0_12px_rgba(0,217,255,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
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
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
            Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Events</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
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
                <h3 className="font-heading font-bold text-lg text-foreground group-hover:text-cyan-300 transition-colors leading-tight">
                  {evt.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                  {evt.description}
                </p>

                {/* Event Details */}
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                    <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{evt.location}</span>
                  </div>
                </div>

                {/* Tags */}
                {evt.tags && evt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {evt.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.03] border border-white/[0.06] text-slate-400"
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
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
            Past <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Events</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            A look back at our successful events and programs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PAST_EVENTS_DATA.map((evt, i) => (
            <CyberCard key={i} glow="purple" className="p-5">
              <div className="space-y-3">
                {/* Title */}
                <h3 className="font-heading text-base font-bold text-white leading-tight">
                  {evt.title}
                </h3>

                {/* Event Info */}
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{evt.attendees}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
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
        <div className="relative rounded-2xl p-8 sm:p-10 overflow-hidden border border-white/[0.08] bg-slate-950/80 backdrop-blur-xl text-center">
          <div className="relative z-10 space-y-4">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white">
              Want to Host an Event?
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
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
