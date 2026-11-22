import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { KisanSetuProvider, useKisanSetu } from './context/KisanSetuContext';
import { OpeningExperience } from './components/OpeningExperience';
import { OnboardingFlow } from './components/OnboardingFlow';
import { AppShell } from './components/AppShell';
import { ToastContainer } from './components/ToastContainer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyFarmPage } from './pages/MyFarmPage';
import { CropScannerPage } from './pages/CropScannerPage';
import { MarketIntelligencePage } from './pages/MarketIntelligencePage';
import { CropDecisionPage } from './pages/CropDecisionPage';
import { AssistantPage } from './pages/AssistantPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { SupplyIntelligencePage } from './pages/SupplyIntelligencePage';
import { FarmHistoryPage } from './pages/FarmHistoryPage';
import { AdminVerificationPage } from './pages/AdminVerificationPage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { BuyerRequirementsPage } from './pages/BuyerRequirementsPage';
import { BuyerMarketplacePage } from './pages/BuyerMarketplacePage';
import { OrdersPage } from './pages/OrdersPage';
import { TransportPage } from './pages/TransportPage';
import { TransportProviderPage } from './pages/TransportProviderPage';
import { SettingsPage } from './pages/SettingsPage';
import { UserRole } from './types/kisansetu';

const ROLE_HOME: Record<UserRole, string> = {
  farmer: '/dashboard',
  buyer: '/buyer',
  transport: '/transport',
  admin: '/admin',
};

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { state } = useKisanSetu();
  const location = useLocation();

  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (state.needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

const RequireRole: React.FC<{
  allowed: UserRole[];
  children: React.ReactElement;
}> = ({ allowed, children }) => {
  const { state } = useKisanSetu();
  if (!allowed.includes(state.activeRole)) {
    return <Navigate to={ROLE_HOME[state.activeRole]} replace />;
  }
  return children;
};

const PublicRootEntry: React.FC = () => {
  const { state, completeIntro } = useKisanSetu();

  if (!state.hasSeenIntro) {
    return <OpeningExperience onComplete={completeIntro} />;
  }

  return <LandingPage />;
};

const AuthRouteGuard: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { state } = useKisanSetu();

  if (state.isAuthenticated) {
    if (state.needsOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to={ROLE_HOME[state.activeRole]} replace />;
  }

  return children;
};

const OnboardingRouteGuard: React.FC = () => {
  const { state } = useKisanSetu();

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!state.needsOnboarding) {
    return <Navigate to={ROLE_HOME[state.activeRole]} replace />;
  }

  return <OnboardingFlow />;
};

const RoleHomeRedirect: React.FC = () => {
  const { state } = useKisanSetu();
  return <Navigate to={ROLE_HOME[state.activeRole]} replace />;
};

const ProtectedPage: React.FC<{
  allowed?: UserRole[];
  children: React.ReactElement;
}> = ({ allowed, children }) => (
  <RequireAuth>
    <AppShell>
      {allowed ? <RequireRole allowed={allowed}>{children}</RequireRole> : children}
    </AppShell>
  </RequireAuth>
);

const AppRoutes: React.FC = () => {
  const { state } = useKisanSetu();

  return (
    <Routes>
      {/* Public Entry & Landing */}
      <Route path="/" element={<PublicRootEntry />} />

      {/* Dedicated Authentication Routes */}
      <Route
        path="/login"
        element={
          <AuthRouteGuard>
            <LoginPage />
          </AuthRouteGuard>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthRouteGuard>
            <SignupPage />
          </AuthRouteGuard>
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Onboarding Route */}
      <Route path="/onboarding" element={<OnboardingRouteGuard />} />

      {/* Protected Farmer Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedPage allowed={['farmer']}>
            <DashboardPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/farm"
        element={
          <ProtectedPage allowed={['farmer']}>
            <MyFarmPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/scanner"
        element={
          <ProtectedPage allowed={['farmer']}>
            <CropScannerPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/crop-scanner"
        element={
          <ProtectedPage allowed={['farmer']}>
            <CropScannerPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/market"
        element={
          <ProtectedPage allowed={['farmer']}>
            <MarketIntelligencePage />
          </ProtectedPage>
        }
      />
      <Route
        path="/decision"
        element={
          <ProtectedPage allowed={['farmer']}>
            <CropDecisionPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/assistant"
        element={
          <ProtectedPage allowed={['farmer']}>
            <AssistantPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/ai-assistant"
        element={
          <ProtectedPage allowed={['farmer']}>
            <AssistantPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/marketplace"
        element={
          <ProtectedPage allowed={['farmer']}>
            <MarketplacePage />
          </ProtectedPage>
        }
      />
      <Route
        path="/sell"
        element={
          <ProtectedPage allowed={['farmer']}>
            <MarketplacePage />
          </ProtectedPage>
        }
      />
      <Route
        path="/supply"
        element={
          <ProtectedPage allowed={['farmer']}>
            <SupplyIntelligencePage />
          </ProtectedPage>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedPage allowed={['farmer']}>
            <FarmHistoryPage />
          </ProtectedPage>
        }
      />

      {/* Protected Buyer Routes */}
      <Route
        path="/buyer"
        element={
          <ProtectedPage allowed={['buyer']}>
            <BuyerDashboardPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/buyer/requirements"
        element={
          <ProtectedPage allowed={['buyer']}>
            <BuyerRequirementsPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/buyer/marketplace"
        element={
          <ProtectedPage allowed={['buyer']}>
            <BuyerMarketplacePage />
          </ProtectedPage>
        }
      />

      {/* Protected Shared & Transport Routes */}
      <Route
        path="/orders"
        element={
          <ProtectedPage allowed={['farmer', 'buyer', 'admin']}>
            <OrdersPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/transport"
        element={
          <ProtectedPage allowed={['farmer', 'buyer', 'transport', 'admin']}>
            <TransportPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/transport/provider"
        element={
          <ProtectedPage allowed={['transport']}>
            <TransportProviderPage />
          </ProtectedPage>
        }
      />

      {/* Protected Admin Route */}
      <Route
        path="/admin"
        element={
          <ProtectedPage allowed={['admin']}>
            <AdminVerificationPage />
          </ProtectedPage>
        }
      />

      {/* Shared Profile / Settings / Workspace aliases */}
      <Route
        path="/settings"
        element={
          <ProtectedPage>
            <SettingsPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedPage>
            <SettingsPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/workspace"
        element={
          <RequireAuth>
            <RoleHomeRedirect />
          </RequireAuth>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedPage>
            <SettingsPage />
          </ProtectedPage>
        }
      />

      {/* Fallback */}
      <Route
        path="*"
        element={
          <Navigate
            to={
              state.isAuthenticated
                ? state.needsOnboarding
                  ? '/onboarding'
                  : ROLE_HOME[state.activeRole]
                : '/'
            }
            replace
          />
        }
      />
    </Routes>
  );
};

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <KisanSetuProvider>
        <AppRoutes />
        <ToastContainer />
      </KisanSetuProvider>
    </BrowserRouter>
  );
}
