import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import RevenueBars from "../components/RevenueBars";
import { formatInr } from "../../../utils/formatInr";
import Pagination from "../components/Pagination";
import ExportStatementModal from "../components/ExportStatementModal";

const TX_PAGE_SIZES = [10, 25, 50];

const adminConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
});
import {
    Wallet as WalletIcon,
    TrendingUp,
    Clock,
    ArrowDownRight,
    Download,
    Filter,
    DollarSign,
    CreditCard,
    History,
    CheckCircle2,
    AlertCircle,
    Plus,
} from "lucide-react";

// "YYYY-MM-DD" -> "Sep 23". Parsed as a local date so it never shifts a day
// (new Date("2026-09-23") is UTC midnight and can render as Sep 22).
const formatTrendDay = (isoDay) => {
    const [y, m, d] = isoDay.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString([], { month: "short", day: "numeric" });
};

const RevenueTrendChart = ({ trend = [] }) => {
    const totalRevenue = trend.reduce((sum, d) => sum + d.revenue, 0);
    const points = trend.map((day) => ({
        key: day._id,
        label: formatTrendDay(day._id),
        revenue: day.revenue,
        orders: day.orders,
    }));

    return (
        <div className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Revenue Trend</h3>
                    <p className="text-xs text-gray-500 mt-1">Paid order revenue per day, last 14 days (IST).</p>
                </div>
                <div className="sm:text-right">
                    <p className="text-xl font-bold text-gray-900">{formatInr(totalRevenue)}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">14-day total</p>
                </div>
            </div>
            <RevenueBars
                points={points}
                labelEvery={2}
                emptyText="No paid orders in the last 14 days"
                tableCaption="Daily paid order revenue, last 14 days"
            />
        </div>
    );
};

const Wallet = () => {
    const [data, setData] = useState({
        summary: {
            totalEarnings: 0,
            pendingPayments: 0,
            todayEarnings: 0,
            balance: 0,
        },
        revenueTrend: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Transaction history, one page at a time. `tx.key` says which page the
    // loaded rows belong to; it's loading while that differs from the request.
    const [txPage, setTxPage] = useState(1);
    const [txPageSize, setTxPageSize] = useState(TX_PAGE_SIZES[0]);
    const [tx, setTx] = useState({ key: null, transactions: [], page: 1, pages: 1, total: 0, error: "" });
    const [showExport, setShowExport] = useState(false);
    const txKey = `${txPage}-${txPageSize}`;
    const txLoading = tx.key !== txKey;

    useEffect(() => {
        let cancelled = false;
        axios
            .get(API_ENDPOINTS.ADMIN_WALLET_TRANSACTIONS, {
                ...adminConfig(),
                params: { page: txPage, pageSize: txPageSize },
            })
            .then(({ data }) => !cancelled && setTx({ key: txKey, ...data, error: "" }))
            .catch(() => !cancelled && setTx((prev) => ({ ...prev, key: txKey, error: "Failed to load transactions" })));
        return () => {
            cancelled = true;
        };
    }, [txPage, txPageSize, txKey]);

    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                const token = localStorage.getItem("adminToken");
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                const { data } = await axios.get(
                    API_ENDPOINTS.ADMIN_WALLET_STATS,
                    config
                );

                setData(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch wallet information");
                setLoading(false);
            }
        };

        fetchWalletData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
                <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                <h3 className="text-lg font-bold text-red-900">{error}</h3>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                >
                    RETRY
                </button>
            </div>
        );
    }

    const stats = [
        {
            name: "Available Balance",
            value: `₹${data.summary.balance.toLocaleString()}`,
            icon: WalletIcon,
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
            description: "Ready to withdraw or use",
        },
        {
            name: "Total Earnings",
            value: `₹${data.summary.totalEarnings.toLocaleString()}`,
            icon: TrendingUp,
            bgColor: "bg-emerald-50",
            iconColor: "text-emerald-600",
            description: "Net revenue from sales",
        },
        {
            name: "Pending Payments",
            value: `₹${data.summary.pendingPayments.toLocaleString()}`,
            icon: Clock,
            bgColor: "bg-amber-50",
            iconColor: "text-amber-600",
            description: "Orders not yet paid",
        },
        {
            name: "Today's Revenue",
            value: `₹${data.summary.todayEarnings.toLocaleString()}`,
            icon: DollarSign,
            bgColor: "bg-purple-50",
            iconColor: "text-purple-600",
            description: "Earnings in last 24h",
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-blue-600 text-white rounded-lg">
                            <WalletIcon size={20} />
                        </div>
                        Financial Wallet
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Manage your earnings, view transactions and track revenue.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowExport(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all disabled:opacity-60">
                        <Download size={18} />
                        EXPORT STATEMENT
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                        <Plus size={18} />
                        WITHDRAW FUNDS
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.iconColor}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.name}</p>
                                <h3 className="text-2xl font-black text-gray-900 mt-0.5">{stat.value}</h3>
                            </div>
                        </div>
                        <p className="mt-4 text-[11px] text-gray-400 font-medium flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            {stat.description}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <RevenueTrendChart trend={data.revenueTrend} />

                {/* Transaction History */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
                                    <History size={18} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
                                {tx.total > 0 && (
                                    <span className="text-xs font-bold text-gray-400">{tx.total.toLocaleString()} total</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                    <Filter size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Type</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction ID</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Method</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y divide-gray-50 text-sm transition-opacity ${txLoading ? "opacity-50" : ""}`}>
                                    {tx.error ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-rose-500 text-sm font-semibold">
                                                {tx.error}
                                            </td>
                                        </tr>
                                    ) : txLoading && tx.transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-400 text-sm">
                                                Loading transactions…
                                            </td>
                                        </tr>
                                    ) : tx.transactions.length > 0 ? (
                                        tx.transactions.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'SALE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        {t.type === 'SALE' ? <TrendingUp size={14} /> : <ArrowDownRight size={14} />}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-gray-900">#{t.id.substring(t.id.length - 8).toUpperCase()}</span>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-700">{t.customer}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard size={14} className="text-gray-400" />
                                                        <span className="text-xs font-bold uppercase text-gray-500">{t.method}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-black tracking-tight ${t.type === 'SALE' ? 'text-gray-900' : 'text-rose-600'}`}>
                                                        {t.type === 'SALE' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-tighter">
                                                        {t.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-400 text-sm italic">
                                                No transactions found in this period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {tx.total > 0 && (
                            <Pagination
                                page={tx.page}
                                pages={tx.pages}
                                total={tx.total}
                                pageSize={tx.pageSize || txPageSize}
                                pageSizes={TX_PAGE_SIZES}
                                disabled={txLoading}
                                onPageChange={setTxPage}
                                onPageSizeChange={(size) => {
                                    setTxPageSize(size);
                                    setTxPage(1);
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
            {showExport && <ExportStatementModal onClose={() => setShowExport(false)} />}
        </div>
    );
};

export default Wallet;
