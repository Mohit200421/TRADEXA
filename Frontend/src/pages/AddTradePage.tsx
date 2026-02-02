import { Calendar, Plus, Upload, Save, X, TrendingUp, TrendingDown, DollarSign, Package, Tag, Brain, BookOpen, BarChart, Image as ImageIcon, AlertCircle, Check, ArrowLeft, Star, Clock, Target, Zap } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/trades")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Trades</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-xl">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">New Trade Entry</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Record your trade details and journal in one place
                  </p>
                </div>
              </div>
              
              {/* PROGRESS STEPS */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">1</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-300">Trade Details</span>
                </div>
                <div className="w-8 h-px bg-gray-300 dark:bg-gray-700"></div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600/50 to-purple-600/50 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">2</span>
                  </div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Journal Entry</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {trade.symbol && (
                <div className="px-3 py-1.5 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/20 dark:to-purple-600/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    {trade.symbol} • {trade.type}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT - SINGLE FORM LAYOUT */}
        <div className="space-y-6">
          {/* TRADE DETAILS SECTION */}
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 dark:from-blue-500/30 dark:to-blue-600/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <BarChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Trade Details</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enter the basic information about your trade</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Symbol & Type</label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          name="symbol"
                          value={trade.symbol}
                          onChange={handleTradeChange}
                          placeholder="e.g., XAUUSD, BTCUSD"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/20 outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
                          autoComplete="off"
                          autoCapitalize="off"
                          autoCorrect="off"
                          spellCheck="false"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500">*</span>
                      </div>
                    </div>
                    <div className="w-32">
                      <div className="relative">
                        <select
                          name="type"
                          value={trade.type}
                          onChange={handleTradeChange}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/20 outline-none appearance-none transition-all"
                          autoComplete="off"
                        >
                          <option value="LONG">LONG</option>
                          <option value="SHORT">SHORT</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                          {trade.type === "LONG" ? 
                            <TrendingUp className="w-4 h-4 text-emerald-500" /> : 
                            <TrendingDown className="w-4 h-4 text-rose-500" />
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dates & Times</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <div className="relative flex-1">
                        <DatePicker
                          selected={entryDate}
                          onChange={setEntryDate}
                          placeholderText="Entry Date & Time"
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          timeCaption="Time"
                          dateFormat="dd/MM/yyyy HH:mm"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/20 outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
                          autoComplete="off"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                        <span className="absolute right-10 top-1/2 -translate-y-1/2 text-rose-500">*</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <div className="relative flex-1">
                        <DatePicker
                          selected={exitDate}
                          onChange={setExitDate}
                          placeholderText="Exit Date & Time (optional)"
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          timeCaption="Time"
                          dateFormat="dd/MM/yyyy HH:mm"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/20 outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
                          autoComplete="off"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price & Size</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      <div className="relative flex-1">
                        <input
                          name="entryPrice"
                          value={trade.entryPrice}
                          onChange={handleTradeChange}
                          placeholder="Entry Price"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/20 outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
                          type="number"
                          step="0.01"
                          autoComplete="off"
                          autoCapitalize="off"
                          autoCorrect="off"
                          spellCheck="false"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500">*</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-amber-500" />
                      <div className="relative flex-1">
                        <input
                          name="exitPrice"
                          value={trade.exitPrice}
                          onChange={handleTradeChange}
                          placeholder="Exit Price (optional)"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/20 outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
                          type="number"
                          step="0.01"
                          autoComplete="off"
                          autoCapitalize="off"
                          autoCorrect="off"
                          spellCheck="false"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-blue-500" />
                      <div className="relative flex-1">
                        <input
                          name="lotSize"
                          value={trade.lotSize}
                          onChange={handleTradeChange}
                          placeholder="Lot Size"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/20 outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
                          type="number"
                          step="0.01"
                          autoComplete="off"
                          autoCapitalize="off"
                          autoCorrect="off"
                          spellCheck="false"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500">*</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-800 dark:text-gray-300 mb-1">Required Fields</p>
                      <p className="text-gray-600 dark:text-gray-400">Symbol, Entry Price, Lot Size, and Entry Date are required to save.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* JOURNAL ENTRY SECTION */}
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 dark:from-emerald-500/30 dark:to-emerald-600/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Journal Entry</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Document your analysis and reflections</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* ANALYSIS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-emerald-500" />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Pre-Trade Analysis</label>
                    </div>
                    <textarea
                      value={journal.preTrade}
                      onChange={(e) => setJournal({ ...journal, preTrade: e.target.value })}
                      placeholder="What was your trading plan? Describe your analysis and reasons for entering..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/20 outline-none resize-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Check className="w-4 h-4 text-blue-500" />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Post-Trade Review</label>
                    </div>
                    <textarea
                      value={journal.postTrade}
                      onChange={(e) => setJournal({ ...journal, postTrade: e.target.value })}
                      placeholder="What actually happened? Review execution, exit reasons, and outcomes..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/20 outline-none resize-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-purple-500" />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Emotions & Psychology</label>
                    </div>
                    <textarea
                      value={journal.emotions}
                      onChange={(e) => setJournal({ ...journal, emotions: e.target.value })}
                      placeholder="How did you feel during the trade? Describe emotional state and discipline..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/20 outline-none resize-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Lessons Learned</label>
                    </div>
                    <textarea
                      value={journal.lessons}
                      onChange={(e) => setJournal({ ...journal, lessons: e.target.value })}
                      placeholder="What will you do differently next time? Note key takeaways and improvements..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/20 outline-none resize-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                  </div>
                </div>
              </div>

              {/* TAGS & RATING */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-blue-500" />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags & Categories</label>
                  </div>
                  <input
                    value={journal.tags}
                    onChange={(e: any) => setJournal({ ...journal, tags: e.target.value })}
                    placeholder="breakout, reversal, scalping (comma separated)"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/20 outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Trade Rating</label>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Performance Score</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{journal.rating}/10</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={journal.rating}
                      onChange={(e) => setJournal({ ...journal, rating: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-600 [&::-webkit-slider-thumb]:to-purple-600"
                      autoComplete="off"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Poor</span>
                      <span>Average</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CHECKLIST */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Checklist Review</label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        value
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        value ? "border-emerald-500 bg-emerald-500" : "border-gray-400 dark:border-gray-600"
                      }`}>
                        {value && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm text-left flex-1">{key}</span>
                    </button>
                  ))}
                </div>

                {!addingCheckpoint ? (
                  <button
                    type="button"
                    onClick={() => setAddingCheckpoint(true)}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Custom Checkpoint
                  </button>
                ) : (
                  <div className="flex gap-2 mt-4">
                    <input
                      value={newCheckpoint}
                      onChange={(e) => setNewCheckpoint(e.target.value)}
                      className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/20 outline-none"
                      placeholder="Enter custom checkpoint..."
                      onKeyPress={(e) => e.key === 'Enter' && addCheckpoint()}
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                    <button
                      type="button"
                      onClick={addCheckpoint}
                      className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-medium text-white transition-all"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingCheckpoint(false);
                        setNewCheckpoint("");
                      }}
                      className="px-4 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* SCREENSHOTS */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Screenshots & Charts</label>
                </div>
                
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
                    <Upload className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-300 mb-1">Upload Charts & Screenshots</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Drag & drop or click to upload images (PNG, JPG, WEBP)</p>
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                    {screenshots.map((file, i) => (
                      <div key={i} className="relative group">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Screenshot ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveScreenshot(i)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="sticky bottom-0 mt-8 p-4 bg-gradient-to-t from-white/90 to-white/70 dark:from-gray-950/90 dark:to-gray-900/70 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {trade.symbol && (
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 dark:text-gray-300">{trade.symbol}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${trade.type === "LONG" ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                      {trade.type}
                    </span>
                    {screenshots.length > 0 && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded text-xs">
                        {screenshots.length} image(s)
                      </span>
                    )}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/trades")}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-medium text-white transition-all hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Trade & Journal
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}