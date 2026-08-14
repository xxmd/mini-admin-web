import type {ReactNode} from 'react';

interface CrudLayoutProps {
    children: ReactNode;
}

export function CrudLayout({children}: CrudLayoutProps) {
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            {children}
        </div>
    );
}
