'use client';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import Icon from './Icon';
import { toggleBookmark } from '@/actions/resources';

export default function BookmarkButton({
  resourceId, initialSaved, variant = 'icon',
}: { resourceId: string; initialSaved: boolean; variant?: 'icon' | 'full' | 'remove' }) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, start] = useTransition();

  function onClick() {
    start(async () => {
      const res = await toggleBookmark(resourceId);
      if (!res.ok) return void toast.error(res.error ?? 'Something went wrong.');
      setSaved(!!res.saved);
      toast.success(res.saved ? 'Saved to your library.' : 'Removed from saved.');
    });
  }

  if (variant === 'remove') {
    return (
      <button onClick={onClick} disabled={pending} className="text-error hover:underline text-label-sm flex items-center gap-1">
        <Icon name="bookmark_remove" size={14} /> Remove
      </button>
    );
  }
  if (variant === 'full') {
    return (
      <button
        onClick={onClick} disabled={pending}
        className="px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-white hover:bg-surface-container text-on-surface text-title-md transition flex items-center gap-1.5 disabled:opacity-60"
      >
        <Icon name={saved ? 'bookmark' : 'bookmark_border'} filled={saved} className={saved ? 'text-primary' : ''} />
        {saved ? 'Saved' : 'Save'}
      </button>
    );
  }
  return (
    <button
      onClick={onClick} disabled={pending} title={saved ? 'Remove from saved' : 'Save resource'}
      className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition disabled:opacity-60"
    >
      <Icon name={saved ? 'bookmark' : 'bookmark_border'} filled={saved} className={saved ? 'text-primary' : ''} />
    </button>
  );
}