import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { NotificationsScreen } from '../features/notifications/NotificationsScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { useNotifications } from '../context/NotificationsContext';
import { colors } from '../theme/colors';
import { themedStyles } from '../theme/themedStyles';
import { Header } from '../components/common/Header';
import { DrawerMenuModal, ERP_MODULES } from '../components/navigation/DrawerMenuModal';
import { LoginScreen } from '../features/auth/LoginScreen';
import { DashboardScreen } from '../features/dashboard/DashboardScreen';
import { CRMSalesScreen } from '../features/crm-sales/CRMSalesScreen';
import { ProjectManagementScreen } from '../features/projects/ProjectManagementScreen';
import { DesignerEngineeringScreen } from '../features/designer-engineering/DesignerEngineeringScreen';
import { PurchaseManagementScreen } from '../features/purchase/PurchaseManagementScreen';
import { StoreWarehouseScreen } from '../features/store-warehouse/StoreWarehouseScreen';
import { ProductionShopFloorScreen } from '../features/production-shop-floor/ProductionShopFloorScreen';
import { AccountingFinanceScreen } from '../features/accounting-finance/AccountingFinanceScreen';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { unreadCount } = useNotifications();
  const { isDark } = useTheme(); // re-render the whole app when the theme changes
  const [activeRoute, setActiveRoute] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.loginArea}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <LoginScreen />
      </SafeAreaView>
    );
  }

  const activeModule = ERP_MODULES.find((m) => m.id === activeRoute) || ERP_MODULES[0];
  const SCREEN_TITLES: Record<string, string> = { notifications: 'Notifications', profile: 'My Profile' };
  const title =
    SCREEN_TITLES[activeRoute] ?? (activeModule.id === 'dashboard' ? 'UMA TECHNO FAB' : activeModule.name);
  const goHome = () => setActiveRoute('dashboard');

  const renderScreen = () => {
    switch (activeRoute) {
      case 'crm_sales':
        return <CRMSalesScreen onBackToDashboard={goHome} />;
      case 'project_management':
        return <ProjectManagementScreen onBackToDashboard={goHome} />;
      case 'designer_engineering':
        return <DesignerEngineeringScreen onBackToDashboard={goHome} />;
      case 'purchase_management':
        return <PurchaseManagementScreen onBackToDashboard={goHome} />;
      case 'store_warehouse':
        return <StoreWarehouseScreen onBackToDashboard={goHome} />;
      case 'production_shop_floor':
        return <ProductionShopFloorScreen onBackToDashboard={goHome} />;
      case 'accounting_finance':
        return <AccountingFinanceScreen onBackToDashboard={goHome} />;
      case 'notifications':
        return <NotificationsScreen onNavigate={setActiveRoute} />;
      case 'profile':
        return <ProfileScreen onOpenSettings={() => setActiveRoute('settings')} />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen onOpenMenu={() => setDrawerOpen(true)} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <Header
        onOpenDrawer={() => setDrawerOpen(true)}
        onOpenProfile={() => setActiveRoute('profile')}
        onOpenNotifications={() => setActiveRoute('notifications')}
        unreadCount={unreadCount}
        title={title}
      />
      <View style={styles.body}>{renderScreen()}</View>
      <DrawerMenuModal
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeRoute={activeRoute}
        onSelectRoute={setActiveRoute}
      />
    </SafeAreaView>
  );
};

const topInset = Platform.OS === 'android' ? RNStatusBar.currentHeight : 0;

const styles = themedStyles(() => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.header, paddingTop: topInset },
  loginArea: { flex: 1, backgroundColor: colors.background, paddingTop: topInset },
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  body: { flex: 1, backgroundColor: colors.background },
}));
