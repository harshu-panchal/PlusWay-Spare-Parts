import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import LazyImage from '../../../components/LazyImage';
import { useCart } from '../context/CartContext';
import { useCountryPricing } from '../../../contexts/CountryPricingContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { getPriceForCountry, formatPrice } = useCountryPricing();

    // Get country-aware pricing (auto-converted from INR or manual override)
    const pricing = getPriceForCountry(product);

    const savingsPercent = pricing.mrp > pricing.price
        ? Math.round(((pricing.mrp - pricing.price) / pricing.mrp) * 100)
        : 0;

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col h-full">
            <Link to={`/product/${product._id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
                <LazyImage
                    src={product.images && product.images.length > 0 ? product.images[0] : (product.image || "https://via.placeholder.com/300")}
                    alt={product.name}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.countInStock === 0 ? (
                        <span className="bg-gray-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Out of stock</span>
                    ) : (
                        <span className="bg-accent text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">In Stock</span>
                    )}
                </div>
                {savingsPercent > 0 && product.countInStock !== 0 && (
                    <div className="absolute top-0 right-0 bg-red-600 text-[10px] text-white font-black px-2 py-1 rounded-bl-lg shadow-md">
                        Save {savingsPercent}%
                    </div>
                )}
            </Link>

            <div className="p-3 md:p-4 flex-1 flex flex-col">
                <Link to={`/product/${product._id}`} className="font-bold text-secondary text-[11px] md:text-sm leading-snug mb-2 hover:text-primary transition-colors block line-clamp-2 min-h-[2.5em]">
                    {product.name}
                </Link>

                <div className="mt-auto">
                    <div className="flex flex-col mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm md:text-lg font-black text-secondary tracking-tighter">
                                {pricing.currencySymbol}{formatPrice(pricing.price)}
                            </span>
                            {pricing.wholesalePrice > 0 && (
                                <span className="text-[10px] md:text-xs font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded tracking-tight">
                                    Wholesale: {pricing.currencySymbol}{formatPrice(pricing.wholesalePrice)} <span className="text-[8px] opacity-70">({pricing.wholesaleMinQty}+)</span>
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {pricing.mrp > pricing.price && (
                                <span className="text-[9px] md:text-[11px] text-gray-400 line-through">{pricing.currencySymbol}{formatPrice(pricing.mrp)}</span>
                            )}
                            {pricing.mrp > pricing.price && (
                                <span className="text-[9px] font-black text-accent uppercase tracking-widest leading-none">Save {pricing.currencySymbol}{formatPrice(pricing.mrp - pricing.price)}</span>
                            )}
                        </div>
                        {/* Show country label for non-Indian users */}
                        {pricing.currencyCode !== "INR" && (
                            <span className="text-[9px] text-gray-400 mt-0.5">
                                🌍 {pricing.countryName} ({pricing.currencyCode})
                            </span>
                        )}
                    </div>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (product.countInStock !== 0) addToCart(product);
                        }}
                        disabled={product.countInStock === 0}
                        className={`w-full py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg ${product.countInStock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-primary text-white hover:bg-orange-600 shadow-orange-500/10'}`}
                    >
                        <ShoppingCart size={14} /> {product.countInStock === 0 ? 'Out of stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
