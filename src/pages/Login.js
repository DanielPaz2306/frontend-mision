import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginService } from "../services/authService";

const Login = () => {
    
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try{
            const data = await loginService(username, password);
            login(data.token);
            navigate("/dashboard");
        }
        catch (err){
            setError("Usuario o contraseña incorrectos")
        }
        finally{
            setLoading(false);
        }
    };

    return(

                <div style={styles.container}>
                <div style={styles.card}>
                <h2 style={styles.title}>Misión Cristiana El Calvario</h2>
                <p style={styles.subtitle}>Iniciar Sesión</p>

                {error && <p style={styles.error}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            placeholder="Ingresa tu usuario"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="Ingresa tu contraseña"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        style={loading ? styles.buttonDisabled : styles.button}
                        disabled={loading}
                    >
                        {loading ? "Ingresando..." : "Ingresar"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000000",
    },
    card: {
        backgroundColor: "#ffffff",
        padding: "40px",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    },
    title: {
        textAlign: "center",
        color: "#FF4000",
        fontSize: "20px",
        fontWeight: "bold",
        marginBottom: "4px",
    },
    subtitle: {
        textAlign: "center",
        color: "#666",
        marginBottom: "24px",
        fontSize: "14px",
    },
    inputGroup: {
        marginBottom: "16px",
    },
    label: {
        display: "block",
        marginBottom: "6px",
        color: "#333",
        fontSize: "14px",
        fontWeight: "500",
    },
    input: {
        width: "100%",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "14px",
        outline: "none",
        boxSizing: "border-box",
    },
    button: {
        width: "100%",
        padding: "12px",
        backgroundColor: "#FF4000",
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        fontSize: "15px",
        fontWeight: "bold",
        cursor: "pointer",
        marginTop: "8px",
    },
    buttonDisabled: {
        width: "100%",
        padding: "12px",
        backgroundColor: "#ffaa00",
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        fontSize: "15px",
        fontWeight: "bold",
        cursor: "not-allowed",
        marginTop: "8px",
    },
    error: {
        color: "#FF2200",
        textAlign: "center",
        fontSize: "13px",
        marginBottom: "12px",
    },
};

export default Login;