import { createContext, useState, useContext } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const[token, setToken] = useState(localStorage.getItem("token") || null );
    const[usuario, setUsuario] = useState(
        localStorage.getItem("token") ? jwtDecode(localStorage.getItem("token")) : null
    );

    const login = (nuevoToken) => {
        localStorage.setItem("token", nuevoToken);
        setToken(nuevoToken);
        setUsuario(jwtDecode(nuevoToken));
    }

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUsuario(null);
    }

    return (
        <AuthContext.Provider value = {{ token, usuario, login, logout}}> {children} </AuthContext.Provider>
    );

};

export const useAuth = () => useContext(AuthContext);