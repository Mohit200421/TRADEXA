import API from "../api/axios";

export interface Journal {
  _id: string;
  userId: string;
  name: string;
  description: string;
  initialBalance: number;
  riskPerTrade: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  tradeCount?: number;
  totalPnL?: number;
  currentBalance?: number;
  totalProfit?: number;
  totalLoss?: number;
}

export const journalService = {
  // Get all journals for current user
  getJournals: async (): Promise<Journal[]> => {
    const response = await API.get("/journals");
    return response.data;
  },

  // Get single journal by ID
  getJournal: async (id: string): Promise<Journal> => {
    const response = await API.get(`/journals/${id}`);
    return response.data;
  },

  // Create a new journal
  createJournal: async (data: {
    name: string;
    description?: string;
    initialBalance?: number;
    riskPerTrade?: number;
    isDefault?: boolean;
  }): Promise<Journal> => {
    const response = await API.post("/journals", data);
    return response.data;
  },

  // Update a journal
  updateJournal: async (
    id: string,
    data: {
      name?: string;
      description?: string;
      initialBalance?: number;
      riskPerTrade?: number;
      isDefault?: boolean;
    }
  ): Promise<Journal> => {
    const response = await API.put(`/journals/${id}`, data);
    return response.data;
  },

  // Delete a journal
  deleteJournal: async (id: string): Promise<void> => {
    await API.delete(`/journals/${id}`);
  },

  // Get trades by journal
  getTradesByJournal: async (journalId: string): Promise<any[]> => {
    const response = await API.get(`/journals/${journalId}/trades`);
    return response.data;
  },
};

export default journalService;

