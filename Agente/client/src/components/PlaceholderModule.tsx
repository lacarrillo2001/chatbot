import React from 'react';
import type { Module } from '../types';
import IconRenderer from '../icons/IconRenderer';

interface Props {
  module: Module;
}

const PlaceholderModule: React.FC<Props> = ({ module }) => (
  <div className="module-placeholder">
    <div className="placeholder-icon">
      <IconRenderer icon={module.icon} />
    </div>
    <h2>{module.name}</h2>
    <p>{module.description}</p>
    <div className="coming-soon">Coming Soon</div>
  </div>
);

export default PlaceholderModule;
