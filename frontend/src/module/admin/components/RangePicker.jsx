import React, { useEffect, useRef, useState } from "react";
import { Clock, ChevronDown, Check } from "lucide-react";
import { RANGE_OPTIONS, getRangeOption } from "../../../utils/dateRanges";

// Period dropdown for admin stats pages (Dashboard, Reports). `busy` spins
// the clock icon while new numbers load.
const RangePicker = ({ value, onChange, busy }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = getRangeOption(value);

  useEffect(() => {
    if (!open) return;
    const onClickAway = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 shadow-sm hover:border-gray-300 transition-colors">
        <Clock size={16} className={busy ? "animate-spin" : ""} />
        {selected.label}
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Dashboard period"
          className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-30">
          {RANGE_OPTIONS.map((option) => (
            <li key={option.key}>
              <button
                type="button"
                role="option"
                aria-selected={option.key === value}
                onClick={() => {
                  onChange(option.key);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-50 ${option.key === value ? "font-bold text-blue-600" : "text-gray-700"}`}>
                {option.label}
                {option.key === value && <Check size={14} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RangePicker;
