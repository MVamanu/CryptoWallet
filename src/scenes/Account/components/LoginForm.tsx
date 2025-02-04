import React from 'react';
import { UserCredentials } from '../../../models/Account';

interface LoginFormProps {
  credentials: UserCredentials;
  error: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  credentials,
  error,
  onChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="login-form">
      <h2 className="h4 mb-4">Login to Existing Account</h2>
      <form onSubmit={onSubmit}>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={credentials.username}
            onChange={onChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={credentials.password}
            onChange={onChange}
            required
          />
        </div>
        <div className="d-grid gap-2">
          <button type="submit" className="btn btn-primary">
            Login
          </button>
          <button 
            type="button" 
            className="btn btn-outline-secondary"
            onClick={onCancel}
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}; 