'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  Bell,
  ChevronRight,
  ExternalLink,
  Eye,
  Edit,
  MoreVertical,
  Palette,
  UserPlus,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
  Key,
  FileText,
  Mail,
  Send,
  Settings,
  Share2,
} from 'lucide-react';
import { cn, formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import {
  currentSalesPerson,
  dashboardStats,
  companies as initialCompanies,
  recentActivity,
  notifications,
  courses,
} from '@/lib/mockData';
import type { Company } from '@/types';
import ClientCustomizer from '@/components/ClientCustomizer';
import CredentialsManager from '@/components/CredentialsManager';
import ReportsManager from '@/components/ReportsManager';
import ClientDetailsModal from '@/components/ClientDetailsModal';

// Portal domain configuration
const PORTAL_DOMAINS = {
  student: 'https://student.learnova.training',
  coordinator: 'https://tc.learnova.training',
  sales: 'https://sales.learnova.training',
};

// Get base portal URL for student/learner dashboard
function getStudentPortalUrl(companySlug?: string): string {
  if (typeof window !== 'undefined') {
    const host = window.location.host;
    if (host.includes('localhost')) {
      return companySlug ? `http://localhost:3000?company=${companySlug}` : 'http://localhost:3000';
    }
  }
  return companySlug ? `${PORTAL_DOMAINS.student}?company=${companySlug}` : PORTAL_DOMAINS.student;
}

export default function SalesDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'analytics' | 'courses'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);

  // Modal states
  const [selectedClient, setSelectedClient] = useState<Company | null>(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle edit client
  const handleEditClient = (company: Company) => {
    setSelectedClient(company);
    setShowClientDetails(false);
    setShowCustomizer(true);
  };

  // Handle view client details
  const handleViewClient = (company: Company) => {
    setSelectedClient(company);
    setShowClientDetails(true);
  };

  // Handle new client
  const handleNewClient = () => {
    setSelectedClient(null);
    setShowCustomizer(true);
  };

  // Handle view credentials
  const handleViewCredentials = (company: Company) => {
    setSelectedClient(company);
    setShowClientDetails(false);
    setShowCredentials(true);
  };

  // Handle view reports
  const handleViewReports = (company: Company) => {
    setSelectedClient(company);
    setShowClientDetails(false);
    setShowReports(true);
  };

  // Handle save client config
  const handleSaveClient = (config: Partial<Company>) => {
    if (selectedClient) {
      // Update existing client
      setCompanies(prev =>
        prev.map(c => c.id === selectedClient.id ? { ...c, ...config, updatedAt: new Date().toISOString() } : c)
      );
      showToast(`${config.name || selectedClient.name} updated successfully!`);
    } else {
      // Create new client
      const newClient: Company = {
        id: `client-${Date.now()}`,
        name: config.name || 'New Client',
        slug: config.slug || 'new-client',
        industry: config.industry || 'technology',
        size: config.size || 'medium',
        logo: null,
        favicon: null,
        branding: config.branding || initialCompanies[0].branding,
        features: config.features || initialCompanies[0].features,
        adminEmail: config.adminEmail || '',
        supportEmail: config.supportEmail || '',
        subscriptionTier: config.subscriptionTier || 'professional',
        subscriptionStatus: 'trial',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        learnerCount: 0,
        activeEnrollments: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentSalesPerson.id,
        salesPerson: currentSalesPerson.name,
        portalUrl: getStudentPortalUrl(config.slug),
      };
      setCompanies(prev => [...prev, newClient]);
      showToast(`${newClient.name} created successfully!`);
    }
    setShowCustomizer(false);
  };

  // Handle invite learners
  const handleInviteLearners = () => {
    const emails = prompt('Enter learner emails (comma-separated):');
    if (emails) {
      showToast(`Invitation sent to ${emails.split(',').length} learners!`);
    }
  };

  // Handle export all reports
  const handleExportReports = () => {
    let content = `Koenig Sales Portal - All Clients Report\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `Sales Rep: ${currentSalesPerson.name}\n`;
    content += `==========================================\n\n`;

    companies.forEach((company) => {
      content += `${company.name}\n`;
      content += `-----------\n`;
      content += `Industry: ${company.industry}\n`;
      content += `Learners: ${company.learnerCount}\n`;
      content += `Enrollments: ${company.activeEnrollments}\n`;
      content += `Status: ${company.subscriptionStatus}\n`;
      content += `Tier: ${company.subscriptionTier}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${formatDate(new Date().toISOString())}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Report exported successfully!');
  };

  // Handle customize portal (quick action)
  const handleCustomizePortal = () => {
    if (companies.length > 0) {
      setSelectedClient(companies[0]);
      setShowCustomizer(true);
    } else {
      handleNewClient();
    }
  };

  // Open portal in new tab
  const openPortal = (company: Company) => {
    const url = getStudentPortalUrl(company.slug);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <div className={cn(
          'fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg animate-slideIn',
          toast.type === 'success' && 'bg-green-600 text-white',
          toast.type === 'error' && 'bg-red-600 text-white',
          toast.type === 'info' && 'bg-blue-600 text-white'
        )}>
          <CheckCircle className="w-5 h-5" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Koenig Sales Portal</h1>
                <p className="text-xs text-gray-500">Client Management Dashboard</p>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clients, courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleNewClient}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Client
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'px-4 py-3 hover:bg-gray-50 cursor-pointer',
                            !notification.isRead && 'bg-cyan-50'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'w-2 h-2 rounded-full mt-2',
                              notification.type === 'success' && 'bg-green-500',
                              notification.type === 'warning' && 'bg-amber-500',
                              notification.type === 'error' && 'bg-red-500',
                              notification.type === 'info' && 'bg-blue-500'
                            )} />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-500">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(notification.timestamp)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {currentSalesPerson.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{currentSalesPerson.name}</p>
                  <p className="text-xs text-gray-500">{currentSalesPerson.territory}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 -mb-px">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'clients', label: 'Clients', icon: Building2 },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'courses', label: 'Courses', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                    activeTab === tab.id
                      ? 'border-cyan-600 text-cyan-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Building2}
                label="Total Clients"
                value={companies.length}
                subValue={`${companies.filter(c => c.subscriptionStatus === 'active').length} active`}
                trend={+8}
                color="cyan"
              />
              <StatCard
                icon={Users}
                label="Total Learners"
                value={companies.reduce((sum, c) => sum + c.learnerCount, 0).toLocaleString()}
                subValue={`${Math.round(companies.reduce((sum, c) => sum + c.learnerCount, 0) * 0.8).toLocaleString()} active`}
                trend={+12}
                color="violet"
              />
              <StatCard
                icon={DollarSign}
                label="Monthly Revenue"
                value={formatCurrency(dashboardStats.monthlyRevenue)}
                subValue={`${formatCurrency(dashboardStats.totalRevenue)} total`}
                trend={+15}
                color="green"
              />
              <StatCard
                icon={Target}
                label="Completion Rate"
                value={`${dashboardStats.averageCompletionRate}%`}
                subValue={`NPS: ${dashboardStats.averageNPS}`}
                trend={+5}
                color="amber"
              />
            </div>

            {/* Revenue Progress */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Revenue Target</h2>
                  <p className="text-sm text-gray-500">Your progress towards quarterly target</p>
                </div>
                <span className="text-2xl font-bold text-cyan-600">
                  {Math.round((currentSalesPerson.revenue / currentSalesPerson.target) * 100)}%
                </span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentSalesPerson.revenue / currentSalesPerson.target) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-500">{formatCurrency(currentSalesPerson.revenue)} achieved</span>
                <span className="text-gray-500">{formatCurrency(currentSalesPerson.target)} target</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  <button className="text-sm text-cyan-600 hover:text-cyan-700">View All</button>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                        activity.type === 'signup' && 'bg-green-100 text-green-600',
                        activity.type === 'enrollment' && 'bg-blue-100 text-blue-600',
                        activity.type === 'completion' && 'bg-amber-100 text-amber-600',
                        activity.type === 'renewal' && 'bg-violet-100 text-violet-600',
                        activity.type === 'payment' && 'bg-cyan-100 text-cyan-600',
                        activity.type === 'support' && 'bg-gray-100 text-gray-600'
                      )}>
                        {activity.type === 'signup' && <UserPlus className="w-5 h-5" />}
                        {activity.type === 'enrollment' && <Users className="w-5 h-5" />}
                        {activity.type === 'completion' && <CheckCircle className="w-5 h-5" />}
                        {activity.type === 'renewal' && <RefreshCw className="w-5 h-5" />}
                        {activity.type === 'payment' && <DollarSign className="w-5 h-5" />}
                        {activity.type === 'support' && <AlertCircle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.companyName}</p>
                        <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={handleNewClient}
                    className="w-full flex items-center gap-3 p-3 bg-cyan-50 text-cyan-700 rounded-xl hover:bg-cyan-100 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add New Client</span>
                  </button>
                  <button
                    onClick={handleCustomizePortal}
                    className="w-full flex items-center gap-3 p-3 bg-violet-50 text-violet-700 rounded-xl hover:bg-violet-100 transition-colors"
                  >
                    <Palette className="w-5 h-5" />
                    <span className="font-medium">Customize Portal</span>
                  </button>
                  <button
                    onClick={handleInviteLearners}
                    className="w-full flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span className="font-medium">Invite Learners</span>
                  </button>
                  <button
                    onClick={handleExportReports}
                    className="w-full flex items-center gap-3 p-3 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-medium">Export Reports</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                <select className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-cyan-500 outline-none">
                  <option>All Industries</option>
                  <option>Consulting</option>
                  <option>Technology</option>
                  <option>Healthcare</option>
                  <option>Finance</option>
                </select>
                <select className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-cyan-500 outline-none">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Trial</option>
                  <option>Expired</option>
                </select>
              </div>
              <button
                onClick={handleNewClient}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Client
              </button>
            </div>

            {/* Client Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleViewClient(company)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: company.branding.primaryColor }}
                      >
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{company.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{company.industry}</p>
                      </div>
                    </div>
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Learners</span>
                      <span className="font-medium text-gray-900">{company.learnerCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Enrollments</span>
                      <span className="font-medium text-gray-900">{company.activeEnrollments}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subscription</span>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                        company.subscriptionStatus === 'active' && 'bg-green-100 text-green-700',
                        company.subscriptionStatus === 'trial' && 'bg-amber-100 text-amber-700',
                        company.subscriptionStatus === 'expired' && 'bg-red-100 text-red-700'
                      )}>
                        {company.subscriptionStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEditClient(company)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleViewCredentials(company)}
                      className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      title="View Credentials"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openPortal(company)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Portal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Learner Growth */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learner Growth</h3>
                <div className="space-y-4">
                  {companies.slice(0, 5).map((company) => (
                    <div key={company.id} className="flex items-center gap-4">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: company.branding.primaryColor }}
                      >
                        {company.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{company.name}</span>
                          <span className="text-sm text-gray-500">{company.learnerCount} learners</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, (company.learnerCount / 500) * 100)}%`,
                              backgroundColor: company.branding.primaryColor,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completion Rates */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Completion Rates</h3>
                <div className="space-y-4">
                  {courses.slice(0, 5).map((course) => (
                    <div key={course.id} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                        <Award className="w-4 h-4 text-cyan-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{course.code}</span>
                          <span className="text-sm text-gray-500">{course.completionRate}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded-full"
                            style={{ width: `${course.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Report Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Reports</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={handleExportReports}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <FileText className="w-6 h-6 text-cyan-600" />
                  <span className="text-sm font-medium text-gray-700">All Clients Report</span>
                </button>
                <button
                  onClick={() => {
                    if (companies.length > 0) {
                      handleViewReports(companies[0]);
                    }
                  }}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Progress Report</span>
                </button>
                <button
                  onClick={handleExportReports}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Users className="w-6 h-6 text-violet-600" />
                  <span className="text-sm font-medium text-gray-700">Engagement Report</span>
                </button>
                <button
                  onClick={handleExportReports}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <DollarSign className="w-6 h-6 text-amber-600" />
                  <span className="text-sm font-medium text-gray-700">Revenue Report</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Vendor</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Level</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Enrollments</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Completion</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Rating</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{course.name}</p>
                          <p className="text-sm text-gray-500">{course.code}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.vendor}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium capitalize',
                          course.level === 'beginner' && 'bg-green-100 text-green-700',
                          course.level === 'intermediate' && 'bg-blue-100 text-blue-700',
                          course.level === 'advanced' && 'bg-purple-100 text-purple-700',
                          course.level === 'expert' && 'bg-red-100 text-red-700'
                        )}>
                          {course.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.enrollments.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-500 rounded-full"
                              style={{ width: `${course.completionRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{course.completionRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.rating}/5</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(course.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showCustomizer && (
        <ClientCustomizer
          client={selectedClient}
          onClose={() => setShowCustomizer(false)}
          onSave={handleSaveClient}
        />
      )}

      {showCredentials && selectedClient && (
        <CredentialsManager
          company={selectedClient}
          onClose={() => setShowCredentials(false)}
        />
      )}

      {showReports && selectedClient && (
        <ReportsManager
          company={selectedClient}
          onClose={() => setShowReports(false)}
        />
      )}

      {showClientDetails && selectedClient && (
        <ClientDetailsModal
          company={selectedClient}
          onClose={() => setShowClientDetails(false)}
          onEdit={() => {
            setShowClientDetails(false);
            setShowCustomizer(true);
          }}
          onViewCredentials={() => {
            setShowClientDetails(false);
            setShowCredentials(true);
          }}
          onViewReports={() => {
            setShowClientDetails(false);
            setShowReports(true);
          }}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue: string;
  trend: number;
  color: 'cyan' | 'violet' | 'green' | 'amber';
}) {
  const colorClasses = {
    cyan: 'bg-cyan-100 text-cyan-600',
    violet: 'bg-violet-100 text-violet-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-3 rounded-xl', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={cn(
          'flex items-center gap-1 text-sm font-medium',
          trend > 0 ? 'text-green-600' : 'text-red-600'
        )}>
          {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(trend)}%
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{subValue}</p>
    </div>
  );
}
