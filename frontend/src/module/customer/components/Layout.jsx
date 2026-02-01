import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import LazyImage from "../../../components/LazyImage";

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col font-sans">
            <Header />
            <main className="flex-grow pb-16 md:pb-0">
                {children || <Outlet />}
            </main>
            <Footer />

            {/* Mobile Bottom Navigation */}
            <BottomNav />

            {/* WhatsApp Floating Button */}
            <a
                href="https://wa.me/919870162128"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-20 right-6 md:bottom-6 bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform z-40"
            >
                <LazyImage
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    alt="WhatsApp"
                    className="w-8 h-8"
                />
            </a>
        </div>
    );
};

export default Layout;
