'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Mail,
  User,
  Users,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  Send,
  Download,
  GraduationCap,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Company } from '@/types';

interface CredentialsManagerProps {
  company: Company;
  onClose: () => void;
}

interface UserCredentials {
  role: 'admin' | 'coordinator' | 'learner';
  email: string;
  password: string;
  portalUrl: string;
  name: string;
}

// Portal domain configuration
const PORTAL_DOMAINS = {
  student: 'https://student.learnova.training',
  coordinator: 'https://tc.learnova.training',
  sales: 'https://sales.learnova.training',
};

// Get the base URL for portals based on role
function getPortalUrl(role: 'admin' | 'coordinator' | 'learner', companySlug: string): string {
  // In production, use the actual domains
  if (typeof window !== 'undefined') {
    const host = window.location.host;

    // If running on actual domains, use them
    if (host.includes('learnova.training')) {
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

    // For development/localhost
    if (host.includes('localhost')) {
      return `http://localhost:3000?company=${companySlug}&role=${role}`;
    }

    // For Vercel preview deployments, still use the production domains
    if (host.includes('vercel.app')) {
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
  }

  // Default fallback to production domains
  return `${PORTAL_DOMAINS.student}?company=${companySlug}`;
}

export default function CredentialsManager({ company, onClose }: CredentialsManagerProps) {
  const [activeTab, setActiveTab] = useState<'admin' | 'coordinator' | 'learner'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // Generate credentials for different user types with proper portal URLs
  const credentials: Record<string, UserCredentials> = {
    admin: {
      role: 'admin',
      name: 'Company Admin',
      email: company.adminEmail || `admin@${company.slug}.com`,
      password: `Admin${company.slug.charAt(0).toUpperCase()}${company.slug.slice(1)}2024!`,
      portalUrl: getPortalUrl('admin', company.slug),
    },
    coordinator: {
      role: 'coordinator',
      name: 'Training Coordinator',
      email: `coordinator@${company.slug}.com`,
      password: `Train${company.slug.charAt(0).toUpperCase()}${company.slug.slice(1)}2024!`,
      portalUrl: getPortalUrl('coordinator', company.slug),
    },
    learner: {
      role: 'learner',
      name: 'Student/Learner',
      email: `learner@${company.slug}.com`,
      password: `Learn${company.slug.charAt(0).toUpperCase()}${company.slug.slice(1)}2024!`,
      portalUrl: getPortalUrl('learner', company.slug),
    },
  };

  const currentCreds = credentials[activeTab];

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAllCredentials = () => {
    const text = `
${company.name} - ${currentCreds.name} Credentials
==========================================

Portal URL: ${currentCreds.portalUrl}
Email: ${currentCreds.email}
Password: ${currentCreds.password}

Note: Please change your password after first login.
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  const regeneratePassword = () => {
    // In a real app, this would call an API to regenerate the password
    alert('Password regeneration would be handled by the backend API');
  };

  const sendCredentialsEmail = () => {
    // In a real app, this would send an email via backend
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  const downloadCredentials = () => {
    const allCreds = Object.values(credentials);
    let content = `${company.name} - Portal Access Credentials\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `==========================================\n\n`;

    allCreds.forEach((cred) => {
      content += `${cred.name}\n`;
      content += `-----------\n`;
      content += `Portal URL: ${cred.portalUrl}\n`;
      content += `Email: ${cred.email}\n`;
      content += `Password: ${cred.password}\n\n`;
    });

    content += `\nNote: Please share these credentials securely and ask users to change their passwords after first login.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company.slug}-credentials.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Portal Access Credentials</h2>
            <p className="text-sm text-gray-500">{company.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Role Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'admin', label: 'Admin', icon: Shield, color: 'violet' },
            { id: 'coordinator', label: 'Training Coordinator', icon: UserCog, color: 'blue' },
            { id: 'learner', label: 'Learner', icon: GraduationCap, color: 'green' },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-cyan-600 text-cyan-600 bg-cyan-50/50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Role Description */}
          <div className={cn(
            'p-4 rounded-xl',
            activeTab === 'admin' && 'bg-violet-50 border border-violet-200',
            activeTab === 'coordinator' && 'bg-blue-50 border border-blue-200',
            activeTab === 'learner' && 'bg-green-50 border border-green-200'
          )}>
            <h3 className="font-semibold text-gray-900 mb-1">{currentCreds.name}</h3>
            <p className="text-sm text-gray-600">
              {activeTab === 'admin' && 'Full access to manage users, view reports, and configure portal settings.'}
              {activeTab === 'coordinator' && 'Manage learner enrollments, track progress, and generate reports.'}
              {activeTab === 'learner' && 'Access courses, take quizzes, and track personal learning progress.'}
            </p>
          </div>

          {/* Credentials */}
          <div className="space-y-4">
            {/* Portal URL */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Portal URL
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  <code className="text-sm text-cyan-600 break-all">{currentCreds.portalUrl}</code>
                </div>
                <button
                  onClick={() => copyToClipboard(currentCreds.portalUrl, 'url')}
                  className={cn(
                    'p-3 rounded-lg transition-colors',
                    copied === 'url' ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  )}
                >
                  {copied === 'url' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
                <a
                  href={currentCreds.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Login Email
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <code className="text-sm text-gray-900">{currentCreds.email}</code>
                </div>
                <button
                  onClick={() => copyToClipboard(currentCreds.email, 'email')}
                  className={cn(
                    'p-3 rounded-lg transition-colors',
                    copied === 'email' ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  )}
                >
                  {copied === 'email' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Temporary Password
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <User className="w-4 h-4 text-gray-400" />
                  <code className="text-sm text-gray-900">
                    {showPassword ? currentCreds.password : '••••••••••••••'}
                  </code>
                </div>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => copyToClipboard(currentCreds.password, 'password')}
                  className={cn(
                    'p-3 rounded-lg transition-colors',
                    copied === 'password' ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  )}
                >
                  {copied === 'password' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={copyAllCredentials}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                copied === 'all'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {copied === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === 'all' ? 'Copied!' : 'Copy All'}
            </button>

            <button
              onClick={sendCredentialsEmail}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                emailSent
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              )}
            >
              {emailSent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              {emailSent ? 'Email Sent!' : 'Send via Email'}
            </button>

            <button
              onClick={regeneratePassword}
              className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate Password
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={downloadCredentials}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download All Credentials
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
