import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getNavItems = () => {
        switch (usuario?.rol) {
            case "ADMIN":
                return [
                    { label: "Dashboard", ruta: "/dashboard" },
                    { label: "Distritos", ruta: "/distritos" },
                    { label: "Iglesias", ruta: "/iglesias" },
                    { label: "Pastores", ruta: "/pastores" },
                    { label: "Diezmos", ruta: "/diezmos" },
                    { label: "Usuarios", ruta: "/usuarios" },
                ];
            case "AP":
                return [
                    { label: "Dashboard", ruta: "/dashboard" },
                    { label: "Distritos", ruta: "/distritos" },
                    { label: "Iglesias", ruta: "/iglesias" },
                    { label: "Pastores", ruta: "/pastores" },
                    { label: "Diezmar", ruta: "/diezmar" },
                ];
            case "PD":
                return [
                    { label: "Dashboard", ruta: "/dashboard" },
                    { label: "Mi Distrito", ruta: "/mi-distrito" },
                    { label: "Iglesias", ruta: "/iglesias" },
                    { label: "Pastores", ruta: "/pastores" },
                    { label: "Diezmar", ruta: "/diezmar" },
                    { label: "Reportes", ruta: "/reportes" },
                ];
            case "PASTOR":
                return [
                    { label: "Dashboard", ruta: "/dashboard" },
                    { label: "Mi Perfil", ruta: "/mi-perfil" },
                    { label: "Diezmar", ruta: "/diezmar" },
                    { label: "Mis Diezmos", ruta: "/mis-diezmos" },
                ];
            default:
                return [];
        }
    };

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <h3 style={styles.sidebarTitle}>Misión Calvario</h3>
                    <p style={styles.sidebarRol}>{usuario?.rol}</p>
                </div>
                <nav style={styles.nav}>
                    {getNavItems().map((item, index) => (
                        <Link key={index} to={item.ruta} style={styles.navItem}>
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <button onClick={handleLogout} style={styles.logoutButton}>
                    Cerrar Sesión
                </button>
            </div>

            {/* Main Content */}
            <div style={styles.main}>
                {children}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
    },
    sidebar: {
        width: "240px",
        backgroundColor: "#000000",
        display: "flex",
        flexDirection: "column",
        padding: "20px 0",
        position: "sticky",
        top: 0,
        height: "100vh",
        boxSizing: "border-box",
    },
    sidebarHeader: {
        padding: "0 20px 20px 20px",
        borderBottom: "1px solid #333",
    },
    sidebarTitle: {
        color: "#FF4000",
        fontSize: "16px",
        fontWeight: "bold",
        margin: "0 0 4px 0",
    },
    sidebarRol: {
        color: "#FFAA00",
        fontSize: "12px",
        margin: 0,
    },
    nav: {
        display: "flex",
        flexDirection: "column",
        padding: "20px 0",
        flex: 1,
    },
    navItem: {
        color: "#ffffff",
        textDecoration: "none",
        padding: "12px 20px",
        fontSize: "14px",
        transition: "background-color 0.2s",
    },
    logoutButton: {
        margin: "0 20px",
        padding: "10px",
        backgroundColor: "#FF2200",
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
    },
    main: {
        flex: 1,
        padding: "0",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
    },
};

export default Layout;
