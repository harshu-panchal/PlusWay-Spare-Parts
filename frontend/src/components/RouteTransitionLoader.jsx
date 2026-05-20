import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const RouteTransitionLoader = () => {
    const location = useLocation();

    useEffect(() => {
        // Optional: You could add subtle scroll animations or other small effects here
        // But no forced delay!
    }, [location.pathname]);

    // Return null - no more forced loading screen!
    return null;
};

export default RouteTransitionLoader;
