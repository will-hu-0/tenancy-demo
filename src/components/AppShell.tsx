import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, Menu, User, Users, X } from 'lucide-react';
import { UserAccount, UserRole } from '../types';
import { ZurelyLogo } from './ZurelyLogo';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
}

interface AppShellProps {
  user: UserAccount;
  navItems: NavItem[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const ROLE_DISPLAY: Record<UserRole, string> = {
  tenant: 'Tenant',
  agency: 'Agent',
  landlord: 'Landlord',
};

export const AppShell: React.FC<AppShellProps> = ({
  user,
  navItems,
  activeTab,
  onSelectTab,
  onSwitchRole,
  onLogout,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-[#E2E8F0] z-30">
        <div className="h-16 px-6 flex items-center border-b border-transparent">
          <ZurelyLogo />
        </div>

        <nav aria-label="Primary navigation" className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#EEF4FF] text-[#0F2942] font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F2942] font-medium'
                }`}
              >
                <span className="flex items-center gap-3 whitespace-nowrap">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#1D4ED8]' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </span>
                {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                  <span className="text-xs font-semibold tabular-nums text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 rounded-md">
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-5 border-t border-slate-100">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#DC2626] hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#0F2942]/30 backdrop-blur-[1px]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[82vw] bg-white h-full flex flex-col border-r border-[#E2E8F0] z-10">
            <div className="h-16 px-5 flex items-center justify-between border-b border-[#E2E8F0]">
              <ZurelyLogo />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#EEF4FF] text-[#0F2942] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F2942] font-medium'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#1D4ED8]' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </span>
                    {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                      <span className="text-xs font-semibold tabular-nums text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 rounded-md">
                        {item.badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="px-4 py-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-[#DC2626] hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden">
              <ZurelyLogo />
            </div>
            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
              <span>TenancyMY</span>
              <span aria-hidden="true">/</span>
              <span className="font-medium text-[#0F2942]">{ROLE_DISPLAY[user.role]} Portal</span>
            </div>
          </div>

          {/* Right User Menu matching Zurely screenshot */}
          <div className="flex items-center gap-3 shrink-0" ref={dropdownRef}>
            {user.licenseNumber && (
              <span className="hidden sm:inline-flex items-center text-xs font-medium text-[#1D4ED8] bg-[#EEF4FF] border border-[#BFDBFE] px-3 py-1.5 rounded-full whitespace-nowrap">
                {user.licenseNumber}
              </span>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-[#E0EAFF] text-[#1D4ED8] font-bold text-xs flex items-center justify-center shrink-0">
                  {user.initials}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-sm font-semibold text-[#0F2942] whitespace-nowrap">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500">{ROLE_DISPLAY[user.role]}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <div className="text-sm font-semibold text-[#0F2942] truncate">
                      {user.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{user.phone}</div>
                  </div>

                  <div className="py-1 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab('profile');
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[#0F2942] hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </button>
                  </div>

                  <div className="py-1.5 border-b border-slate-100">
                    <div className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Switch Demo Role</span>
                    </div>
                    {(['tenant', 'agency', 'landlord'] as UserRole[]).map((roleOption) => (
                      <button
                        key={roleOption}
                        type="button"
                        onClick={() => {
                          onSwitchRole(roleOption);
                          setDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                          user.role === roleOption
                            ? 'font-semibold text-[#1D4ED8] bg-[#EEF4FF]/60'
                            : 'text-slate-600'
                        }`}
                      >
                        <span>{ROLE_DISPLAY[roleOption]} Portal</span>
                        {user.role === roleOption && <span>Active</span>}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm font-medium text-[#DC2626] hover:bg-red-50 flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
