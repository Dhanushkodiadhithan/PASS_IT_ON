export default function Footer() {
  return (
    <footer className="w-full shrink-0 bg-surface-container-low border-t border-outline-variant/30 shadow-[0_-1px_8px_rgba(0,0,0,0.04)] py-2">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-title-md text-primary font-bold">PassItOn</span>
          <span className="text-body-sm text-on-surface-variant">— Open Academic Exchange</span>
        </div>
        <p className="text-body-sm text-on-surface-variant text-center">
          © {new Date().getFullYear()} PassItOn. Built for students, by students.
        </p>
      </div>
    </footer>
  );
}