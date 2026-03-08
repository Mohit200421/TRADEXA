import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import journalService, { type Journal } from "../services/journalService";

interface JournalContextType {
  journals: Journal[];
  selectedJournal: Journal | null;
  loading: boolean;
  error: string | null;
  fetchJournals: () => Promise<void>;
  selectJournal: (journal: Journal | null) => void;
  createJournal: (data: { name: string; description?: string; isDefault?: boolean }) => Promise<Journal>;
  updateJournal: (id: string, data: { name?: string; description?: string; isDefault?: boolean }) => Promise<Journal>;
  deleteJournal: (id: string) => Promise<void>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

interface JournalProviderProps {
  children: ReactNode;
}

export const JournalProvider: React.FC<JournalProviderProps> = ({ children }) => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJournals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await journalService.getJournals();
      setJournals(data);
      
      // If there's a selected journal in localStorage, restore it
      const savedJournalId = localStorage.getItem("selectedJournalId");
      if (savedJournalId && data.length > 0) {
        const savedJournal = data.find((j: Journal) => j._id === savedJournalId);
        if (savedJournal) {
          setSelectedJournal(savedJournal);
        } else if (data.length > 0) {
          // If saved journal doesn't exist, select the first one or default
          const defaultJournal = data.find((j: Journal) => j.isDefault) || data[0];
          setSelectedJournal(defaultJournal);
          localStorage.setItem("selectedJournalId", defaultJournal._id);
        }
      } else if (data.length > 0) {
        // No saved selection, select default or first
        const defaultJournal = data.find((j: Journal) => j.isDefault) || data[0];
        setSelectedJournal(defaultJournal);
        localStorage.setItem("selectedJournalId", defaultJournal._id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch journals");
      console.error("Error fetching journals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch journals on mount
  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  const selectJournal = (journal: Journal | null) => {
    setSelectedJournal(journal);
    if (journal) {
      localStorage.setItem("selectedJournalId", journal._id);
    } else {
      localStorage.removeItem("selectedJournalId");
    }
  };

  const createJournal = async (data: { name: string; description?: string; isDefault?: boolean }) => {
    const newJournal = await journalService.createJournal(data);
    await fetchJournals();
    return newJournal;
  };

  const updateJournal = async (id: string, data: { name?: string; description?: string; isDefault?: boolean }) => {
    const updatedJournal = await journalService.updateJournal(id, data);
    await fetchJournals();
    
    // Update selected journal if it was the one being edited
    if (selectedJournal?._id === id) {
      setSelectedJournal(updatedJournal);
    }
    
    return updatedJournal;
  };

  const deleteJournal = async (id: string) => {
    await journalService.deleteJournal(id);
    
    // If the deleted journal was selected, clear selection
    if (selectedJournal?._id === id) {
      setSelectedJournal(null);
      localStorage.removeItem("selectedJournalId");
    }
    
    await fetchJournals();
  };

  const value: JournalContextType = {
    journals,
    selectedJournal,
    loading,
    error,
    fetchJournals,
    selectJournal,
    createJournal,
    updateJournal,
    deleteJournal,
  };

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournals = (): JournalContextType => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error("useJournals must be used within a JournalProvider");
  }
  return context;
};

export default JournalContext;

