import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../appContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session } = useContext(AppContext);
  const location = useLocation();

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

  if (!session && isProtectedPath) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}; 