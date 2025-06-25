import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { categories } from '../data/mockData';

const SidebarCategories = () => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';

  return (
    <div className="sticky-top" style={{ top: '1rem', paddingTop: '1rem' }}>
      <h5 className="mb-3 px-3">Categories</h5>
      <Nav className="flex-column">
        <Nav.Link
          as={Link}
          to="/"
          className={`px-3 py-2 ${!selectedCategory ? 'active bg-primary text-white rounded' : ''}`}
        >
          All Categories
        </Nav.Link>
        {categories.map(category => (
          <Nav.Link
            key={category.id}
            as={Link}
            to={`/?category=${category.id}`}
            className={`px-3 py-2 ${selectedCategory === category.id ? 'active bg-primary text-white rounded' : ''}`}
          >
            {category.name}
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
};

export default SidebarCategories; 