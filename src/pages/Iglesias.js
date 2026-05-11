import React, { useState, useEffect, useCallback } from 'react';
import {
  getIglesias,
  getIglesiasByDistrito,
  createIglesia,
  updateIglesia,
  deleteIglesia,
  getDistritos,
  getPastoresSinIglesia,
  getPastores,
} from '../services/apiService';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const estilos = {
  contenedor: {
    padding: '2rem',
    fontFamily: "'Inter', sans-serif",
  },
  encabezado: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  titulo: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#000',
    margin: 0,
  },
  botonPrimario: {
    backgroundColor: '#FF4000',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.55rem 1.2rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  botonSecundario: {
    backgroundColor: '#fff',
    color: '#000',
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '0.55rem 1.2rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  botonPeligro: {
    backgroundColor: '#FF2200',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.4rem 0.9rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '600',
    fontSize: '0.82rem',
    cursor: 'pointer',
  },
  botonEditar: {
    backgroundColor: '#FFAA00',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    padding: '0.4rem 0.9rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '600',
    fontSize: '0.82rem',
    cursor: 'pointer',
  },
  filtros: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  inputFiltro: {
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '0.5rem 0.8rem',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    minWidth: '200px',
    outline: 'none',
  },
  selectFiltro: {
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '0.5rem 0.8rem',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    minWidth: '200px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    outline: 'none',
  },
  gridCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.25rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    borderLeft: '4px solid #FF4000',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    padding: '1.1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  cardCabecera: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.25rem',
  },
  cardCodigo: {
    fontSize: '0.78rem',
    color: '#888',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  cardNombre: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#000',
    margin: '0.1rem 0 0.3rem',
  },
  cardFila: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#333',
  },
  cardEtiqueta: {
    color: '#888',
    fontWeight: '500',
    minWidth: '60px',
    fontSize: '0.8rem',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#f0f0f0',
    color: '#444',
    borderRadius: '4px',
    padding: '0.15rem 0.55rem',
    fontSize: '0.78rem',
    fontWeight: '600',
  },
  badgeSin: {
    display: 'inline-block',
    backgroundColor: '#fff3e0',
    color: '#e65100',
    borderRadius: '4px',
    padding: '0.15rem 0.55rem',
    fontSize: '0.78rem',
    fontWeight: '600',
  },
  cardAcciones: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '2rem',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  },
  modalTitulo: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#000',
    marginBottom: '1.25rem',
  },
  grupo: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '0.3rem',
  },
  input: {
    width: '100%',
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '0.55rem 0.8rem',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    outline: 'none',
  },
  select: {
    width: '100%',
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '0.55rem 0.8rem',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    cursor: 'pointer',
    outline: 'none',
  },
  error: {
    backgroundColor: '#fff0ee',
    border: '1px solid #FF2200',
    color: '#c00',
    borderRadius: '6px',
    padding: '0.6rem 0.9rem',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  modalAcciones: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  vacio: {
    textAlign: 'center',
    color: '#888',
    padding: '3rem 0',
    fontSize: '0.95rem',
  },
  cargando: {
    textAlign: 'center',
    color: '#888',
    padding: '3rem 0',
    fontSize: '0.95rem',
  },
  infoFiltro: {
    fontSize: '0.85rem',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  botonLimpiar: {
    background: 'none',
    border: 'none',
    color: '#FF4000',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0,
  },
};

const FORM_INICIAL = {
  nombreIglesia: '',
  distritoId: '',
  pastorId: '',
};

export default function Iglesias() {
  const { usuario } = useAuth();
  const rol = usuario?.rol || '';
  const pastorIdUsuario = usuario?.pastorId || null;
  const distritoIdUsuario = usuario?.distritoId || null;

  const esAdmin = rol === 'ADMIN';
  // const esAP = rol === 'AP'; // Unused variable
  const esPD = rol === 'PD';
  const esPastor = rol === 'PASTOR';

  const puedeCrear = esAdmin;
  const puedeEditar = esAdmin;
  const puedeEliminar = esAdmin;

  const [iglesias, setIglesias] = useState([]);
  const [distritos, setDistritos] = useState([]);
  const [pastoresDisponibles, setPastoresDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [filtroPastor, setFiltroPastor] = useState('');
  const [filtroDistrito, setFiltroDistrito] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [iglesiaEditando, setIglesiaEditando] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [errorModal, setErrorModal] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [modalEliminar, setModalEliminar] = useState(false);
  const [iglesiaAEliminar, setIglesiaAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cargarIglesias = useCallback(async () => {
    setCargando(true);
    try {
      let data;
      if (esPD && distritoIdUsuario) {
        data = await getIglesiasByDistrito(distritoIdUsuario);
      } else if (esPastor && pastorIdUsuario) {
        const todas = await getIglesias();
        // Filtrar iglesias cuyo pastor asignado coincida (suponiendo que la entidad devuelve la relación)
        // O si backend ya devuelve el codigoPastor en getIglesias
        data = todas.filter(ig => 
           (ig.codigoPastor && ig.codigoPastor === usuario?.codigoPastor) || 
           (ig.pastorId && ig.pastorId === pastorIdUsuario)
        );
      } else {
        // ADMIN y AP ven todas
        data = await getIglesias();
      }
      setIglesias(Array.isArray(data) ? data : []);
    } catch (e) {
      setIglesias([]);
    }
    setCargando(false);
  }, [esPD, esPastor, pastorIdUsuario, distritoIdUsuario, usuario?.codigoPastor]);

  const cargarDistritos = useCallback(async () => {
    try {
      const data = await getDistritos();
      setDistritos(Array.isArray(data) ? data : []);
    } catch (e) {
      setDistritos([]);
    }
  }, []);

  const cargarPastoresDisponibles = useCallback(async (iglesiaActualId = null) => {
    try {
      // Pastores sin iglesia
      let sinIglesia = [];
      try { sinIglesia = await getPastoresSinIglesia(); } catch (e) { sinIglesia = []; }

      // Si estamos editando, también incluir el pastor actual de esa iglesia
      if (iglesiaActualId) {
        const iglActual = iglesias.find((ig) => ig.id === iglesiaActualId);
        if (iglActual && iglActual.codigoPastor) {
          // Buscar ese pastor en la lista completa
          try {
            const todos = await getPastores();
            const pastorActual = todos.find(
              (p) => p.codigoPastor === iglActual.codigoPastor
            );
            if (
              pastorActual &&
              !sinIglesia.find((p) => p.id === pastorActual.id)
            ) {
              sinIglesia = [pastorActual, ...sinIglesia];
            }
          } catch (e) {}
        }
      }

      setPastoresDisponibles(Array.isArray(sinIglesia) ? sinIglesia : []);
    } catch (e) {
      setPastoresDisponibles([]);
    }
  }, [iglesias]);

  useEffect(() => {
    cargarIglesias();
    cargarDistritos();
  }, [cargarIglesias, cargarDistritos]);

  // Filtrado local
  const iglesiasFiltradas = iglesias.filter((ig) => {
    const matchDistrito =
      filtroDistrito === '' ||
      String(ig.codigoDistrito) === filtroDistrito ||
      ig.nombreDistrito === filtroDistrito;

    const busqueda = filtroPastor.toLowerCase().trim();
    const terminos = busqueda.split(/\s+/).filter(Boolean);
    const matchNombrePastor = terminos.length === 0 || 
      (ig.nombrePastor && terminos.every(term => ig.nombrePastor.toLowerCase().includes(term)));

    const matchPastor =
      matchNombrePastor ||
      (ig.codigoPastor && ig.codigoPastor.toLowerCase().includes(busqueda));

    return matchDistrito && matchPastor;
  });

  const abrirCrear = async () => {
    setModoEdicion(false);
    setIglesiaEditando(null);
    setForm(FORM_INICIAL);
    setErrorModal('');
    await cargarPastoresDisponibles(null);
    setModalAbierto(true);
  };

  const abrirEditar = async (iglesia) => {
    setModoEdicion(true);
    setIglesiaEditando(iglesia);
    setErrorModal('');

    // Cargar pastores disponibles incluyendo el actual
    await cargarPastoresDisponibles(iglesia.id);

    // Encontrar IDs para el form
    const distrito = distritos.find(
      (d) =>
        d.codigoDistrito === iglesia.codigoDistrito ||
        d.nombreDistrito === iglesia.nombreDistrito
    );

    // Para el pastor, buscamos en pastoresDisponibles después de cargar
    // Usamos un timeout mínimo para que el estado se actualice
    setForm({
      nombreIglesia: iglesia.nombreIglesia || '',
      distritoId: distrito ? String(distrito.id) : '',
      pastorId: '', // se resuelve abajo
    });

    // Buscar pastorId desde codigoPastor
    try {
      const todos = await getPastores();
      const pastorActual = todos.find(
        (p) => p.codigoPastor === iglesia.codigoPastor
      );
      setForm((prev) => ({
        ...prev,
        pastorId: pastorActual ? String(pastorActual.id) : '',
      }));
    } catch (e) {}

    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setErrorModal('');
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const guardar = async () => {
    setErrorModal('');
    if (!form.nombreIglesia.trim()) {
      setErrorModal('El nombre de la iglesia es obligatorio.');
      return;
    }
    if (!form.distritoId) {
      setErrorModal('Debe seleccionar un distrito.');
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        nombreIglesia: form.nombreIglesia.trim(),
        distritoId: form.distritoId ? parseInt(form.distritoId, 10) : null,
        pastorId: form.pastorId ? parseInt(form.pastorId, 10) : null,
      };

      if (modoEdicion) {
        await updateIglesia(iglesiaEditando.id, payload);
      } else {
        await createIglesia(payload);
      }
      cerrarModal();
      await cargarIglesias();
    } catch (e) {
      const msg =
        e?.response?.data?.mensaje ||
        e?.response?.data?.message ||
        e?.message ||
        'Error al guardar la iglesia.';
      setErrorModal(msg);
    }
    setGuardando(false);
  };

  const confirmarEliminar = (iglesia) => {
    setIglesiaAEliminar(iglesia);
    setModalEliminar(true);
  };

  const ejecutarEliminar = async () => {
    setEliminando(true);
    try {
      await deleteIglesia(iglesiaAEliminar.id);
      setModalEliminar(false);
      setIglesiaAEliminar(null);
      await cargarIglesias();
    } catch (e) {
      const msg =
        e?.response?.data?.mensaje ||
        e?.response?.data?.message ||
        e?.message ||
        'Error al eliminar la iglesia.';
      alert(msg);
    }
    setEliminando(false);
  };

  const limpiarFiltros = () => {
    setFiltroPastor('');
    setFiltroDistrito('');
  };

  const hayFiltros = filtroPastor !== '' || filtroDistrito !== '';

  // Pastores filtrados por distrito seleccionado en el form
  const pastoresFiltradosPorDistrito = pastoresDisponibles.filter((p) => {
    if (!form.distritoId) return true;
    return (
      p.codigoDistrito === distritos.find((d) => String(d.id) === form.distritoId)?.codigoDistrito ||
      p.nombreDistrito === distritos.find((d) => String(d.id) === form.distritoId)?.nombreDistrito
    );
  });

  return (
    <Layout>
      <div style={estilos.contenedor}>
        {/* Encabezado */}
        <div style={estilos.encabezado}>
        <h1 style={estilos.titulo}>Iglesias</h1>
        {puedeCrear && (
          <button style={estilos.botonPrimario} onClick={abrirCrear}>
            + Nueva Iglesia
          </button>
        )}
      </div>

      {/* Filtros */}
      <div style={estilos.filtros}>
        {/* Filtro por distrito — no mostrar a PASTOR ni PD */}
        {!esPastor && !esPD && (
          <select
            style={estilos.selectFiltro}
            value={filtroDistrito}
            onChange={(e) => setFiltroDistrito(e.target.value)}
          >
            <option value="">
              {esPD ? 'Mi Distrito' : 'Todos los distritos'}
            </option>
            {distritos.map((d) => (
              <option key={d.id} value={d.codigoDistrito}>
                {d.nombreDistrito}
              </option>
            ))}
          </select>
        )}

        {/* Búsqueda por pastor */}
        <input
          style={estilos.inputFiltro}
          type="text"
          placeholder="Buscar por pastor..."
          value={filtroPastor}
          onChange={(e) => setFiltroPastor(e.target.value)}
        />

        {hayFiltros && (
          <button style={estilos.botonLimpiar} onClick={limpiarFiltros}>
            ✕ Limpiar filtros
          </button>
        )}

        <span style={estilos.infoFiltro}>
          {iglesiasFiltradas.length}{' '}
          {iglesiasFiltradas.length === 1 ? 'iglesia' : 'iglesias'}
          {hayFiltros && ' (filtradas)'}
        </span>
      </div>

      {/* Contenido */}
      {cargando ? (
        <p style={estilos.cargando}>Cargando iglesias...</p>
      ) : iglesiasFiltradas.length === 0 ? (
        <p style={estilos.vacio}>
          {hayFiltros
            ? 'No se encontraron iglesias con los filtros aplicados.'
            : 'No hay iglesias registradas.'}
        </p>
      ) : (
        <div style={estilos.gridCards}>
          {iglesiasFiltradas.map((ig) => (
            <div key={ig.id} style={estilos.card}>
              <div style={estilos.cardCabecera}>
                <span style={estilos.cardCodigo}>
                  {ig.codigoIglesia || '—'}
                </span>
              </div>

              <p style={estilos.cardNombre}>{ig.nombreIglesia}</p>

              <div style={estilos.cardFila}>
                <span style={estilos.cardEtiqueta}>Distrito</span>
                {ig.nombreDistrito ? (
                  <span style={estilos.badge}>{ig.nombreDistrito}</span>
                ) : (
                  <span style={estilos.badgeSin}>Sin distrito</span>
                )}
              </div>

              <div style={estilos.cardFila}>
                <span style={estilos.cardEtiqueta}>Pastor</span>
                {ig.nombrePastor ? (
                  <span style={{ fontSize: '0.875rem', color: '#222' }}>
                    {ig.nombrePastor}
                    {ig.celularPastor && (
                      <span style={{ color: '#888', marginLeft: '6px' }}>
                        · {ig.celularPastor}
                      </span>
                    )}
                  </span>
                ) : (
                  <span style={estilos.badgeSin}>Sin pastor</span>
                )}
              </div>

              {(puedeEditar || puedeEliminar) && (
                <div style={estilos.cardAcciones}>
                  {puedeEditar && (
                    <button
                      style={estilos.botonEditar}
                      onClick={() => abrirEditar(ig)}
                    >
                      Editar
                    </button>
                  )}
                  {puedeEliminar && (
                    <button
                      style={estilos.botonPeligro}
                      onClick={() => confirmarEliminar(ig)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar */}
      {modalAbierto && (
        <div style={estilos.overlay}>
          <div style={estilos.modal}>
            <h2 style={estilos.modalTitulo}>
              {modoEdicion ? 'Editar Iglesia' : 'Nueva Iglesia'}
            </h2>

            {errorModal && <div style={estilos.error}>{errorModal}</div>}

            <div style={estilos.grupo}>
              <label style={estilos.label}>
                Nombre de Iglesia <span style={{ color: '#FF2200' }}>*</span>
              </label>
              <input
                style={estilos.input}
                name="nombreIglesia"
                value={form.nombreIglesia}
                onChange={manejarCambio}
                placeholder="Nombre de la iglesia"
              />
            </div>

            <div style={estilos.grupo}>
              <label style={estilos.label}>
                Distrito <span style={{ color: '#FF2200' }}>*</span>
              </label>
              <select
                style={estilos.select}
                name="distritoId"
                value={form.distritoId}
                onChange={(e) => {
                  manejarCambio(e);
                  setForm((prev) => ({ ...prev, pastorId: '' }));
                }}
              >
                <option value="">— Seleccione un distrito —</option>
                {distritos.map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.nombreDistrito} ({d.codigoDistrito})
                  </option>
                ))}
              </select>
            </div>

            <div style={estilos.grupo}>
              <label style={estilos.label}>Pastor Asignado</label>
              <select
                style={estilos.select}
                name="pastorId"
                value={form.pastorId}
                onChange={manejarCambio}
                disabled={!form.distritoId}
              >
                <option value="">— Sin pastor —</option>
                {pastoresFiltradosPorDistrito.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.nombre} {p.apellido}
                    {p.codigoPastor ? ` (${p.codigoPastor})` : ''}
                  </option>
                ))}
              </select>
              {!form.distritoId && (
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: '#888',
                    margin: '0.3rem 0 0',
                  }}
                >
                  Seleccione un distrito primero para ver los pastores disponibles.
                </p>
              )}
            </div>

            <div style={estilos.modalAcciones}>
              <button
                style={estilos.botonSecundario}
                onClick={cerrarModal}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                style={estilos.botonPrimario}
                onClick={guardar}
                disabled={guardando}
              >
                {guardando
                  ? 'Guardando...'
                  : modoEdicion
                  ? 'Guardar Cambios'
                  : 'Crear Iglesia'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {modalEliminar && iglesiaAEliminar && (
        <div style={estilos.overlay}>
          <div style={{ ...estilos.modal, maxWidth: '400px' }}>
            <h2 style={estilos.modalTitulo}>Confirmar Eliminación</h2>
            <p style={{ fontSize: '0.95rem', color: '#333', marginBottom: '0.5rem' }}>
              ¿Estás seguro de que deseas eliminar la iglesia{' '}
              <strong>{iglesiaAEliminar.nombreIglesia}</strong>?
            </p>
            <p style={{ fontSize: '0.85rem', color: '#888' }}>
              Esta acción no se puede deshacer. Si la iglesia tiene un pastor
              asignado, quedará desvinculado.
            </p>
            <div style={estilos.modalAcciones}>
              <button
                style={estilos.botonSecundario}
                onClick={() => setModalEliminar(false)}
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button
                style={estilos.botonPeligro}
                onClick={ejecutarEliminar}
                disabled={eliminando}
              >
                {eliminando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}


