import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getDiezmos,
  getDistritos,
  getIglesias,
  getPastores,
  actualizarDiezmo
} from '../services/apiService';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const meses = [
  { id: 1, nombre: 'Enero' }, { id: 2, nombre: 'Febrero' },
  { id: 3, nombre: 'Marzo' }, { id: 4, nombre: 'Abril' },
  { id: 5, nombre: 'Mayo' }, { id: 6, nombre: 'Junio' },
  { id: 7, nombre: 'Julio' }, { id: 8, nombre: 'Agosto' },
  { id: 9, nombre: 'Septiembre' }, { id: 10, nombre: 'Octubre' },
  { id: 11, nombre: 'Noviembre' }, { id: 12, nombre: 'Diciembre' },
];

const CUENTAS_BANCARIAS = [
  { banco: 'GyT Continental', numeroCuenta: '229983746' },
  { banco: 'Banco Industrial', numeroCuenta: '1182383929' },
  { banco: 'Banrural', numeroCuenta: '1214151515' },
];

const nombreMes = (numMes) => {
  const m = meses.find(x => x.id === numMes);
  return m ? m.nombre : numMes;
};

const formatMoneda = (valor) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(valor);

export default function Diezmos() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const esAdmin = usuario?.rol === 'ADMIN';

  const [diezmos, setDiezmos] = useState([]);
  const [distritos, setDistritos] = useState([]);
  const [iglesias, setIglesias] = useState([]);
  const [pastores, setPastores] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [filtroDistrito, setFiltroDistrito] = useState('');
  const [filtroIglesia, setFiltroIglesia] = useState('');
  const [filtroPastor, setFiltroPastor] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear().toString());
  const [filtroBanco, setFiltroBanco] = useState('');
  const [vistaVerificacion, setVistaVerificacion] = useState('pendientes'); // 'pendientes' | 'verificados'

  // Modal editar
  const [modalEditar, setModalEditar] = useState(false);
  const [diezmoEditando, setDiezmoEditando] = useState(null);
  const [formEditar, setFormEditar] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [dataDiezmos, dataDistritos, dataIglesias, dataPastores] = await Promise.all([
        getDiezmos(), getDistritos(), getIglesias(), getPastores()
      ]);
      setDiezmos(Array.isArray(dataDiezmos) ? dataDiezmos : []);
      setDistritos(Array.isArray(dataDistritos) ? dataDistritos : []);
      setIglesias(Array.isArray(dataIglesias) ? dataIglesias : []);
      setPastores(Array.isArray(dataPastores) ? dataPastores : []);
    } catch (e) {
      console.error("Error cargando datos de diezmos", e);
    }
    setCargando(false);
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const diezmosEnriquecidos = useMemo(() => {
    return diezmos.map(d => {
      const ig = iglesias.find(i => i.codigoIglesia === d.codigoIglesia);
      return { ...d, codigoDistrito: ig ? ig.codigoDistrito : null };
    });
  }, [diezmos, iglesias]);

  const diezmosFiltrados = useMemo(() => {
    return diezmosEnriquecidos.filter(d => {
      const matchDistrito = filtroDistrito === '' || d.codigoDistrito === filtroDistrito;
      const matchIglesia = filtroIglesia === '' || d.codigoIglesia === filtroIglesia;
      const matchPastor = filtroPastor === '' || d.codigoPastor === filtroPastor;
      const matchMes = filtroMes === '' || d.mes === parseInt(filtroMes, 10);
      const matchAnio = filtroAnio === '' || d.anio === parseInt(filtroAnio, 10);
      const matchBanco = filtroBanco === '' || d.banco === filtroBanco;
      return matchDistrito && matchIglesia && matchPastor && matchMes && matchAnio && matchBanco;
    });
  }, [diezmosEnriquecidos, filtroDistrito, filtroIglesia, filtroPastor, filtroMes, filtroAnio, filtroBanco]);

  const noVerificados = diezmosFiltrados.filter(d => !d.verificado);
  const verificados = diezmosFiltrados.filter(d => d.verificado);
  const totalVerificado = verificados.reduce((acc, c) => acc + c.monto, 0);
  const totalNoVerificado = noVerificados.reduce((acc, c) => acc + c.monto, 0);

  const listaActual = vistaVerificacion === 'pendientes' ? noVerificados : verificados;

  // Bancos únicos para el filtro
  const bancosUnicos = useMemo(() => {
    const set = new Set(diezmos.map(d => d.banco).filter(Boolean));
    return [...set].sort();
  }, [diezmos]);

  const iglesiasOpciones = filtroDistrito
    ? iglesias.filter(ig => ig.codigoDistrito === filtroDistrito)
    : iglesias;

  const limpiarFiltros = () => {
    setFiltroDistrito(''); setFiltroIglesia(''); setFiltroPastor('');
    setFiltroMes(''); setFiltroAnio(new Date().getFullYear().toString()); setFiltroBanco('');
  };

  // --- Editar ---
  const abrirEditar = (diezmo) => {
    const pastor = pastores.find(p => p.codigoPastor === diezmo.codigoPastor);
    setDiezmoEditando(diezmo);
    setFormEditar({
      pastorId: pastor ? pastor.id : '',
      iglesiaId: '',
      mes: diezmo.mes,
      anio: diezmo.anio,
      fechaPago: diezmo.fechaPago,
      numerotransaccion: diezmo.numerotransaccion,
      banco: diezmo.banco,
      numeroCuenta: diezmo.numeroCuenta,
      monto: diezmo.monto,
      observaciones: diezmo.observaciones || '',
      verificado: diezmo.verificado || false,
    });
    // buscar iglesiaId
    if (diezmo.codigoIglesia) {
      const ig = iglesias.find(i => i.codigoIglesia === diezmo.codigoIglesia);
      if (ig) setFormEditar(prev => ({ ...prev, iglesiaId: ig.id }));
    }
    setErrorModal('');
    setModalEditar(true);
  };

  const guardarEdicion = async () => {
    setGuardando(true);
    setErrorModal('');
    try {
      const payload = {
        pastorId: parseInt(formEditar.pastorId, 10),
        pastor: { id: parseInt(formEditar.pastorId, 10) },
        iglesiaId: formEditar.iglesiaId ? parseInt(formEditar.iglesiaId, 10) : null,
        iglesia: formEditar.iglesiaId ? { id: parseInt(formEditar.iglesiaId, 10) } : null,
        mes: parseInt(formEditar.mes, 10),
        anio: parseInt(formEditar.anio, 10),
        fechaPago: formEditar.fechaPago,
        numerotransaccion: formEditar.numerotransaccion,
        numeroCuenta: formEditar.numeroCuenta,
        banco: formEditar.banco,
        monto: parseFloat(formEditar.monto),
        observaciones: formEditar.observaciones,
        verificado: formEditar.verificado,
        urlComprobante: diezmoEditando.urlComprobante || null,
      };
      await actualizarDiezmo(diezmoEditando.id, payload);
      setModalEditar(false);
      await cargarDatos();
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.mensaje || 'Error al guardar.';
      setErrorModal(msg);
    }
    setGuardando(false);
  };

  // --- Verificar rápido (toggle) ---
  const toggleVerificar = async (diezmo) => {
    const pastor = pastores.find(p => p.codigoPastor === diezmo.codigoPastor);
    const ig = diezmo.codigoIglesia ? iglesias.find(i => i.codigoIglesia === diezmo.codigoIglesia) : null;
    try {
      const payload = {
        pastorId: pastor ? pastor.id : null,
        pastor: pastor ? { id: pastor.id } : null,
        iglesiaId: ig ? ig.id : null,
        iglesia: ig ? { id: ig.id } : null,
        mes: diezmo.mes, anio: diezmo.anio, fechaPago: diezmo.fechaPago,
        numerotransaccion: diezmo.numerotransaccion, numeroCuenta: diezmo.numeroCuenta,
        banco: diezmo.banco, monto: diezmo.monto, observaciones: diezmo.observaciones,
        verificado: !diezmo.verificado,
        urlComprobante: diezmo.urlComprobante || null,
      };
      await actualizarDiezmo(diezmo.id, payload);
      await cargarDatos();
    } catch (e) {
      alert('Error al cambiar estado de verificación.');
    }
  };

  const renderTabla = (lista, mostrarAcciones) => (
    <div style={{ overflowX: 'auto' }}>
      <table style={estilos.tabla}>
        <thead>
          <tr>
            <th style={estilos.th}>Transacción</th>
            <th style={estilos.th}>Pastor</th>
            <th style={estilos.th}>Iglesia</th>
            <th style={estilos.th}>Período</th>
            <th style={estilos.th}>Fecha Pago</th>
            <th style={estilos.th}>Monto</th>
            <th style={estilos.th}>Comprobante</th>
            {mostrarAcciones && <th style={estilos.th}>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {lista.length === 0 ? (
            <tr>
              <td colSpan={mostrarAcciones ? 8 : 7} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                No se encontraron diezmos.
              </td>
            </tr>
          ) : (
            lista.map((d) => (
              <tr key={d.id}>
                <td style={estilos.td}>
                  <div style={{ fontWeight: '600' }}>{d.numerotransaccion}</div>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>{d.banco}</div>
                </td>
                <td style={estilos.td}>
                  <div style={{ fontWeight: '500' }}>{d.nombrePastor}</div>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>NIT: {d.nitPastor}</div>
                </td>
                <td style={estilos.td}>
                  {d.nombreIglesia || <span style={{ color: '#aaa', fontStyle: 'italic' }}>N/A</span>}
                </td>
                <td style={estilos.td}>
                  <span style={estilos.badgeMes}>{nombreMes(d.mes)} {d.anio}</span>
                </td>
                <td style={estilos.td}>{d.fechaPago}</td>
                <td style={estilos.td}>
                  <span style={estilos.badgeMonto}>{formatMoneda(d.monto)}</span>
                </td>
                <td style={estilos.td}>
                  {d.urlComprobante ? (
                    <a href={d.urlComprobante} target="_blank" rel="noreferrer" style={{ color: '#1565c0', textDecoration: 'none', fontWeight: '500' }}>
                      Ver Imagen
                    </a>
                  ) : (
                    <span style={{ color: '#aaa' }}>Sin subir</span>
                  )}
                </td>
                {mostrarAcciones && (
                  <td style={{ ...estilos.td, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button style={estilos.botonEditar} onClick={() => abrirEditar(d)}>
                      Editar
                    </button>
                    <button
                      style={d.verificado ? estilos.botonDesverificar : estilos.botonVerificar}
                      onClick={() => toggleVerificar(d)}
                    >
                      {d.verificado ? 'Desverificar' : '✓ Verificar'}
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <Layout>
      <div style={estilos.contenedor}>
        <div style={estilos.encabezado}>
          <h1 style={estilos.titulo}>Diezmos Registrados</h1>
          <button style={estilos.botonPrimario} onClick={() => navigate('/diezmar')}>
            + Registrar Diezmo
          </button>
        </div>

        {/* Paneles de Totales */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ ...estilos.totalesPanel, flex: 1, backgroundColor: '#1a1a2e' }}>
            <div>
              <div style={estilos.totalesLabel}>Total Verificado</div>
              <div style={{ fontSize: '0.85rem', color: '#888' }}>{verificados.length} registros</div>
            </div>
            <div style={{ ...estilos.totalesValor, color: '#4caf50' }}>{formatMoneda(totalVerificado)}</div>
          </div>
          <div style={{ ...estilos.totalesPanel, flex: 1, backgroundColor: '#2c1810' }}>
            <div>
              <div style={estilos.totalesLabel}>Pendientes de Verificación</div>
              <div style={{ fontSize: '0.85rem', color: '#888' }}>{noVerificados.length} registros</div>
            </div>
            <div style={{ ...estilos.totalesValor, color: '#FF4000' }}>{formatMoneda(totalNoVerificado)}</div>
          </div>
        </div>

        {/* Filtros */}
        <div style={estilos.filtros}>
          <select style={estilos.selectFiltro} value={filtroDistrito}
            onChange={(e) => { setFiltroDistrito(e.target.value); setFiltroIglesia(''); }}>
            <option value="">Todos los Distritos</option>
            {distritos.map(d => <option key={d.id} value={d.codigoDistrito}>{d.nombreDistrito}</option>)}
          </select>
          <select style={estilos.selectFiltro} value={filtroIglesia} onChange={(e) => setFiltroIglesia(e.target.value)}>
            <option value="">Todas las Iglesias</option>
            {iglesiasOpciones.map(ig => <option key={ig.id} value={ig.codigoIglesia}>{ig.nombreIglesia}</option>)}
          </select>
          <select style={estilos.selectFiltro} value={filtroPastor} onChange={(e) => setFiltroPastor(e.target.value)}>
            <option value="">Todos los Pastores</option>
            {pastores.map(p => <option key={p.id} value={p.codigoPastor}>{p.nombre} {p.apellido}</option>)}
          </select>
          <select style={estilos.selectFiltro} value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
            <option value="">Todos los Meses</option>
            {meses.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
          <select style={estilos.selectFiltro} value={filtroBanco} onChange={(e) => setFiltroBanco(e.target.value)}>
            <option value="">Todos los Bancos</option>
            {bancosUnicos.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <input type="number" placeholder="Año" style={{ ...estilos.inputFiltro, minWidth: '100px' }}
            value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)} />
          <button style={{ ...estilos.botonSecundario, padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            onClick={limpiarFiltros}>Limpiar</button>
        </div>

        {/* Toggle Pendientes / Verificados */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setVistaVerificacion('pendientes')}
            style={{
              ...estilos.tabBtn,
              backgroundColor: vistaVerificacion === 'pendientes' ? '#FF4000' : '#f4f6f9',
              color: vistaVerificacion === 'pendientes' ? '#fff' : '#555',
              borderRadius: '8px 0 0 8px',
            }}
          >
            ⏳ Pendientes ({noVerificados.length})
          </button>
          <button
            onClick={() => setVistaVerificacion('verificados')}
            style={{
              ...estilos.tabBtn,
              backgroundColor: vistaVerificacion === 'verificados' ? '#4caf50' : '#f4f6f9',
              color: vistaVerificacion === 'verificados' ? '#fff' : '#555',
              borderRadius: '0 8px 8px 0',
            }}
          >
            ✅ Verificados ({verificados.length})
          </button>
        </div>

        {cargando ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>Cargando diezmos...</p>
        ) : (
          renderTabla(listaActual, esAdmin)
        )}
      </div>

      {/* Modal Editar */}
      {modalEditar && diezmoEditando && (
        <div style={estilos.overlay}>
          <div style={{ ...estilos.modal, maxWidth: '520px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>
              Editar Diezmo — {diezmoEditando.numerotransaccion}
            </h2>
            {errorModal && <div style={estilos.error}>{errorModal}</div>}

            <div style={estilos.gridForm}>
              <div>
                <label style={estilos.label}>Banco</label>
                <select style={estilos.select} value={`${formEditar.banco}|${formEditar.numeroCuenta}`}
                  onChange={(e) => {
                    const [b, nc] = e.target.value.split('|');
                    setFormEditar(p => ({ ...p, banco: b, numeroCuenta: nc }));
                  }}>
                  <option value="">— Seleccione —</option>
                  {CUENTAS_BANCARIAS.map((c, i) => (
                    <option key={i} value={`${c.banco}|${c.numeroCuenta}`}>{c.banco} - {c.numeroCuenta}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={estilos.label}>Monto (GTQ)</label>
                <input type="number" step="0.01" style={estilos.input} value={formEditar.monto}
                  onChange={(e) => setFormEditar(p => ({ ...p, monto: e.target.value }))} />
              </div>
              <div>
                <label style={estilos.label}>Mes</label>
                <select style={estilos.select} value={formEditar.mes}
                  onChange={(e) => setFormEditar(p => ({ ...p, mes: e.target.value }))}>
                  {meses.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={estilos.label}>Año</label>
                <input type="number" style={estilos.input} value={formEditar.anio}
                  onChange={(e) => setFormEditar(p => ({ ...p, anio: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={estilos.label}>Observaciones</label>
                <textarea style={{ ...estilos.input, minHeight: '60px', resize: 'vertical' }}
                  value={formEditar.observaciones}
                  onChange={(e) => setFormEditar(p => ({ ...p, observaciones: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={formEditar.verificado}
                  onChange={(e) => setFormEditar(p => ({ ...p, verificado: e.target.checked }))}
                  style={{ width: '18px', height: '18px' }} />
                <label style={{ ...estilos.label, marginBottom: 0 }}>Marcar como verificado</label>
              </div>
            </div>

            <div style={estilos.modalAcciones}>
              <button style={estilos.botonSecundario} onClick={() => setModalEditar(false)} disabled={guardando}>Cancelar</button>
              <button style={estilos.botonPrimario} onClick={guardarEdicion} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

const estilos = {
  contenedor: { padding: '2rem', fontFamily: "'Inter', sans-serif" },
  encabezado: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  titulo: { fontSize: '1.6rem', fontWeight: '700', color: '#000', margin: 0 },
  botonPrimario: { backgroundColor: '#FF4000', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.55rem 1.2rem', fontFamily: "'Inter', sans-serif", fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' },
  botonSecundario: { backgroundColor: '#fff', color: '#000', border: '1px solid #ccc', borderRadius: '6px', padding: '0.55rem 1.2rem', fontFamily: "'Inter', sans-serif", fontWeight: '500', fontSize: '0.9rem', cursor: 'pointer' },
  botonEditar: { backgroundColor: '#FFAA00', color: '#000', border: 'none', borderRadius: '6px', padding: '0.4rem 0.9rem', fontFamily: "'Inter', sans-serif", fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer' },
  botonVerificar: { backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.9rem', fontFamily: "'Inter', sans-serif", fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer' },
  botonDesverificar: { backgroundColor: '#f44336', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.9rem', fontFamily: "'Inter', sans-serif", fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer' },
  tabBtn: { border: '1px solid #ddd', padding: '0.65rem 1.5rem', fontFamily: "'Inter', sans-serif", fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' },
  filtros: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' },
  inputFiltro: { border: '1px solid #ccc', borderRadius: '6px', padding: '0.5rem 0.8rem', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', minWidth: '180px', outline: 'none' },
  selectFiltro: { border: '1px solid #ccc', borderRadius: '6px', padding: '0.5rem 0.8rem', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', minWidth: '180px', backgroundColor: '#fff', cursor: 'pointer', outline: 'none' },
  tabla: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
  th: { backgroundColor: '#f8f9fa', padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#555', borderBottom: '2px solid #eee' },
  td: { padding: '1rem', borderBottom: '1px solid #eee', fontSize: '0.9rem', color: '#333' },
  badgeMes: { display: 'inline-block', backgroundColor: '#e3f2fd', color: '#1565c0', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: '600' },
  badgeMonto: { display: 'inline-block', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.85rem', fontWeight: '700' },
  totalesPanel: { padding: '1.25rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  totalesLabel: { fontSize: '1rem', fontWeight: '500', color: '#aaa' },
  totalesValor: { fontSize: '1.8rem', fontWeight: '700' },
  seccionTitulo: { fontSize: '1.1rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '3px solid #FF4000', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  seccionIcono: { fontSize: '1.2rem' },
  seccionContador: { backgroundColor: '#fff3e0', color: '#e65100', borderRadius: '12px', padding: '0.15rem 0.6rem', fontSize: '0.8rem', fontWeight: '700', marginLeft: '0.5rem' },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', borderRadius: '10px', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' },
  modalAcciones: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' },
  gridForm: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  label: { display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#333', marginBottom: '0.3rem' },
  input: { width: '100%', border: '1px solid #ccc', borderRadius: '6px', padding: '0.55rem 0.8rem', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' },
  select: { width: '100%', border: '1px solid #ccc', borderRadius: '6px', padding: '0.55rem 0.8rem', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#fff', outline: 'none' },
  error: { backgroundColor: '#fff0ee', border: '1px solid #FF2200', color: '#c00', borderRadius: '6px', padding: '0.6rem 0.9rem', fontSize: '0.875rem', marginBottom: '1rem' },
};
