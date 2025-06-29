import React from 'react';
import type { Module } from '../types';
import IconRenderer from '../icons/IconRenderer';

interface Props {
  modules: Module[];
  activeModule: string;
  setActiveModule: (id: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<Props> = ({ modules, activeModule, setActiveModule, sidebarCollapsed, toggleSidebar }) => (
  <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
    <div className="sidebar-header">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <IconRenderer icon="menu" />
      </button>
      {!sidebarCollapsed && <h1 className="sidebar-title">PsicoSim</h1>}
      
    </div>

    <nav className="sidebar-nav">
      {modules.map((module) => (
        <button
          key={module.id}
          className={`nav-item ${activeModule === module.id ? 'active' : ''}`}
          onClick={() => setActiveModule(module.id)}
          title={sidebarCollapsed ? module.name : ''}
        >
          <div className="nav-icon">
            <IconRenderer icon={module.icon} />
          </div>
          {!sidebarCollapsed && (
            <div className="nav-content">
              <span className="nav-name">{module.name}</span>
              <span className="nav-description">{module.description}</span>
            </div>
          )}
        </button>
      ))}
    </nav>
  </div>
);

export default Sidebar;
