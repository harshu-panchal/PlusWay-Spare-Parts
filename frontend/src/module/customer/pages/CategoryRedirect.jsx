import React, { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import LoadingFallback from "../../../components/LoadingFallback";

/**
 * Resolves the legacy `/category/:slug` URL — used by banner CTAs, external
 * links, and bookmarks — to the canonical `/products?category=<id>` route.
 *
 * Why this exists: the `/category/:slug` route historically rendered the
 * BrandSelection page (which never even read the slug), so clicking a
 * category from the home grid dumped the user on "all brands". Home now
 * links directly to `/products?category=<id>`, but any persisted URL still
 * needs to land on the right place.
 */
const CategoryRedirect = () => {
  const { slug } = useParams();
  const [resolvedId, setResolvedId] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(
          `${API_ENDPOINTS.CUSTOMER_CATEGORIES}?all=true`,
        );
        const list = data?.categories || (Array.isArray(data) ? data : []);
        const wanted = String(slug || "").toLowerCase().trim();
        const match = list.find(
          (c) =>
            String(c.slug || "").toLowerCase().trim() === wanted ||
            String(c.name || "")
              .toLowerCase()
              .replace(/\s+/g, "-")
              .trim() === wanted,
        );
        if (cancelled) return;
        if (match?._id) {
          setResolvedId(match._id);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("CategoryRedirect lookup failed:", err);
        if (!cancelled) setNotFound(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (resolvedId) {
    return <Navigate to={`/products?category=${resolvedId}`} replace />;
  }

  if (notFound) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-black text-secondary mb-2">
          Category not found
        </h1>
        <p className="text-sm text-gray-500 mb-6 max-w-md">
          The category you’re looking for doesn’t exist or has been renamed.
        </p>
        <Link
          to="/products"
          className="px-5 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded hover:bg-orange-600 transition-colors">
          Browse all products
        </Link>
      </div>
    );
  }

  return <LoadingFallback />;
};

export default CategoryRedirect;
