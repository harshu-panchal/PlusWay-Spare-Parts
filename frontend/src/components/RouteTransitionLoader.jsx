import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Lottie from 'lottie-react';
import cpuChipAnimation from '../assets/CPRU chip.json';

const RouteTransitionLoader = () => {
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Show loader on route change
        setIsLoading(true);

        // Hide loader after 2 seconds
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        // Cleanup timer
        return () => clearTimeout(timer);
    }, [location.pathname]);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center">
                <div className="w-48 h-48 md:w-64 md:h-64">
                    <Lottie
                        animationData={cpuChipAnimation}
                        loop={true}
                        autoplay={true}
                    />
                </div>
                <div className="mt-4 text-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteTransitionLoader;
