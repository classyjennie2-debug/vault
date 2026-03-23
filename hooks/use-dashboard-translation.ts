'use client'

import { useState, useEffect } from 'react'

export const dashboardTranslations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    investments: 'Investments',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    transactions: 'Transactions',
    referrals: 'Referrals',
    settings: 'Settings',
    
    // Dashboard
    balance: 'Balance',
    totalInvested: 'Total Invested',
    monthlyProfit: 'Monthly Profit',
    accountStatus: 'Account Status',
    active: 'Active',
    
    // Investments
    myInvestments: 'My Investments',
    investmentPlan: 'Investment Plan',
    status: 'Status',
    startDate: 'Start Date',
    endDate: 'End Date',
    amount: 'Amount',
    profit: 'Profit',
    
    // Transactions
    recentTransactions: 'Recent Transactions',
    type: 'Type',
    date: 'Date',
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
    
    // Deposit/Withdraw
    depositFunds: 'Deposit Funds',
    withdrawFunds: 'Withdraw Funds',
    minimumAmount: 'Minimum Amount',
    selectPaymentMethod: 'Select Payment Method',
    continue: 'Continue',
    
    // Settings
    accountSettings: 'Account Settings',
    profileSettings: 'Profile Settings',
    securitySettings: 'Security Settings',
    notificationSettings: 'Notification Settings',
    emailNotifications: 'Email Notifications',
    twoFactorAuth: '2FA Authentication',
    changePassword: 'Change Password',
  },
  es: {
    // Navigation
    dashboard: 'Panel de Control',
    investments: 'Inversiones',
    deposit: 'Depósito',
    withdraw: 'Retiro',
    transactions: 'Transacciones',
    referrals: 'Referidos',
    settings: 'Configuración',
    
    // Dashboard
    balance: 'Saldo',
    totalInvested: 'Total Invertido',
    monthlyProfit: 'Ganancia Mensual',
    accountStatus: 'Estado de Cuenta',
    active: 'Activo',
    
    // Investments
    myInvestments: 'Mis Inversiones',
    investmentPlan: 'Plan de Inversión',
    status: 'Estado',
    startDate: 'Fecha de Inicio',
    endDate: 'Fecha de Finalización',
    amount: 'Cantidad',
    profit: 'Ganancia',
    
    // Transactions
    recentTransactions: 'Transacciones Recientes',
    type: 'Tipo',
    date: 'Fecha',
    approved: 'Aprobado',
    pending: 'Pendiente',
    rejected: 'Rechazado',
    
    // Deposit/Withdraw
    depositFunds: 'Depositar Fondos',
    withdrawFunds: 'Retirar Fondos',
    minimumAmount: 'Cantidad Mínima',
    selectPaymentMethod: 'Seleccionar Método de Pago',
    continue: 'Continuar',
    
    // Settings
    accountSettings: 'Configuración de Cuenta',
    profileSettings: 'Configuración de Perfil',
    securitySettings: 'Configuración de Seguridad',
    notificationSettings: 'Configuración de Notificaciones',
    emailNotifications: 'Notificaciones por Correo',
    twoFactorAuth: 'Autenticación de 2FA',
    changePassword: 'Cambiar Contraseña',
  },
}

export type DashboardTranslationKey = keyof typeof dashboardTranslations.en

export function useDashboardTranslation() {
  const [language, setLanguage] = useState<'en' | 'es'>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedLanguage = (localStorage.getItem('language') as 'en' | 'es') || 'en'
    setLanguage(savedLanguage)
    setMounted(true)
    
    // Listen for language changes
    const handleStorageChange = () => {
      const newLanguage = (localStorage.getItem('language') as 'en' | 'es') || 'en'
      setLanguage(newLanguage)
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const t = (key: DashboardTranslationKey): string => {
    return dashboardTranslations[language]?.[key] || dashboardTranslations.en[key] || key
  }

  return { t, language, mounted }
}
