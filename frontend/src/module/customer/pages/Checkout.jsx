import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import {
    ChevronRight, MapPin, CreditCard, Wallet, Phone, CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/api';

const Checkout = () => {
    const { cartTotal, cartItems } = useCart();
    const navigate = useNavigate();

    // State for form inputs
    const [fullAddress, setFullAddress] = useState({
        address: '', city: '', pincode: '', country: 'India'
    });
    const [paymentMethod, setPaymentMethod] = useState('cod'); // Default to COD

    const handlePlaceOrder = async () => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            const token = userInfo ? JSON.parse(userInfo).token : null;

            if (!token) {
                alert("Please login first");
                // navigate('/login?redirect=checkout'); // Optional: redirects
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            const orderData = {
                orderItems: cartItems.map(item => {
                    const currentPrice = (item.wholesalePrice > 0 && item.quantity >= (item.wholesaleMinQty || 10))
                        ? item.wholesalePrice
                        : item.price;
                    return {
                        ...item,
                        product: item._id, // Backend expects product ID in 'product' field
                        qty: item.quantity, // Backend expects 'qty', frontend has 'quantity'
                        price: currentPrice, // Use the retail or wholesale price
                        image: item.image || "sample.jpg" // Fallback image
                    };
                }),
                shippingAddress: {
                    address: fullAddress.address,
                    city: fullAddress.city,
                    pincode: fullAddress.pincode,
                    state: "Default State",
                    country: "India"
                },
                paymentMethod: paymentMethod,
                itemsPrice: cartTotal,
                taxPrice: 0,
                shippingPrice: 0,
                totalPrice: cartTotal
            };

            const { data } = await axios.post(API_ENDPOINTS.ORDERS, orderData, config);

            // Redirect to Order Details (Payment Page)
            navigate(`/order/${data._id}`);

        } catch (error) {
            console.error("Place Order Error", error);
            alert(error.response?.data?.message || "Failed to place order");
        }
    };

    return (
        <div className="bg-[#f4f4f4] min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-[2%] md:px-4 py-8">
                <h1 className="text-3xl font-black text-secondary mb-8 uppercase italic tracking-tighter">
                    SECURE <span className="text-primary italic">CHECKOUT</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Shipping Address Section */}
                        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-primary">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-secondary uppercase italic tracking-tighter">Shipping <span className="text-primary italic">Address</span></h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Where should we deliver your parts?</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Address</label>
                                    <input
                                        type="text"
                                        value={fullAddress.address}
                                        onChange={(e) => setFullAddress({ ...fullAddress, address: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-bold"
                                        placeholder="House No, Street, Area"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                                    <input
                                        type="text"
                                        value={fullAddress.city}
                                        onChange={(e) => setFullAddress({ ...fullAddress, city: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-bold"
                                        placeholder="New Delhi"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
                                    <input
                                        type="text"
                                        value={fullAddress.pincode}
                                        onChange={(e) => setFullAddress({ ...fullAddress, pincode: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-bold"
                                        placeholder="110001"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Section */}
                        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-primary">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-secondary uppercase italic tracking-tighter">Payment <span className="text-primary italic">Method</span></h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select your preferred payment option</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { id: 'cod', name: 'Cash on Delivery', icon: <Wallet size={20} /> },
                                ].map((method) => (
                                    <label key={method.id} className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all group ${paymentMethod === method.id ? 'border-primary bg-white' : 'border-gray-100 bg-gray-50 hover:border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            className="w-5 h-5 text-primary focus:ring-primary"
                                            checked={paymentMethod === method.id}
                                            onChange={() => setPaymentMethod(method.id)}
                                        />
                                        <div className="text-primary font-bold">{method.icon}</div>
                                        <span className="font-bold text-sm text-secondary">{method.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Checkout Totals */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 sticky top-28">
                            {/* ... Summary ... */}
                            <h3 className="text-sm font-black text-secondary mb-6 uppercase tracking-[0.2em] border-b border-gray-100 pb-4">Checkout Summary</h3>

                            <div className="space-y-4 mb-8">
                                <div className="max-h-40 overflow-y-auto pr-2 space-y-3 mb-4">
                                    {cartItems.map(item => (
                                        <div key={item._id} className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-bold truncate max-w-[150px]">{item.name} x {item.quantity}</span>
                                            <span className="text-secondary font-black">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span className="text-secondary tracking-tighter">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-widest">
                                    <span>Shipping</span>
                                    <span className="text-accent tracking-widest">FREE</span>
                                </div>
                                <div className="flex justify-between items-end mb-8 pt-4 border-t border-gray-100">
                                    <span className="text-sm font-black text-secondary uppercase tracking-[0.2em]">Total Payable</span>
                                    <span className="text-3xl font-black text-primary italic tracking-tighter">₹{cartTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                className="w-full bg-primary text-white font-black py-4 rounded-xl text-center shadow-lg hover:bg-orange-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                PLACE ORDER <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
