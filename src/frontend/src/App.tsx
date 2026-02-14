import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import HumanizerPage from './pages/HumanizerPage';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <HumanizerPage />
        </main>
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
