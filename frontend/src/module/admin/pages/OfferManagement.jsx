import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Search,
    Loader2,
    Tag,
    Image as ImageIcon,
    ExternalLink,
    Percent,
    Layers,
    CalendarClock,
    Home,
    Eye,
} from "lucide-react";
import { API_ENDPOINTS } from "../../../config/api";
import ImageUpload from "../../../components/ImageUpload";

const MIN_PERCENT = 1;
const MAX_PERCENT = 90;
const SEARCH_PAGE_SIZE = 12;

const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
});

// Date <-> <input type="datetime-local"> value, in the browser's time zone
const toLocalInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (value) => (value ? new Date(value).toISOString() : null);

const formatDateTime = (date) =>
    date ? new Date(date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—";

const formatInr = (value) => `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

const dealPriceFor = (price, percent) => Math.max(0, Math.round((Number(price) || 0) * (1 - percent / 100)));

// Live / Scheduled / Ended / Off, from the offer's switch and dates
const getOfferStatus = (offer, now = Date.now()) => {
    if (!offer.isActive) return { label: "Off", className: "bg-gray-100 text-gray-500" };
    if (offer.startDate && new Date(offer.startDate).getTime() > now)
        return { label: "Scheduled", className: "bg-amber-50 text-amber-700" };
    if (offer.endDate && new Date(offer.endDate).getTime() <= now)
        return { label: "Ended", className: "bg-rose-50 text-rose-600" };
    return { label: "Live", className: "bg-emerald-50 text-emerald-700" };
};

const emptyForm = () => ({
    _id: null,
    title: "",
    subtitle: "",
    description: "",
    badgeText: "",
    bannerImage: "",
    accentColor: "#ff6b00",
    discountMode: "uniform",
    discountPercent: 10,
    products: [], // [{ product: {_id, name, code, price, images}, discountPercent }]
    startDate: toLocalInput(new Date()),
    endDate: "",
    isActive: true,
    showOnHome: false,
    sortOrder: 0,
});

const Toggle = ({ checked, onChange, label, description, icon: Icon }) => (
    <label className="flex items-start justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer">
        <span className="flex items-start gap-3">
            {Icon && <Icon size={18} className="text-gray-400 mt-0.5" />}
            <span>
                <span className="block text-sm font-bold text-gray-900">{label}</span>
                {description && <span className="block text-xs text-gray-500 mt-0.5">{description}</span>}
            </span>
        </span>
        <span className="relative inline-flex items-center shrink-0">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <span className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-colors" />
            <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
        </span>
    </label>
);

const Field = ({ label, hint, children }) => (
    <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
        {children}
        {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
);

const inputClass =
    "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors";

// ─── Product picker: server-side search across the whole catalog ───────────
const ProductPicker = ({ selectedIds, onAdd }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState({ query: null, products: [], total: 0, page: 1 });
    const [loadingMore, setLoadingMore] = useState(false);
    const searching = results.query !== query.trim();

    useEffect(() => {
        const q = query.trim();
        const timer = setTimeout(async () => {
            try {
                const { data } = await axios.get(API_ENDPOINTS.ADMIN_PRODUCTS, {
                    ...authConfig(),
                    params: { search: q, pageSize: SEARCH_PAGE_SIZE, pageNumber: 1 },
                });
                setResults({ query: q, products: data.products || [], total: data.total || 0, page: 1 });
            } catch {
                setResults({ query: q, products: [], total: 0, page: 1 });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const hasMore = !searching && results.products.length < results.total;

    const loadMore = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const nextPage = results.page + 1;
        try {
            const { data } = await axios.get(API_ENDPOINTS.ADMIN_PRODUCTS, {
                ...authConfig(),
                params: { search: results.query, pageSize: SEARCH_PAGE_SIZE, pageNumber: nextPage },
            });
            setResults((prev) => {
                if (prev.query !== results.query) return prev;
                const seen = new Set(prev.products.map((p) => p._id));
                const fresh = (data.products || []).filter((p) => !seen.has(p._id));
                return { ...prev, products: [...prev.products, ...fresh], total: data.total ?? prev.total, page: nextPage };
            });
        } catch {
            /* keep what we have; scrolling again retries */
        } finally {
            setLoadingMore(false);
        }
    };

    const handleScroll = (e) => {
        const el = e.currentTarget;
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) loadMore();
    };

    return (
        <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="relative border-b border-gray-100 bg-white">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products by name, SKU or ID…"
                    className="w-full pl-9 pr-9 py-3 text-sm focus:outline-none"
                />
                {searching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />}
            </div>
            <div onScroll={handleScroll} className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {results.products.length === 0 && !searching ? (
                    <p className="p-4 text-center text-xs text-gray-400">No products match.</p>
                ) : (
                    results.products.map((product) => {
                        const added = selectedIds.has(product._id);
                        return (
                            <div key={product._id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
                                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                    {product.images?.[0] && (
                                        <img src={product.images[0]} alt="" className="w-full h-full object-contain" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                                    <p className="text-[11px] text-gray-400">
                                        {product.code || "No SKU"} · {formatInr(product.price)} · {product.countInStock ?? 0} in stock
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    disabled={added}
                                    onClick={() => onAdd(product)}
                                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${added ? "bg-gray-100 text-gray-400 cursor-default" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>
                                    {added ? "Added" : "Add"}
                                </button>
                            </div>
                        );
                    })
                )}
                {loadingMore && (
                    <div className="flex justify-center py-3">
                        <Loader2 size={16} className="animate-spin text-gray-400" />
                    </div>
                )}
            </div>
            {results.total > 0 && (
                <p className="px-3 py-2 text-[11px] text-gray-400 bg-gray-50 border-t border-gray-100">
                    Showing {results.products.length} of {results.total.toLocaleString()}
                    {hasMore && " — scroll down to load more."}
                </p>
            )}
        </div>
    );
};

// ─── Offer editor (create / edit) ──────────────────────────────────────────
const OfferEditor = ({ initial, onClose, onSaved }) => {
    const [form, setForm] = useState(initial);
    const [bulkPercent, setBulkPercent] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
    const selectedIds = useMemo(() => new Set(form.products.map((p) => p.product._id)), [form.products]);
    const isUniform = form.discountMode === "uniform";

    const percentFor = (item) => (isUniform ? Number(form.discountPercent) || 0 : Number(item.discountPercent) || 0);

    const addProduct = (product) =>
        setForm((f) => ({
            ...f,
            products: [
                ...f.products,
                {
                    product,
                    // Start a new product at the offer-wide % so per-product mode has a sensible default
                    discountPercent: Number(bulkPercent) || Number(f.discountPercent) || 10,
                },
            ],
        }));

    const updateProductPercent = (id, value) =>
        setForm((f) => ({
            ...f,
            products: f.products.map((p) => (p.product._id === id ? { ...p, discountPercent: value } : p)),
        }));

    const removeProduct = (id) =>
        setForm((f) => ({ ...f, products: f.products.filter((p) => p.product._id !== id) }));

    const applyBulkPercent = () => {
        const value = Number(bulkPercent);
        if (!(value >= MIN_PERCENT && value <= MAX_PERCENT)) return;
        setForm((f) => ({ ...f, products: f.products.map((p) => ({ ...p, discountPercent: value })) }));
    };

    const validate = () => {
        if (!form.title.trim()) return "Give the offer a title";
        const pct = Number(form.discountPercent);
        if (isUniform && !(pct >= MIN_PERCENT && pct <= MAX_PERCENT))
            return `Discount must be between ${MIN_PERCENT}% and ${MAX_PERCENT}%`;
        if (!isUniform) {
            const bad = form.products.find((p) => {
                const v = Number(p.discountPercent);
                return !(v >= MIN_PERCENT && v <= MAX_PERCENT);
            });
            if (bad) return `Set a discount between ${MIN_PERCENT}% and ${MAX_PERCENT}% for "${bad.product.name}"`;
        }
        if (form.products.length === 0) return "Add at least one product";
        if (form.endDate && form.startDate && new Date(form.endDate) <= new Date(form.startDate))
            return "End date must be after the start date";
        return "";
    };

    const handleSave = async () => {
        const problem = validate();
        if (problem) {
            setError(problem);
            return;
        }
        setSaving(true);
        setError("");
        const payload = {
            title: form.title,
            subtitle: form.subtitle,
            description: form.description,
            badgeText: form.badgeText,
            bannerImage: form.bannerImage,
            accentColor: form.accentColor,
            discountMode: form.discountMode,
            discountPercent: Number(form.discountPercent) || 0,
            products: form.products.map((p) => ({
                product: p.product._id,
                discountPercent: Number(p.discountPercent) || 0,
            })),
            startDate: fromLocalInput(form.startDate),
            endDate: fromLocalInput(form.endDate),
            isActive: form.isActive,
            showOnHome: form.showOnHome,
            sortOrder: Number(form.sortOrder) || 0,
        };
        try {
            if (form._id) {
                await axios.put(API_ENDPOINTS.ADMIN_OFFER_DETAIL(form._id), payload, authConfig());
            } else {
                await axios.post(API_ENDPOINTS.ADMIN_OFFERS, payload, authConfig());
            }
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save the offer");
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-stretch md:items-center justify-center md:p-6">
            <div className="bg-white w-full max-w-5xl md:rounded-2xl flex flex-col max-h-full md:max-h-[92vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{form._id ? "Edit offer" : "New offer"}</h2>
                        <p className="text-xs text-gray-500">Discounts apply automatically on the store while the offer is live.</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Details */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Tag size={16} /> Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Title *">
                                <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Diwali Battery Sale" />
                            </Field>
                            <Field label="Badge text" hint='Shown on cards. Leave empty for an automatic "Up to N% off".'>
                                <input className={inputClass} value={form.badgeText} onChange={(e) => set("badgeText", e.target.value)} placeholder="e.g. Flat 20% off" />
                            </Field>
                            <Field label="Subtitle">
                                <input className={inputClass} value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="One line under the title" />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Accent colour" hint="Used when there's no cover image.">
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={form.accentColor} onChange={(e) => set("accentColor", e.target.value)} className="h-10 w-14 rounded-lg border border-gray-200 bg-white p-1" />
                                        <span className="text-xs font-mono text-gray-500">{form.accentColor}</span>
                                    </div>
                                </Field>
                                <Field label="Display order" hint="Lower shows first.">
                                    <input type="number" className={inputClass} value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} />
                                </Field>
                            </div>
                            <Field label="Description">
                                <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional details shown on the offer page" />
                            </Field>
                            <Field label="Cover image" hint="Wide image (about 16:9) for the offer card and page header.">
                                <ImageUpload value={form.bannerImage} onChange={(url) => set("bannerImage", url)} placeholder="Upload cover image" />
                            </Field>
                        </div>
                    </section>

                    {/* Schedule & visibility */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><CalendarClock size={16} /> Schedule &amp; visibility</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Starts">
                                <input type="datetime-local" className={inputClass} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
                            </Field>
                            <Field label="Ends" hint="Leave empty to run until you switch it off.">
                                <div className="flex gap-2">
                                    <input type="datetime-local" className={inputClass} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
                                    {form.endDate && (
                                        <button type="button" onClick={() => set("endDate", "")} className="px-3 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200">
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </Field>
                            <Toggle checked={form.isActive} onChange={(v) => set("isActive", v)} icon={Eye} label="Offer is on" description="Turn off to hide the offer and stop its discounts immediately." />
                            <Toggle checked={form.showOnHome} onChange={(v) => set("showOnHome", v)} icon={Home} label="Show on home page" description="Adds a deals strip for this offer to the home page." />
                        </div>
                    </section>

                    {/* Discount */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Percent size={16} /> Discount</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                { key: "uniform", title: "Same % for all products", text: "One discount applies to every product in this offer.", icon: Percent },
                                { key: "perProduct", title: "Different % per product", text: "Set the discount for each product individually.", icon: Layers },
                            ].map((mode) => (
                                <button
                                    key={mode.key}
                                    type="button"
                                    onClick={() => set("discountMode", mode.key)}
                                    className={`text-left p-4 rounded-xl border-2 transition-colors ${form.discountMode === mode.key ? "border-blue-600 bg-blue-50/50" : "border-gray-100 hover:border-gray-200"}`}>
                                    <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                        <mode.icon size={16} className={form.discountMode === mode.key ? "text-blue-600" : "text-gray-400"} />
                                        {mode.title}
                                    </span>
                                    <span className="block text-xs text-gray-500 mt-1">{mode.text}</span>
                                </button>
                            ))}
                        </div>
                        {isUniform ? (
                            <div className="max-w-xs">
                                <Field label="Discount for all products" hint={`Between ${MIN_PERCENT}% and ${MAX_PERCENT}% off the selling price.`}>
                                    <div className="relative">
                                        <input type="number" min={MIN_PERCENT} max={MAX_PERCENT} className={`${inputClass} pr-8`} value={form.discountPercent} onChange={(e) => set("discountPercent", e.target.value)} />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">%</span>
                                    </div>
                                </Field>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-end gap-2">
                                <Field label="Set all products to">
                                    <div className="relative w-32">
                                        <input type="number" min={MIN_PERCENT} max={MAX_PERCENT} className={`${inputClass} pr-8`} value={bulkPercent} onChange={(e) => setBulkPercent(e.target.value)} placeholder="e.g. 15" />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">%</span>
                                    </div>
                                </Field>
                                <button type="button" onClick={applyBulkPercent} className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-900 text-white hover:bg-gray-800">
                                    Apply to all
                                </button>
                                <p className="text-[11px] text-gray-400 w-full">Then fine-tune any product below.</p>
                            </div>
                        )}
                    </section>

                    {/* Products */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Layers size={16} /> Products <span className="text-gray-400 font-medium">({form.products.length})</span>
                        </h3>
                        <ProductPicker selectedIds={selectedIds} onAdd={addProduct} />

                        {form.products.length > 0 && (
                            <div className="rounded-2xl border border-gray-100 overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3">Product</th>
                                            <th className="px-4 py-3 text-right">Price</th>
                                            <th className="px-4 py-3 text-center">Discount</th>
                                            <th className="px-4 py-3 text-right">Deal price</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {form.products.map((item) => {
                                            const pct = percentFor(item);
                                            return (
                                                <tr key={item.product._id}>
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-3 min-w-[220px]">
                                                            <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                                                {item.product.images?.[0] && <img src={item.product.images[0]} alt="" className="w-full h-full object-contain" />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-gray-900 truncate max-w-[280px]">{item.product.name}</p>
                                                                <p className="text-[11px] text-gray-400">
                                                                    {item.product.code || "No SKU"}
                                                                    {item.product.status === "Draft" && <span className="ml-2 text-amber-600 font-bold">Draft — hidden on store</span>}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right text-gray-500 whitespace-nowrap">{formatInr(item.product.price)}</td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        {isUniform ? (
                                                            <span className="font-bold text-gray-700">{pct}%</span>
                                                        ) : (
                                                            <div className="relative inline-block w-20">
                                                                <input
                                                                    type="number"
                                                                    min={MIN_PERCENT}
                                                                    max={MAX_PERCENT}
                                                                    value={item.discountPercent}
                                                                    onChange={(e) => updateProductPercent(item.product._id, e.target.value)}
                                                                    className="w-full pl-2 pr-6 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-blue-500"
                                                                />
                                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right font-bold text-emerald-700 whitespace-nowrap">
                                                        {pct >= MIN_PERCENT && pct <= MAX_PERCENT ? formatInr(dealPriceFor(item.product.price, pct)) : "—"}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right">
                                                        <button type="button" onClick={() => removeProduct(item.product._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50" aria-label={`Remove ${item.product.name}`}>
                                                            <X size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
                    <p className="text-sm font-semibold text-rose-600 min-h-[1.25rem]">{error}</p>
                    <div className="flex gap-2 ml-auto">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100">
                            Cancel
                        </button>
                        <button type="button" onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
                            {saving && <Loader2 size={16} className="animate-spin" />}
                            {form._id ? "Save changes" : "Create offer"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Offer page banners (Banner type "offer") ──────────────────────────────
const OfferBanners = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ image: "", link: "", isActive: true });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        try {
            const { data } = await axios.get(API_ENDPOINTS.ADMIN_BANNERS, authConfig());
            setBanners((Array.isArray(data) ? data : []).filter((b) => b.type === "offer"));
        } catch {
            setError("Couldn't load banners");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const addBanner = async (e) => {
        e.preventDefault();
        if (!form.image) {
            setError("Upload a banner image first");
            return;
        }
        setSaving(true);
        setError("");
        try {
            await axios.post(API_ENDPOINTS.ADMIN_BANNERS, { ...form, type: "offer" }, authConfig());
            setForm({ image: "", link: "", isActive: true });
            await load();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add banner");
        } finally {
            setSaving(false);
        }
    };

    const toggleBanner = async (banner) => {
        await axios.put(API_ENDPOINTS.ADMIN_BANNER_DETAIL(banner._id), { isActive: !banner.isActive }, authConfig());
        load();
    };

    const deleteBanner = async (banner) => {
        if (!window.confirm("Delete this banner?")) return;
        await axios.delete(API_ENDPOINTS.ADMIN_BANNER_DETAIL(banner._id), authConfig());
        load();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={addBanner} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 h-fit">
                <div>
                    <h3 className="text-sm font-bold text-gray-900">Add offer page banner</h3>
                    <p className="text-xs text-gray-500 mt-1">Shown as a sliding carousel at the top of the customer Offers page. Wide images (about 4:1) work best.</p>
                </div>
                <ImageUpload value={form.image} onChange={(url) => setForm((f) => ({ ...f, image: url }))} placeholder="Upload banner image" />
                <Field label="Link (optional)" hint="e.g. /offers/diwali-sale or a full https:// URL">
                    <input className={inputClass} value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="/offers/your-offer" />
                </Field>
                {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
                <button type="submit" disabled={saving} className="w-full py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add banner
                </button>
            </form>

            <div className="lg:col-span-2 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-600" size={28} /></div>
                ) : banners.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-400">
                        No offer page banners yet.
                    </div>
                ) : (
                    banners.map((banner) => (
                        <div key={banner._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row">
                            <div className="sm:w-72 aspect-[4/1] sm:aspect-auto bg-gray-100 shrink-0">
                                <img src={banner.image} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 p-4 flex flex-wrap items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${banner.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                                        {banner.isActive ? "Showing" : "Hidden"}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
                                        <ExternalLink size={12} /> {banner.link || "No link"}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => toggleBanner(banner)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200">
                                        {banner.isActive ? "Hide" : "Show"}
                                    </button>
                                    <button type="button" onClick={() => deleteBanner(banner)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50" aria-label="Delete banner">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// ─── Page ──────────────────────────────────────────────────────────────────
const OfferManagement = () => {
    const [tab, setTab] = useState("offers");
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editor, setEditor] = useState(null); // form state when open
    const [opening, setOpening] = useState(null); // id of the offer being loaded for edit

    const loadOffers = useCallback(async () => {
        try {
            const { data } = await axios.get(API_ENDPOINTS.ADMIN_OFFERS, authConfig());
            setOffers(Array.isArray(data) ? data : []);
            setError("");
        } catch {
            setError("Couldn't load offers");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOffers();
    }, [loadOffers]);

    const openEditor = async (offer) => {
        if (!offer) {
            setEditor(emptyForm());
            return;
        }
        setOpening(offer._id);
        try {
            const { data } = await axios.get(API_ENDPOINTS.ADMIN_OFFER_DETAIL(offer._id), authConfig());
            setEditor({
                ...emptyForm(),
                ...data,
                startDate: toLocalInput(data.startDate),
                endDate: toLocalInput(data.endDate),
                products: (data.products || []).filter((p) => p.product),
            });
        } catch {
            setError("Couldn't open that offer");
        } finally {
            setOpening(null);
        }
    };

    const toggleActive = async (offer) => {
        await axios.put(API_ENDPOINTS.ADMIN_OFFER_DETAIL(offer._id), { isActive: !offer.isActive }, authConfig());
        loadOffers();
    };

    const deleteOffer = async (offer) => {
        if (!window.confirm(`Delete "${offer.title}"? Its discounts stop immediately.`)) return;
        await axios.delete(API_ENDPOINTS.ADMIN_OFFER_DETAIL(offer._id), authConfig());
        loadOffers();
    };

    const discountSummary = (offer) =>
        offer.discountMode === "uniform" ? `${offer.discountPercent}% on all` : "Per-product %";

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Offers &amp; Deals</h1>
                    <p className="text-gray-500 text-sm mt-1">Create time-limited discounts on selected products and manage the Offers page.</p>
                </div>
                <div className="flex items-center gap-3">
                    <a href="/offers" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 shadow-sm hover:border-gray-300">
                        <ExternalLink size={16} /> View on store
                    </a>
                    {tab === "offers" && (
                        <button type="button" onClick={() => openEditor(null)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700">
                            <Plus size={16} /> New offer
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200">
                {[
                    { key: "offers", label: "Offers", icon: Tag },
                    { key: "banners", label: "Offer Page Banners", icon: ImageIcon },
                ].map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => setTab(t.key)}
                        className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${tab === t.key ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
                        <t.icon size={16} /> {t.label}
                        {tab === t.key && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
                    </button>
                ))}
            </div>

            {tab === "banners" ? (
                <OfferBanners />
            ) : loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
            ) : error ? (
                <p className="text-center text-rose-600 font-semibold py-10">{error}</p>
            ) : offers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4"><Tag size={26} /></div>
                    <h3 className="text-lg font-bold text-gray-900">No offers yet</h3>
                    <p className="text-sm text-gray-500 mt-1">Create your first offer to show deals on the store.</p>
                    <button type="button" onClick={() => openEditor(null)} className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
                        <Plus size={16} /> New offer
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-4">Offer</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Discount</th>
                                <th className="px-6 py-4">Products</th>
                                <th className="px-6 py-4">Runs</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {offers.map((offer) => {
                                const status = getOfferStatus(offer);
                                return (
                                    <tr key={offer._id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 min-w-[240px]">
                                                <div
                                                    className="w-16 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100"
                                                    style={offer.bannerImage ? undefined : { background: offer.accentColor || "#ff6b00" }}>
                                                    {offer.bannerImage && <img src={offer.bannerImage} alt="" className="w-full h-full object-cover" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{offer.title}</p>
                                                    <p className="text-[11px] text-gray-400 truncate">
                                                        /offers/{offer.slug}
                                                        {offer.showOnHome && <span className="ml-2 text-blue-600 font-bold">· On home page</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${status.className}`}>{status.label}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">{discountSummary(offer)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{offer.productCount}</td>
                                        <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                                            <div>{formatDateTime(offer.startDate)}</div>
                                            <div className="text-gray-400">to {offer.endDate ? formatDateTime(offer.endDate) : "no end date"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button type="button" onClick={() => toggleActive(offer)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap">
                                                    {offer.isActive ? "Turn off" : "Turn on"}
                                                </button>
                                                <button type="button" onClick={() => openEditor(offer)} disabled={opening === offer._id} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50" aria-label={`Edit ${offer.title}`}>
                                                    {opening === offer._id ? <Loader2 size={16} className="animate-spin" /> : <Pencil size={16} />}
                                                </button>
                                                <button type="button" onClick={() => deleteOffer(offer)} className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50" aria-label={`Delete ${offer.title}`}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {editor && (
                <OfferEditor
                    initial={editor}
                    onClose={() => setEditor(null)}
                    onSaved={() => {
                        setEditor(null);
                        loadOffers();
                    }}
                />
            )}
        </div>
    );
};

export default OfferManagement;
