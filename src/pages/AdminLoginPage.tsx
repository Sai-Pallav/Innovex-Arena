import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';
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
      {/* Background Hero Bloom */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-96 ultraviolet-hero-bloom pointer-events-none" />

      <div className="w-full max-w-md space-y-5 animate-fade-up relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9b96b0] hover:text-[#ba9cff] transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Home
        </Link>

        {/* Observatory Card */}
        <div
          className="relative rounded-2xl bg-[#0a0118] border border-white/[0.12] p-7 sm:p-9 space-y-6 overflow-hidden"
          style={{ boxShadow: 'inset 0 0 24px rgba(255,255,255,0.04), 0 20px 40px rgba(0,0,0,0.6)' }}
        >
          {/* Top hairline aurora glow */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ba9cff]/50 to-transparent" />

          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#713dff]/15 border border-[#713dff]/30 flex items-center justify-center text-[#ba9cff] mb-2 shadow-[0_0_20px_rgba(113,61,255,0.3)]">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="font-rebond font-bold text-xl sm:text-2xl text-white tracking-tight">
              {isModeSignUp ? 'Request Admin Access' : 'Admin Sign In'}
            </h2>
            <p className="text-xs text-[#9b96b0] leading-relaxed max-w-xs mx-auto">
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
              <label className="block text-xs font-medium uppercase tracking-wider text-[#9b96b0]">
                Password <span className="text-[#e59cff]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.12] text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#9382ff] focus:ring-1 focus:ring-[#9382ff]/50 pr-10 transition-all font-mono"
                  style={{ boxShadow: 'inset 0 0 12px rgba(255,255,255,0.02)' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9b96b0] hover:text-white cursor-pointer p-1 rounded-full hover:bg-white/[0.06]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full mt-3 cursor-pointer"
              isLoading={isLoading}
              rightIcon={<Lock className="w-4 h-4 ml-1" />}
            >
              {isModeSignUp ? 'Submit Access Request' : 'Sign In to Portal'}
            </Button>
          </form>

          <div className="pt-3 text-center text-xs text-[#9b96b0] border-t border-white/[0.08]">
            {isModeSignUp ? (
              <p>
                Already have an admin account?{' '}
                <button
                  type="button"
                  onClick={() => setIsModeSignUp(false)}
                  className="text-[#ba9cff] hover:text-[#e59cff] hover:underline font-semibold cursor-pointer ml-1"
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
                  className="text-[#ba9cff] hover:text-[#e59cff] hover:underline font-semibold cursor-pointer ml-1"
                >
                  Request Access
                </button>
              </p>
            )}
          </div>
          <div className="card-underglow-beam" />
        </div>
      </div>
    </div>
  );
};
