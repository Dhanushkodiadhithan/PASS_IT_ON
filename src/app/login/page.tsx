import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <div className="app-shell">
      <Header showNav={false} />
      {/* m-auto centers the card when there is room; if the viewport is too short even after
          the spacing tweak, only this area scrolls (never the whole page) */}
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex px-4 py-3 bg-surface-container-lowest">
        <div className="m-auto w-full flex justify-center">
          <AuthForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}