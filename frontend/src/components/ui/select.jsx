import React from 'react';
import { Form } from 'react-bootstrap';

const Select = ({ className = '', children, ...props }) => {
  return (
    <Form.Select className={className} {...props}>
      {children}
    </Form.Select>
  );
};

const SelectTrigger = Select;
const SelectContent = ({ children }) => <>{children}</>;
const SelectItem = Form.Select.Option;
const SelectValue = ({ children }) => <>{children}</>;

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
}; 