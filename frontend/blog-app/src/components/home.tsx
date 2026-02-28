import React from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Home: React.FC = () => {
  useDocumentTitle('LIVBlog - Home');

  return (
    <div>
      <h1>Home</h1>
    </div>
  );
};

export default Home;