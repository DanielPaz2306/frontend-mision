import axios from "axios";

const api = "http://localhost:8080/api";

const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        Authorization: `Bearer ${token}`,
    };
};

// ---- DISTRITOS ----
export const getDistritos = () =>
    axios.get(`${api}/distritos`, { headers: getHeaders() }).then((r) => r.data);

export const getDistritoById = (id) =>
    axios.get(`${api}/distritos/${id}`, { headers: getHeaders() }).then((r) => r.data);

export const crearDistrito = (distrito) =>
    axios.post(`${api}/distritos`, distrito, { headers: getHeaders() }).then((r) => r.data);

export const actualizarDistrito = (id, distrito) =>
    axios.put(`${api}/distritos/${id}`, distrito, { headers: getHeaders() }).then((r) => r.data);

export const eliminarDistrito = (id) =>
    axios.delete(`${api}/distritos/${id}`, { headers: getHeaders() }).then((r) => r.data);

// ---- IGLESIAS ----
export const getIglesias = () =>
    axios.get(`${api}/iglesias`, { headers: getHeaders() }).then((r) => r.data);

export const getIglesiasByDistrito = (distritoId) =>
    axios.get(`${api}/iglesias/distrito/${distritoId}`, { headers: getHeaders() }).then((r) => r.data);

export const getIglesiaById = (id) =>
    axios.get(`${api}/iglesias/${id}`, { headers: getHeaders() }).then((r) => r.data);

export const createIglesia = (data) =>
    axios.post(`${api}/iglesias`, data, { headers: getHeaders() }).then((r) => r.data);

export const updateIglesia = (id, data) =>
    axios.put(`${api}/iglesias/${id}`, data, { headers: getHeaders() }).then((r) => r.data);

export const deleteIglesia = (id) =>
    axios.delete(`${api}/iglesias/${id}`, { headers: getHeaders() }).then((r) => r.data);

// ---- PASTORES ----
export const getPastores = () =>
    axios.get(`${api}/pastores`, { headers: getHeaders() }).then((r) => r.data);

export const getPastoresSinIglesia = () =>
    axios.get(`${api}/pastores/sin-iglesia`, { headers: getHeaders() }).then((r) => r.data);

export const getPastoresByDistrito = (distritoId) =>
    axios.get(`${api}/pastores/distrito/${distritoId}`, { headers: getHeaders() }).then((r) => r.data);

export const getPastorById = (id) =>
    axios.get(`${api}/pastores/${id}`, { headers: getHeaders() }).then((r) => r.data);

export const crearPastor = (pastor) =>
    axios.post(`${api}/pastores`, pastor, { headers: getHeaders() }).then((r) => r.data);

export const actualizarPastor = (id, pastor) =>
    axios.put(`${api}/pastores/${id}`, pastor, { headers: getHeaders() }).then((r) => r.data);

export const eliminarPastor = (id) =>
    axios.delete(`${api}/pastores/${id}`, { headers: getHeaders() }).then((r) => r.data);

// ---- DIEZMOS ----
export const getDiezmos = () =>
    axios.get(`${api}/diezmos`, { headers: getHeaders() }).then((r) => r.data);

export const getDiezmoById = (id) =>
    axios.get(`${api}/diezmos/${id}`, { headers: getHeaders() }).then((r) => r.data);

export const getDiezmosByPastor = (id) =>
    axios.get(`${api}/diezmos/pastor/${id}`, { headers: getHeaders() }).then((r) => r.data);

export const getDiezmosByIglesia = (id) =>
    axios.get(`${api}/diezmos/iglesia/${id}`, { headers: getHeaders() }).then((r) => r.data);

export const getDiezmosByMesAnio = (mes, anio) =>
    axios.get(`${api}/diezmos/mes/${mes}/anio/${anio}`, { headers: getHeaders() }).then((r) => r.data);

export const crearDiezmo = (diezmo) =>
    axios.post(`${api}/diezmos`, diezmo, { headers: getHeaders() }).then((r) => r.data);

export const actualizarDiezmo = (id, diezmo) =>
    axios.put(`${api}/diezmos/${id}`, diezmo, { headers: getHeaders() }).then((r) => r.data);

export const verificarDiezmo = (id, diezmoActualizado) =>
    axios.put(`${api}/diezmos/${id}`, diezmoActualizado, { headers: getHeaders() }).then((r) => r.data);