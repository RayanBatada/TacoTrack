"use client";

import { useEffect } from "react";

export default function FaviconAnimator() {
    useEffect(() => {
        const sequence = ["favicon1.ico", "favicon2.ico", "favicon3.ico", "favicon2.ico"];
        let index = 0;

        const interval = setInterval(() => {
            const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
            if (link) {
                link.href = `/${sequence[index]}`;
            } else {
                const newLink = document.createElement('link');
                newLink.rel = 'icon';
                newLink.href = `/${sequence[index]}`;
                document.head.appendChild(newLink);
            }
            index = (index + 1) % sequence.length;
        }, 500); // 500ms interval for the animation

        return () => clearInterval(interval);
    }, []);

    return null;
}
