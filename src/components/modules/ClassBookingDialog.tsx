import React, { useState } from 'react';
import {
  Video,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  MapPin,
  Laptop,
} from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { ClassBookingFormData } from '../../types';
import { CAMPUS_HUBS } from '../../data/learningModesData';

interface ClassBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'online' | 'offline' | 'hybrid';
}

export const ClassBookingDialog: React.FC<ClassBookingDialogProps> = ({
  isOpen,
  onClose,
  defaultMode = 'online',
}) => {
  const [bookingType, setBookingType] = useState<'online-demo' | 'campus-tour'>(
    defaultMode === 'offline' ? 'campus-tour' : 'online-demo'
  );

  const [formData, setFormData] = useState<ClassBookingFormData>({
    bookingType: defaultMode === 'offline' ? 'campus-tour' : 'online-demo',
    name: '',
    email: '',
    phone: '',
    track: 'Generative AI & LLM Systems',
    campusCity: 'Hyderabad',
    preferredDate: '',
    timeSlot: '11:00 AM - 12:30 PM (Morning Slot)',
    questions: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleTypeChange = (type: 'online-demo' | 'campus-tour') => {
    setBookingType(type);
    setFormData((prev) => ({ ...prev, bookingType: type }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const isOnline = bookingType === 'online-demo';
      toast({
        title: isOnline ? 'Demo Class Reserved!' : 'Campus Tour Confirmed!',
        description: isOnline
          ? `We emailed your private access link for the ${formData.track} live session to ${formData.email}.`
          : `Your campus lab pass for Innovex ${formData.campusCity} Hub has been generated and sent to ${formData.email}.`,
        variant: 'success',
      });
      onClose();
      setFormData({
        bookingType: 'online-demo',
        name: '',
        email: '',
        phone: '',
        track: 'Generative AI & LLM Systems',
        campusCity: 'Hyderabad',
        preferredDate: '',
        timeSlot: '11:00 AM - 12:30 PM (Morning Slot)',
        questions: '',
      });
    }, 800);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={bookingType === 'online-demo' ? 'Reserve Free Live Demo Class' : 'Schedule In-Person Campus Tour'}
      description="Experience our learning ecosystem firsthand before you make any commitment. 100% free with no obligations."
    >
      <div className="space-y-4">
        {/* Toggle between Online Demo and Campus Tour */}
        <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] gap-1">
          <button
            type="button"
            onClick={() => handleTypeChange('online-demo')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
              bookingType === 'online-demo'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-cyan-400" />
            <span>Online Live Demo Class</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('campus-tour')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
              bookingType === 'campus-tour'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Campus Lab Walkthrough</span>
          </button>
        </div>

        {/* Highlights banner based on selected type */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300 flex items-start gap-2.5">
          {bookingType === 'online-demo' ? (
            <>
              <Laptop className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-white">Live Online Interactive Session:</span> Join an active cohort on Google Meet / Discord, test-drive our cloud code sandbox, and interact directly with the lead instructor.
              </div>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-white">In-Person Campus Lab Visit:</span> Tour our dedicated RTX GPU workstations, inspect high-speed gigabit setup, sit in on an active sprint, and speak 1-on-1 with senior faculty.
              </div>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Track Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Interested Technology Track
            </label>
            <select
              value={formData.track}
              onChange={(e) => setFormData({ ...formData, track: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg bg-white/[0.04] border border-white/[0.1] text-foreground focus:outline-none focus:border-cyan-400 transition-colors"
              required
            >
              <option value="Generative AI & LLM Systems" className="bg-[#0b101d] text-white">
                Generative AI, RAG & LLM Systems
              </option>
              <option value="Full-Stack Web3 & Cloud Architecture" className="bg-[#0b101d] text-white">
                Full-Stack (React, Next.js, Node & Microservices)
              </option>
              <option value="Cloud Computing & DevOps (AWS/K8s)" className="bg-[#0b101d] text-white">
                Cloud Computing & DevOps (AWS, Docker, Kubernetes)
              </option>
              <option value="AI & Machine Learning Engineering" className="bg-[#0b101d] text-white">
                AI & Machine Learning Engineering (PyTorch, MLOps)
              </option>
              <option value="Cybersecurity & Ethical Hacking" className="bg-[#0b101d] text-white">
                Cybersecurity & Network Defense
              </option>
            </select>
          </div>

          {/* Campus Location (Only if campus tour) */}
          {bookingType === 'campus-tour' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Campus Hub
              </label>
              <select
                value={formData.campusCity}
                onChange={(e) => setFormData({ ...formData, campusCity: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white/[0.04] border border-white/[0.1] text-foreground focus:outline-none focus:border-purple-400 transition-colors"
                required
              >
                {CAMPUS_HUBS.map((hub) => (
                  <option key={hub.id} value={hub.city} className="bg-[#0b101d] text-white">
                    {hub.city} Hub ({hub.area})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Personal details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name"
              placeholder="e.g. Rahul Verma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="rahul@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone / WhatsApp"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Preferred Slot
              </label>
              <select
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white/[0.04] border border-white/[0.1] text-foreground focus:outline-none focus:border-cyan-400 transition-colors"
              >
                <option value="11:00 AM - 12:30 PM (Morning Slot)" className="bg-[#0b101d] text-white">
                  Morning (11:00 AM - 12:30 PM)
                </option>
                <option value="3:00 PM - 4:30 PM (Afternoon Slot)" className="bg-[#0b101d] text-white">
                  Afternoon (3:00 PM - 4:30 PM)
                </option>
                <option value="7:00 PM - 8:30 PM (Evening Slot)" className="bg-[#0b101d] text-white">
                  Evening (7:00 PM - 8:30 PM)
                </option>
                <option value="Weekend Special (Saturday 2:00 PM)" className="bg-[#0b101d] text-white">
                  Saturday Intensive (2:00 PM - 3:30 PM)
                </option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant={bookingType === 'campus-tour' ? 'secondary' : 'hero'}
              size="sm"
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                'Processing...'
              ) : bookingType === 'online-demo' ? (
                'Confirm Free Online Demo'
              ) : (
                'Confirm Campus Pass'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};
