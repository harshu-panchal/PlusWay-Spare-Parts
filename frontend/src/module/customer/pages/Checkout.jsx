import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import {
    ChevronRight, MapPin, CreditCard, Wallet, Plus, Home, Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/api';

const emptyAddressForm = {
    type: 'Home', name: '', mobile: '', street: '', landmark: '', city: '', state: '', pincode: ''
};

const Checkout = () => {
    const { cartTotal, cartItems } = useCart();
    const navigate = useNavigate();

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [addressesLoading, setAddressesLoading] = useState(true);
    const [selectedAddressId, setSelectedAddressId] = useState(null); // null => "add new" form is active
    const [addressForm, setAddressForm] = useState(emptyAddressForm);
    const [saveNewAddress, setSaveNewAddress] = useState(true);
    const [addressError, setAddressError] = useState('');
    const [placingOrder, setPlacingOrder] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState('paypal'); // Default to Online Payment

    const getToken = () => {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo).token : null;
    };

    useEffect(() => {
        const fetchAddresses = async () => {
            const token = getToken();
            if (!token) {
                setAddressesLoading(false);
                return;
            }
            try {
                const { data } = await axios.get(API_ENDPOINTS.ADDRESSES, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const addresses = Array.isArray(data) ? data : [];
                setSavedAddresses(addresses);
                if (addresses.length > 0) {
                    const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
                    setSelectedAddressId(defaultAddr._id);
                }
            } catch (error) {
                console.error('Error fetching addresses:', error);
            } finally {
                setAddressesLoading(false);
            }
        };
        fetchAddresses();
    }, []);

    const handleAddressFieldChange = (field, value) => {
        setAddressForm({ ...addressForm, [field]: value });
        setAddressError('');
    };

    const validateNewAddress = () => {
        if (!addressForm.name.trim()) return 'Please enter the recipient\'s full name';
        if (!/^\d{10}$/.test(addressForm.mobile.trim())) return 'Please enter a valid 10-digit mobile number';
        if (!addressForm.street.trim()) return 'Please enter the house no., building and street';
        if (!addressForm.city.trim()) return 'Please enter the city';
        if (!addressForm.state.trim()) return 'Please enter your state / province';
        if (!/^\d{6}$/.test(addressForm.pincode.trim())) return 'Please enter a valid 6-digit pincode';
        return '';
    };

    const resolveShippingAddress = async () => {
        // Using a previously saved address
        if (selectedAddressId) {
            const addr = savedAddresses.find(a => a._id === selectedAddressId);
            if (!addr) return null;
            return {
                name: addr.name,
                mobile: addr.mobile,
                address: addr.street,
                landmark: addr.landmark || '',
                city: addr.city,
                state: addr.state,
                pincode: addr.pincode,
                country: 'India',
            };
        }

        // Filling in a brand new address
        const validationError = validateNewAddress();
        if (validationError) {
            setAddressError(validationError);
            return null;
        }

        if (saveNewAddress) {
            try {
                const token = getToken();
                await axios.post(API_ENDPOINTS.ADDRESSES, addressForm, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (error) {
                // Don't block placing the order just because saving-for-later failed.
                console.error('Error saving address:', error);
            }
        }

        return {
            name: addressForm.name,
            mobile: addressForm.mobile,
            address: addressForm.street,
            landmark: addressForm.landmark,
            city: addressForm.city,
            state: addressForm.state,
            pincode: addressForm.pincode,
            country: 'India',
        };
    };

    const handlePlaceOrder = async () => {
        try {
            const token = getToken();

            if (!token) {
                alert("Please login first");
                return;
            }

            const shippingAddress = await resolveShippingAddress();
            if (!shippingAddress) return;

            setPlacingOrder(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            const orderData = {
                orderItems: cartItems.map(item => {
                    return {
                        ...item,
                        product: item._id, // Backend expects product ID in 'product' field
                        qty: item.quantity, // Backend expects 'qty', frontend has 'quantity'
                        price: item.price, // Always the selling price — wholesale pricing isn't used in the customer app
                        image: item.image || "sample.jpg" // Fallback image
                    };
                }),
                shippingAddress,
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
        } finally {
            setPlacingOrder(false);
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

                            {!addressesLoading && savedAddresses.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {savedAddresses.map((addr) => (
                                        <label
                                            key={addr._id}
                                            className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-primary bg-orange-50/30' : 'border-gray-100 bg-gray-50 hover:border-gray-300'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="savedAddress"
                                                className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                                                checked={selectedAddressId === addr._id}
                                                onChange={() => { setSelectedAddressId(addr._id); setAddressError(''); }}
                                            />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {addr.type === 'Work' ? <Briefcase size={12} className="text-gray-400" /> : <Home size={12} className="text-gray-400" />}
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{addr.type || 'Home'}</span>
                                                    {addr.isDefault && (
                                                        <span className="text-[8px] font-black bg-accent text-white px-1.5 py-0.5 rounded uppercase tracking-widest">Default</span>
                                                    )}
                                                </div>
                                                <p className="font-bold text-secondary text-sm">{addr.name} <span className="text-gray-400 font-medium">· {addr.mobile}</span></p>
                                                <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                                                    {addr.street}{addr.landmark ? `, Near ${addr.landmark}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                                                </p>
                                            </div>
                                        </label>
                                    ))}

                                    <label
                                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${selectedAddressId === null ? 'border-primary bg-orange-50/30' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
                                    >
                                        <input
                                            type="radio"
                                            name="savedAddress"
                                            className="w-4 h-4 text-primary focus:ring-primary"
                                            checked={selectedAddressId === null}
                                            onChange={() => { setSelectedAddressId(null); setAddressError(''); }}
                                        />
                                        <Plus size={16} className="text-primary" />
                                        <span className="font-bold text-sm text-secondary">Deliver to a new address</span>
                                    </label>
                                </div>
                            )}

                            {!addressesLoading && (savedAddresses.length === 0 || selectedAddressId === null) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={addressForm.name}
                                            onChange={(e) => handleAddressFieldChange('name', e.target.value)}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-bold"
                                            placeholder="Recipient's full name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                        <input
                                            type="tel"
                                            value={addressForm.mobile}
                                            onChange={(e) => handleAddressFieldChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-bold"
                                            placeholder="10-digit mobile number"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">House No., Building, Street, Area</label>
                                        <input
                                            type="text"
                                            value={addressForm.street}
                                            onChange={(e) => handleAddressFieldChange('street', e.target.value)}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-bold"
                                            placeholder="House No, Building, Street, Area"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Landmark <span className="text-gray-300">(optional)</span></label>
                                        <input
                                            type="text"
                                            value={addressForm.landmark}
                                            onChange={(e) => handleAddressFieldChange('landmark', e.target.value)}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-bold"
                                            placeholder="Near famous shop / landmark"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                                        <input
                                            type="text"
                                            value={addressForm.city}
                                            onChange={(e) => handleAddressFieldChange('city', e.target.value)}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-bold"
                                            placeholder="New Delhi"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State / Province</label>
                                        <input
                                            type="text"
                                            value={addressForm.state}
                                            onChange={(e) => handleAddressFieldChange('state', e.target.value)}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-bold"
                                            placeholder="State / Province / Region"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
                                        <input
                                            type="text"
                                            value={addressForm.pincode}
                                            onChange={(e) => handleAddressFieldChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-bold"
                                            placeholder="110001"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address Type</label>
                                        <div className="flex gap-2">
                                            {['Home', 'Work', 'Other'].map((t) => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => handleAddressFieldChange('type', t)}
                                                    className={`flex-1 py-3 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all ${addressForm.type === t ? 'border-primary bg-orange-50 text-primary' : 'border-gray-200 text-gray-400'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="saveNewAddress"
                                            checked={saveNewAddress}
                                            onChange={(e) => setSaveNewAddress(e.target.checked)}
                                            className="w-4 h-4 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="saveNewAddress" className="text-xs font-bold text-gray-500">
                                            Save this address for future orders
                                        </label>
                                    </div>
                                </div>
                            )}

                            {addressError && (
                                <p className="text-xs font-bold text-red-600 mt-4">{addressError}</p>
                            )}
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
                                    { id: 'paypal', name: 'Online Payment (Cards, UPI, NetBanking, PayPal)', icon: <CreditCard size={20} /> },
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
                                disabled={placingOrder}
                                className="w-full bg-primary text-white font-black py-4 rounded-xl text-center shadow-lg hover:bg-orange-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {placingOrder ? 'PLACING ORDER...' : 'PLACE ORDER'} <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
