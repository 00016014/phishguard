'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  className?: string;
}

const Header = ({ className = '' }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const primaryNavItems = [
    { name: 'Scan & Detect', href: '/scan-detect-hub', icon: 'ShieldCheckIcon' },
    { name: 'Threat Intelligence', href: '/threat-intelligence-database', icon: 'CircleStackIcon' },
    { name: 'Learning Lab', href: '/interactive-learning-lab', icon: 'AcademicCapIcon' },
    { name: 'Dashboard', href: '/personal-dashboard', icon: 'ChartBarIcon' },
  ];

  const secondaryNavItems = [
    { name: 'API Documentation', href: '/api-documentation', icon: 'CodeBracketIcon' },
    { name: 'Pricing', href: '/pricing', icon: 'CreditCardIcon' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsMoreMenuOpen(false);
  };

  const toggleMoreMenu = () => {
    setIsMoreMenuOpen(!isMoreMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMoreMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
      router.push('/homepage');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-card shadow-md ${className}`}>
      <div className="w-full">
        <div className="flex items-center justify-between h-16 px-4 lg:px-8">
          <Link
            href="/homepage"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            onClick={closeMobileMenu}
          >
            <Image src="/logo.png" alt="PhishGuard Logo" width={40} height={40} className="rounded-lg shadow-sm" />
            <div className="flex flex-col">
              <span className="text-xl font-headline font-bold text-primary leading-none">
                PhishGuard
              </span>
              <span className="text-xs font-body text-muted-foreground leading-none mt-0.5">
                AI-Powered Protection
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-1">
            {primaryNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-foreground hover:text-brand-primary hover:bg-surface rounded-md transition-all duration-300"
              >
                <Icon name={item.icon as any} size={18} />
                <span>{item.name}</span>
              </Link>
            ))}

            <div className="relative">
              <button
                onClick={toggleMoreMenu}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-foreground hover:text-brand-primary hover:bg-surface rounded-md transition-all duration-300"
              >
                <Icon name="EllipsisHorizontalIcon" size={18} />
                <span>More</span>
              </button>

              {isMoreMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMoreMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-md shadow-lg z-50 animate-fade-in">
                    <div className="py-1">
                      {secondaryNavItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-popover-foreground hover:bg-surface transition-colors"
                          onClick={() => setIsMoreMenuOpen(false)}
                        >
                          <Icon name={item.icon as any} size={18} />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </nav>

          <div className="hidden lg:flex items-center space-x-3">
            {!loading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-foreground hover:text-brand-primary hover:bg-surface rounded-md transition-all duration-300"
                    >
                      {user?.profile?.avatar ? (
                        <img
                          src={user.profile.avatar}
                          alt="Avatar"
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-brand-primary/30"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-7 h-7 bg-brand-primary/20 rounded-full text-xs font-bold text-brand-primary select-none">
                          {user?.first_name && user?.last_name
                            ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
                            : (user?.username?.slice(0, 2) ?? '??').toUpperCase()}
                        </div>
                      )}
                      <span className="max-w-[120px] truncate">{user?.email?.split('@')[0]}</span>
                      <Icon name="ChevronDownIcon" size={14} className="text-muted-foreground" />
                    </button>
                    {isUserMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                        <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg z-50">
                          <div className="py-1">
                            <Link
                              href="/profile"
                              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-popover-foreground hover:bg-surface transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Icon name="UserCircleIcon" size={16} />
                              <span>Profile</span>
                            </Link>
                            <Link
                              href="/pricing"
                              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-popover-foreground hover:bg-surface transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Icon name="CreditCardIcon" size={16} />
                              <span>Upgrade Plan</span>
                            </Link>
                            {user?.profile?.role === 'admin' && (
                              <Link
                                href="/admin"
                                className="flex items-center space-x-3 px-4 py-2.5 text-sm text-popover-foreground hover:bg-surface transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <Icon name="LockClosedIcon" size={16} />
                                <span>Admin Panel</span>
                              </Link>
                            )}
                            <div className="border-t border-border my-1" />
                            <button
                              onClick={handleSignOut}
                              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-red-500 hover:bg-surface transition-colors w-full text-left"
                            >
                              <Icon name="ArrowRightOnRectangleIcon" size={16} />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/10 rounded-md transition-all duration-300"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
            <Link
              href="/scan-detect-hub"
              className="px-5 py-2.5 text-sm font-cta font-semibold text-white bg-brand-accent hover:bg-brand-accent/90 rounded-md shadow-sm transition-all duration-300 hover:shadow-md"
            >
              Start Free Scan
            </Link>
          </div>

          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-foreground hover:text-brand-primary hover:bg-surface rounded-md transition-colors"
            aria-label="Toggle mobile menu"
          >
            <Icon
              name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'}
              size={24}
            />
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden bg-card border-t border-border animate-slide-in-right">
            <nav className="px-4 py-4 space-y-1">
              {primaryNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-foreground hover:text-brand-primary hover:bg-surface rounded-md transition-colors"
                  onClick={closeMobileMenu}
                >
                  <Icon name={item.icon as any} size={20} />
                  <span>{item.name}</span>
                </Link>
              ))}

              <div className="pt-2 border-t border-border">
                <div className="text-xs font-semibold text-muted-foreground px-4 py-2">
                  More Options
                </div>
                {secondaryNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-foreground hover:text-brand-primary hover:bg-surface rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Icon name={item.icon as any} size={20} />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                {!loading && (
                  user ? (
                    <>  
                      <div className="flex items-center space-x-3 px-4 py-2">
                        {user?.profile?.avatar ? (
                          <img
                            src={user.profile.avatar}
                            alt="Avatar"
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-brand-primary/30 flex-shrink-0"
                          />
                        ) : (
                          <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 bg-brand-primary/20 rounded-full text-xs font-bold text-brand-primary select-none">
                            {user?.first_name && user?.last_name
                              ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
                              : (user?.username?.slice(0, 2) ?? '??').toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm text-foreground truncate">{user?.email}</span>
                      </div>
                      <button
                        onClick={() => { handleSignOut(); closeMobileMenu(); }}
                        className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-red-500 hover:bg-surface rounded-md transition-colors w-full"
                      >
                        <Icon name="ArrowRightOnRectangleIcon" size={20} />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center justify-center w-full px-5 py-3 text-base font-medium text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/10 rounded-md transition-all"
                      onClick={closeMobileMenu}
                    >
                      Sign In
                    </Link>
                  )
                )}
                <Link
                  href="/scan-detect-hub"
                  className="flex items-center justify-center w-full px-5 py-3 text-base font-cta font-semibold text-white bg-brand-accent hover:bg-brand-accent/90 rounded-md shadow-sm transition-all"
                  onClick={closeMobileMenu}
                >
                  Start Free Scan
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;