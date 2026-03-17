import type { Metadata } from 'next';
import HomepageInteractive from './components/HomepageInteractive';

export const metadata: Metadata = {
  title: 'PhishGuard - AI-Powered Cybersecurity Protection & Education',
  description: 'Transform phishing detection into proactive learning with PhishGuard. Real-time AI threat scanning, comprehensive cybersecurity education, and community-driven defense network. Join 150K+ protected users today.',
};

export default function Homepage() {
  return <HomepageInteractive />;
}