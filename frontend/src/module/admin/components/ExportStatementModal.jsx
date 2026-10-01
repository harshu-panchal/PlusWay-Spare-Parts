import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CalendarRange, Download, Loader2, X } from "lucide-react";
import { API_ENDPOINTS } from "../../../config/api";
import { RANGE_OPTIONS } from "../../../utils/dateRanges";

const CUSTOM = "custom";

// Local calendar date as "YYYY-MM-DD" (for <input type="date">)
const toDateInput = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const formatDay = (date) =>
    new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/**
 * Asks for a period, then downloads the wallet statement (paid orders by
 * payment date) for it as an Excel file.
 */
const ExportStatementModal = ({ onClose }) => {
    const today = new Date();
    const [choice, setChoice] = useState("this_month");
    const [from, setFrom] = useState(toDateInput(new Date(today.getFullYear(), today.getMonth(), 1)));
    const [to, setTo] = useState(toDateInput(today));
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");

    const customInvalid = choice === CUSTOM && (!from || !to || from > to);

    const download = async () => {
        if (busy || customInvalid) return;
        setBusy(true);
        setMessage("");
        try {
            const params = { all: 1, ...(choice === CUSTOM ? { from, to } : { range: choice }) };
            const { data } = await axios.get(API_ENDPOINTS.ADMIN_WALLET_TRANSACTIONS, {
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
                params,
            });
            const transactions = data.transactions || [];
            if (transactions.length === 0) {
                setMessage("No transactions in this period. Try a different range.");
                return;
            }

            // Period shown in the sheet and file name. API end is exclusive.
            const periodLabel = data.period
                ? `${formatDay(data.period.start)} – ${formatDay(new Date(new Date(data.period.end).getTime() - 1))}`
                : "All time";
            const fileSuffix =
                choice === CUSTOM
                    ? `${from}_to_${to}`
                    : data.period
                      ? `${toDateInput(new Date(data.period.start))}_to_${toDateInput(new Date(new Date(data.period.end).getTime() - 1))}`
                      : "all_time";

            const header = ["Transaction ID", "Date", "Time", "Type", "Amount (₹)", "Customer", "Method", "Status"];
            const rows = transactions.map((t) => [
                t.id,
                new Date(t.date).toLocaleDateString("en-IN"),
                new Date(t.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
                t.type,
                t.amount,
                t.customer,
                String(t.method || "").toUpperCase(),
                t.status,
            ]);
            const sheet = XLSX.utils.aoa_to_sheet([
                ["Plusway — Wallet statement"],
                [`Period: ${periodLabel}`],
                [`Generated: ${new Date().toLocaleString("en-IN")}`],
                [],
                header,
                ...rows,
                [],
                ["Total", `${transactions.length} transaction${transactions.length === 1 ? "" : "s"}`, "", "", data.totalAmount],
            ]);
            sheet["!cols"] = [{ wch: 26 }, { wch: 14 }, { wch: 10 }, { wch: 8 }, { wch: 14 }, { wch: 26 }, { wch: 12 }, { wch: 12 }];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, sheet, "Statement");
            const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            saveAs(
                new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
                `Wallet_Statement_${fileSuffix}.xlsx`,
            );
            if (data.truncated) {
                setMessage(`Downloaded the latest ${transactions.length.toLocaleString()} of ${data.total.toLocaleString()} transactions. Choose a shorter period for the rest.`);
                return;
            }
            onClose();
        } catch (err) {
            setMessage(err.response?.data?.message || "Couldn't export the statement. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    const chipClass = (active) =>
        `px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${active ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="export-statement-title">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
                    <div>
                        <h2 id="export-statement-title" className="text-lg font-bold text-gray-900">Export statement</h2>
                        <p className="text-xs text-gray-500 mt-1">Choose the period to download. Transactions are included by payment date.</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 -m-2 rounded-lg text-gray-400 hover:bg-gray-100" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div className="flex flex-wrap gap-2">
                        {RANGE_OPTIONS.map((option) => (
                            <button key={option.key} type="button" onClick={() => setChoice(option.key)} className={chipClass(choice === option.key)}>
                                {option.label}
                            </button>
                        ))}
                        <button type="button" onClick={() => setChoice(CUSTOM)} className={`${chipClass(choice === CUSTOM)} flex items-center gap-1.5`}>
                            <CalendarRange size={15} /> Custom range
                        </button>
                    </div>

                    {choice === CUSTOM && (
                        <div className="grid grid-cols-2 gap-3">
                            <label className="space-y-1.5">
                                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">From</span>
                                <input
                                    type="date"
                                    value={from}
                                    max={to || undefined}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                                />
                            </label>
                            <label className="space-y-1.5">
                                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">To</span>
                                <input
                                    type="date"
                                    value={to}
                                    min={from || undefined}
                                    max={toDateInput(today)}
                                    onChange={(e) => setTo(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                                />
                            </label>
                            {customInvalid && (
                                <p className="col-span-2 text-xs font-semibold text-rose-600">Pick a start date on or before the end date.</p>
                            )}
                        </div>
                    )}

                    {message && <p className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">{message}</p>}
                </div>

                <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={download}
                        disabled={busy || customInvalid}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
                        {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportStatementModal;
