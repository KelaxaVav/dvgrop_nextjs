import React, { createContext, useContext, useState, useEffect } from "react";
import { User, LoginLog } from "../types";
import { useData } from "./DataContext";
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { setAuth,logout as logoutAction } from "../redux/auth_slice";
import { ReduxState } from "../types/redux_state";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // const { addLoginLog, updateUser } = useData();
 const dispatch = useDispatch();
   const isAuthenticated = useSelector((state: ReduxState) => state.auth.isAuthenticated);
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      // setIsAuthenticated(true);
      // updateUser(userData.id, { isOnline: true });
    }
  }, []);

  const getClientInfo = () => {
    return {
      ipAddress: "192.168.1." + Math.floor(Math.random() * 255),
      userAgent: navigator.userAgent,
      location: "Colombo, Sri Lanka",
    };
  };

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    const clientInfo = getClientInfo();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/auth/login", { username, password }
      );
      console.log("Customer saved:", response.data);
      localStorage.setItem("token", response.data.token);
      dispatch(setAuth({ user: response.data.user, token: response.data.token }));
      // setUser(response.data.user);
      // setIsAuthenticated(true);
    } catch (error) {
      console.error("Error saving customer:", error);
    }
    const foundUser = user;

    if (!foundUser) {
      // addLoginLog({
      //   userId: "unknown",
      //   loginTime: new Date().toISOString(),
      //   ...clientInfo,
      //   status: "failed",
      //   failureReason: "User not found",
      // });
      return false;
    }

    if (foundUser.isLocked) {
      // addLoginLog({
      //   userId: foundUser._id,
      //   loginTime: new Date().toISOString(),
      //   ...clientInfo,
      //   status: "locked",
      //   failureReason: "Account locked",
      // });
      return false;
    }

    if (!foundUser.isActive) {
      // addLoginLog({
      //   userId: foundUser._id,
      //   loginTime: new Date().toISOString(),
      //   ...clientInfo,
      //   status: "failed",
      //   failureReason: "Account inactive",
      // });
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

    // const { password: _, ...userWithoutPassword } = updatedUser;
    const userWithoutPassword = updatedUser;

    setUser(userWithoutPassword);
    // setIsAuthenticated(true);
    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));

    // updateUser(foundUser._id, {
    //   lastLogin: loginTime,
    //   isOnline: true,
    //   failedLoginAttempts: 0,
    //   sessionToken,
    //   updatedAt: loginTime,
    // });

    // addLoginLog({
    //   userId: foundUser._id,
    //   loginTime,
    //   ...clientInfo,
    //   status: "success",
    //   sessionId: sessionToken,
    // });

    return true;
  };

  // const logout = () => {
  //   if (user) {
  //     const logoutTime = new Date().toISOString();

  //     updateUser(user._id, {
  //       isOnline: false,
  //       lastLogout: logoutTime,
  //       sessionToken: undefined,
  //       updatedAt: logoutTime,
  //     });

  //     addLoginLog({
  //       userId: user._id,
  //       loginTime: user.lastLogin || new Date().toISOString(),
  //       logoutTime,
  //       ...getClientInfo(),
  //       status: "logout",
  //     });
  //   }

  //   setUser(null);
  //   setIsAuthenticated(false);
  //   localStorage.removeItem("currentUser");
  // };
    const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    dispatch(logoutAction());
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
function loginSuccess(arg0: { user: any; token: any; }): any {
  throw new Error("Function not implemented.");
}

