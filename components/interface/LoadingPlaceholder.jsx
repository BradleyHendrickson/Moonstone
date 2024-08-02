import React from 'react';
import './LoadingPlaceholder.css';

export default function LoadingPlaceholder({ width = '100px', height = '100px', cornerRadius = '10px', className, style }) {
  return (
    <div 
      className={`loading-placeholder ${className}`}
      style={{ width, height, borderRadius: cornerRadius, ...style }}
    />
  );
}
