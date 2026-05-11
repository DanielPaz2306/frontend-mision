import React, { useState, useEffect, useCallback } from 'react';
import { getDiezmosByPastor } from '../services/apiService';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const estilos = {
  contenedor: {
    padding: '2rem',
    fontFamily: "'Inter', sans-serif",
  },
  titulo: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#000',
    marginBottom: '1.5rem',
  },
  totalesPanel: {
    backgroundColor: '#000',
    color: '#fff',
    padding: '1.5rem',
    borderRadius: '10px',
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  totalesLabel: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#ccc',
  },
  totalesValor: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#FF4000',
  },
  tabla: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    textAlign: 'left',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#555',
    borderBottom: '2px solid #eee',
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #eee',
    fontSize: '0.9rem',
    color: '#333',
  },
  badgeMes: {
    display: 'inline-block',
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
    borderRadius: '4px',
    padding: '0.2rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  badgeMonto: {
    display: 'inline-block',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '4px',
    padding: '0.2rem 0.5rem',
    fontSize: '0.85rem',
    fontWeight: '700',
  },
  filtros: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    alignItems: 'center',
  },
  selectFiltro: {
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '0.5rem 0.8rem',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    backgroundColor: '#fff',
    outline: 'none',
  },
  inputFiltro: {
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '0.5rem 0.8rem',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    width: '100px',
    outline: 'none',
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

export default function MisDiezmos() {
  const { usuario } = useAuth();
  
  const [diezmos, setDiezmos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear().toString());

  const cargarMisDiezmos = useCallback(async () => {
    setCargando(true);
    try {
      if (!usuario?.pastorId) {
        setDiezmos([]);
        setCargando(false);
        return;
      }
      const dataDiezmos = await getDiezmosByPastor(usuario.pastorId);
      const misDatos = Array.isArray(dataDiezmos) ? dataDiezmos : [];
      
      // Ordenamos por fecha de pago descendente
      misDatos.sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));
      setDiezmos(misDatos);
    } catch (e) {
      console.error("Error al cargar mis diezmos", e);
    }
    setCargando(false);
  }, [usuario]);

  useEffect(() => {
    if (usuario?.pastorId) {
      cargarMisDiezmos();
    } else {
      setCargando(false);
    }
  }, [cargarMisDiezmos, usuario]);

  const formatMoneda = (valor) => {
    return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(valor);
  };

  const nombreMes = (numMes) => {
    const m = meses.find(x => x.id === numMes);
    return m ? m.nombre : numMes;
  };

  const diezmosFiltrados = diezmos.filter(d => {
    const matchMes = filtroMes === '' || d.mes === parseInt(filtroMes, 10);
    const matchAnio = filtroAnio === '' || d.anio === parseInt(filtroAnio, 10);
    return matchMes && matchAnio;
  });

  const totalFiltrado = diezmosFiltrados.reduce((acc, curr) => acc + curr.monto, 0);

  if (!usuario || usuario.rol !== 'PASTOR') {
    return (
      <Layout>
        <div style={estilos.contenedor}>
          <h2>Acceso Denegado</h2>
          <p>Esta vista es exclusiva para Pastores.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={estilos.contenedor}>
        <h1 style={estilos.titulo}>Mis Diezmos</h1>

        <div style={estilos.totalesPanel}>
          <div>
            <div style={estilos.totalesLabel}>Total Aportado (Filtrado)</div>
            <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.3rem' }}>
              {diezmosFiltrados.length} registros en el historial
            </div>
          </div>
          <div style={estilos.totalesValor}>
            {formatMoneda(totalFiltrado)}
          </div>
        </div>

        <div style={estilos.filtros}>
          <select
            style={estilos.selectFiltro}
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
          >
            <option value="">Todos los Meses</option>
            {meses.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
          <input
            type="number"
            style={estilos.inputFiltro}
            value={filtroAnio}
            onChange={(e) => setFiltroAnio(e.target.value)}
            placeholder="Año"
          />
          <button
            style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: '#fff' }}
            onClick={() => { setFiltroMes(''); setFiltroAnio(''); }}
          >
            Limpiar
          </button>
        </div>

        {cargando ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>Cargando historial...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={estilos.tabla}>
              <thead>
                <tr>
                  <th style={estilos.th}>Transacción</th>
                  <th style={estilos.th}>Período</th>
                  <th style={estilos.th}>Fecha Pago</th>
                  <th style={estilos.th}>Banco</th>
                  <th style={estilos.th}>Comprobante</th>
                  <th style={estilos.th}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {diezmosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                      No tienes diezmos registrados con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  diezmosFiltrados.map((d) => (
                    <tr key={d.id}>
                      <td style={estilos.td}>
                        <div style={{ fontWeight: '600' }}>{d.numerotransaccion}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>Ref: {d.numeroCuenta}</div>
                      </td>
                      <td style={estilos.td}>
                        <span style={estilos.badgeMes}>{nombreMes(d.mes)} {d.anio}</span>
                      </td>
                      <td style={estilos.td}>{d.fechaPago}</td>
                      <td style={estilos.td}>{d.banco}</td>
                      <td style={estilos.td}>
                        {d.urlComprobante ? (
                          <span style={{ color: '#1565c0', fontWeight: '500' }}>Adjunto</span>
                        ) : (
                          <span style={{ color: '#aaa' }}>—</span>
                        )}
                      </td>
                      <td style={estilos.td}>
                        <span style={estilos.badgeMonto}>{formatMoneda(d.monto)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
