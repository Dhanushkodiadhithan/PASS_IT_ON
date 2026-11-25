import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <>
      <Header showNav={false} />
      <main className="flex-1 flex items-center justify-center px-4 py-10 bg-surface-container-lowest">
        <AuthForm />
      </main>
      <Footer />
    </>
  );
}