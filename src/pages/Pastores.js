import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
    getPastores, 
    crearPastor, 
    actualizarPastor, 
    eliminarPastor, 
    getDistritos, 
    getIglesias 
} from "../services/apiService";
import Layout from "../components/Layout";

const Pastores = () => {

    const { usuario } = useAuth();
    const [pastores, setPastores] = useState([]);
    const [distritos, setDistritos] = useState([]);
    const [iglesias, setIglesias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalError, setModalError] = useState("");
    const [pastorEditando, setPastorEditando] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [soloPD, setSoloPD] = useState(false);
    const [form, setForm] = useState({
        nitPastor: "",
        nombre: "",
        apellido: "",
        celular: "",
        edad: "",
        esPastorDistrito: false,
        distritoId: "",
        iglesiaId: "",
    });

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [pastoresRes, distritosRes, iglesiasRes] = await Promise.all([
                getPastores(),
                getDistritos(),
                getIglesias(),
            ]);
            setPastores(Array.isArray(pastoresRes) ? pastoresRes : []);
            setDistritos(Array.isArray(distritosRes) ? distritosRes : []);
            setIglesias(Array.isArray(iglesiasRes) ? iglesiasRes : []);
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
        setPastorEditando(null);
        setForm({ 
            nitPastor: "", nombre: "", apellido: "", 
            celular: "", edad: "", esPastorDistrito: false, distritoId: "", iglesiaId: "" 
        });
        setModalError("");
        setModalOpen(true);
    };

    const abrirModalEditar = (pastor) => {
        setPastorEditando(pastor);
        setForm({
            nitPastor: pastor.nitPastor || "",
            nombre: pastor.nombre || "",
            apellido: pastor.apellido || "",
            celular: pastor.celular || "",
            edad: pastor.edad || "",
            esPastorDistrito: pastor.esPastorDistrito || false,
            distritoId: pastor.distritoId || "",
            iglesiaId: pastor.iglesiaId || "",
        });
        setModalError("");
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setModalError("");
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ 
            ...form, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };

    const handleGuardar = async () => {
        try {
            setModalError("");
            const payload = {
                nitPastor: form.nitPastor,
                nombre: form.nombre,
                apellido: form.apellido,
                celular: form.celular,
                edad: form.edad ? parseInt(form.edad) : 0,
                esPastorDistrito: form.esPastorDistrito,
                distrito: form.distritoId ? { id: parseInt(form.distritoId) } : null,
                iglesia: form.iglesiaId ? { id: parseInt(form.iglesiaId) } : null,
            };

            if (pastorEditando) {
                await actualizarPastor(pastorEditando.id, payload);
            } else {
                await crearPastor(payload);
            }
            cerrarModal();
            cargarDatos();
        } catch (err) {
            setModalError(err.response?.data?.mensaje || "Error al guardar el pastor");
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este pastor?")) return;
        try {
            await eliminarPastor(id);
            cargarDatos();
        } catch (err) {
            alert(err.response?.data?.mensaje || "Error al eliminar el pastor");
        }
    };

    const rol = usuario?.rol || '';
    const distritoIdUsuario = usuario?.distritoId || null;
    const esPD = rol === 'PD';

    const pastoresFiltrados = pastores.filter((p) => {
        if (esPD) {
            if (String(p.distritoId) !== String(distritoIdUsuario)) {
                return false;
            }
        }

        const busqueda = searchQuery.toLowerCase().trim();
        const terminos = busqueda.split(/\s+/).filter(Boolean);
        const nombreCompleto = `${p.nombre || ''} ${p.apellido || ''}`.toLowerCase();

        if (soloPD && !p.esPastorDistrito) return false;

        const matchNombre = terminos.length === 0 || terminos.every(term => nombreCompleto.includes(term));

        return (
            matchNombre ||
            (p.codigoPastor && p.codigoPastor.toLowerCase().includes(busqueda)) ||
            (p.nitPastor && p.nitPastor.toLowerCase().includes(busqueda))
        );
    });

    if (loading) return (
        <Layout>
            <p style={styles.loading}>Cargando pastores...</p>
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
                        <h2 style={styles.titulo}>Pastores</h2>
                        <p style={styles.subtitulo}>{pastoresFiltrados.length} pastores encontrados</p>
                    </div>
                    
                    <div style={styles.headerActions}>
                        <input 
                            type="text" 
                            placeholder="Buscar pastor..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />
                        {!esPD && (
                          <button
                            onClick={() => setSoloPD(!soloPD)}
                            style={{
                                ...styles.btnFiltroToggle,
                                backgroundColor: soloPD ? '#1976d2' : '#f4f6f9',
                                color: soloPD ? '#ffffff' : '#555',
                                border: soloPD ? '1px solid #1565c0' : '1px solid #e0e0e0',
                            }}
                          >
                            {soloPD ? '🟦 Solo PD' : '🟦 Pastor de Distrito'}
                          </button>
                        )}
                        {usuario?.rol === "ADMIN" && (
                            <button onClick={abrirModalCrear} style={styles.btnNuevo}>
                                + Nuevo Pastor
                            </button>
                        )}
                    </div>
                </div>

                {/* Cards */}
                <div style={styles.cardsContainer}>
                    {pastoresFiltrados.map((pastor) => (
                        <div key={pastor.id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <div style={styles.badgesContainer}>
                                    {pastor.codigoPastor && <span style={styles.codigo}>{pastor.codigoPastor}</span>}
                                    {pastor.esPastorDistrito && <span style={styles.badgePD}>Pastor Distrito</span>}
                                </div>
                                {usuario?.rol === "ADMIN" && (
                                    <div style={styles.cardActions}>
                                        <button onClick={() => abrirModalEditar(pastor)} style={styles.btnEditar}>
                                            Editar
                                        </button>
                                        <button onClick={() => handleEliminar(pastor.id)} style={styles.btnEliminar}>
                                            Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>

                            <h3 style={styles.nombre}>{pastor.nombre} {pastor.apellido}</h3>

                            <div style={styles.cardInfo}>
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>NIT</span>
                                    <span style={styles.infoValor}>{pastor.nitPastor || "—"}</span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>Celular</span>
                                    <span style={styles.infoValor}>{pastor.celular || "—"}</span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>Distrito Asignado</span>
                                    <span style={styles.badge}>{pastor.distrito?.nombreDistrito || pastor.codigoDistrito || "Sin asignar"}</span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>Iglesia</span>
                                    <span style={styles.badge}>{pastor.iglesia?.nombreIglesia || pastor.codigoIglesia || "Sin asignar"}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {modalOpen && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <div style={styles.modalHeader}>
                                <h3 style={styles.modalTitulo}>
                                    {pastorEditando ? "Editar Pastor" : "Nuevo Pastor"}
                                </h3>
                                <button onClick={cerrarModal} style={styles.btnCerrar}>✕</button>
                            </div>

                            {modalError && <p style={styles.modalError}>{modalError}</p>}

                            <div style={{display: 'flex', gap: '10px'}}>
                                <div style={{...styles.inputGroup, flex: 1}}>
                                    <label style={styles.label}>NIT</label>
                                    <input
                                        name="nitPastor"
                                        value={form.nitPastor}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="Ej: 12345678"
                                        maxLength="8"
                                    />
                                </div>
                            </div>

                            <div style={{display: 'flex', gap: '10px'}}>
                                <div style={{...styles.inputGroup, flex: 1}}>
                                    <label style={styles.label}>Nombres</label>
                                    <input
                                        name="nombre"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="Ej: Juan"
                                    />
                                </div>
                                <div style={{...styles.inputGroup, flex: 1}}>
                                    <label style={styles.label}>Apellidos</label>
                                    <input
                                        name="apellido"
                                        value={form.apellido}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="Ej: Pérez"
                                    />
                                </div>
                            </div>

                            <div style={{display: 'flex', gap: '10px'}}>
                                <div style={{...styles.inputGroup, flex: 1}}>
                                    <label style={styles.label}>Celular</label>
                                    <input
                                        name="celular"
                                        value={form.celular}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="Ej: +502 12345678"
                                        maxLength="15"
                                    />
                                </div>
                                <div style={{...styles.inputGroup, flex: 1}}>
                                    <label style={styles.label}>Edad</label>
                                    <input
                                        type="number"
                                        name="edad"
                                        value={form.edad}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="Ej: 45"
                                    />
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Distrito Asignado</label>
                                <select
                                    name="distritoId"
                                    onChange={handleChange}
                                    style={styles.input}
                                    value={form.distritoId}
                                >
                                    <option value="">Sin asignar</option>
                                    {distritos.map((distrito) => (
                                        <option key={distrito.id} value={distrito.id}>
                                            {distrito.nombreDistrito}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Iglesia Asignada</label>
                                <select
                                    name="iglesiaId"
                                    onChange={handleChange}
                                    style={styles.input}
                                    value={form.iglesiaId}
                                >
                                    <option value="">Sin asignar</option>
                                    {iglesias
                                        .filter(ig => !form.distritoId || ig.codigoDistrito === distritos.find(d => d.id === parseInt(form.distritoId))?.codigoDistrito)
                                        .map((iglesia) => (
                                        <option key={iglesia.id} value={iglesia.id}>
                                            {iglesia.nombreIglesia}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{...styles.inputGroup, display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <input
                                    type="checkbox"
                                    name="esPastorDistrito"
                                    checked={form.esPastorDistrito}
                                    onChange={handleChange}
                                    style={{width: '18px', height: '18px'}}
                                />
                                <label style={{...styles.label, marginBottom: 0}}>Es Pastor de Distrito</label>
                            </div>

                            <div style={styles.modalButtons}>
                                <button onClick={cerrarModal} style={styles.btnCancelar}>
                                    Cancelar
                                </button>
                                <button onClick={handleGuardar} style={styles.btnGuardar}>
                                    {pastorEditando ? "Actualizar" : "Guardar"}
                                </button>
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
    btnFiltroToggle: {
        borderRadius: "8px",
        padding: "10px 16px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s",
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
    badgesContainer: {
        display: "flex",
        gap: "8px",
        alignItems: "center",
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
    badgePD: {
        backgroundColor: "#e3f2fd",
        color: "#1976d2",
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
        maxWidth: "150px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
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
        maxWidth: "480px",
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

export default Pastores;
