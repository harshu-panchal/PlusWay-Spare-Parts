import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Reset window scroll
        window.scrollTo(0, 0);

        // Reset all scrollable containers marked with data-scroll-container
        const scrollContainers = document.querySelectorAll('[data-scroll-container]');
        scrollContainers.forEach(container => {
            container.scrollTop = 0;
        });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
