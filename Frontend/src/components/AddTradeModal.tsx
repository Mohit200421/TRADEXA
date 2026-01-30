import { X, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function AddTradeModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [entryDate, setEntryDate] = useState<Date | null>(new Date());
  const [exitDate, setExitDate] = useState<Date | null>(null);

  // 🔹 FORM STATE
  const [form, setForm] = useState({
    symbol: "",
    type: "LONG",
    entryPrice: "",
    exitPrice: "",
    lotSize: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ======================
     SAVE TRADE
  ====================== */
  const handleSave = async () => {
    if (!form.symbol || !form.entryPrice || !form.lotSize || !entryDate) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      setLoading(true);

      await API.post("/trades", {
        symbol: form.symbol,
        type: form.type,
        entryPrice: Number(form.entryPrice),
        exitPrice: form.exitPrice ? Number(form.exitPrice) : null,
        lotSize: Number(form.lotSize),
        entryDate,
        exitDate,
        notes: form.notes,
      });
      

      toast.success("Trade added");
      onSuccess(); // 🔥 refresh trades list
      onClose();   // close modal
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add trade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="
          fixed inset-0 z-[9998]
          bg-white/60 dark:bg-black/60
          backdrop-blur-[3px]
        "
      />

      {/* MODAL */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <div
          className="w-full max-w-lg rounded-2xl p-6 shadow-2xl
          bg-white text-black
          dark:bg-[#0b0b0b] dark:text-white
        "
        >
          {/* HEADER */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Add Manual Trade</h2>
            <button onClick={onClose} className="opacity-70 hover:opacity-100">
              <X />
            </button>
          </div>

          {/* FORM */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Symbol"
              name="symbol"
              placeholder="E.G. XAUUSD"
              value={form.symbol}
              onChange={handleChange}
            />

            <Select
              label="Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              options={["LONG", "SHORT"]}
            />

            <Input
              label="Entry Price"
              type="number"
              name="entryPrice"
              value={form.entryPrice}
              onChange={handleChange}
            />

            <Input
              label="Exit Price (Optional)"
              type="number"
              name="exitPrice"
              value={form.exitPrice}
              onChange={handleChange}
            />

            <Input
              label="Quantity"
              name="lotSize"
              placeholder="Lots or units"
              value={form.lotSize}
              onChange={handleChange}
            />

            <DateField
              label="Entry Date"
              selected={entryDate}
              onChange={setEntryDate}
            />

            <DateField
              label="Exit Date (Optional)"
              selected={exitDate}
              onChange={setExitDate}
              placeholder="dd-mm-yyyy --:-- --"
            />
          </div>

          {/* NOTES */}
          <div className="mt-4">
            <label className="text-xs font-medium text-text-secondary">
              Notes (Optional)
            </label>
            <textarea
              rows={3}
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Trade rationale, entry/exit notes"
              className="
                mt-1 w-full rounded-lg p-3 text-sm resize-none
                border border-border
                bg-white dark:bg-[#141414]
                text-black dark:text-white
              "
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn-primary px-5 py-2"
            >
              {loading ? "Saving..." : "Save Trade"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------- UI COMPONENTS ---------------- */

function Input({ label, ...props }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-text-secondary">
        {label}
      </label>
      <input
        {...props}
        className="
          w-full rounded-lg px-3 py-2 text-sm
          border border-border
          bg-white dark:bg-[#141414]
          text-black dark:text-white
        "
      />
    </div>
  );
}

function Select({ label, options, ...props }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-text-secondary">
        {label}
      </label>
      <select
        {...props}
        className="
          w-full rounded-lg px-3 py-2 text-sm
          border border-border
          bg-white dark:bg-[#141414]
          text-black dark:text-white
        "
      >
        {options.map((o: string) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ---------------- DATE PICKER ---------------- */

function DateField({
  label,
  selected,
  onChange,
  placeholder,
}: any) {
  return (
    <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
      <label className="text-xs font-medium text-text-secondary">
        {label}
      </label>

      <div className="relative">
        <DatePicker
          selected={selected}
          onChange={onChange}
          showTimeSelect
          timeIntervals={1}
          dateFormat="dd-MM-yyyy hh:mm aa"
          placeholderText={placeholder}
          popperClassName="datepicker-popper"
          className="
            w-full rounded-lg px-3 py-2 text-sm
            border border-border
            bg-white dark:bg-[#141414]
            text-black dark:text-white
          "
        />
        <Calendar
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
        />
      </div>
    </div>
  );
}
