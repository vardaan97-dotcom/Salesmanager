'use client';

import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Users,
  BookOpen,
  TrendingUp,
  Calendar,
  Mail,
  Building2,
  Shield,
  Key,
  FileText,
  Settings,
  Copy,
  Check,
  Eye,
  EyeOff,
  Send,
  Download,
  BarChart3,
  Clock,
  GraduationCap,
  UserCog,
} from 'lucide-react';
import { cn, formatDate, formatCurrency } from '@/lib/utils';
import type { Company } from '@/types';

interface ClientDetailsModalProps {
  company: Company;
  onClose: () => void;
  onEdit: () => void;
  onViewCredentials: () => void;
  onViewReports: () => void;
}

// Portal domain configuration
const PORTAL_DOMAINS = {
  student: 'https://student.learnova.training',
  coordinator: 'https://tc.learnova.training',
  sales: 'https://sales.learnova.training',
};

// Get portal URL based on role
function getPortalUrl(role: 'admin' | 'coordinator' | 'learner', companySlug: string): string {
  if (typeof window !== 'undefined') {
    const host = window.location.host;
    if (host.includes('localhost')) {
      return `http://localhost:3000?company=${companySlug}&role=${role}`;
    }
  }
  // Use production domains
  switch (role) {
    case 'learner':
      return `${PORTAL_DOMAINS.student}?company=${companySlug}`;
    case 'coordinator':
      return `${PORTAL_DOMAINS.coordinator}?company=${companySlug}`;
    case 'admin':
      return `${PORTAL_DOMAINS.coordinator}?company=${companySlug}&role=admin`;
    default:
      return `${PORTAL_DOMAINS.student}?company=${companySlug}`;
  }
}

export default function ClientDetailsModal({
  company,
  onClose,
  onEdit,
  onViewCredentials,
  onViewReports,
}: ClientDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'access' | 'stats'>('overview');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Generate portal URLs using proper domains
  const portalUrls = {
    admin: getPortalUrl('admin', company.slug),
    coordinator: getPortalUrl('coordinator', company.slug),
    learner: getPortalUrl('learner', company.slug),
  };

  // Generate credentials
  const credentials = {
    admin: {
      email: company.adminEmail || `admin@${company.slug}.com`,
      password: `Admin${company.slug.charAt(0).toUpperCase()}${company.slug.slice(1)}2024!`,
    },
    coordinator: {
      email: `coordinator@${company.slug}.com`,
      password: `Train${company.slug.charAt(0).toUpperCase()}${company.slug.slice(1)}2024!`,
    },
    learner: {
      email: `learner@${company.slug}.com`,
      password: `Learn${company.slug.charAt(0).toUpperCase()}${company.slug.slice(1)}2024!`,
    },
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with Company Brand */}
        <div
          className="px-6 py-6 text-white"
          style={{ backgroundColor: company.branding.primaryColor }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-3xl font-bold">{company.name.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{company.name}</h2>
                <p className="text-white/80 capitalize">{company.industry} • {company.size}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/70 text-sm">Learners</p>
              <p className="text-2xl font-bold">{company.learnerCount}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/70 text-sm">Enrollments</p>
              <p className="text-2xl font-bold">{company.activeEnrollments}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/70 text-sm">Subscription</p>
              <p className="text-2xl font-bold capitalize">{company.subscriptionTier}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/70 text-sm">Status</p>
              <p className="text-2xl font-bold capitalize">{company.subscriptionStatus}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: Building2 },
            { id: 'access', label: 'Portal Access', icon: Key },
            { id: 'stats', label: 'Analytics', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-cyan-600 text-cyan-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Company Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Company Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Industry</p>
                        <p className="font-medium text-gray-900 capitalize">{company.industry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Company Size</p>
                        <p className="font-medium text-gray-900 capitalize">{company.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-medium text-gray-900">{formatDate(company.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Admin Email</p>
                        <p className="font-medium text-gray-900">{company.adminEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Support Email</p>
                        <p className="font-medium text-gray-900">{company.supportEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Sales Person</p>
                        <p className="font-medium text-gray-900">{company.salesPerson || 'Unassigned'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Subscription
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 capitalize">{company.subscriptionTier} Plan</p>
                      <p className="text-sm text-gray-500">
                        {company.subscriptionStatus === 'trial' && company.trialEndsAt
                          ? `Trial ends: ${formatDate(company.trialEndsAt)}`
                          : `Status: ${company.subscriptionStatus}`
                        }
                      </p>
                    </div>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium capitalize',
                      company.subscriptionStatus === 'active' && 'bg-green-100 text-green-700',
                      company.subscriptionStatus === 'trial' && 'bg-amber-100 text-amber-700',
                      company.subscriptionStatus === 'expired' && 'bg-red-100 text-red-700'
                    )}>
                      {company.subscriptionStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enabled Features */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Enabled Features
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(company.features).map(([key, enabled]) => (
                    enabled && (
                      <span
                        key={key}
                        className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full text-sm"
                      >
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    )
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Portal Access Tab */}
          {activeTab === 'access' && (
            <div className="space-y-6">
              {/* Portal Links */}
              {[
                { role: 'admin', label: 'Admin Portal', icon: Shield, color: 'violet', desc: 'Full management access' },
                { role: 'coordinator', label: 'Training Coordinator', icon: UserCog, color: 'blue', desc: 'Manage learners and track progress' },
                { role: 'learner', label: 'Learner Portal', icon: GraduationCap, color: 'green', desc: 'Access courses and take assessments' },
              ].map((portal) => {
                const Icon = portal.icon;
                const url = portalUrls[portal.role as keyof typeof portalUrls];
                const creds = credentials[portal.role as keyof typeof credentials];

                return (
                  <div
                    key={portal.role}
                    className={cn(
                      'p-5 rounded-xl border-2',
                      portal.color === 'violet' && 'border-violet-200 bg-violet-50',
                      portal.color === 'blue' && 'border-blue-200 bg-blue-50',
                      portal.color === 'green' && 'border-green-200 bg-green-50'
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Icon className={cn(
                          'w-6 h-6',
                          portal.color === 'violet' && 'text-violet-600',
                          portal.color === 'blue' && 'text-blue-600',
                          portal.color === 'green' && 'text-green-600'
                        )} />
                        <div>
                          <h4 className="font-semibold text-gray-900">{portal.label}</h4>
                          <p className="text-sm text-gray-500">{portal.desc}</p>
                        </div>
                      </div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors',
                          portal.color === 'violet' && 'bg-violet-600 hover:bg-violet-700',
                          portal.color === 'blue' && 'bg-blue-600 hover:bg-blue-700',
                          portal.color === 'green' && 'bg-green-600 hover:bg-green-700'
                        )}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Portal
                      </a>
                    </div>

                    {/* Credentials */}
                    <div className="grid grid-cols-2 gap-4 bg-white/70 rounded-lg p-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <div className="flex items-center gap-2">
                          <code className="text-sm text-gray-900">{creds.email}</code>
                          <button
                            onClick={() => copyToClipboard(creds.email, `${portal.role}-email`)}
                            className={cn(
                              'p-1 rounded transition-colors',
                              copied === `${portal.role}-email` ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                            )}
                          >
                            {copied === `${portal.role}-email` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Password</p>
                        <div className="flex items-center gap-2">
                          <code className="text-sm text-gray-900">
                            {showPassword ? creds.password : '••••••••••'}
                          </code>
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(creds.password, `${portal.role}-pass`)}
                            className={cn(
                              'p-1 rounded transition-colors',
                              copied === `${portal.role}-pass` ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                            )}
                          >
                            {copied === `${portal.role}-pass` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Portal URL */}
                    <div className="mt-3 flex items-center gap-2">
                      <code className="text-xs text-gray-500 break-all flex-1">{url}</code>
                      <button
                        onClick={() => copyToClipboard(url, `${portal.role}-url`)}
                        className={cn(
                          'p-1 rounded transition-colors',
                          copied === `${portal.role}-url` ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                        )}
                      >
                        {copied === `${portal.role}-url` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Active Learners</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(company.learnerCount * 0.85)}</p>
                  <p className="text-xs text-green-600">+12% this month</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">Completion Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">72%</p>
                  <p className="text-xs text-green-600">+5% vs last month</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Avg. Study Time</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">45 min</p>
                  <p className="text-xs text-gray-500">per session</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">NPS Score</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">8.4</p>
                  <p className="text-xs text-green-600">Excellent</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {[
                    { action: '15 learners completed AZ-104', time: '2 hours ago', icon: Check },
                    { action: '8 new enrollments in AWS track', time: '5 hours ago', icon: Users },
                    { action: 'Monthly progress report generated', time: '1 day ago', icon: FileText },
                    { action: 'Subscription renewed', time: '3 days ago', icon: Calendar },
                  ].map((activity, idx) => {
                    const Icon = activity.icon;
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-white rounded-lg">
                          <Icon className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Generate Reports Button */}
              <button
                onClick={onViewReports}
                className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 transition-colors"
              >
                <FileText className="w-5 h-5" />
                Generate Full Report
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <button
              onClick={onViewCredentials}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Key className="w-4 h-4" />
              All Credentials
            </button>
            <button
              onClick={onViewReports}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              Reports
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Edit Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
