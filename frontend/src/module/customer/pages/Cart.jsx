import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ChevronRight, ShieldCheck, Truck, Flame } from 'lucide-react';
import LazyImage from '../../../components/LazyImage';
import { useSettings } from '../../../contexts/SettingsContext';
import { computeOrderTotals } from '../../../utils/orderTotals';
import { useCountryPricing } from '../../../contexts/CountryPricingContext';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, fetchCart } = useCart();
    const { settings } = useSettings();
    const { countryInfo, convertFromINR, formatPrice } = useCountryPricing();
    const { shippingPrice, taxPercentage } =
        computeOrderTotals(cartTotal, settings?.shipping || {});
    const currencySymbol = countryInfo.currencySymbol;
    const displaySubtotal = cartItems.reduce(
        (sum, item) => sum + item.displayPrice * item.quantity,
        0
    );
    const displayShippingPrice = countryInfo.currencyCode === 'INR'
        ? shippingPrice
        : convertFromINR(shippingPrice);
    const displayTaxPrice = Math.round(displaySubtotal * (taxPercentage / 100) * 100) / 100;
    const displayOrderTotal = displaySubtotal + displayShippingPrice + displayTaxPrice;
    const dealSavings = cartItems.reduce(
        (sum, item) => sum + Math.max(0, (item.displayOriginalPrice - item.displayPrice) * item.quantity),
        0
    );

    // Refresh cart on mount to ensure latest data
    React.useEffect(() => {
        fetchCart();
    }, []);

    if (cartItems.length === 0) {
        // ... (rest is same, but logical check)

        return (
            <div className="bg-[#f4f4f4] min-h-screen py-20">
                <div className="max-w-7xl mx-auto px-0 md:px-4 text-center">
                    <div className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100 max-w-2xl mx-auto">
                        <h1 className="text-3xl font-black text-secondary mb-4 uppercase italic tracking-tighter">Your cart is <span className="text-primary italic">empty</span></h1>
                        <p className="text-gray-500 mb-8 uppercase text-xs font-black tracking-widest">Add some high quality mobile parts to get started</p>
                        <Link to="/" className="inline-block bg-primary text-white font-black py-4 px-8 rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all uppercase tracking-widest">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f4f4f4] min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-[2%] md:px-4 py-8">
                <h1 className="text-3xl font-black text-secondary mb-8 uppercase italic tracking-tighter">
                    SHOPPING <span className="text-primary italic">CART</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-8 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item._id} className="bg-white p-3 md:p-6 rounded-lg md:rounded-2xl shadow-sm border border-gray-100 flex gap-3 md:gap-6 relative group">
                                <button
                                    onClick={() => removeFromCart(item._id)}
                                    className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-300 hover:text-red-500 transition-colors z-10"
                                >
                                    <Trash2 size={18} className="md:w-5 md:h-5" />
                                </button>

                                {/* Product Image - Smaller on mobile */}
                                <div className="w-20 h-20 md:w-32 md:h-32 flex-shrink-0 bg-gray-50 rounded-lg md:rounded-xl overflow-hidden p-2 md:p-4">
                                    <LazyImage src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0 pr-6 md:pr-0">
                                    <Link to={`/product/${item._id}`} className="font-bold text-secondary hover:text-primary transition-colors block mb-1 uppercase tracking-tight text-xs md:text-sm line-clamp-2">
                                        {item.name}
                                    </Link>
                                    <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">SKU: MAX-{item._id.slice(-6)}</p>
                                    {item.deal && (
                                        <Link
                                            to={`/offers/${item.deal.slug}`}
                                            className="inline-flex items-center gap-1 mb-2 md:mb-4 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[9px] md:text-[10px] font-black uppercase tracking-wider hover:bg-red-100">
                                            <Flame size={11} /> {item.deal.percent}% off · {item.deal.title}
                                        </Link>
                                    )}
                                    {!item.deal && <div className="mb-0 md:mb-2" />}

                                    {/* Mobile: Compact layout */}
                                    <div className="flex flex-col gap-2 md:hidden">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                                                <button
                                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                    className="w-7 h-7 flex items-center justify-center font-bold text-gray-500 hover:text-secondary"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="w-8 text-center font-black text-secondary text-xs">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                    className="w-7 h-7 flex items-center justify-center font-bold text-gray-500 hover:text-secondary"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-black text-secondary tracking-tighter">{item.currencySymbol}{formatPrice(item.displayPrice * item.quantity)}</p>
                                                <p className="text-[9px] text-gray-400 font-bold">{item.currencySymbol}{formatPrice(item.displayPrice)} / Unit</p>
                                                {item.deal && item.displayOriginalPrice > item.displayPrice && (
                                                    <p className="text-[9px] text-gray-400 font-bold line-through">{item.currencySymbol}{formatPrice(item.displayOriginalPrice * item.quantity)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop: Original layout */}
                                    <div className="hidden md:flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                                <button
                                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center font-bold text-gray-500 hover:text-secondary"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-10 text-center font-black text-secondary text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center font-bold text-gray-500 hover:text-secondary"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <span className="text-xs font-bold text-gray-400">UNITS</span>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xl font-black text-secondary tracking-tighter italic">{item.currencySymbol}{formatPrice(item.displayPrice * item.quantity)}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{item.currencySymbol}{formatPrice(item.displayPrice)} / Unit</p>
                                                {item.deal && item.displayOriginalPrice > item.displayPrice && (
                                                    <p className="text-[10px] text-gray-400 font-bold line-through">{item.currencySymbol}{formatPrice(item.displayOriginalPrice * item.quantity)}</p>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                            <h3 className="text-sm font-black text-secondary mb-6 uppercase tracking-[0.2em] border-b border-gray-100 pb-4">Order Summary</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span className="text-secondary tracking-tighter">{currencySymbol}{formatPrice(displaySubtotal)}</span>
                                </div>
                                {dealSavings > 0 && (
                                    <div className="flex justify-between text-sm font-bold text-red-600 uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><Flame size={14} /> Deal savings</span>
                                        <span className="tracking-tighter">-{currencySymbol}{formatPrice(dealSavings)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-widest">
                                    <span>Shipping</span>
                                    {shippingPrice === 0
                                        ? <span className="text-accent tracking-widest">FREE</span>
                                        : <span className="text-secondary tracking-tighter">{currencySymbol}{formatPrice(displayShippingPrice)}</span>}
                                </div>
                                <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-widest">
                                    <span>Tax (GST{taxPercentage > 0 ? ` ${taxPercentage}%` : ''})</span>
                                    <span className="text-secondary tracking-tighter">{currencySymbol}{formatPrice(displayTaxPrice)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-8 pt-4 border-t border-gray-100">
                                <span className="text-sm font-black text-secondary uppercase tracking-[0.2em]">Grand Total</span>
                                <span className="text-3xl font-black text-primary italic tracking-tighter line-height-none">{currencySymbol}{formatPrice(displayOrderTotal)}</span>
                            </div>

                            <Link to="/checkout" className="block w-full bg-secondary text-white font-black py-4 rounded-xl text-center shadow-lg hover:bg-black transition-all uppercase tracking-widest mb-4">
                                PROCEED TO CHECKOUT
                            </Link>

                            <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-secondary">
                                    <ShieldCheck size={14} className="text-accent" /> Secure Payment Guaranteed
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-secondary">
                                    <Truck size={14} className="text-primary" /> Worldwide Shipping
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
