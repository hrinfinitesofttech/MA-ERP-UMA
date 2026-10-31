import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
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
import { ModulePlaceholderScreen } from '../features/common/ModulePlaceholderScreen';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeRoute, setActiveRoute] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <LoginScreen />
      </SafeAreaView>
    );
  }

  const activeModule = ERP_MODULES.find((m) => m.id === activeRoute) || ERP_MODULES[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      {/* Top Application Header */}
      <Header
        onOpenDrawer={() => setDrawerOpen(true)}
        title={activeModule.id === 'dashboard' ? 'UMA TECHNO FAB' : activeModule.name}
      />

      {/* Main Screen Content */}
      <View style={styles.body}>
        {activeRoute === 'dashboard' ? (
          <DashboardScreen onOpenMenu={() => setDrawerOpen(true)} />
        ) : activeRoute === 'crm_sales' ? (
          <CRMSalesScreen onBackToDashboard={() => setActiveRoute('dashboard')} />
        ) : activeRoute === 'project_management' ? (
          <ProjectManagementScreen onBackToDashboard={() => setActiveRoute('dashboard')} />
        ) : activeRoute === 'designer_engineering' ? (
          <DesignerEngineeringScreen onBackToDashboard={() => setActiveRoute('dashboard')} />
        ) : activeRoute === 'purchase_management' ? (
          <PurchaseManagementScreen onBackToDashboard={() => setActiveRoute('dashboard')} />
        ) : activeRoute === 'store_warehouse' ? (
          <StoreWarehouseScreen onBackToDashboard={() => setActiveRoute('dashboard')} />
        ) : activeRoute === 'production_shop_floor' ? (
          <ProductionShopFloorScreen onBackToDashboard={() => setActiveRoute('dashboard')} />
        ) : activeRoute === 'accounting_finance' ? (
          <AccountingFinanceScreen onBackToDashboard={() => setActiveRoute('dashboard')} />
        ) : (
          <ModulePlaceholderScreen
            moduleId={activeModule.id}
            moduleName={activeModule.name}
            phaseNumber={activeModule.phase}
            onBackToDashboard={() => setActiveRoute('dashboard')}
          />
        )}
      </View>

      {/* Slide-out / Modal Drawer with all 13 modules */}
      <DrawerMenuModal
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeRoute={activeRoute}
        onSelectRoute={(route) => setActiveRoute(route)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
