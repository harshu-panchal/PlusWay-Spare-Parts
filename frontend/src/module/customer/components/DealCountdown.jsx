import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { formatTimeLeft } from "../../../utils/offers";

/**
 * Live "Ends in …" countdown for an offer. Renders nothing for offers
 * without an end date unless `showOpenEnded` is set.
 *
 * variant: "light" (on images/colour) or "dark" (on white)
 */
const DealCountdown = ({ endsAt, variant = "dark", showOpenEnded = false, className = "" }) => {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!endsAt) return undefined;
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [endsAt]);

    const timeLeft = formatTimeLeft(endsAt, now);
    if (timeLeft === null && !showOpenEnded) return null;

    const colors =
        variant === "light"
            ? "bg-white/15 text-white border-white/25"
            : "bg-red-50 text-red-600 border-red-100";

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider tabular-nums ${colors} ${className}`}>
            <Clock size={12} />
            {timeLeft === null ? "Limited time" : timeLeft === "" ? "Offer ended" : `Ends in ${timeLeft}`}
        </span>
    );
};

export default DealCountdown;
