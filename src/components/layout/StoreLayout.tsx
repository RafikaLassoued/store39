import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { WhatsAppButton } from './WhatsAppButton';

interface StoreLayoutProps {
  adminPath: string;
}

export function StoreLayout({ adminPath }: StoreLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header adminPath={adminPath} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
