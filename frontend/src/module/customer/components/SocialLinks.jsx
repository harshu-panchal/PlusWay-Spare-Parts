import React from "react";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useSettings } from "../../../contexts/SettingsContext";

const NETWORKS = [
    { field: "facebookUrl", label: "Facebook", icon: Facebook, hover: "hover:bg-[#1877F2] hover:border-[#1877F2]" },
    { field: "twitterUrl", label: "Twitter / X", icon: Twitter, hover: "hover:bg-black hover:border-black" },
    { field: "instagramUrl", label: "Instagram", icon: Instagram, hover: "hover:bg-[#E4405F] hover:border-[#E4405F]" },
    { field: "youtubeUrl", label: "YouTube", icon: Youtube, hover: "hover:bg-[#FF0000] hover:border-[#FF0000]" },
];

// Admin-entered URL -> safe absolute http(s) URL, or null.
// "facebook.com/plusway" becomes "https://facebook.com/plusway"; anything
// that isn't a web address (e.g. "javascript:…") is dropped.
const toSafeUrl = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return null;
    const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw.replace(/^\/+/, "")}`;
    try {
        const url = new URL(withProtocol);
        return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch {
        return null;
    }
};

/**
 * Social media icons from Admin → Settings → Social Media. Only networks with
 * a URL are shown; renders nothing when none are set.
 *
 * variant: "dark" (on the dark footer bar) or "light" (on white)
 */
const SocialLinks = ({ variant = "dark", className = "" }) => {
    const { settings } = useSettings();
    const links = NETWORKS.map((n) => ({ ...n, href: toSafeUrl(settings?.social?.[n.field]) })).filter((n) => n.href);
    if (links.length === 0) return null;

    const base =
        variant === "dark"
            ? "border-white/20 bg-white/10 text-white"
            : "border-gray-200 bg-white text-secondary hover:text-white";

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            {links.map((link) => {
                const Icon = link.icon;
                return (
                    <a
                        key={link.field}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Plusway on ${link.label}`}
                        title={link.label}
                        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:-translate-y-0.5 hover:text-white ${base} ${link.hover}`}>
                        <Icon size={18} />
                    </a>
                );
            })}
        </div>
    );
};

export default SocialLinks;
