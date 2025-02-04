import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-4">
              {children}
              
              {/* Footer comun */}
              <div className="text-center mt-4">
                <hr className="my-4" />
                <p className="text-muted mb-0" style={{ 
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  letterSpacing: '0.5px'
                }}>
                  Made with ❤️ by Zorbu
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout; 