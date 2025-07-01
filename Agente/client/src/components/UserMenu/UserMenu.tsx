import React, { useEffect, useState, useRef } from 'react';
import './UserMenu.css';

interface UserInfo {
  nombre: string;
  apellido: string;
  seudonimo: string;
  correo: string;
  universidad: string;
}

interface Props {
  onLogout: () => void;
  onShowInfo: (info: UserInfo) => void;
}

const UserMenu: React.FC<Props> = ({ onLogout, onShowInfo }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem('token_info');

 useEffect(() => {
  const fetchUserInfo = async () => {
    if (!token) return ;
    try {
      const url = `${import.meta.env.VITE_API_BASE}/usuarios/info?token=${token}`;
      console.log("📡 URL de la petición:", url);
      
      const res = await fetch(url);
      const raw = await res.text(); // 👈 primero obtenemos el texto sin parsear

      console.log("📦 Respuesta cruda del backend:", raw);

      const data = JSON.parse(raw); // luego la parseamos manualmente

      setUserInfo({
        nombre: data.nombre,
        apellido: data.apellido,
        seudonimo: data.seudonimo,
        correo: data.correo,
        universidad: data.universidad,
      });
    } catch (err) {
      console.error("❌ Error al obtener usuario:", err);
    }
  };

  fetchUserInfo();
}, [token]);



  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!userInfo) return <div style={{ color: 'red' }}>Esperando datos del usuario...</div>;

console.log("👤 Renderizando UserMenu con info:", userInfo);

  return (
    
    <div className="user-menu" ref={menuRef}>
      <div className="user-avatar" onClick={() => setOpen(!open)}>
        {userInfo.nombre[0].toUpperCase()}
      </div>
      <span className="user-name">{userInfo.nombre}</span>

      {open && (
        <div className="user-dropdown">
          <button onClick={() => onShowInfo(userInfo)}>Información</button>
          <button onClick={onLogout}>Cerrar sesión</button>
        </div>
      )}
    </div>
  );


};

export default UserMenu;
