import React, { useEffect } from 'react';

interface SEOProps {
    title: string;
    description: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description }) => {
    useEffect(() => {
        // Update Title
        document.title = `${title} | VDMX Risk Intelligence`;

        // Update Meta Description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description);

        // Cleanup (Optional: Reset on unmount if needed, but usually fine to leave until next overwrite)
    }, [title, description]);

    return null;
};
