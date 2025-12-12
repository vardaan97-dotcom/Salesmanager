'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Company, CompanyBranding, CompanyFeatures } from '@/types';

interface SyncedData {
  companies: Company[];
  lastSyncTime: Date | null;
  isSyncing: boolean;
}

interface SyncContextType extends SyncedData {
  syncCompany: (company: Company) => Promise<void>;
  publishUpdate: (companyId: string, updates: Partial<Company>) => Promise<void>;
  refreshData: () => Promise<void>;
  generateAccessUrl: (companySlug: string) => string;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

// Simulated WebSocket-like real-time sync using localStorage events
// In production, this would use actual WebSockets or Server-Sent Events
const SYNC_STORAGE_KEY = 'koenig_company_sync';
const LEARNER_CONFIG_KEY = 'koenig_learner_config';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const stored = localStorage.getItem(SYNC_STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setCompanies(data.companies || []);
          setLastSyncTime(data.lastSyncTime ? new Date(data.lastSyncTime) : null);
        }
      } catch (error) {
        console.error('Failed to load sync data:', error);
      }
    };

    loadStoredData();

    // Listen for storage events from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SYNC_STORAGE_KEY && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          setCompanies(data.companies || []);
          setLastSyncTime(data.lastSyncTime ? new Date(data.lastSyncTime) : null);
        } catch (error) {
          console.error('Failed to parse sync data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Persist changes to localStorage
  const persistData = useCallback((newCompanies: Company[]) => {
    const syncTime = new Date();
    const data = {
      companies: newCompanies,
      lastSyncTime: syncTime.toISOString(),
    };
    localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(data));
    setLastSyncTime(syncTime);
  }, []);

  // Sync a single company (create or update)
  const syncCompany = useCallback(async (company: Company) => {
    setIsSyncing(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      setCompanies(prev => {
        const existing = prev.findIndex(c => c.id === company.id);
        let updated: Company[];
        if (existing >= 0) {
          updated = [...prev];
          updated[existing] = company;
        } else {
          updated = [...prev, company];
        }
        persistData(updated);
        return updated;
      });

      // Also publish to learner portal config
      publishToLearnerPortal(company);
    } finally {
      setIsSyncing(false);
    }
  }, [persistData]);

  // Publish updates for a specific company
  const publishUpdate = useCallback(async (companyId: string, updates: Partial<Company>) => {
    setIsSyncing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));

      setCompanies(prev => {
        const updated = prev.map(c =>
          c.id === companyId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
        );
        persistData(updated);

        // Find and publish the updated company
        const updatedCompany = updated.find(c => c.id === companyId);
        if (updatedCompany) {
          publishToLearnerPortal(updatedCompany);
        }

        return updated;
      });
    } finally {
      setIsSyncing(false);
    }
  }, [persistData]);

  // Refresh all data (simulate API fetch)
  const refreshData = useCallback(async () => {
    setIsSyncing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // In production, this would fetch from API
      // For now, just update the sync time
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Generate access URL for learner portal
  const generateAccessUrl = useCallback((companySlug: string) => {
    // In production, this would be the actual learner portal domain
    const baseUrl = process.env.NEXT_PUBLIC_LEARNER_PORTAL_URL || 'http://localhost:3000';
    return `${baseUrl}?company=${companySlug}`;
  }, []);

  return (
    <SyncContext.Provider
      value={{
        companies,
        lastSyncTime,
        isSyncing,
        syncCompany,
        publishUpdate,
        refreshData,
        generateAccessUrl,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

// Publish company config to learner portal via localStorage
function publishToLearnerPortal(company: Company) {
  const learnerConfig = {
    companyId: company.id,
    slug: company.slug,
    name: company.name,
    branding: company.branding,
    features: company.features,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(LEARNER_CONFIG_KEY, JSON.stringify(learnerConfig));

  // Dispatch a custom event for same-tab updates
  window.dispatchEvent(new CustomEvent('learner-config-update', {
    detail: learnerConfig
  }));
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
