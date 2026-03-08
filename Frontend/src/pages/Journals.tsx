import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit,
  BookOpen,
  MoreVertical,
  Check,
  X,
  Loader2,
  Archive,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useJournals } from "../contexts/JournalContext";
import type { Journal } from "../services/journalService";

export default function Journals() {
  const { journals, selectedJournal, selectJournal, createJournal, updateJournal, deleteJournal, loading, fetchJournals } = useJournals();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newJournalName, setNewJournalName] = useState("");
  const [newJournalDescription, setNewJournalDescription] = useState("");
  const [newJournalAccountBalance, setNewJournalAccountBalance] = useState<string>("");
  const [newJournalRiskPerTrade, setNewJournalRiskPerTrade] = useState<string>("1");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!newJournalName.trim()) {
      toast.error("Please enter a journal name");
      return;
    }

    try {
      setSaving(true);
      await createJournal({
        name: newJournalName.trim(),
        description: newJournalDescription.trim(),
        accountBalance: newJournalAccountBalance ? Number(newJournalAccountBalance) : 0,
        riskPerTrade: newJournalRiskPerTrade ? Number(newJournalRiskPerTrade) : 1,
      });
      toast.success("Journal created successfully");
      setIsCreating(false);
      setNewJournalName("");
      setNewJournalDescription("");
      setNewJournalAccountBalance("");
      setNewJournalRiskPerTrade("1");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create journal");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!newJournalName.trim()) {
      toast.error("Please enter a journal name");
      return;
    }

    try {
      setSaving(true);
      await updateJournal(id, {
        name: newJournalName.trim(),
        description: newJournalDescription.trim(),
        accountBalance: newJournalAccountBalance ? Number(newJournalAccountBalance) : 0,
        riskPerTrade: newJournalRiskPerTrade ? Number(newJournalRiskPerTrade) : 1,
      });
      toast.success("Journal updated successfully");
      setEditingId(null);
      setNewJournalName("");
      setNewJournalDescription("");
      setNewJournalAccountBalance("");
      setNewJournalRiskPerTrade("1");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update journal");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this journal? Trades will be unassigned from this journal.")) {
      return;
    }

    try {
      await deleteJournal(id);
      toast.success("Journal deleted successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete journal");
    }
  };

  const handleSetDefault = async (journal: Journal) => {
    try {
      await updateJournal(journal._id, { isDefault: true });
      toast.success(`${journal.name} set as default journal`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to set default journal");
    }
  };

  const startEditing = (journal: Journal) => {
    setEditingId(journal._id);
    setNewJournalName(journal.name);
    setNewJournalDescription(journal.description || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewJournalName("");
    setNewJournalDescription("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading && journals.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Trading Journals</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create and manage multiple trading journals
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white 
                   rounded-lg font-medium hover:opacity-90 transition-all duration-200 
                   flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Create Journal
        </button>
      </div>

      {/* CREATE NEW JOURNAL FORM */}
      {isCreating && (
        <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Journal</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Journal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newJournalName}
                onChange={(e) => setNewJournalName(e.target.value)}
                placeholder="e.g., Intraday Trading, Swing Trading, Demo Account"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 
                         rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Description (Optional)
              </label>
              <textarea
                value={newJournalDescription}
                onChange={(e) => setNewJournalDescription(e.target.value)}
                placeholder="Describe what this journal is for..."
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 
                         rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreate}
                disabled={saving}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium 
                         hover:opacity-90 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Create Journal
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewJournalName("");
                  setNewJournalDescription("");
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 
                         rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JOURNALS LIST */}
      {journals.length === 0 && !isCreating ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <BookOpen className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No journals yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
            Create your first trading journal to organize your trades
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white 
                     rounded-lg font-medium hover:opacity-90 transition-all duration-200 
                     flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Your First Journal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {journals.map((journal) => (
            <div
              key={journal._id}
              className={`bg-white dark:bg-black rounded-xl border p-5 transition-all duration-200 
                ${selectedJournal?._id === journal._id 
                  ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20" 
                  : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                }`}
            >
              {editingId === journal._id ? (
                /* EDIT MODE */
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newJournalName}
                    onChange={(e) => setNewJournalName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 
                             rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <textarea
                    value={newJournalDescription}
                    onChange={(e) => setNewJournalDescription(e.target.value)}
                    placeholder="Description (optional)"
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 
                             rounded-lg text-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdate(journal._id)}
                      disabled={saving}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* VIEW MODE */
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{journal.name}</h3>
                        {journal.isDefault && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      {journal.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {journal.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>{journal.tradeCount || 0} trades</span>
                    <span>{formatDate(journal.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        selectJournal(journal);
                        navigate("/trades");
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${selectedJournal?._id === journal._id
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                        }`}
                    >
                      {selectedJournal?._id === journal._id ? "Selected" : "Select"}
                    </button>
                    
                    {!journal.isDefault && (
                      <button
                        onClick={() => handleSetDefault(journal)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                        title="Set as default"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => startEditing(journal)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                      title="Edit journal"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(journal._id)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                      title="Delete journal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* INFO BOX */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">About Trading Journals</h4>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Create separate journals for different trading styles, account types, or strategies. 
          Each journal maintains its own trade history and statistics. Trades can be filtered by 
          journal to analyze performance separately.
        </p>
      </div>
    </div>
  );
}

