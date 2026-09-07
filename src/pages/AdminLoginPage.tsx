import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';
import { CyberCard } from '../components/ui/CyberCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isModeSignUp, setIsModeSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: isModeSignUp ? 'Account Requested' : 'Admin Authenticated',
        description: isModeSignUp
          ? 'Admin access request has been sent for approval.'
          : 'Welcome to the Innovex Arena Administrator Portal.',
        variant: 'success',
      });
      setTimeout(() => navigate('/'), 1200);
    }, 900);
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 pt-24 pb-16">
      <div className="w-full max-w-md space-y-5 animate-fade-up">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-cyan-300 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Home
        </Link>

        <CyberCard glow="cyan" className="p-7 sm:p-9 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-11 h-11 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-foreground tracking-tight">
              {isModeSignUp ? 'Request Admin Access' : 'Admin Sign In'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Access the management console for hackathons, positions, and platform inquiries.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@innovexarena.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1.5 relative">
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                Password <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0b101e]/80 border border-white/[0.08] text-foreground text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 pr-10 transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-white/[0.04]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<Lock className="w-4 h-4 ml-1" />}
            >
              {isModeSignUp ? 'Submit Access Request' : 'Sign In to Portal'}
            </Button>
          </form>

          <div className="pt-3 text-center text-xs text-slate-400 border-t border-white/[0.06]">
            {isModeSignUp ? (
              <p>
                Already have an admin account?{' '}
                <button
                  type="button"
                  onClick={() => setIsModeSignUp(false)}
                  className="text-cyan-400 hover:underline font-semibold cursor-pointer ml-1"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Need administrative privileges?{' '}
                <button
                  type="button"
                  onClick={() => setIsModeSignUp(true)}
                  className="text-cyan-400 hover:underline font-semibold cursor-pointer ml-1"
                >
                  Request Access
                </button>
              </p>
            )}
          </div>
        </CyberCard>
      </div>
    </div>
  );
};
