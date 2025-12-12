'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Eye,
  Copy,
  ExternalLink,
  Palette,
  Settings,
  Users,
  Building2,
  Mail,
  Globe,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn, generateSlug, isValidHexColor, getContrastColor } from '@/lib/utils';
import { companyPresets, generateCredentials } from '@/lib/mockData';
import type { Company, CompanyBranding, CompanyFeatures, CompanyIndustry, CompanySize } from '@/types';

interface ClientCustomizerProps {
  client: Company | null;
  onClose: () => void;
  onSave: (config: Partial<Company>) => void;
}

const DEFAULT_BRANDING: CompanyBranding = {
  primaryColor: '#0891b2',
  secondaryColor: '#06b6d4',
  accentColor: '#f59e0b',
  backgroundColor: '#f8fafc',
  headerBackground: '#ffffff',
  textColor: '#1e293b',
  fontFamily: 'Inter, sans-serif',
  headingFont: 'Inter, sans-serif',
  buttonStyle: 'rounded',
  cardStyle: 'elevated',
  welcomeTitle: 'Welcome to Learning Portal',
  welcomeSubtitle: 'Start your certification journey today',
  loginMessage: 'Sign in to continue learning',
  helpUrl: null,
  privacyUrl: null,
  termsUrl: null,
};

const DEFAULT_FEATURES: CompanyFeatures = {
  courseContent: true,
  quizzes: true,
  qubits: true,
  certificates: true,
  aiAssistant: false,
  studyGroups: true,
  forum: true,
  liveSessions: false,
  analytics: true,
  gamification: true,
  flashcards: true,
  mindMaps: true,
  focusMode: true,
  calendar: true,
  examSimulator: true,
  weakAreaDrills: true,
  progressSharing: true,
  leaderboards: true,
  customReporting: false,
  apiAccess: false,
};

export default function ClientCustomizer({ client, onClose, onSave }: ClientCustomizerProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'branding' | 'features' | 'preview' | 'credentials'>('info');
  const [config, setConfig] = useState({
    name: client?.name || '',
    slug: client?.slug || '',
    industry: (client?.industry || 'technology') as CompanyIndustry,
    size: (client?.size || 'medium') as CompanySize,
    subscriptionTier: (client?.subscriptionTier || 'professional') as 'starter' | 'professional' | 'enterprise',
    adminEmail: client?.adminEmail || '',
    supportEmail: client?.supportEmail || '',
    branding: client?.branding || DEFAULT_BRANDING,
    features: client?.features || DEFAULT_FEATURES,
  });
  const [selectedPreset, setSelectedPreset] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  const [copied, setCopied] = useState(false);

  const isEditing = !!client;
  const credentials = generateCredentials(config.slug || 'newclient');

  const handlePresetSelect = (presetId: string) => {
    const preset = companyPresets.find(p => p.id === presetId);
    if (preset) {
      setConfig(prev => ({
        ...prev,
        industry: preset.industry,
        branding: preset.branding,
        features: preset.features,
      }));
      setSelectedPreset(presetId);
    }
  };

  const updateBranding = (key: keyof CompanyBranding, value: string) => {
    setConfig(prev => ({
      ...prev,
      branding: { ...prev.branding, [key]: value },
    }));
  };

  const toggleFeature = (key: keyof CompanyFeatures) => {
    setConfig(prev => ({
      ...prev,
      features: { ...prev.features, [key]: !prev.features[key] },
    }));
  };

  const handleSave = () => {
    onSave(config);

    // Publish changes to learner portal via localStorage for real-time sync
    const learnerConfig = {
      companyId: client?.id || `${config.slug}-${Date.now()}`,
      slug: config.slug,
      name: config.name,
      branding: config.branding,
      features: config.features,
      updatedAt: new Date().toISOString(),
    };

    // Store in localStorage for cross-tab communication
    localStorage.setItem('koenig_learner_config', JSON.stringify(learnerConfig));

    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('learner-config-update', {
      detail: learnerConfig
    }));

    setShowCredentials(true);
  };

  const copyCredentials = () => {
    const text = `
Portal URL: ${credentials.url}
Admin Email: ${credentials.adminEmail}
Temporary Password: ${credentials.tempPassword}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? `Edit ${client.name}` : 'Create New Client Portal'}
            </h2>
            <p className="text-sm text-gray-500">
              Configure branding, features, and generate access credentials
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-2 border-b border-gray-200 bg-gray-50">
          {[
            { id: 'info', label: 'Company Info', icon: Building2 },
            { id: 'branding', label: 'Branding', icon: Palette },
            { id: 'features', label: 'Features', icon: Settings },
            { id: 'preview', label: 'Preview', icon: Eye },
            { id: 'credentials', label: 'Credentials', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-white text-cyan-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
          {/* Company Info Tab */}
          {activeTab === 'info' && (
            <div className="max-w-2xl space-y-6">
              {/* Preset Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start from a Preset
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {companyPresets.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset.id)}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all',
                        selectedPreset === preset.id
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div
                        className="w-8 h-8 rounded-lg mb-2"
                        style={{ backgroundColor: preset.branding.primaryColor }}
                      />
                      <p className="font-medium text-gray-900">{preset.name}</p>
                      <p className="text-xs text-gray-500">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    name: e.target.value,
                    slug: generateSlug(e.target.value),
                  }))}
                  placeholder="e.g., PricewaterhouseCoopers"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
              </div>

              {/* URL Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portal URL
                </label>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-500">https://</span>
                  <input
                    type="text"
                    value={config.slug}
                    onChange={(e) => setConfig(prev => ({ ...prev, slug: e.target.value }))}
                    className="flex-1 bg-transparent outline-none font-medium text-gray-900"
                    placeholder="company-name"
                  />
                  <span className="text-gray-500">.learn.koenig.com</span>
                </div>
              </div>

              {/* Industry & Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    value={config.industry}
                    onChange={(e) => setConfig(prev => ({ ...prev, industry: e.target.value as CompanyIndustry }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="consulting">Consulting</option>
                    <option value="finance">Finance</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="retail">Retail</option>
                    <option value="education">Education</option>
                    <option value="government">Government</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  <select
                    value={config.size}
                    onChange={(e) => setConfig(prev => ({ ...prev, size: e.target.value as CompanySize }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="startup">Startup (1-50)</option>
                    <option value="small">Small (51-200)</option>
                    <option value="medium">Medium (201-1000)</option>
                    <option value="large">Large (1001-5000)</option>
                    <option value="enterprise">Enterprise (5000+)</option>
                  </select>
                </div>
              </div>

              {/* Contact Emails */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Email
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-cyan-500">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={config.adminEmail}
                      onChange={(e) => setConfig(prev => ({ ...prev, adminEmail: e.target.value }))}
                      placeholder="admin@company.com"
                      className="flex-1 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Email
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-cyan-500">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={config.supportEmail}
                      onChange={(e) => setConfig(prev => ({ ...prev, supportEmail: e.target.value }))}
                      placeholder="support@company.com"
                      className="flex-1 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Subscription Tier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Tier
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'starter', name: 'Starter', features: '10 features', price: '$500/mo' },
                    { id: 'professional', name: 'Professional', features: '15 features', price: '$1,500/mo' },
                    { id: 'enterprise', name: 'Enterprise', features: 'All features', price: 'Custom' },
                  ].map(tier => (
                    <button
                      key={tier.id}
                      onClick={() => setConfig(prev => ({ ...prev, subscriptionTier: tier.id as typeof config.subscriptionTier }))}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all',
                        config.subscriptionTier === tier.id
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <p className="font-semibold text-gray-900">{tier.name}</p>
                      <p className="text-xs text-gray-500">{tier.features}</p>
                      <p className="text-sm font-medium text-cyan-600 mt-2">{tier.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="max-w-2xl space-y-6">
              {/* Colors */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Brand Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'primaryColor', label: 'Primary' },
                    { key: 'secondaryColor', label: 'Secondary' },
                    { key: 'accentColor', label: 'Accent' },
                    { key: 'backgroundColor', label: 'Background' },
                    { key: 'headerBackground', label: 'Header' },
                    { key: 'textColor', label: 'Text' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.branding[key as keyof CompanyBranding] as string}
                        onChange={(e) => updateBranding(key as keyof CompanyBranding, e.target.value)}
                        className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{label}</p>
                        <input
                          type="text"
                          value={config.branding[key as keyof CompanyBranding] as string}
                          onChange={(e) => updateBranding(key as keyof CompanyBranding, e.target.value)}
                          className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Typography</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Body Font</label>
                    <select
                      value={config.branding.fontFamily}
                      onChange={(e) => updateBranding('fontFamily', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    >
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Open Sans, sans-serif">Open Sans</option>
                      <option value="Poppins, sans-serif">Poppins</option>
                      <option value="Georgia, serif">Georgia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Heading Font</label>
                    <select
                      value={config.branding.headingFont}
                      onChange={(e) => updateBranding('headingFont', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    >
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Poppins, sans-serif">Poppins</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Merriweather, serif">Merriweather</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* UI Style */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">UI Style</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Button Style</label>
                    <div className="flex gap-2">
                      {(['rounded', 'pill', 'square'] as const).map(style => (
                        <button
                          key={style}
                          onClick={() => updateBranding('buttonStyle', style)}
                          className={cn(
                            'flex-1 py-2 text-sm font-medium transition-all',
                            style === 'rounded' ? 'rounded-lg' : style === 'pill' ? 'rounded-full' : 'rounded',
                            config.branding.buttonStyle === style
                              ? 'bg-cyan-600 text-white'
                              : 'bg-gray-100 text-gray-700'
                          )}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Card Style</label>
                    <div className="flex gap-2">
                      {(['flat', 'elevated', 'bordered'] as const).map(style => (
                        <button
                          key={style}
                          onClick={() => updateBranding('cardStyle', style)}
                          className={cn(
                            'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
                            config.branding.cardStyle === style
                              ? 'bg-cyan-600 text-white'
                              : 'bg-gray-100 text-gray-700'
                          )}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Messages */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Custom Messages</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Welcome Title</label>
                    <input
                      type="text"
                      value={config.branding.welcomeTitle}
                      onChange={(e) => updateBranding('welcomeTitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Welcome Subtitle</label>
                    <input
                      type="text"
                      value={config.branding.welcomeSubtitle}
                      onChange={(e) => updateBranding('welcomeSubtitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Login Message</label>
                    <input
                      type="text"
                      value={config.branding.loginMessage}
                      onChange={(e) => updateBranding('loginMessage', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="max-w-3xl">
              <div className="grid grid-cols-2 gap-6">
                {/* Core Features */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Core Features</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'courseContent', label: 'Course Content', desc: 'Video lessons and articles' },
                      { key: 'quizzes', label: 'Quizzes', desc: 'End of lesson assessments' },
                      { key: 'qubits', label: 'Qubits', desc: 'Quick knowledge checks' },
                      { key: 'certificates', label: 'Certificates', desc: 'Completion certificates' },
                    ].map(({ key, label, desc }) => (
                      <FeatureToggle
                        key={key}
                        label={label}
                        description={desc}
                        enabled={config.features[key as keyof CompanyFeatures]}
                        onChange={() => toggleFeature(key as keyof CompanyFeatures)}
                      />
                    ))}
                  </div>
                </div>

                {/* Learning Tools */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Learning Tools</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'flashcards', label: 'Flashcards', desc: 'Spaced repetition' },
                      { key: 'mindMaps', label: 'Mind Maps', desc: 'Visual mapping' },
                      { key: 'focusMode', label: 'Focus Mode', desc: 'Pomodoro timer' },
                      { key: 'calendar', label: 'Calendar', desc: 'Study scheduling' },
                    ].map(({ key, label, desc }) => (
                      <FeatureToggle
                        key={key}
                        label={label}
                        description={desc}
                        enabled={config.features[key as keyof CompanyFeatures]}
                        onChange={() => toggleFeature(key as keyof CompanyFeatures)}
                      />
                    ))}
                  </div>
                </div>

                {/* Exam Prep */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Exam Preparation</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'examSimulator', label: 'Exam Simulator', desc: 'Practice exams' },
                      { key: 'weakAreaDrills', label: 'Weak Area Drills', desc: 'Targeted practice' },
                    ].map(({ key, label, desc }) => (
                      <FeatureToggle
                        key={key}
                        label={label}
                        description={desc}
                        enabled={config.features[key as keyof CompanyFeatures]}
                        onChange={() => toggleFeature(key as keyof CompanyFeatures)}
                      />
                    ))}
                  </div>
                </div>

                {/* Social */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Social & Gamification</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'gamification', label: 'Gamification', desc: 'XP and achievements' },
                      { key: 'leaderboards', label: 'Leaderboards', desc: 'Rankings' },
                      { key: 'studyGroups', label: 'Study Groups', desc: 'Team learning' },
                      { key: 'forum', label: 'Forum', desc: 'Discussions' },
                    ].map(({ key, label, desc }) => (
                      <FeatureToggle
                        key={key}
                        label={label}
                        description={desc}
                        enabled={config.features[key as keyof CompanyFeatures]}
                        onChange={() => toggleFeature(key as keyof CompanyFeatures)}
                      />
                    ))}
                  </div>
                </div>

                {/* Advanced */}
                <div className="col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Advanced Features</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { key: 'aiAssistant', label: 'AI Assistant', desc: 'AI help' },
                      { key: 'liveSessions', label: 'Live Sessions', desc: 'Real-time classes' },
                      { key: 'analytics', label: 'Analytics', desc: 'Learning insights' },
                      { key: 'customReporting', label: 'Reports', desc: 'Custom reports' },
                    ].map(({ key, label, desc }) => (
                      <FeatureToggle
                        key={key}
                        label={label}
                        description={desc}
                        enabled={config.features[key as keyof CompanyFeatures]}
                        onChange={() => toggleFeature(key as keyof CompanyFeatures)}
                        compact
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="max-w-3xl">
              <div
                className="rounded-2xl overflow-hidden border-2 border-gray-200"
                style={{
                  backgroundColor: config.branding.backgroundColor,
                  fontFamily: config.branding.fontFamily,
                }}
              >
                {/* Mock Header */}
                <div
                  className="p-4 flex items-center justify-between"
                  style={{ backgroundColor: config.branding.headerBackground }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: config.branding.primaryColor }}
                    >
                      {config.name.charAt(0) || 'K'}
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: config.branding.textColor }}>
                        {config.name || 'Company Name'}
                      </div>
                      <div className="text-xs text-gray-500">Learning Portal</div>
                    </div>
                  </div>
                </div>

                {/* Mock Content */}
                <div className="p-6">
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{
                      color: config.branding.textColor,
                      fontFamily: config.branding.headingFont,
                    }}
                  >
                    {config.branding.welcomeTitle}
                  </h2>
                  <p className="text-gray-600 mb-6">{config.branding.welcomeSubtitle}</p>

                  {/* Sample Cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div
                      className={cn(
                        'p-4 bg-white rounded-xl',
                        config.branding.cardStyle === 'bordered' && 'border border-gray-200',
                        config.branding.cardStyle === 'elevated' && 'shadow-lg'
                      )}
                    >
                      <div className="text-sm font-medium" style={{ color: config.branding.textColor }}>
                        Course Progress
                      </div>
                      <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: '65%', backgroundColor: config.branding.primaryColor }}
                        />
                      </div>
                    </div>
                    <div
                      className={cn(
                        'p-4 bg-white rounded-xl',
                        config.branding.cardStyle === 'bordered' && 'border border-gray-200',
                        config.branding.cardStyle === 'elevated' && 'shadow-lg'
                      )}
                    >
                      <div className="text-sm font-medium" style={{ color: config.branding.textColor }}>
                        Weekly Streak
                      </div>
                      <div className="text-2xl font-bold" style={{ color: config.branding.accentColor }}>
                        5 Days
                      </div>
                    </div>
                  </div>

                  {/* Sample Buttons */}
                  <div className="flex gap-3">
                    <button
                      className={cn(
                        'px-6 py-2.5 font-medium',
                        config.branding.buttonStyle === 'rounded' && 'rounded-lg',
                        config.branding.buttonStyle === 'pill' && 'rounded-full',
                        config.branding.buttonStyle === 'square' && 'rounded'
                      )}
                      style={{
                        backgroundColor: config.branding.primaryColor,
                        color: getContrastColor(config.branding.primaryColor),
                      }}
                    >
                      Continue Learning
                    </button>
                    <button
                      className={cn(
                        'px-6 py-2.5 font-medium border-2',
                        config.branding.buttonStyle === 'rounded' && 'rounded-lg',
                        config.branding.buttonStyle === 'pill' && 'rounded-full',
                        config.branding.buttonStyle === 'square' && 'rounded'
                      )}
                      style={{
                        borderColor: config.branding.secondaryColor,
                        color: config.branding.secondaryColor,
                      }}
                    >
                      View Courses
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Credentials Tab */}
          {activeTab === 'credentials' && (
            <div className="max-w-xl">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-cyan-100 rounded-xl">
                    <Sparkles className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Portal Access Credentials</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      These credentials will be used to access the client's learning portal.
                      Share these with the client administrator.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Portal URL
                  </label>
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono text-cyan-600">{credentials.url}</code>
                    <a
                      href={credentials.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </a>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Admin Email
                  </label>
                  <code className="text-sm font-mono text-gray-900">{credentials.adminEmail}</code>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Temporary Password
                  </label>
                  <code className="text-sm font-mono text-gray-900">{credentials.tempPassword}</code>
                </div>

                <button
                  onClick={copyCredentials}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors',
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy All Credentials
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            {activeTab !== 'credentials' && (
              <button
                onClick={() => {
                  const tabs = ['info', 'branding', 'features', 'preview', 'credentials'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1] as typeof activeTab);
                  }
                }}
                className="flex items-center gap-2 px-6 py-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              {isEditing ? 'Save Changes' : 'Create Portal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Feature Toggle Component
function FeatureToggle({
  label,
  description,
  enabled,
  onChange,
  compact = false,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onChange}
      className={cn(
        'w-full rounded-xl border-2 text-left transition-all',
        compact ? 'p-3' : 'p-4',
        enabled ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 hover:border-gray-300'
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn('font-medium text-gray-900', compact && 'text-sm')}>{label}</span>
        <div
          className={cn(
            'w-10 h-6 rounded-full transition-colors',
            enabled ? 'bg-cyan-500' : 'bg-gray-300'
          )}
        >
          <div
            className={cn(
              'w-4 h-4 rounded-full bg-white shadow transform transition-transform mt-1',
              enabled ? 'translate-x-5' : 'translate-x-1'
            )}
          />
        </div>
      </div>
      <p className={cn('text-gray-500 mt-1', compact ? 'text-xs' : 'text-sm')}>{description}</p>
    </button>
  );
}
