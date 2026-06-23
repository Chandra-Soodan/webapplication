import React from 'react';

export const StatCard = ({ title, value, icon, color, lightColor }) => {
  const cardStyle = {
    '--card-accent': color,
    '--card-accent-light': lightColor,
  };

  return (
    <div className="stat-card" style={cardStyle}>
      <div className="stat-icon-wrapper">
        {icon}
      </div>
      <div className="stat-info">
        <span className="stat-label">{title}</span>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  );
};

export default StatCard;
