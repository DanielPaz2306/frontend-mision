import React, { useState, useEffect } from 'react';
import {
  getPastores,
  getIglesias,
  crearDiezmo
} from '../services/apiService';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const estilos = {
  contenedor: {
    padding: '2rem',
    fontFamily: "'Inter', sans-serif",
    maxWidth: '800px',
    margin: '0 auto',
  },
  titulo: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#000',
    marginBottom: '1.5rem',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    border: '1px solid #eaeaea',
  },
  gridForm: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.2rem',
  },
  grupoFull: {
    gridColumn: '1 / -1',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '0.4rem',
  },
  input: {
    width: '100%',
    padding: '0.65rem 0.8rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.9rem',
    fontFamily: "'Inter', sans-serif",
    boxSizing: 'border-box',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '0.65rem 0.8rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.9rem',
    fontFamily: "'Inter', sans-serif",
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    outline: 'none',
  },
  botonPrimario: {
    backgroundColor: '#FF4000',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.75rem 1.5rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    width: '100%',
    marginTop: '1rem',
  },
  error: {
    backgroundColor: '#fff0ee',
    border: '1px solid #FF2200',
    color: '#c00',
    borderRadius: '6px',
    padding: '0.8rem 1rem',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  exito: {
    backgroundColor: '#e8f5e9',
    border: '1px solid #2e7d32',
    color: '#1b5e20',
    borderRadius: '6px',
    padding: '0.8rem 1rem',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  notaFile: {
    fontSize: '0.75rem',
    color: '#888',
    marginTop: '0.3rem',
    display: 'block'
  }
};

const meses = [
  { id: 1, nombre: 'Enero' }, { id: 2, nombre: 'Febrero' },
  { id: 3, nombre: 'Marzo' }, { id: 4, nombre: 'Abril' },
  { id: 5, nombre: 'Mayo' }, { id: 6, nombre: 'Junio' },
  { id: 7, nombre: 'Julio' }, { id: 8, nombre: 'Agosto' },
  { id: 9, nombre: 'Septiembre' }, { id: 10, nombre: 'Octubre' },
  { id: 11, nombre: 'Noviembre' }, { id: 12, nombre: 'Diciembre' },
];

const CUENTAS_BANCARIAS = [
  { id: '1', banco: 'GyT Continental', numeroCuenta: '229983746', label: 'GyT Continental - No Cta. 229983746' },
  { id: '2', banco: 'Banco Industrial', numeroCuenta: '1182383929', label: 'Banco Industrial - No Cta. 1182383929' },
  { id: '3', banco: 'Banrural', numeroCuenta: '1214151515', label: 'Banrural - No Cta. 1214151515' }
];

export default function Diezmar() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const tienePastorId = Boolean(usuario?.pastorId);

  const [pastores, setPastores] = useState([]);
  const [iglesias, setIglesias] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [form, setForm] = useState({
    pastorId: '',
    iglesiaId: '',
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    fechaPago: new Date().toISOString().split('T')[0],
    numerotransaccion: '',
    cuentaBancariaId: '',
    monto: '',
    observaciones: '',
  });

  const [archivoVisible, setArchivoVisible] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [exitoMsg, setExitoMsg] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPastores, resIglesias] = await Promise.all([
          getPastores(),
          getIglesias()
        ]);
        
        const past = Array.isArray(resPastores) ? resPastores : [];
        const igl = Array.isArray(resIglesias) ? resIglesias : [];
        
        setPastores(past);
        setIglesias(igl);

        if (usuario?.pastorId) {
          const miPastorIdStr = String(usuario.pastorId);
          const miPastor = past.find(p => String(p.id) === miPastorIdStr);
          
          if (miPastor) {
            const miIglesia = igl.find(i => i.codigoPastor && i.codigoPastor === miPastor.codigoPastor);
            setForm(prev => ({ 
              ...prev, 
              pastorId: miPastorIdStr,
              iglesiaId: miIglesia ? String(miIglesia.id) : ''
            }));
          }
        }
      } catch (e) {
        console.error("Error al cargar datos", e);
      }
      setCargando(false);
    };
    fetchData();
  }, [usuario]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const manejarArchivo = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivoVisible(e.target.files[0]);
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setExitoMsg('');

    if (!form.pastorId || !form.mes || !form.anio || !form.fechaPago || !form.numerotransaccion || !form.cuentaBancariaId || !form.monto) {
      setErrorMsg('Por favor complete todos los campos obligatorios (*).');
      return;
    }

    const cuentaSeleccionada = CUENTAS_BANCARIAS.find(c => c.id === form.cuentaBancariaId);

    setGuardando(true);
    try {
      const payload = {
        pastorId: parseInt(form.pastorId, 10),
        pastor: { id: parseInt(form.pastorId, 10) },
        iglesiaId: form.iglesiaId ? parseInt(form.iglesiaId, 10) : null,
        iglesia: form.iglesiaId ? { id: parseInt(form.iglesiaId, 10) } : null,
        mes: parseInt(form.mes, 10),
        anio: parseInt(form.anio, 10),
        fechaPago: form.fechaPago,
        numerotransaccion: form.numerotransaccion,
        numeroCuenta: cuentaSeleccionada.numeroCuenta,
        banco: cuentaSeleccionada.banco,
        monto: parseFloat(form.monto),
        observaciones: form.observaciones,
        urlComprobante: archivoVisible ? archivoVisible.name : null
      };

      await crearDiezmo(payload);
      setExitoMsg('Diezmo registrado exitosamente.');
      
      // Limpiar form
      setForm(prev => ({
        ...prev,
        numerotransaccion: '',
        monto: '',
        observaciones: '',
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear(),
      }));
      setArchivoVisible(null);
      // Reset input file
      const fileInput = document.getElementById('comprobanteFile');
      if (fileInput) fileInput.value = '';

      setTimeout(() => {
        if (usuario?.rol === 'PASTOR') {
          navigate('/mis-diezmos');
        } else if (usuario?.rol === 'ADMIN') {
          navigate('/diezmos');
        } else {
          navigate('/dashboard');
        }
      }, 2000);

    } catch (e) {
      const msj = e.response?.data?.message || e.response?.data?.mensaje || 'Error al registrar el diezmo. Verifique que el número de transacción no esté duplicado.';
      setErrorMsg(msj);
    }
    setGuardando(false);
  };

  if (cargando) {
    return <Layout><div style={estilos.contenedor}>Cargando formulario...</div></Layout>;
  }

  return (
    <Layout>
      <div style={estilos.contenedor}>
        <h1 style={estilos.titulo}>Registrar Diezmo</h1>

        <div style={estilos.card}>
          {errorMsg && <div style={estilos.error}>{errorMsg}</div>}
          {exitoMsg && <div style={estilos.exito}>{exitoMsg}</div>}

          <form onSubmit={guardar} style={estilos.gridForm}>
            
            {/* Pastor */}
            <div>
              <label style={estilos.label}>Pastor <span style={{ color: 'red' }}>*</span></label>
              <select 
                style={estilos.select}
                name="pastorId"
                value={form.pastorId}
                onChange={manejarCambio}
                disabled={tienePastorId} // Si tiene un ID implícito, no puede cambiarlo
              >
                <option value="">— Seleccione Pastor —</option>
                {pastores.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} {p.apellido} ({p.codigoPastor})</option>
                ))}
              </select>
            </div>

            {/* Iglesia */}
            <div>
              <label style={estilos.label}>Iglesia</label>
              <select 
                style={estilos.select}
                name="iglesiaId"
                value={form.iglesiaId}
                onChange={manejarCambio}
                disabled={tienePastorId}
              >
                <option value="">— Sin Iglesia asignada —</option>
                {iglesias.map(i => (
                  <option key={i.id} value={i.id}>{i.nombreIglesia} ({i.codigoIglesia})</option>
                ))}
              </select>
            </div>

            {/* Período */}
            <div>
              <label style={estilos.label}>Mes a Pagar <span style={{ color: 'red' }}>*</span></label>
              <select 
                style={estilos.select}
                name="mes"
                value={form.mes}
                onChange={manejarCambio}
              >
                {meses.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={estilos.label}>Año <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="number"
                style={estilos.input}
                name="anio"
                value={form.anio}
                onChange={manejarCambio}
                min="2000"
                max="2100"
              />
            </div>

            {/* Detalles Bancarios */}
            <div style={estilos.grupoFull}>
              <label style={estilos.label}>Cuenta de Depósito <span style={{ color: 'red' }}>*</span></label>
              <select
                style={estilos.select}
                name="cuentaBancariaId"
                value={form.cuentaBancariaId}
                onChange={manejarCambio}
              >
                <option value="">— Seleccione una Cuenta —</option>
                {CUENTAS_BANCARIAS.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={estilos.label}>Nº Transacción/Boleta <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text"
                style={estilos.input}
                name="numerotransaccion"
                value={form.numerotransaccion}
                onChange={manejarCambio}
                placeholder="Ej. 987654321"
              />
            </div>
            <div>
              <label style={estilos.label}>Fecha de Pago <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="date"
                style={estilos.input}
                name="fechaPago"
                value={form.fechaPago}
                onChange={manejarCambio}
              />
            </div>

            {/* Monto */}
            <div style={estilos.grupoFull}>
              <label style={estilos.label}>Monto Depositado (GTQ) <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="number"
                step="0.01"
                style={{ ...estilos.input, fontSize: '1.2rem', fontWeight: 'bold', color: '#1565c0' }}
                name="monto"
                value={form.monto}
                onChange={manejarCambio}
                placeholder="0.00"
              />
            </div>

            {/* Comprobante e Observaciones */}
            <div style={estilos.grupoFull}>
              <label style={estilos.label}>Comprobante de Pago</label>
              <input 
                type="file"
                id="comprobanteFile"
                accept="image/*"
                style={estilos.input}
                onChange={manejarArchivo}
              />
              <span style={estilos.notaFile}>
                * Por ahora, la imagen solo queda registrada visualmente y no se almacena en la nube.
              </span>
            </div>

            <div style={estilos.grupoFull}>
              <label style={estilos.label}>Observaciones</label>
              <textarea 
                style={{ ...estilos.input, minHeight: '80px', resize: 'vertical' }}
                name="observaciones"
                value={form.observaciones}
                onChange={manejarCambio}
                placeholder="Opcional. Notas adicionales sobre el depósito."
              />
            </div>

            <div style={estilos.grupoFull}>
              <button type="submit" style={estilos.botonPrimario} disabled={guardando}>
                {guardando ? 'Registrando...' : 'Registrar Diezmo'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
}
