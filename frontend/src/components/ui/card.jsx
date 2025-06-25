import React from 'react';
import { Card as BootstrapCard } from 'react-bootstrap';

const Card = ({ className = '', children, ...props }) => {
  return (
    <BootstrapCard className={className} {...props}>
      {children}
    </BootstrapCard>
  );
};

const CardHeader = ({ className = '', children, ...props }) => {
  return (
    <BootstrapCard.Header className={className} {...props}>
      {children}
    </BootstrapCard.Header>
  );
};

const CardTitle = ({ className = '', children, ...props }) => {
  return (
    <BootstrapCard.Title className={className} {...props}>
      {children}
    </BootstrapCard.Title>
  );
};

const CardContent = ({ className = '', children, ...props }) => {
  return (
    <BootstrapCard.Body className={className} {...props}>
      {children}
    </BootstrapCard.Body>
  );
};

const CardFooter = ({ className = '', children, ...props }) => {
  return (
    <BootstrapCard.Footer className={className} {...props}>
      {children}
    </BootstrapCard.Footer>
  );
};

export { Card, CardHeader, CardTitle, CardContent, CardFooter }; 