import React, { useEffect, useState } from 'react';
import { Atom, Commet } from 'react-loading-indicators';

interface PageLoaderProps {
  loading: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({ loading }) => {
  const [pageHeight, setPageHeight] = useState('100vh');

  useEffect(() => {
    if (loading) {
      const height = `${document.documentElement.scrollHeight}px`;
      setPageHeight(height);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [loading]);

  if (!loading) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: pageHeight,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Atom color='#1E3A8A'/>
       
        <div
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1E3A8A',
            marginTop: '10px',
          }}
        >
          Loading...
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
