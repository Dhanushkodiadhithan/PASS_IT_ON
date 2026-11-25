import Icon from './Icon';

export default function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  return (
    <form action="/search" method="get" className="flex items-center bg-white rounded-xl p-1.5 shadow-md border border-outline-variant/30">
      <Icon name="search" size={22} className="ml-3 text-on-surface-variant" />
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder="Search notes, question papers, syllabus, and more"
        className="w-full px-3 py-2 bg-transparent text-on-surface text-body-md focus:outline-none placeholder:text-on-surface-variant/60"
      />
      <button type="submit" className="px-5 py-2.5 rounded-lg bg-primary text-on-primary text-title-md hover:bg-primary-container transition shrink-0">
        Search
      </button>
    </form>
  );
}