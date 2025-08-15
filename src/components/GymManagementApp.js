import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { customerService, paymentService, statsService, membershipService } from '../services';
import { APP_CONFIG, PAGES, MODAL_TYPES } from '../constants/app';
import Layout from './layout/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Memberships from './pages/Memberships';
import Payments from './pages/Payments';
import Programs from './pages/Programs';
import Entries from './pages/Entries';
import Settings from './pages/Settings';
import Exercises from './pages/Exercises';
import MemberPrograms from './pages/MemberPrograms';
import MembershipTypes from './pages/MembershipTypes';
import LoginModal from './auth/LoginModal';

const GymManagementApp = () => {
  // State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(PAGES.DASHBOARD);
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [currentUser] = useState({ name: 'Admin' });
  const [refreshCustomers, setRefreshCustomers] = useState(0);

  // API hooks
  const { data: dashboardStats, loading: statsLoading, error: statsError, refetch: refetchStats } = useApi(
    statsService.getDashboardStats.bind(statsService),
    [],
    { immediate: true }
  );

  const { data: customers, loading: customersLoading, error: customersError, refetch: refetchCustomers } = useApi(
    customerService.getAll.bind(customerService),
    [],
    { immediate: true }
  );

  const { data: payments, loading: paymentsLoading, error: paymentsError, refetch: refetchPayments } = useApi(
    paymentService.getAll.bind(paymentService),
    [],
    { immediate: false }
  );

  const { data: memberships, loading: membershipsLoading, error: membershipsError, refetch: refetchMemberships } = useApi(
    membershipService.getAll.bind(membershipService),
    [],
    { immediate: false }
  );

  const { data: unpaidCustomers, loading: unpaidCustomersLoading, error: unpaidCustomersError, refetch: refetchUnpaidCustomers } = useApi(
    statsService.getUnpaidCustomers.bind(statsService),
    [],
    { immediate: true }
  );

  // Login işlemi
  const handleLogin = (password) => {
    if (password === APP_CONFIG.ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setShowLoginModal(false);
      // Local storage'a kaydet
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      throw new Error('Hatalı şifre!');
    }
  };

  // Logout işlemi
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage(PAGES.DASHBOARD);
    setShowLoginModal(true);
    // Local storage'dan kaldır
    localStorage.removeItem('isLoggedIn');
  };

  // Sayfa değiştirme
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Arama işlemi
  const handleSearch = (searchTerm) => {
    // Global arama implementasyonu
  };

  // Müşteri eklendiğinde çağrılacak fonksiyon
  const handleCustomerAdded = (newCustomer) => {
    // Müşteri listesini yenile
    refetchCustomers();
  };

  // Müşteri güncellendiğinde çağrılacak fonksiyon
  const handleCustomerUpdated = (updatedCustomer) => {
    // Müşteri listesini yenile
    refetchCustomers();
  };

  // Müşteri silindiğinde çağrılacak fonksiyon
  const handleCustomerDeleted = async (customerId) => {
    try {
      await customerService.delete(customerId);
      // Müşteri listesini yenile
      refetchCustomers();
    } catch (error) {
      console.error('Müşteri silinirken hata:', error);
    }
  };

  // Ödeme durumu güncelleme
  const handlePaymentStatusUpdate = async (paymentId, newStatus) => {
    
    try {
      await paymentService.updateStatus(paymentId, newStatus);
      
      // Ödemeleri yeniden yükle
      refetchPayments();
      
      // Dashboard'daki ödemesi yapılmayan müşteriler listesini de yenile
      refetchUnpaidCustomers();
    } catch (error) {
      console.error('Ödeme durumu güncellenirken hata:', error);
      // Hatayı fırlat ki Payments component'te yakalanabilsin
      throw error;
    }
  };

  // Yeni ödeme ekleme
  const handleAddPayment = async (paymentData) => {
    try {
      await paymentService.create(paymentData);
      // Ödemeleri yeniden yükle
      refetchPayments();
      // Dashboard'daki ödemesi yapılmayan müşteriler listesini de yenile
      refetchUnpaidCustomers();
    } catch (error) {
      console.error('Yeni ödeme eklenirken hata:', error);
    }
  };

  // Ödeme düzenleme
  const handleEditPayment = async (paymentId, paymentData) => {
    try {
      await paymentService.update(paymentId, paymentData);
      // Ödemeleri yeniden yükle
      refetchPayments();
      // Dashboard'daki ödemesi yapılmayan müşteriler listesini de yenile
      refetchUnpaidCustomers();
    } catch (error) {
      console.error('Ödeme düzenlenirken hata:', error);
    }
  };

  // Ödeme silme
  const handleDeletePayment = async (paymentId) => {
    try {
      await paymentService.delete(paymentId);
      // Ödemeleri yeniden yükle
      refetchPayments();
      // Dashboard'daki ödemesi yapılmayan müşteriler listesini de yenile
      refetchUnpaidCustomers();
    } catch (error) {
      console.error('Ödeme silinirken hata:', error);
    }
  };

  // Ödemeler sayfasına geçildiğinde verileri yükle
  useEffect(() => {
    if (currentPage === PAGES.PAYMENTS) {
      refetchPayments();
      refetchMemberships();
    }
  }, [currentPage]); // refetchPayments dependency'sini kaldırdım

  // Sayfa render
  const renderCurrentPage = () => {
    switch (currentPage) {
      case PAGES.DASHBOARD:
        return (
          <Dashboard 
            stats={dashboardStats} 
            loading={statsLoading} 
            error={statsError}
            unpaidCustomers={unpaidCustomers || []}
          />
        );
      case PAGES.CUSTOMERS:
        return (
          <Customers 
            customers={customers} 
            loading={customersLoading} 
            error={customersError}
            onCustomerAdded={handleCustomerAdded}
            onCustomerUpdated={handleCustomerUpdated}
            onCustomerDeleted={handleCustomerDeleted}
          />
        );
      case PAGES.MEMBERSHIPS:
        return <Memberships />;
      case PAGES.MEMBERSHIP_TYPES:
        return <MembershipTypes />;
      case PAGES.PAYMENTS:
        return (
          <Payments 
            payments={payments} 
            loading={paymentsLoading} 
            error={paymentsError}
            customers={customers}
            memberships={memberships || []}
            onUpdatePaymentStatus={handlePaymentStatusUpdate}
            onAddPayment={handleAddPayment}
            onEditPayment={handleEditPayment}
            onDeletePayment={handleDeletePayment}
          />
        );
      case PAGES.EXERCISES:
        return <Exercises />;
      case PAGES.PROGRAMS:
        return <Programs />;
      case PAGES.MEMBER_PROGRAMS:
        return <MemberPrograms />;
      case PAGES.ENTRIES:
        return <Entries />;
      case PAGES.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  // Login kontrolü
  useEffect(() => {
    const savedLoginState = localStorage.getItem('isLoggedIn');
    if (savedLoginState === 'true') {
      setIsLoggedIn(true);
      setShowLoginModal(false);
    }
  }, []);

  // Login modal kapalıysa ve giriş yapılmamışsa
  if (!isLoggedIn && !showLoginModal) {
    setShowLoginModal(true);
  }

  // Login modal
  if (showLoginModal && !isLoggedIn) {
    return (
      <LoginModal
        isOpen={showLoginModal}
        onLogin={handleLogin}
        onClose={() => setShowLoginModal(false)}
      />
    );
  }

  // Ana uygulama
  return (
    <Layout
      currentPage={currentPage}
      onPageChange={handlePageChange}
      currentUser={currentUser}
      onLogout={handleLogout}
      onSearch={handleSearch}
    >
      {renderCurrentPage()}
    </Layout>
  );
};

export default GymManagementApp; 