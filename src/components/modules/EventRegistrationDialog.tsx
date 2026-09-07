import React, { useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { EventItem, EventRegistrationFormData } from '../../types';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

interface EventRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
}

export const EventRegistrationDialog: React.FC<EventRegistrationDialogProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const [formData, setFormData] = useState<EventRegistrationFormData>({
    name: '',
    email: '',
    phone: '',
    college: '',
    yearOfStudy: '3rd Year',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: 'Registration Confirmed',
        description: `You are registered for "${event.title}". Check your email for joining details.`,
        variant: 'success',
      });
      onClose();
      setFormData({
        name: '',
        email: '',
        phone: '',
        college: '',
        yearOfStudy: '3rd Year',
      });
    }, 800);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Event Registration"
      description={`Secure your slot for ${event.title}`}
    >
      <div className="mb-5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2 text-foreground font-medium">
          <div className="flex items-center gap-1.5 text-primary">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-foreground">{event.date}</span>
          </div>
          <span className="text-white/20">•</span>
          <div className="flex items-center gap-1.5 text-primary">
            <Clock className="w-3.5 h-3.5" />
            <span>{event.time}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span>{event.location} ({event.mode})</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="e.g. Alex Morgan"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Email Address"
            type="email"
            placeholder="alex@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="College / Institution"
            placeholder="e.g. VIT University"
            value={formData.college}
            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
              Year of Study <span className="text-primary">*</span>
            </label>
            <select
              value={formData.yearOfStudy}
              onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0b101e]/80 border border-white/[0.08] text-foreground text-sm focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 transition-all cursor-pointer"
              required
            >
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="Working Professional">Working Professional</option>
            </select>
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.06]">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="hero"
            size="md"
            isLoading={isSubmitting}
            rightIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm Registration
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
