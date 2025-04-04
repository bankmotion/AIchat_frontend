import { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../appContext';
import { supabase } from '../../config';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { session, setSession, localData } = useContext(AppContext);
    const location = useLocation();
    const [loading, setLoading] = useState(true); // To handle async session load

    // List of routes that require authentication
    const protectedPaths = [
        '/create_character',
        '/pricing',
        '/my_characters',
        '/blocks',
        '/edit_character',
        '/my_chats',
        '/profile',
        '/account'
    ];

    // Check if the current path starts with any protected path
    const isProtectedPath = protectedPaths.some(path =>
        location.pathname.startsWith(path)
    );

    useEffect(() => {
        async function fetchSession() {
            const response = await supabase.auth.getSession();
            setSession(response.data.session);
            setLoading(false); // Mark loading as false once session is fetched
        }
        fetchSession();
    }, [setSession]);

    if (loading) {
        return <div>Loading...</div>; // Optional: show loading while fetching session
    }

    if (!session && isProtectedPath) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (localData.is_signIn) {
        return <>{children}</>;
    }

    return <Navigate to="/login" state={{ from: location }} replace />;
};
