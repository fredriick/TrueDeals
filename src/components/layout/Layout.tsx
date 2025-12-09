import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <footer className="border-t bg-white py-8">
                <div className="container mx-auto px-4 text-center text-sm text-slate-500">
                    © 2025 TrueDeals. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
