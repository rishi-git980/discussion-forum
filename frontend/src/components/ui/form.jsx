import React from 'react';
import { Form as BootstrapForm } from 'react-bootstrap';

const Form = ({ className = '', children, ...props }) => {
  return (
    <BootstrapForm className={className} {...props}>
      {children}
    </BootstrapForm>
  );
};

const FormGroup = ({ className = '', children, ...props }) => {
  return (
    <BootstrapForm.Group className={className} {...props}>
      {children}
    </BootstrapForm.Group>
  );
};

const FormLabel = ({ className = '', children, ...props }) => {
  return (
    <BootstrapForm.Label className={className} {...props}>
      {children}
    </BootstrapForm.Label>
  );
};

const FormControl = ({ className = '', ...props }) => {
  return (
    <BootstrapForm.Control className={className} {...props} />
  );
};

const FormText = ({ className = '', children, ...props }) => {
  return (
    <BootstrapForm.Text className={className} {...props}>
      {children}
    </BootstrapForm.Text>
  );
};

const FormCheck = ({ className = '', children, ...props }) => {
  return (
    <BootstrapForm.Check className={className} {...props}>
      {children}
    </BootstrapForm.Check>
  );
};

export {
  Form,
  FormGroup,
  FormLabel,
  FormControl,
  FormText,
  FormCheck
}; 