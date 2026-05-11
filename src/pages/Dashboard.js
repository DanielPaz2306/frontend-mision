import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getDistritos, getIglesias, getPastores, getDiezmos, getDiezmosByPastor, getIglesiasByDistrito } from "../services/apiService";
import Layout from "../components/Layout";

const Dashboard = () => {

    const { usuario } = useAuth();
    const [conteos, setConteos] = useState({
        distritos: 0,
        iglesias: 0,
        pastores: 0,
        diezmos: 0,
    });

    useEffect(() => {
        const cargarConteos = async () => {
            try {
                if (usuario?.rol === "ADMIN") {
                    const [distritos, iglesias, pastores, diezmos] = await Promise.all([
                        getDistritos(),
                        getIglesias(),
                        getPastores(),
                        getDiezmos(),
                    ]);
                    setConteos({
                        distritos: Array.isArray(distritos) ? distritos.length : 0,
                        iglesias: Array.isArray(iglesias) ? iglesias.length : 0,
                        pastores: Array.isArray(pastores) ? pastores.length : 0,
                        diezmos: Array.isArray(diezmos) ? diezmos.length : 0,
                    });
                } else if (usuario?.rol === "AP") {
                    const [distritos, iglesias, pastores] = await Promise.all([
                        getDistritos(),
                        getIglesias(),
                        getPastores(),
                    ]);
                    setConteos({
                        distritos: Array.isArray(distritos) ? distritos.length : 0,
                        iglesias: Array.isArray(iglesias) ? iglesias.length : 0,
                        pastores: Array.isArray(pastores) ? pastores.length : 0,
                    });
                } else if (usuario?.rol === "PD" && usuario?.distritoId) {
                    const [iglesias, pastores] = await Promise.all([
                        getIglesiasByDistrito(usuario.distritoId),
                        getPastores(),
                    ]);
                    const pastoresDistrito = (Array.isArray(pastores) ? pastores : []).filter(
                        p => p.distritoId === usuario.distritoId || String(p.distritoId) === String(usuario.distritoId)
                    );
                    setConteos({
                        iglesias: Array.isArray(iglesias) ? iglesias.length : 0,
                        pastores: pastoresDistrito.length,
                    });
                } else if (usuario?.rol === "PASTOR" && usuario?.pastorId) {
                    const misDiezmos = await getDiezmosByPastor(usuario.pastorId);
                    const total = Array.isArray(misDiezmos) ? misDiezmos.reduce((acc, d) => acc + d.monto, 0) : 0;
                    setConteos({
                        diezmos: Array.isArray(misDiezmos) ? misDiezmos.length : 0,
                        totalDiezmos: total,
                    });
                }
            } catch (error) {
                console.error("Error cargando conteos:", error);
            }
        };

        cargarConteos();
    }, [usuario]);

    const getCards = () => {
        switch (usuario?.rol) {
            case "ADMIN":
                return [
                    { titulo: "Distritos", valor: conteos.distritos },
                    { titulo: "Iglesias", valor: conteos.iglesias },
                    { titulo: "Pastores", valor: conteos.pastores },
                    { titulo: "Diezmos", valor: conteos.diezmos },
                ];
            case "AP":
                return [
                    { titulo: "Distritos", valor: conteos.distritos },
                    { titulo: "Iglesias", valor: conteos.iglesias },
                    { titulo: "Pastores", valor: conteos.pastores },
                ];
            case "PD":
                return [
                    { titulo: "Iglesias de mi Distrito", valor: conteos.iglesias || 0 },
                    { titulo: "Pastores de mi Distrito", valor: conteos.pastores || 0 },
                ];
            case "PASTOR":
                return [
                    { titulo: "Mis Diezmos", valor: conteos.diezmos || 0 },
                    { titulo: "Total Aportado", valor: conteos.totalDiezmos != null ? new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(conteos.totalDiezmos) : 'Q0.00' },
                ];
            default:
                return [];
        }
    };

    return (
        <Layout>
            <div style={styles.mainContent}>
                <div style={styles.header}>
                    <h2 style={styles.headerTitle}>Dashboard</h2>
                    <span style={styles.userInfo}>👤 {usuario?.sub} — {usuario?.rol}</span>
                </div>

                <div style={styles.cardsContainer}>
                    {getCards().map((card, index) => (
                        <div key={index} style={styles.card}>
                            <h3 style={styles.cardTitle}>{card.titulo}</h3>
                            <p style={styles.cardNumber}>{card.valor}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

const styles = {
    mainContent: {
        padding: "30px",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
    },
    headerTitle: {
        color: "#333",
        margin: 0,
    },
    userInfo: {
        fontSize: "14px",
        color: "#666",
    },
    cardsContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        borderTop: "4px solid #FF4000",
    },
    cardTitle: {
        color: "#666",
        fontSize: "14px",
        fontWeight: "500",
        margin: "0 0 12px 0",
    },
    cardNumber: {
        color: "#333",
        fontSize: "32px",
        fontWeight: "bold",
        margin: 0,
    },
};

export default Dashboard;