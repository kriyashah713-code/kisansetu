import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Building2,
  Camera,
  CheckCircle2,
  ClipboardList,
  Compass,
  FileText,
  History,
  Home,
  Layers,
  LogOut,
  Menu,
  MessageSquare,
  PackageCheck,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  TrendingUp,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { translateRole } from '../i18n';
import { UserRole } from '../types/kisansetu';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationsDrawer } from './NotificationsDrawer';
import { ResilientImage } from './ResilientImage';

interface AppShellProps {
  children: React.ReactNode;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { state, t, logout, loginAsDemoRole, resetDemoWorkspace } = useKisanSetu();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const role = state.activeRole;

  const unreadCount = state.notifications.filter(
    (n) => !n.read && (!n.targetRole || n.targetRole === 'all' || n.targetRole === role)
  ).length;

  const farmerPrimaryNav: NavItem[] = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: Home },
    { to: '/farm', label: t('nav.myFarm'), icon: Sprout },
    { to: '/scanner', label: t('nav.cropScanner'), icon: Camera },
    { to: '/market', label: t('nav.marketPulse'), icon: TrendingUp },
    { to: '/marketplace', label: t('nav.sellCrop'), icon: ShoppingBag },
    { to: '/orders', label: t('nav.orders'), icon: PackageCheck },
    { to: '/transport', label: t('nav.transport'), icon: Truck },
    { to: '/assistant', label: t('nav.aiAssistant'), icon: MessageSquare },
  ];

  const farmerSecondaryNav: NavItem[] = [
    { to: '/decision', label: t('nav.cropDecision'), icon: Compass },
    { to: '/supply', label: t('nav.supplyMatch'), icon: Layers },
    { to: '/history', label: t('nav.farmHistory'), icon: History },
    { to: '/settings', label: t('nav.settingsProfile'), icon: Settings },
  ];

  const buyerNav: NavItem[] = [
    { to: '/buyer', label: t('nav.buyerOverview'), icon: Home },
    { to: '/buyer/requirements', label: t('nav.requirements'), icon: ClipboardList },
    { to: '/buyer/marketplace', label: t('nav.browseSupply'), icon: ShoppingBag },
    { to: '/orders', label: t('nav.orders'), icon: PackageCheck },
    { to: '/transport', label: t('nav.transport'), icon: Truck },
  ];

  const transportNav: NavItem[] = [
    { to: '/transport/provider', label: t('nav.providerJobs'), icon: Truck },
    { to: '/transport', label: t('nav.liveTracking'), icon: Compass },
  ];

  const adminNav: NavItem[] = [
    { to: '/admin', label: t('admin.tabOverview'), icon: Home },
    { to: '/admin?tab=farmers', label: t('admin.tabFarmers'), icon: Users },
    { to: '/admin?tab=buyers', label: t('admin.tabBuyers'), icon: Building2 },
    { to: '/admin?tab=listings', label: t('admin.tabListings'), icon: ShoppingBag },
    { to: '/admin?tab=requirements', label: t('admin.tabRequirements'), icon: ClipboardList },
    { to: '/admin?tab=orders', label: t('admin.tabOrders'), icon: PackageCheck },
    { to: '/admin?tab=transport', label: t('admin.tabTransport'), icon: Truck },
    { to: '/admin?tab=scans', label: t('admin.tabAiScans'), icon: Camera },
    { to: '/admin?tab=ai-logs', label: t('admin.tabAssistantLogs'), icon: MessageSquare },
    { to: '/admin?tab=guidance', label: t('admin.tabGuidance'), icon: FileText },
    { to: '/admin?tab=settings', label: t('admin.tabSettings'), icon: ShieldCheck },
  ];

  const primaryGroup =
    role === 'buyer'
      ? buyerNav
      : role === 'transport'
      ? transportNav
      : role === 'admin'
      ? adminNav
      : farmerPrimaryNav;

  const secondaryGroup: NavItem[] =
    role === 'farmer'
      ? farmerSecondaryNav
      : [{ to: '/settings', label: t('nav.settingsProfile'), icon: Settings }];

  const allNav = [...primaryGroup, ...secondaryGroup];

  const currentTitle = (() => {
    if (location.pathname === '/settings' || location.pathname === '/profile') {
      return t('nav.settingsProfile');
    }
    if (location.pathname === '/crop-scanner') return t('nav.cropScanner');
    if (location.pathname === '/sell') return t('nav.sellCrop');
    if (location.pathname === '/ai-assistant') return t('nav.aiAssistant');
    if (role === 'admin' && location.pathname === '/admin') {
      const tab = new URLSearchParams(location.search).get('tab');
      const matched = adminNav.find((n) => (tab ? n.to.includes(`tab=${tab}`) : n.to === '/admin'));
      return `${t('common.admin')} · ${matched?.label || t('admin.tabOverview')}`;
    }
    return (
      allNav.find((item) => location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to)))
        ?.label || t('common.brandName')
    );
  })();

  const handleRoleQuickSwitch = (targetRole: UserRole) => {
    loginAsDemoRole(targetRole);
    const homeMap: Record<UserRole, string> = {
      farmer: '/dashboard',
      buyer: '/buyer',
      transport: '/transport',
      admin: '/admin',
    };
    navigate(homeMap[targetRole]);
  };

  const handleSignOut = () => {
    logout();
    navigate('/', { replace: true });
  };

  const renderProfileSubtitle = () => {
    if (role === 'buyer') return `${state.buyerProfile.location}`;
    if (role === 'transport') return `${state.transportProfile.vehicleNumber}`;
    if (role === 'admin') return t('header.workspaceAdmin');
    return `${state.profile.village}, ${state.profile.district}`;
  };

  const roleWorkspaceLabel =
    role === 'buyer'
      ? t('header.workspaceBuyer')
      : role === 'transport'
      ? t('header.workspaceTransport')
      : role === 'admin'
      ? t('header.workspaceAdmin')
      : t('header.workspaceFarmer');

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#17231B] flex flex-col lg:flex-row">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#143A28] text-[#F8F7F4] border-r border-[#0F2C1E]">
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleRoleQuickSwitch(role)}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#C48F29] text-[#101D15] flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-display text-lg font-semibold tracking-wide block leading-none">
                {t('common.brandName')}
              </span>
              <span className="text-[10px] tracking-wide text-[#E6B85C] font-semibold truncate block mt-0.5">
                {translateRole(state.language, role)}
              </span>
            </div>
          </button>
        </div>

        <nav aria-label={roleWorkspaceLabel} className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <div>
            <p className="px-3 mb-2 text-[11px] font-medium text-[#9CB2A4] tracking-wide truncate">
              {roleWorkspaceLabel}
            </p>
            <div className="space-y-1">
              {primaryGroup.map((item) => {
                const Icon = item.icon;
                const isAdminTabActive =
                  role === 'admin'
                    ? item.to === '/admin'
                      ? !location.search
                      : location.pathname + location.search === item.to
                    : undefined;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/buyer' || item.to === '/transport' || item.to === '/admin'}
                    className={({ isActive }) => {
                      const active = isAdminTabActive !== undefined ? isAdminTabActive : isActive;
                      return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-[#216B43] text-white'
                          : 'text-[#D4E0D7] hover:bg-white/8 hover:text-white'
                      }`;
                    }}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {secondaryGroup.length > 0 && (
            <div>
              <div className="space-y-1">
                {secondaryGroup.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                          isActive
                            ? 'bg-[#216B43] text-white'
                            : 'text-[#D4E0D7] hover:bg-white/8 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}

          {/* Role Switcher */}
          <div className="pt-3 border-t border-white/10">
            <p className="px-3 mb-2 text-[11px] font-medium text-[#9CB2A4]">
              {t('auth.chooseRole')}
            </p>
            <div className="grid grid-cols-2 gap-1.5 px-1">
              {(['farmer', 'buyer', 'transport', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleQuickSwitch(r)}
                  className={`py-1.5 px-2 rounded-md text-[11px] font-semibold cursor-pointer transition-colors truncate ${
                    role === r
                      ? 'bg-[#C48F29] text-[#101D15]'
                      : 'bg-white/8 text-[#D4E0D7] hover:bg-white/15'
                  }`}
                >
                  {translateRole(state.language, r)}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Active Account Footer */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-left transition-colors cursor-pointer"
          >
            {role === 'farmer' ? (
              <ResilientImage
                src={state.profile.avatarUrl}
                alt={state.user.name}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/20"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#C48F29] text-[#101D15] flex items-center justify-center font-bold text-xs shrink-0">
                {state.user.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{state.user.name}</p>
              <p className="text-[11px] text-[#B8CABD] truncate flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#E6B85C] shrink-0" />
                <span className="truncate">{renderProfileSubtitle()}</span>
              </p>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              type="button"
              onClick={resetDemoWorkspace}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-[11px] text-[#D4E0D7] hover:bg-white/8 cursor-pointer truncate"
            >
              <RotateCcw className="w-3 h-3 shrink-0" />
              <span className="truncate">{t('common.resetDemo')}</span>
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-[11px] text-[#D4E0D7] hover:bg-white/8 cursor-pointer truncate"
            >
              <LogOut className="w-3 h-3 shrink-0" />
              <span className="truncate">{t('common.signOut')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 h-[56px] lg:h-16 bg-[#F8F7F4]/92 backdrop-blur-md border-b border-[#E5E2DA] px-3 sm:px-4 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={t('nav.more')}
              className="lg:hidden min-h-[44px] min-w-[44px] -ml-1 flex items-center justify-center text-[#143A28] cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-display text-sm sm:text-base lg:text-xl font-semibold text-[#17231B] truncate">
              {currentTitle}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Global 3-language selector visible across desktop & mobile */}
            <LanguageSwitcher variant="pill" />

            <button
              type="button"
              onClick={() => setNotifOpen(true)}
              aria-label={`${t('header.notifications')} (${t('header.unreadCount', { count: unreadCount })})`}
              className="relative min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] inline-flex items-center justify-center rounded-lg border border-[#E5E2DA] bg-white hover:bg-[#F3F1EC] text-[#17231B] cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B8860B] text-white text-[10px] font-mono font-semibold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {role === 'farmer' && (
              <button
                type="button"
                onClick={() => navigate('/scanner')}
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#216B43] hover:bg-[#195434] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{t('dashboard.scanCropBtn')}</span>
              </button>
            )}

            {role === 'buyer' && (
              <button
                type="button"
                onClick={() => navigate('/buyer/requirements')}
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#216B43] hover:bg-[#195434] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>{t('buyer.postReqBtn')}</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 py-5 pb-24 lg:px-8 lg:py-7 lg:pb-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation (Role-Aware) */}
      {role === 'farmer' && (
        <nav
          aria-label={t('header.workspaceFarmer')}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-t border-[#E5E2DA] grid grid-cols-5 items-center px-1"
        >
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium px-1 ${
                isActive ? 'text-[#216B43] font-semibold' : 'text-[#5E6D63]'
              }`
            }
          >
            <Home className="w-5 h-5" />
            <span className="truncate max-w-full">{t('nav.dashboard')}</span>
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium px-1 ${
                isActive ? 'text-[#216B43] font-semibold' : 'text-[#5E6D63]'
              }`
            }
          >
            <PackageCheck className="w-5 h-5" />
            <span className="truncate max-w-full">{t('nav.orders')}</span>
          </NavLink>
          <div className="flex items-center justify-center">
            <NavLink
              to="/scanner"
              aria-label={t('nav.cropScanner')}
              className="w-12 h-12 -mt-4 rounded-2xl bg-[#143A28] text-white shadow-lg flex items-center justify-center border-2 border-[#F8F7F4]"
            >
              <Camera className="w-5 h-5" />
            </NavLink>
          </div>
          <NavLink
            to="/transport"
            className={({ isActive }) =>
              `min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium px-1 ${
                isActive ? 'text-[#216B43] font-semibold' : 'text-[#5E6D63]'
              }`
            }
          >
            <Truck className="w-5 h-5" />
            <span className="truncate max-w-full">{t('nav.transport')}</span>
          </NavLink>
          <NavLink
            to="/assistant"
            className={({ isActive }) =>
              `min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium px-1 ${
                isActive ? 'text-[#216B43] font-semibold' : 'text-[#5E6D63]'
              }`
            }
          >
            <MessageSquare className="w-5 h-5" />
            <span className="truncate max-w-full">{t('nav.aiAssistant')}</span>
          </NavLink>
        </nav>
      )}

      {role === 'buyer' && (
        <nav
          aria-label={t('header.workspaceBuyer')}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-t border-[#E5E2DA] grid grid-cols-5 items-center px-1"
        >
          {buyerNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/buyer'}
                className={({ isActive }) =>
                  `min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium px-1 ${
                    isActive ? 'text-[#216B43] font-semibold' : 'text-[#5E6D63]'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="truncate max-w-full">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      )}

      {/* Mobile Slide-Out Full Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-72 max-w-[85vw] bg-[#143A28] text-white h-full flex flex-col p-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="font-display text-lg font-semibold">
                {t('common.brandName')} · {translateRole(state.language, role)}
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label={t('common.close')}
                className="p-2 text-[#D4E0D7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 border-b border-white/10">
              <p className="text-[11px] text-[#9CB2A4] mb-2">{t('common.selectLanguage')}</p>
              <LanguageSwitcher variant="dark" className="w-full justify-between" />
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-1">
              {allNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                        isActive ? 'bg-[#216B43] text-white' : 'text-[#D4E0D7]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}

              <div className="pt-4 mt-4 border-t border-white/10">
                <p className="px-2 mb-2 text-[11px] text-[#9CB2A4]">{t('auth.chooseRole')}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['farmer', 'buyer', 'transport', 'admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleRoleQuickSwitch(r);
                      }}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold truncate ${
                        role === r ? 'bg-[#C48F29] text-[#101D15]' : 'bg-white/10 text-[#D4E0D7]'
                      }`}
                    >
                      {translateRole(state.language, r)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    resetDemoWorkspace();
                  }}
                  className="py-2 px-2 text-xs rounded-lg bg-white/10 text-white truncate"
                >
                  {t('common.resetDemo')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="py-2 px-2 text-xs rounded-lg bg-white/10 text-white truncate"
                >
                  {t('common.signOut')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
};
