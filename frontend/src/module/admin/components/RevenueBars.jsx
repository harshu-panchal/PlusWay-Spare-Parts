import React, { useState } from "react";
import { formatInr } from "../../../utils/formatInr";

const ordersText = (orders = 0) => `${orders} paid order${orders === 1 ? "" : "s"}`;

/**
 * Single-series revenue column chart: one bar per period, the peak period
 * direct-labelled, hover/focus tooltip with revenue + paid order count, and
 * a screen-reader table. The parent supplies the card and heading.
 *
 * points: [{ key, label, revenue, orders }] in time order
 * labelEvery: show every Nth axis label (always ending on the last point)
 * showOrdersOnAxis: print the order count under each axis label
 */
const RevenueBars = ({
    points = [],
    labelEvery = 1,
    showOrdersOnAxis = false,
    emptyText = "No paid orders in this period",
    tableCaption = "Revenue by period",
    heightClass = "h-48",
}) => {
    const [activeIdx, setActiveIdx] = useState(null);
    const maxRevenue = Math.max(0, ...points.map((p) => p.revenue));
    const peakIdx = maxRevenue > 0 ? points.findIndex((p) => p.revenue === maxRevenue) : -1;
    const lastIdx = points.length - 1;
    const active = activeIdx !== null ? points[activeIdx] : null;

    return (
        // `relative` anchors the sr-only table below; without a positioned
        // ancestor it is placed against the viewport and makes the whole
        // admin layout scrollable.
        <div className="relative">
            <div className={`relative ${heightClass} mt-6`} onMouseLeave={() => setActiveIdx(null)}>
                {/* Recessive scale reference at the peak (its value is the peak's direct label) */}
                {maxRevenue > 0 && (
                    <div className="absolute inset-x-0 top-0 border-t border-dashed border-gray-100 pointer-events-none" />
                )}

                {maxRevenue === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                        {emptyText}
                    </div>
                )}

                <div className="absolute inset-0 flex items-end gap-0.5 border-b border-gray-200">
                    {points.map((point, idx) => {
                        const heightPct = maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0;
                        const isActive = idx === activeIdx;
                        return (
                            <div
                                key={point.key}
                                tabIndex={0}
                                role="img"
                                aria-label={`${point.label}: ${formatInr(point.revenue)} from ${ordersText(point.orders)}`}
                                onMouseEnter={() => setActiveIdx(idx)}
                                onFocus={() => setActiveIdx(idx)}
                                onBlur={() => setActiveIdx(null)}
                                className={`relative flex-1 h-full flex items-end justify-center rounded-t outline-none cursor-default ${isActive ? "bg-gray-50" : ""} focus-visible:ring-2 focus-visible:ring-blue-300`}
                            >
                                {point.revenue > 0 && (
                                    <div
                                        className={`w-full max-w-[24px] rounded-t transition-colors ${isActive ? "bg-blue-700" : "bg-blue-600"}`}
                                        style={{ height: `${heightPct}%`, minHeight: 2 }}
                                    />
                                )}
                                {/* Direct label on the peak only */}
                                {idx === peakIdx && !isActive && (
                                    <span
                                        className="absolute text-[10px] font-bold text-gray-700 whitespace-nowrap pointer-events-none"
                                        style={{ bottom: `calc(${heightPct}% + 4px)` }}
                                    >
                                        {formatInr(point.revenue)}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Tooltip */}
                {active && (
                    <div
                        className="absolute -top-2 z-10 -translate-y-full bg-gray-900 text-white rounded-lg px-3 py-2 shadow-lg pointer-events-none whitespace-nowrap"
                        style={
                            activeIdx < points.length / 2
                                ? { left: `${(activeIdx / points.length) * 100}%` }
                                : { right: `${((lastIdx - activeIdx) / points.length) * 100}%` }
                        }
                    >
                        <p className="text-sm font-bold">{formatInr(active.revenue)}</p>
                        <p className="text-[10px] text-gray-300">
                            {active.label} · {ordersText(active.orders)}
                        </p>
                    </div>
                )}
            </div>

            {/* X axis */}
            <div className="flex gap-0.5 mt-2">
                {points.map((point, idx) => {
                    const showLabel = (lastIdx - idx) % labelEvery === 0;
                    return (
                        <div key={point.key} className="flex-1 text-center whitespace-nowrap">
                            <span className="block text-[10px] font-semibold text-gray-400">
                                {showLabel ? point.label : ""}
                            </span>
                            {showOrdersOnAxis && (
                                <span className="block text-[10px] text-gray-400">
                                    {point.orders || 0} order{point.orders === 1 ? "" : "s"}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Table view for screen readers */}
            <table className="sr-only">
                <caption>{tableCaption}</caption>
                <thead>
                    <tr><th>Period</th><th>Revenue</th><th>Paid orders</th></tr>
                </thead>
                <tbody>
                    {points.map((point) => (
                        <tr key={point.key}>
                            <td>{point.label}</td>
                            <td>{formatInr(point.revenue)}</td>
                            <td>{point.orders || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RevenueBars;
