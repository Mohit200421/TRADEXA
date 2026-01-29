import { X, Calendar } from "lucide-react";
import { useState } from "react";
import DatePicker from "react-datepicker";

export default function AddTradeModal({
  onClose
}: {
  onClose: () => void;
}) {
  const [entryDate, setEntryDate] = useState<Date | null>(new Date());
  const [exitDate, setExitDate] = useState<Date | null>(null);

  return (
    <>
      {/* ===== BACKDROP (theme aware, no gap) ===== */}
      <div
        onClick={onClose}
        className="
          fixed inset-0 z-[9998]
          bg-white/40 dark:bg-black/40
          backdrop-blur-[6px]
        "
      />

      {/* ===== MODAL WRAPPER ===== */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <div
          className="
            w-full max-w-lg rounded-2xl p-6 shadow-2xl
            bg-white text-black
            dark:bg-black dark:text-white
          "
        >
          {/* ===== HEADER ===== */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Add Manual Trade</h2>
            <button onClick={onClose} className="opacity-70 hover:opacity-100">
              <X />
            </button>
          </div>

          {/* ===== FORM ===== */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Symbol" placeholder="E.G. XAUUSD" />
            <Select label="Type" options={["Long", "Short"]} />

            <Input label="Entry Price" type="number" />
            <Input label="Exit Price (Optional)" type="number" />

            <Input label="Quantity" placeholder="Lots or units" />

            <DateTimeInput
              label="Entry Date"
              value={entryDate}
              onChange={setEntryDate}
            />

            <DateTimeInput
              label="Exit Date (Optional)"
              value={exitDate}
              onChange={setExitDate}
            />
          </div>

          {/* ===== NOTES ===== */}
          <div className="mt-4">
            <label className="text-xs font-medium opacity-70">
              Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Trade rationale, entry/exit notes"
              className="
                mt-1 w-full rounded-lg p-3 text-sm resize-none
                border border-border
                bg-white text-black
                dark:bg-neutral-900 dark:text-white
              "
            />
          </div>

          {/* ===== ACTIONS ===== */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="
                px-4 py-2 rounded-lg text-sm
                border border-border
                hover:bg-border-light
              "
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

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function Input({ label, ...props }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium opacity-70">{label}</label>
      <input
        {...props}
        className="
          w-full rounded-lg px-3 py-2 text-sm
          border border-border
          bg-white text-black
          dark:bg-neutral-900 dark:text-white
        "
      />
    </div>
  );
}

function Select({ label, options }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium opacity-70">{label}</label>
      <select
        className="
          w-full rounded-lg px-3 py-2 text-sm
          border border-border
          bg-white text-black
          dark:bg-neutral-900 dark:text-white
        "
      >
        {options.map((o: string) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function DateTimeInput({
  label,
  value,
  onChange
}: {
  label: string;
  value: Date | null;
  onChange: (d: Date | null) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium opacity-70">{label}</label>

      <div className="relative">
        <DatePicker
          selected={value}
          onChange={onChange}
          showTimeSelect
          timeIntervals={1}
          timeCaption="Time"
          dateFormat="dd-MM-yyyy hh:mm aa"
          placeholderText="dd-mm-yyyy --:-- --"
          className="
            w-full rounded-lg px-3 py-2 text-sm
            border border-border
            bg-white text-black
            dark:bg-neutral-900 dark:text-white
          "
          popperPlacement="bottom-start"
        />

        <Calendar
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none"
        />
      </div>
    </div>
  );
}
