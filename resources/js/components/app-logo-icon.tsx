import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M12 2C12 2 9 5 9 8c0 2.761 2.239 5 5 5s5-2.239 5-5c0-3-3-6-3-6s-3 1-4 0z" />
            <path d="M5 13c0 0 3 2 7 2s7-2 7-2v7H5v-7z" />
        </svg>
    );
}
