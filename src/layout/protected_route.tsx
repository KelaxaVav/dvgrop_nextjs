import { JSX } from 'react';
import {  Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: JSX.Element;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');  

  if (!token) {
    return <Navigate to="/login" replace />;  
  }

  return children;  
}

export default ProtectedRoute;
