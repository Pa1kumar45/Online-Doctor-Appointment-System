/**
 * App Context Provider
 * 
 * Central state management for the Health-Connect application.
 * Manages user authentication and theme preferences.
 * Provides global state including current user and dark mode.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from '../utils/axios';
import { Doctor, Patient, SignUpFormData, LoginCredentials } from '../types/index';

/**
 * Theme context interface - defines theme-related state and functions
 */
interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

/**
 * Main app context interface - extends theme context with auth functionality
 */
interface AppContextType extends ThemeContextType {
  currentUser: Doctor | Patient | null;                    // Currently authenticated user
  setCurrentUser: (user: Doctor | Patient | null) => void; // Function to set current user
  isLoading: boolean;                                       // Global loading state
  error: string | null;                                     // Global error state
  logout: () => void;                                       // Logout function
  signup: (data: SignUpFormData) => void;                  // User registration function
  login: (data: LoginCredentials) => void;                 // User login function
  getCurrentUser: () => Promise<{ data: { data: any; success: boolean; message: string } }>; // Get current user from server
}

// Create the app context
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * App Context Provider Component
 * Provides all app-wide state and functionality to child components
 */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize dark mode from localStorage, default to true (dark mode)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('darkMode');
        return savedTheme ? JSON.parse(savedTheme) : true;
    });

    // Current authenticated user state (doctor or patient)
    const [currentUser, setCurrentUser] = useState<Doctor | Patient | null>(null);
    
    // Global loading and error states (currently unused but available for future use)
    const [isLoading] = useState(false);
    const [error] = useState<string | null>(null);

    // Apply dark mode class to html element
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    /**
     * User signup function - handles new user registration
     * Sets current user state after successful signup
     */
    const signup = async (data: SignUpFormData) => {
        try {
            console.log("register data", data);
            const response = await axios.post('/auth/register', data);
            console.log("Signup response:", response.data);

            // Set the newly registered user as current user
            setCurrentUser(response.data.data);
        } catch (error) {
            console.error("Signup error:", error);
        }
    };

    /**
     * User login function - handles user authentication
     * Sets current user state after successful login
     */
    const login = async (data: LoginCredentials) => {
        try {
            console.log("logindata", data);
            const response = await axios.post('/auth/login', data);
            console.log("login responce", response);
            
            // Set the authenticated user as current user
            setCurrentUser(response.data.data);

        } catch (error: any) {
            console.log(error);
            throw error;
        }
    }

    /**
     * User logout function - clears user state and calls logout API
     */
    const logout = async () => {
        setCurrentUser(null);
        await axios.post('/auth/logout');
    }

    /**
     * Get current user function - fetches current user from server
     * Used for maintaining authentication state on app reload
     */
    const getCurrentUser = async () => {
        try {
            const response = await axios('/auth/me');
            console.log("current me ", response);
            if (response.data.data) {
                setCurrentUser(response.data.data);
            }
            return response;
        } catch (error) {
            console.error("Error getting current user:", error);
            throw error;
        }
    }

    /**
     * Theme toggle function - switches between light and dark modes
     * Uses useCallback for performance optimization
     */
    const toggleDarkMode = useCallback(() => {
        setIsDarkMode((prev: boolean) => !prev);
    }, []);

    // Provide all context values to child components
    return (
        <AppContext.Provider
            value={{
                isDarkMode,
                toggleDarkMode,
                currentUser,
                setCurrentUser,
                isLoading,
                error,
                logout,
                signup,
                login,
                getCurrentUser
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

/**
 * Custom hook to access app context
 * Throws error if used outside of AppProvider
 */
export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

/**
 * Custom hook to access theme-specific context values
 * Convenience hook for components that only need theme functionality
 */
export const useTheme = () => {
    const { isDarkMode, toggleDarkMode } = useApp();
    return { isDarkMode, toggleDarkMode };
};