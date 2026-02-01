import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import LazyImage from '../../../components/LazyImage';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const savingsPercent = product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
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
                    {product.countInStock > 0 && <span className="bg-accent text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">In Stock</span>}
                </div>
                {savingsPercent > 0 && (
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
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm md:text-lg font-black text-secondary tracking-tighter">₹{product.price.toLocaleString()}</span>
                            {product.mrp > product.price && (
                                <span className="text-[9px] md:text-[11px] text-gray-400 line-through">₹{product.mrp.toLocaleString()}</span>
                            )}
                        </div>
                        {product.mrp > product.price && (
                            <span className="text-[9px] font-black text-accent uppercase tracking-widest leading-none mt-0.5">You Save ₹{(product.mrp - product.price).toLocaleString()}</span>
                        )}
                    </div>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                        }}
                        className="w-full bg-primary text-white py-2 md:py-2.5 rounded-lg md:rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/10"
                    >
                        <ShoppingCart size={14} /> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
