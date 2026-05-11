import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getDistritos, crearDistrito, actualizarDistrito, eliminarDistrito, getPastores } from "../services/apiService";
import Layout from "../components/Layout";


const Distritos = () => {

    const { usuario } = useAuth();
    const [distritos, setDistritos] = useState([]);
    const [pastores, setPastores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalError, setModalError] = useState("");
    const [distritoEditando, setDistritoEditando] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [modalVerPastoresOpen, setModalVerPastoresOpen] = useState(false);
    const [distritoSeleccionado, setDistritoSeleccionado] = useState(null);
    const [form, setForm] = useState({
        nombreDistrito: "",
        pastorDistrito: null,
    });

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [distritosRes, pastoresRes] = await Promise.all([
                getDistritos(),
                getPastores(),
            ]);
            setDistritos(distritosRes);
            setPastores(pastoresRes);
        } catch (err) {
            setError("Error al cargar los datos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const abrirModalCrear = () => {
        setDistritoEditando(null);
        setForm({ nombreDistrito: "", pastorDistrito: null });
        setModalError("");
        setModalOpen(true);
    };

    const abrirModalEditar = (distrito) => {
        setDistritoEditando(distrito);
        setForm({
            nombreDistrito: distrito.nombreDistrito,
            pastorDistrito: distrito.pastorDistritoId
                ? { id: distrito.pastorDistritoId }
                : null,
        });
        setModalError("");
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setModalError("");
    };

    const abrirModalVerPastores = (distrito) => {
        setDistritoSeleccionado(distrito);
        setModalVerPastoresOpen(true);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePastorChange = (e) => {
    const id = e.target.value;
    console.log("Pastor seleccionado id:", id);
    setForm({
        ...form,
        pastorDistrito: id ? { id: parseInt(id) } : null,
    });
};

const handleGuardar = async () => {
    try {
        setModalError("");
        const payload = {
            nombreDistrito: form.nombreDistrito,
            pastorDistrito: form.pastorDistrito?.id ? { id: form.pastorDistrito.id } : null,
        };
        if (distritoEditando) {
            await actualizarDistrito(distritoEditando.id, payload);
        } else {
            await crearDistrito(payload);
        }
        cerrarModal();
        cargarDatos();
    } catch (err) {
        setModalError(err.response?.data?.mensaje || "Error al guardar el distrito");
    }
};

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este distrito?")) return;
        try {
            await eliminarDistrito(id);
            cargarDatos();
        } catch (err) {
            alert(err.response?.data?.mensaje || "Error al eliminar el distrito");
        }
    };

    // Al editar: mostrar solo pastores que pertenecen a ESE distrito.
    // Al crear: no hay pastores aún en el distrito nuevo, así que lista vacía.
    const pastoresDisponibles = distritoEditando
        ? pastores.filter(p =>
            p.distritoId === distritoEditando.id
          )
        : [];

    const distritosFiltrados = distritos.filter((d) => 
        d.nombreDistrito.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.codigoDistrito.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <Layout>
            <p style={styles.loading}>Cargando distritos...</p>
        </Layout>
    );
    if (error) return (
        <Layout>
            <p style={styles.errorMsg}>{error}</p>
        </Layout>
    );


    return (
        <Layout>
            <div style={styles.mainContent}>
                {/* Header */}
                
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.titulo}>Distritos</h2>
                        <p style={styles.subtitulo}>{distritosFiltrados.length} distritos encontrados</p>
                    </div>
                    
                    <div style={styles.headerActions}>
                        <input 
                            type="text" 
                            placeholder="Buscar distrito..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />
                        {usuario?.rol === "ADMIN" && (
                            <button onClick={abrirModalCrear} style={styles.btnNuevo}>
                                + Nuevo Distrito
                            </button>
                        )}
                    </div>
                </div>

                {/* Cards */}
                <div style={styles.cardsContainer}>
                    {distritosFiltrados.map((distrito) => (
                        <div key={distrito.id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <span style={styles.codigo}>{distrito.codigoDistrito}</span>
                            {usuario?.rol === "ADMIN" && (
                                <div style={styles.cardActions}>
                                    <button onClick={() => abrirModalEditar(distrito)} style={styles.btnEditar}>
                                        Editar
                                    </button>
                                    <button onClick={() => handleEliminar(distrito.id)} style={styles.btnEliminar}>
                                        Eliminar
                                    </button>
                                </div>
                            )}
                        </div>

                        <h3 style={styles.nombre}>{distrito.nombreDistrito}</h3>

                        <div style={styles.cardInfo}>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Pastor de Distrito</span>
                                <span style={styles.infoValor}>
                                    {distrito.nombrePastorDistrito || "Sin asignar"}
                                </span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Total Pastores</span>
                                <span style={styles.badge}>{distrito.totalPastores}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Total Iglesias</span>
                                <span style={styles.badge}>{distrito.totalIglesias}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => abrirModalVerPastores(distrito)} 
                            style={styles.btnSecundario}
                        >
                            Ver Pastores del Distrito
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitulo}>
                                {distritoEditando ? "Editar Distrito" : "Nuevo Distrito"}
                            </h3>
                            <button onClick={cerrarModal} style={styles.btnCerrar}>✕</button>
                        </div>

                        {modalError && <p style={styles.modalError}>{modalError}</p>}

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Nombre</label>
                            <input
                                name="nombreDistrito"
                                value={form.nombreDistrito}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="Ej: Distrito Central"
                            />
                        </div>

                        {distritoEditando ? (
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Pastor de Distrito</label>
                                {pastoresDisponibles.length > 0 ? (
                                    <select
                                        onChange={handlePastorChange}
                                        style={styles.input}
                                        value={form.pastorDistrito?.id?.toString() || ""}
                                    >
                                        <option value="">Sin asignar</option>
                                        {pastoresDisponibles.map((pastor) => (
                                            <option key={pastor.id} value={pastor.id}>
                                                {pastor.nombre} {pastor.apellido} — {pastor.codigoPastor || "Sin código"}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p style={{ fontSize: '13px', color: '#888', margin: '6px 0 0 0' }}>
                                        Este distrito aún no tiene pastores asignados. Agrega pastores al distrito primero.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div style={{ ...styles.inputGroup, backgroundColor: '#f9f9f9', borderRadius: '8px', padding: '12px', border: '1px solid #eee' }}>
                                <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                                    💡 El Pastor de Distrito se puede asignar una vez que el distrito haya sido creado y tenga pastores.
                                </p>
                            </div>
                        )}

                        <div style={styles.modalButtons}>
                            <button onClick={cerrarModal} style={styles.btnCancelar}>
                                Cancelar
                            </button>
                            <button onClick={handleGuardar} style={styles.btnGuardar}>
                                {distritoEditando ? "Actualizar" : "Guardar"}
                            </button>
                        </div>
                        </div>
                    </div>
                )}

                {/* Modal Ver Pastores */}
                {modalVerPastoresOpen && distritoSeleccionado && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <div style={styles.modalHeader}>
                                <h3 style={styles.modalTitulo}>
                                    Pastores en {distritoSeleccionado.nombreDistrito}
                                </h3>
                                <button onClick={() => setModalVerPastoresOpen(false)} style={styles.btnCerrar}>✕</button>
                            </div>
                            
                            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                                {pastores.filter(p => p.distritoId === distritoSeleccionado.id).length > 0 ? (
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {pastores.filter(p => p.distritoId === distritoSeleccionado.id).map(p => (
                                            <li key={p.id} style={{ padding: '12px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '15px' }}>{p.nombre} {p.apellido}</div>
                                                    <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>{p.codigoPastor} • Cel: {p.celular || 'N/A'}</div>
                                                </div>
                                                {p.esPastorDistrito && <span style={styles.badgePD}>PD</span>}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No hay pastores asignados a este distrito.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

const styles = {
    mainContent: {
        padding: "32px",
        fontFamily: "'Inter', sans-serif",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "28px",
    },
    titulo: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#1a1a2e",
        margin: "0 0 4px 0",
    },
    subtitulo: {
        fontSize: "13px",
        color: "#888",
        margin: 0,
    },
    headerActions: {
        display: "flex",
        gap: "16px",
        alignItems: "center",
    },
    searchInput: {
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        fontSize: "14px",
        width: "250px",
        outline: "none",
    },
    btnNuevo: {
        backgroundColor: "#FF4000",
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        letterSpacing: "0.3px",
    },
    cardsContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "20px",
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "22px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        borderLeft: "4px solid #FF4000",
        transition: "box-shadow 0.2s",
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
    },
    codigo: {
        backgroundColor: "#fff3f0",
        color: "#FF4000",
        borderRadius: "6px",
        padding: "3px 10px",
        fontSize: "12px",
        fontWeight: "700",
        letterSpacing: "0.5px",
    },
    cardActions: {
        display: "flex",
        gap: "8px",
    },
    btnEditar: {
        backgroundColor: "#FFAA00",
        color: "#ffffff",
        border: "none",
        borderRadius: "6px",
        padding: "5px 12px",
        fontSize: "12px",
        cursor: "pointer",
        fontWeight: "600",
    },
    btnEliminar: {
        backgroundColor: "#FF2200",
        color: "#ffffff",
        border: "none",
        borderRadius: "6px",
        padding: "5px 12px",
        fontSize: "12px",
        cursor: "pointer",
        fontWeight: "600",
    },
    nombre: {
        color: "#1a1a2e",
        fontSize: "17px",
        fontWeight: "600",
        margin: "0 0 16px 0",
    },
    cardInfo: {
        borderTop: "1px solid #f5f5f5",
        paddingTop: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    infoRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    infoLabel: {
        fontSize: "13px",
        color: "#888",
        fontWeight: "500",
    },
    infoValor: {
        fontSize: "13px",
        color: "#1a1a2e",
        fontWeight: "600",
    },
    badge: {
        backgroundColor: "#f4f6f9",
        color: "#1a1a2e",
        borderRadius: "20px",
        padding: "2px 10px",
        fontSize: "13px",
        fontWeight: "700",
    },
    badgePD: {
        backgroundColor: "#e3f2fd",
        color: "#1976d2",
        borderRadius: "6px",
        padding: "3px 10px",
        fontSize: "12px",
        fontWeight: "700",
        letterSpacing: "0.5px",
    },
    btnSecundario: {
        width: "100%",
        marginTop: "16px",
        backgroundColor: "#fff3f0",
        color: "#FF4000",
        border: "1px solid #ffccbc",
        borderRadius: "8px",
        padding: "10px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "background-color 0.2s",
    },
    loading: {
        textAlign: "center",
        color: "#888",
        padding: "60px",
        fontSize: "15px",
    },
    errorMsg: {
        textAlign: "center",
        color: "#FF2200",
        padding: "60px",
        fontSize: "15px",
    },
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },
    modal: {
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "30px",
        width: "100%",
        maxWidth: "440px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    },
    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
    },
    modalTitulo: {
        color: "#1a1a2e",
        fontSize: "18px",
        fontWeight: "700",
        margin: 0,
    },
    btnCerrar: {
        background: "none",
        border: "none",
        fontSize: "18px",
        cursor: "pointer",
        color: "#888",
    },
    modalError: {
        color: "#FF2200",
        fontSize: "13px",
        marginBottom: "16px",
        backgroundColor: "#fff3f0",
        padding: "10px",
        borderRadius: "6px",
    },
    inputGroup: {
        marginBottom: "16px",
    },
    label: {
        display: "block",
        marginBottom: "6px",
        color: "#555",
        fontSize: "13px",
        fontWeight: "600",
    },
    input: {
        width: "100%",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        fontSize: "14px",
        boxSizing: "border-box",
        color: "#1a1a2e",
        outline: "none",
    },
    modalButtons: {
        display: "flex",
        gap: "12px",
        marginTop: "24px",
    },
    btnCancelar: {
        flex: 1,
        padding: "11px",
        backgroundColor: "#f4f6f9",
        color: "#555",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
    },
    btnGuardar: {
        flex: 1,
        padding: "11px",
        backgroundColor: "#FF4000",
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "700",
        cursor: "pointer",
    },
};

export default Distritos;