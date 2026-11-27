'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import Icon from './Icon';
import { btnPrimary, inputCls, labelCls } from './ui';
import { DEPARTMENTS, YEARS } from '@/lib/constants';
import { yearLabel } from '@/lib/format';
import { login, signup } from '@/actions/auth';

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError('');
    start(async () => {
      const res = mode === 'signin' ? await login(fd) : await signup(fd);
      if (!res.ok) { setError(res.error ?? 'Something went wrong.'); return; }
      if (mode === 'signup' && !('verified' in res && res.verified)) {
        toast.success('Account created. Check your college email to verify, then sign in.');
        setMode('signin');
        return;
      }
      toast.success(mode === 'signin' ? 'Welcome back!' : 'Account created. Welcome to PassItOn!');
      router.push('/');
      router.refresh();
    });
  }

  const tab = (m: 'signin' | 'signup', label: string) => (
    <button
      type="button" onClick={() => { setMode(m); setError(''); setShowPw(false); }}
      className={`py-2 text-center text-title-md rounded-lg transition-all ${
        mode === m ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
      }`}
    >{label}</button>
  );

  return (
    <div className="auth-card w-full max-w-lg bg-white border border-outline-variant/30 rounded-2xl shadow-xl p-6">
      <div className="auth-head text-center mb-4">
        <div className="auth-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-primary text-label-sm mb-2">
          <Icon name="school" size={16} /> Verified Campus Network
        </div>
        <h2 className="text-headline-md text-on-surface">Access College Resources</h2>
        <p className="auth-sub text-body-sm text-on-surface-variant mt-1">Sign in with your college email.</p>
      </div>

      <div className="auth-tabs grid grid-cols-2 p-1 bg-surface-container-low rounded-xl mb-4 border border-outline-variant/20">
        {tab('signin', 'Sign In')}
        {tab('signup', 'Create Account')}
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {mode === 'signup' && (
          <div>
            <label className={labelCls}>Full Name</label>
            <input name="fullName" required className={inputCls} placeholder="Aarav Sharma" />
          </div>
        )}
        <div>
          <label className={labelCls}>Email</label>
          <input name="email" type="email" required className={inputCls} placeholder="you@campus.edu" />
        </div>
        {mode === 'signup' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Department</label>
              <select name="department" className={inputCls} defaultValue="CSE">
                {DEPARTMENTS.map((d) => <option key={d.code} value={d.code}>{d.code}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Academic Year</label>
              <select name="academicYear" className={inputCls} defaultValue="1">
                {YEARS.map((y) => <option key={y} value={y}>{yearLabel(y)}</option>)}
              </select>
            </div>
          </div>
        )}
        <div>
          <label className={labelCls}>Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPw ? 'text' : 'password'}
              required
              minLength={mode === 'signup' ? 8 : undefined}
              className={`${inputCls} pr-11`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              aria-pressed={showPw}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-on-surface-variant hover:text-on-surface"
            >
              <Icon name={showPw ? 'visibility_off' : 'visibility'} size={20} />
            </button>
          </div>
        </div>
        {error && <p className="text-body-sm text-error">{error}</p>}
        <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
          {pending ? 'Please wait…' : mode === 'signin' ? 'Sign In to PassItOn' : 'Create Account'}
          {!pending && <Icon name="arrow_forward" />}
        </button>
      </form>
    </div>
  );
}