import React, { createContext, useContext, useState, useEffect } from "react";
import { User, LoginLog } from "../types";
import { useData } from "./DataContext";
import axios from "axios";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo with enhanced security features
// const mockUsers: (User & { password: string })[] = [
//   {
//     _id: "1",
//     username: "admin",
//     email: "admin@loanmanager.com",
//     role: "admin",
//     name: "System Administrator",
//     phone: "+94771234567",
//     isActive: true,
//     isLocked: false,
//     isOnline: false,
//     failedLoginAttempts: 0,
//     createdAt: "2024-01-01T00:00:00Z",
//     lastLogin: "2024-01-15T10:30:00Z",
//     department: "IT",
//     employeeId: "EMP001",
//     twoFactorEnabled: true,
//     password: "password",
//   },
//   {
//     _id: "2",
//     username: "officer",
//     email: "officer@loanmanager.com",
//     role: "officer",
//     name: "Loan Officer",
//     phone: "+94771234568",
//     isActive: true,
//     isLocked: false,
//     isOnline: false,
//     failedLoginAttempts: 0,
//     createdAt: "2024-01-01T00:00:00Z",
//     lastLogin: "2024-01-15T09:15:00Z",
//     department: "Loans",
//     employeeId: "EMP002",
//     password: "password",
//   },
//   {
//     id: "3",
//     username: "clerk",
//     email: "clerk@loanmanager.com",
//     role: "clerk",
//     name: "Data Entry Clerk",
//     phone: "+94771234569",
//     isActive: true,
//     isLocked: false,
//     isOnline: false,
//     failedLoginAttempts: 0,
//     createdAt: "2024-01-01T00:00:00Z",
//     lastLogin: "2024-01-15T08:45:00Z",
//     department: "Operations",
//     employeeId: "EMP003",
//     password: "password",
//   },
// ];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { addLoginLog, updateUser } = useData();

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);

      // Update user online status
      updateUser(userData.id, { isOnline: true });
    }
    // }, [updateUser]);
  }, []);

  const getClientInfo = () => {
    return {
      ipAddress: "192.168.1." + Math.floor(Math.random() * 255), // Mock IP
      userAgent: navigator.userAgent,
      location: "Colombo, Sri Lanka", // Mock location
    };
  };

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    const clientInfo = getClientInfo();

    // Find user in mock data
    // const foundUser = mockUsers.find(u => u.username === username);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/auth/login",{ username, password }
      );
      console.log("Customer saved:", response.data);
      // Update local storage with session token
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
    } catch (error) {
      console.error("Error saving customer:", error);
    }
    const foundUser = user;

    if (!foundUser) {
      // Log failed attempt - user not found
      addLoginLog({
        userId: "unknown",
        loginTime: new Date().toISOString(),
        ...clientInfo,
        status: "failed",
        failureReason: "User not found",
      });
      return false;
    }

    // Check if account is locked
    if (foundUser.isLocked) {
      addLoginLog({
        userId: foundUser._id,
        loginTime: new Date().toISOString(),
        ...clientInfo,
        status: "locked",
        failureReason: "Account locked",
      });
      return false;
    }

    // Check if account is active
    if (!foundUser.isActive) {
      addLoginLog({
        userId: foundUser._id,
        loginTime: new Date().toISOString(),
        ...clientInfo,
        status: "failed",
        failureReason: "Account inactive",
      });
      return false;
    }

    // // Check password
    // if (password !== foundUser.password) {
    //   const newFailedAttempts = (foundUser.failedLoginAttempts || 0) + 1;
    //   const shouldLock = newFailedAttempts >= 3;

    //   // Update failed attempts and potentially lock account
    //   updateUser(foundUser._id, {
    //     failedLoginAttempts: newFailedAttempts,
    //     isLocked: shouldLock,
    //     updatedAt: new Date().toISOString(),
    //   });

    //   addLoginLog({
    //     userId: foundUser._id,
    //     loginTime: new Date().toISOString(),
    //     ...clientInfo,
    //     status: shouldLock ? "locked" : "failed",
    //     failureReason: shouldLock
    //       ? "Account locked due to failed attempts"
    //       : "Invalid password",
    //   });

    //   return false;
    // }

    // Successful login
    const sessionToken = "sess_" + Date.now().toString();
    const loginTime = new Date().toISOString();

    const updatedUser: User = {
      ...foundUser,
      lastLogin: loginTime,
      isOnline: true,
      failedLoginAttempts: 0,
      sessionToken,
      updatedAt: loginTime,
    };

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = updatedUser;

    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));

    // Update user in database
    updateUser(foundUser._id, {
      lastLogin: loginTime,
      isOnline: true,
      failedLoginAttempts: 0,
      sessionToken,
      updatedAt: loginTime,
    });

    // Log successful login
    addLoginLog({
      userId: foundUser._id,
      loginTime,
      ...clientInfo,
      status: "success",
      sessionId: sessionToken,
    });

    return true;
  };

  const logout = () => {
    if (user) {
      const logoutTime = new Date().toISOString();

      // Update user online status
      updateUser(user._id, {
        isOnline: false,
        lastLogout: logoutTime,
        sessionToken: undefined,
        updatedAt: logoutTime,
      });

      // Log logout
      addLoginLog({
        userId: user._id,
        loginTime: user.lastLogin || new Date().toISOString(),
        logoutTime,
        ...getClientInfo(),
        status: "logout",
      });
    }

    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
