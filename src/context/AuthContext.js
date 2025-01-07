import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
const API_URL = 'https://www.wynstarcreations.com/seyal/api'; // Mock API
const AuthContext = createContext(null);



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

 // Check if the user is already authenticated (e.g., by checking token in localStorage)
 useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('user'));
      
        if (token) {        
          setIsAuthenticated(true);          
          setUser(token);                      
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
      } finally {
        //setLoading(false);
      }
    };

    checkAuth();
    
  }, []);
  const login = async (email, password) => {
    try {
    const response = await axios.post(`${API_URL}/users`, { email, password });
    const userData = response.data;    
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));     
    } catch (err) {      
      throw err;
    }
   
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };


  return (
    <AuthContext.Provider value={{ isAuthenticated,user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);