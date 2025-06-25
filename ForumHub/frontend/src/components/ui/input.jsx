import React from 'react';
import { Form } from 'react-bootstrap';

const Input = ({ className = '', type = 'text', ...props }) => {
  return (
    <Form.Control
      type={type}
      className={className}
      {...props}
    />
  );
};

export { Input }; 