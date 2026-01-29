import { X, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";

export default function AddTradeModal({ onClose }: { onClose: () => void }) {
  const [entryDate, setEntryDate] = useState<Date | null>(new Date());
  const [exitDate, setExitDate] = useState<Date | null>(null);

  return (
    <>
      {/* BACKDROP – full screen, no gap */}
      <div
        onClick={onClose}
        className="
          fixed inset-0 z-[9998]
          bg-white/60 dark:bg-black/60
          backdrop-blur-[3px]
        "
      />

      {/* MODAL WRAPPER */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl p-6 shadow-2xl
          bg-white text-black
          dark:bg-[#0b0b0b] dark:text-white
        ">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Add Manual Trade</h2>
            <button onClick={onClose} className="opacity-70 hover:opacity-100">
              <X />
            </button>
          </div>

          {/* FORM */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Symbol" placeholder="E.G. XAUUSD" />
            <Select label="Type" options={["Long", "Short"]} />

            <Input label="Entry Price" type="number" />
            <Input label="Exit Price (Optional)" type="number" />

            <Input label="Quantity" placeholder="Lots or units" />

            {/* ENTRY DATE */}
            <DateField
              label="Entry Date"
              selected={entryDate}
              onChange={setEntryDate}
            />

            {/* EXIT DATE */}
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
            <button className="btn-primary px-5 py-2">
              Save Trade
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

function Select({ label, options }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-text-secondary">
        {label}
      </label>
      <select
        className="
          w-full rounded-lg px-3 py-2 text-sm
          border border-border
          bg-white dark:bg-[#141414]
          text-black dark:text-white
        "
      >
        {options.map((o: string) => (
          <option key={o}>{o}</option>
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
  placeholder
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
