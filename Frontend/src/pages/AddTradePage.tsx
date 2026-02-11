import { Calendar, Plus, Upload, Save, X, TrendingUp, TrendingDown, DollarSign, Package, Tag, Brain, BookOpen, BarChart, Image as ImageIcon, AlertCircle, Check, ArrowLeft, Star, Clock, Target, Zap, Loader2 } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

type Checklist = Record<string, boolean>;

export default function AddTradePage() {
  const navigate = useNavigate();

  const [entryDate, setEntryDate] = useState<Date | null>(new Date());
  const [exitDate, setExitDate] = useState<Date | null>(null);

  const [trade, setTrade] = useState({
    symbol: "",
    type: "LONG",
    entryPrice: "",
    exitPrice: "",
    lotSize: "",
  });

  const [journal, setJournal] = useState({
    preTrade: "",
    postTrade: "",
    emotions: "",
    lessons: "",
    tags: "",
    rating: 5,
    checklist: {
      "Followed Trading Plan": false,
      "Proper Risk Management": false,
      "Good Entry Timing": false,
      "Patient Exit Strategy": false,
      "Emotionally Controlled": false,
      "Market Analysis Done": false,
    } as Checklist,
  });

  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [newCheckpoint, setNewCheckpoint] = useState("");
  const [addingCheckpoint, setAddingCheckpoint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<"trade" | "journal">("trade");

  const handleTradeChange = (e: any) =>
    setTrade({ ...trade, [e.target.name]: e.target.value });

  const addCheckpoint = () => {
    const key = newCheckpoint.trim();
    if (!key || journal.checklist[key]) return;

    setJournal({
      ...journal,
      checklist: { ...journal.checklist, [key]: false },
    });
    setNewCheckpoint("");
    setAddingCheckpoint(false);
    toast.success("Checkpoint added");
  };

  const handleSave = async () => {
    if (!trade.symbol || !trade.entryPrice || !trade.lotSize || !entryDate) {
      toast.error("Fill required trade fields");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      Object.entries(trade).forEach(([k, v]) =>
        formData.append(k, v)
      );

      formData.append("entryDate", entryDate.toISOString());
      if (exitDate) formData.append("exitDate", exitDate.toISOString());

      formData.append("journal", JSON.stringify(journal));
      screenshots.forEach((f) => formData.append("screenshots", f));

      await API.post("/trades", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Trade saved successfully");
      navigate("/trades");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save trade");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/trades")}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Back to Trades</span>
            </button>
            
            {/* Progress Indicator for Mobile */}
            <div className="flex items-center gap-2 sm:hidden">
              <div className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${activeSection === "trade" ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-800"}`}></div>
                <span className={`text-xs ${activeSection === "trade" ? "font-medium text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-500"}`}>1</span>
              </div>
              <div className="w-6 h-px bg-gray-300 dark:bg-gray-800"></div>
              <div className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${activeSection === "journal" ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-800"}`}></div>
                <span className={`text-xs ${activeSection === "journal" ? "font-medium text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-500"}`}>2</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">New Trade</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Record trade details and journal
                  </p>
                </div>
              </div>
              
              {/* Section Tabs for Mobile */}
              <div className="flex gap-2 mt-4 sm:hidden">
                <button
                  onClick={() => setActiveSection("trade")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === "trade"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Trade Details
                </button>
                <button
                  onClick={() => setActiveSection("journal")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === "journal"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Journal
                </button>
              </div>
            </div>
            
            {trade.symbol && (
              <div className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  {trade.symbol} • {trade.type}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* MAIN CONTENT - MOBILE TABS */}
        <div className={`${activeSection === "trade" ? "block" : "hidden"} sm:block`}>
          {/* TRADE DETAILS SECTION */}
          <div className="bg-white dark:bg-black rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 md:p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 flex items-center justify-center">
                <BarChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Trade Details</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Basic information about your trade</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Symbol & Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Symbol & Type</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        name="symbol"
                        value={trade.symbol}
                        onChange={handleTradeChange}
                        placeholder="e.g., XAUUSD, BTCUSD"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        autoComplete="off"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 text-sm">*</span>
                    </div>
                  </div>
                  <div className="w-28 sm:w-32">
                    <div className="relative">
                      <select
                        name="type"
                        value={trade.type}
                        onChange={handleTradeChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-sm"
                        autoComplete="off"
                      >
                        <option value="LONG">LONG</option>
                        <option value="SHORT">SHORT</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {trade.type === "LONG" ? 
                          <TrendingUp className="w-4 h-4 text-green-500" /> : 
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Entry Date</label>
                  <div className="relative">
                    <DatePicker
                      selected={entryDate}
                      onChange={setEntryDate}
                      placeholderText="Select date & time"
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="dd/MM/yy HH:mm"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      autoComplete="off"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Exit Date (Optional)</label>
                  <div className="relative">
                    <DatePicker
                      selected={exitDate}
                      onChange={setExitDate}
                      placeholderText="Select date & time"
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="dd/MM/yy HH:mm"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      autoComplete="off"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Price & Size */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price & Size</label>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Entry Price</span>
                    </div>
                    <div className="relative">
                      <input
                        name="entryPrice"
                        value={trade.entryPrice}
                        onChange={handleTradeChange}
                        placeholder="Enter entry price"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        type="number"
                        step="0.01"
                        autoComplete="off"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 text-sm">*</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Exit Price (Optional)</span>
                    </div>
                    <input
                      name="exitPrice"
                      value={trade.exitPrice}
                      onChange={handleTradeChange}
                      placeholder="Enter exit price"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      type="number"
                      step="0.01"
                      autoComplete="off"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Lot Size</span>
                    </div>
                    <div className="relative">
                      <input
                        name="lotSize"
                        value={trade.lotSize}
                        onChange={handleTradeChange}
                        placeholder="Enter lot size"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        type="number"
                        step="0.01"
                        autoComplete="off"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 text-sm">*</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Required Fields Note */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Required fields:</span> Symbol, Entry Price, Lot Size, and Entry Date.
                    <span className="text-rose-500"> *</span> indicates required field.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* JOURNAL SECTION */}
        <div className={`${activeSection === "journal" ? "block" : "hidden"} sm:block`}>
          <div className="bg-white dark:bg-black rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Journal Entry</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Document your analysis and reflections</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Pre & Post Trade */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Pre-Trade Analysis</label>
                  <textarea
                    value={journal.preTrade}
                    onChange={(e) => setJournal({ ...journal, preTrade: e.target.value })}
                    placeholder="What was your trading plan? Describe analysis and entry reasons..."
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Post-Trade Review</label>
                  <textarea
                    value={journal.postTrade}
                    onChange={(e) => setJournal({ ...journal, postTrade: e.target.value })}
                    placeholder="What actually happened? Review execution and outcomes..."
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  />
                </div>
              </div>

              {/* Emotions & Lessons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Emotions & Psychology</label>
                  <textarea
                    value={journal.emotions}
                    onChange={(e) => setJournal({ ...journal, emotions: e.target.value })}
                    placeholder="How did you feel during the trade? Describe emotional state..."
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Lessons Learned</label>
                  <textarea
                    value={journal.lessons}
                    onChange={(e) => setJournal({ ...journal, lessons: e.target.value })}
                    placeholder="What will you do differently next time? Note key takeaways..."
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  />
                </div>
              </div>

              {/* Tags & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Tags & Categories</label>
                  <input
                    value={journal.tags}
                    onChange={(e: any) => setJournal({ ...journal, tags: e.target.value })}
                    placeholder="breakout, reversal, scalping (comma separated)"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Trade Rating</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Score</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{journal.rating}/10</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={journal.rating}
                      onChange={(e) => setJournal({ ...journal, rating: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 dark:[&::-webkit-slider-thumb]:bg-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                      <span>Poor</span>
                      <span>Average</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Checklist Review</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(journal.checklist).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setJournal({
                          ...journal,
                          checklist: { ...journal.checklist, [key]: !value },
                        })
                      }
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors text-left ${
                        value
                          ? "border-green-500 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                          : "border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-400"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        value ? "border-green-500 bg-green-500" : "border-gray-400 dark:border-gray-700"
                      }`}>
                        {value && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm flex-1">{key}</span>
                    </button>
                  ))}
                </div>

                {!addingCheckpoint ? (
                  <button
                    type="button"
                    onClick={() => setAddingCheckpoint(true)}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-gray-300 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-700 rounded-lg transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Custom Checkpoint
                  </button>
                ) : (
                  <div className="flex gap-2 mt-3">
                    <input
                      value={newCheckpoint}
                      onChange={(e) => setNewCheckpoint(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Enter custom checkpoint..."
                      onKeyPress={(e) => e.key === 'Enter' && addCheckpoint()}
                    />
                    <button
                      type="button"
                      onClick={addCheckpoint}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white text-sm transition-colors"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingCheckpoint(false);
                        setNewCheckpoint("");
                      }}
                      className="px-4 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg font-medium text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Screenshots */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Screenshots & Charts</label>
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
                    <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-300 mb-1 text-sm">Upload Charts & Screenshots</p>
                      <p className="text-xs text-gray-600 dark:text-gray-500">Click to upload images (PNG, JPG)</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          setScreenshots(Array.from(e.target.files));
                          toast.success(`${e.target.files.length} file(s) added`);
                        }
                      }}
                    />
                  </div>
                </label>

                {screenshots.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                    {screenshots.map((file, i) => (
                      <div key={i} className="relative group">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800 overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Screenshot ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveScreenshot(i)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
                          {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex gap-2 mt-6 sm:hidden">
          <button
            onClick={() => setActiveSection("trade")}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeSection === "trade"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
            }`}
          >
            <BarChart className="w-4 h-4" />
            Trade
          </button>
          <button
            onClick={() => setActiveSection("journal")}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeSection === "journal"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Journal
          </button>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="sticky bottom-0 mt-6 sm:mt-8 p-3 sm:p-4 bg-white dark:bg-black/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {trade.symbol && (
                <span className="flex items-center gap-2">
                  <span className="font-medium text-gray-800 dark:text-gray-300">{trade.symbol}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${trade.type === "LONG" ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                    {trade.type}
                  </span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate("/trades")}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg font-medium text-sm sm:text-base transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-lg font-medium text-white text-sm sm:text-base transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Trade
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}