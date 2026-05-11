import { jwtDecode } from "jwt-decode";

const RutaProtegida = ({ children, rolesPermitidos }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/login";
        return null;
    }

    if (rolesPermitidos) {
        const usuario = jwtDecode(token);
        if (!rolesPermitidos.includes(usuario?.rol)) {
            window.location.href = "/login";
            return null;
        }
    }

    return children;
};

export default RutaProtegida;