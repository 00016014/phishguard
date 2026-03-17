import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Scan & Detect', href: '/scan-detect-hub' },
      { name: 'Threat Intelligence', href: '/threat-intelligence-database' },
      { name: 'Learning Lab', href: '/interactive-learning-lab' },
      { name: 'Dashboard', href: '/personal-dashboard' },
    ],
    resources: [
      { name: 'API Documentation', href: '/api-documentation' },
      { name: 'Help Center', href: '#' },
      { name: 'Video Tutorials', href: '#' },
      { name: 'Community Forum', href: '#' },
    ],
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Press Kit', href: '#' },
      { name: 'Contact', href: '#' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Security', href: '#' },
      { name: 'Compliance', href: '#' },
    ],
  };

  const socialLinks = [
    { name: 'Twitter', icon: 'AtSymbolIcon', href: '#' },
    { name: 'LinkedIn', icon: 'BuildingOfficeIcon', href: '#' },
    { name: 'GitHub', icon: 'CodeBracketIcon', href: '#' },
    { name: 'YouTube', icon: 'PlayIcon', href: '#' },
  ];

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <Link href="/homepage" className="flex items-center space-x-3 mb-4">
              <Image src="/logo.png" alt="PhishGuard Logo" width={40} height={40} className="rounded-lg" />
              <div className="flex flex-col">
                <span className="text-xl font-headline font-bold leading-none">PhishGuard</span>
                <span className="text-xs text-white/70 leading-none mt-0.5">AI-Powered Protection</span>
              </div>
            </Link>
            <p className="text-sm text-white/80 mb-4 max-w-sm">
              Making cybersecurity accessible to everyone through AI-powered detection and comprehensive education.
            </p>
            <div className="flex items-center space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                  aria-label={social.name}
                >
                  <Icon name={social.icon as any} size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-headline font-bold mb-4 uppercase tracking-wider">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-headline font-bold mb-4 uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-headline font-bold mb-4 uppercase tracking-wider">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-headline font-bold mb-4 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-white/70">
              &copy; {currentYear} PhishGuard. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <Icon name="ShieldCheckIcon" size={16} variant="solid" className="text-success" />
                <span>SOC 2 Certified</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <Icon name="LockClosedIcon" size={16} variant="solid" className="text-success" />
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}