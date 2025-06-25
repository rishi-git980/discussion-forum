import React from 'react';
import { Image } from 'react-bootstrap';

const Avatar = ({ className = '', children, ...props }) => {
  return (
    <div className={`d-inline-block position-relative ${className}`} {...props}>
      {children}
    </div>
  );
};

const AvatarImage = ({ src, alt = '', className = '', ...props }) => {
  return (
    <Image
      src={src}
      alt={alt}
      className={`rounded-circle object-fit-cover ${className}`}
      width={40}
      height={40}
      {...props}
    />
  );
};

const AvatarFallback = ({ className = '', children, ...props }) => {
  return (
    <div
      className={`d-flex align-items-center justify-content-center rounded-circle bg-secondary text-white ${className}`}
      style={{ width: '40px', height: '40px' }}
      {...props}
    >
      {children}
    </div>
  );
};

export { Avatar, AvatarImage, AvatarFallback }; 