import React from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';

const Button = ({ variant = 'primary', size = 'md', className = '', children, ...props }) => {
  return (
    <BootstrapButton
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {children}
    </BootstrapButton>
  );
};

export { Button }; 