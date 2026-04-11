// src/components/Shimmer.js
import React from 'react';
import './Shimmer.css';

const Shimmer = ({ width = '100%', height = '20px', borderRadius = '8px', marginBottom = '12px', className = '' }) => {
  return (
    <div
      className={`shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        marginBottom,
      }}
    />
  );
};

export const FormShimmer = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Shimmer width="200px" height="24px" marginBottom="24px" />
      <Shimmer height="50px" marginBottom="16px" />
      <Shimmer height="50px" marginBottom="16px" />
      <Shimmer height="50px" marginBottom="16px" />
      <Shimmer height="100px" marginBottom="16px" />
      <Shimmer width="150px" height="48px" />
    </div>
  );
};

export const TableShimmer = () => {
  return (
    <div>
      <Shimmer height="40px" marginBottom="8px" />
      {[1, 2, 3, 4, 5].map(i => (
        <Shimmer key={i} height="50px" marginBottom="8px" />
      ))}
    </div>
  );
};

export const StatsShimmer = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
      {[1, 2, 3, 4].map(i => (
        <Shimmer key={i} height="120px" />
      ))}
    </div>
  );
};

export default Shimmer;