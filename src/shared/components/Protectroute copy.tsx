import { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../appContext';
import { supabase } from '../../config';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { session, setSession, localData } = useContext(AppContext);
    const location = useLocation();

    console.log(session, localData, "localData_protected")

    // List of routes that require authentication
    const protectedPaths = [
        '/create_character',
        '/pricing',
        '/my_characters',
        // '/my_chats',
        '/blocks',
        // '/profile',
        '/edit_character'
    ];

    // Check if the current path starts with any protected path
    const isProtectedPath = protectedPaths.some(path =>
        location.pathname.startsWith(path)
    );

    useEffect(() => {
        async function run() {
            const response = await supabase.auth.getSession();
            setSession(response.data.session);
            if (!session && isProtectedPath) {
                return <Navigate to="/login" state={{ from: location }} replace />;
            }
        }

    }, [session])


    if (localData.is_signIn) { return <>{children}</>; }
    else return <Navigate to="/login" state={{ from: location }} replace />;
}; 