import type { Metadata } from 'next';
import { Suspense } from 'react';
import Header from '@/components/common/Header';
import LearningLabInteractive from './components/LearningLabInteractive';

export const metadata: Metadata = {
  title: 'Interactive Learning Lab - PhishGuard',
  description: 'Master cybersecurity through gamified quizzes, realistic phishing simulations, and comprehensive skill assessments in a safe, hands-on learning environment.',
};

export default function InteractiveLearningLabPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <Suspense>
          <LearningLabInteractive />
        </Suspense>
      </div>
    </div>
  );
}