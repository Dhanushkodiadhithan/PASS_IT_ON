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
      type="button" onClick={() => { setMode(m); setError(''); }}
      className={`py-2 text-center text-title-md rounded-lg transition-all ${
        mode === m ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
      }`}
    >{label}</button>
  );

  return (
    <div className="w-full max-w-lg bg-white border border-outline-variant/30 rounded-2xl shadow-xl p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-primary text-label-sm mb-3">
          <Icon name="school" size={16} /> Verified Campus Network
        </div>
        <h2 className="text-headline-md text-on-surface">Access College Resources</h2>
        <p className="text-body-sm text-on-surface-variant mt-1">Sign in with your college email.</p>
      </div>

      <div className="grid grid-cols-2 p-1 bg-surface-container-low rounded-xl mb-6 border border-outline-variant/20">
        {tab('signin', 'Sign In')}
        {tab('signup', 'Create Account')}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className={labelCls}>Full Name</label>
            <input name="fullName" required className={inputCls} placeholder="Aarav Sharma" />
          </div>
        )}
        <div>
          <label className={labelCls}>College Email</label>
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
          <input name="password" type="password" required minLength={mode === 'signup' ? 8 : undefined} className={inputCls} placeholder="••••••••" />
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