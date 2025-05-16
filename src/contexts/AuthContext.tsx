import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user data exists in localStorage
    const userData = localStorage.getItem('user');
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // In a real app, this would make an API call
    // For this demo, we'll simulate a login with localStorage
    
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user exists (in a real app, this would be server-side)
    const usersData = localStorage.getItem('users');
    const users = usersData ? JSON.parse(usersData) : [];
    
    const foundUser = users.find((u: any) => 
      u.email === email && u.password === password
    );
    
    if (!foundUser) {
      throw new Error('Invalid email or password');
    }
    
    // Remove password before storing in state/localStorage
    const { password: _, ...userWithoutPassword } = foundUser;
    
    // Update state and localStorage
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
  };

  const register = async (name: string, email: string, password: string) => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get existing users or initialize empty array
    const usersData = localStorage.getItem('users');
    const users = usersData ? JSON.parse(usersData) : [];
    
    // Check if user already exists
    if (users.some((u: any) => u.email === email)) {
      throw new Error('Email already in use');
    }
    
    // Create new user
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password, // In a real app, this would be hashed
    };
    
    // Save to "database"
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Log in the user (without password in state)
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update user in localStorage
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Also update in users array
    const usersData = localStorage.getItem('users');
    
    if (usersData) {
      const users = JSON.parse(usersData);
      const updatedUsers = users.map((u: any) => 
        u.id === user.id ? { ...u, ...data } : u
      );
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
  };

  const resetPassword = async (email: string) => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would trigger a password reset email
    console.log(`Password reset email sent to ${email}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}