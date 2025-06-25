import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ asLink = true }) => {
  const logoContent = (
    <div className="d-flex align-items-center">
      <div 
        className="rounded-circle d-flex align-items-center justify-content-center me-2"
        style={{ 
          width: '32px', 
          height: '32px', 
          background: 'linear-gradient(135deg, #007bff, #6610f2)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <span className="fw-bold text-white" style={{ fontSize: '18px' }}>F</span>
      </div>
      <div className="d-flex">
        <span className="fw-bold h5 mb-0 text-primary">Forum</span>
        <span className="fw-bold h5 mb-0 text-secondary">Hub</span>
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" className="text-decoration-none">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo; 