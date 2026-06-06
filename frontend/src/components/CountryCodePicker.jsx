import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, Check } from "lucide-react";
import COUNTRY_CODES from "../data/countryCodes";

/**
 * CountryCodePicker — flag + dial-code dropdown for mobile-number inputs.
 *
 * Controlled component. Parent passes:
 *   value      — the currently selected country object (from countryCodes.js)
 *   onChange   — called with the newly selected country
 *
 * The trigger is a flat chip; clicking it opens a searchable list.
 *
 * The list panel is rendered via a portal with `position: fixed`, anchored
 * to the trigger button's measured bounding rect. This avoids two layout
 * problems we'd otherwise hit:
 *   1) The trigger is a small chip inside a much taller input row, so a
 *      naive `top-full` would overlap the bottom of the row.
 *   2) The input row uses `overflow-hidden` for rounded-corner clipping,
 *      which would crop any absolutely-positioned descendant.
 * Fixed-positioned, portaled content escapes both.
 */
const CountryCodePicker = ({ value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [panelStyle, setPanelStyle] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const searchInputRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [query]);

  // Position + lifecycle: measure trigger on open and on viewport changes,
  // close on outside click / ESC, autofocus the search input.
  useEffect(() => {
    if (!isOpen) return;

    const PANEL_WIDTH = 288; // matches w-72
    const GUTTER = 8; // breathing room from viewport edges

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      // Keep the panel inside the viewport horizontally.
      const maxLeft = window.innerWidth - PANEL_WIDTH - GUTTER;
      const left = Math.min(Math.max(GUTTER, rect.left), Math.max(GUTTER, maxLeft));
      setPanelStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left,
        width: PANEL_WIDTH,
        maxWidth: `calc(100vw - ${GUTTER * 2}px)`,
        zIndex: 60,
      });
    };

    updatePosition();

    const onClickAway = (e) => {
      const inTrigger = triggerRef.current?.contains(e.target);
      const inPanel = panelRef.current?.contains(e.target);
      if (!inTrigger && !inPanel) setIsOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("resize", updatePosition);
    // Capture-phase scroll listener so we react to any scroll container.
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onKey);

    // Defer focus until the portaled panel is in the DOM.
    const id = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onKey);
      window.cancelAnimationFrame(id);
    };
  }, [isOpen]);

  const handleSelect = (country) => {
    onChange?.(country);
    setIsOpen(false);
    setQuery("");
  };

  const panel = isOpen && panelStyle && (
    <div
      ref={panelRef}
      role="listbox"
      style={panelStyle}
      className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
    >
      <div className="p-2 border-b border-gray-100 bg-gray-50">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country or code"
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <ul className="max-h-72 overflow-y-auto py-1">
        {filtered.length === 0 ? (
          <li className="px-3 py-4 text-center text-xs text-gray-400 italic">
            No matches
          </li>
        ) : (
          filtered.map((c) => {
            const selected = value?.code === c.code;
            return (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => handleSelect(c)}
                  role="option"
                  aria-selected={selected}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                    selected ? "bg-orange-50" : ""
                  }`}
                >
                  <span className="text-lg leading-none" aria-hidden="true">
                    {c.flag}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-secondary truncate">
                      {c.name}
                    </span>
                  </span>
                  <span className="text-xs font-bold text-gray-500 tabular-nums">
                    {c.dial}
                  </span>
                  {selected && (
                    <Check size={14} className="text-primary shrink-0" />
                  )}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-secondary font-bold hover:bg-gray-100 transition-colors select-none"
      >
        <span className="text-lg leading-none" aria-hidden="true">
          {value?.flag || "🌐"}
        </span>
        <span className="text-sm tracking-tight">{value?.dial || "+91"}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {panel && createPortal(panel, document.body)}
    </div>
  );
};

export default CountryCodePicker;
