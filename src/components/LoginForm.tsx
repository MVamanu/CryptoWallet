import React from 'react';
import { UserCredentials } from '../models/Account';

interface LoginFormProps {
  credentials: UserCredentials;
  loginError: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  credentials,
  loginError,
  onChange,
  onSubmit
}) => {
  return (
    <div className="login-form">
      <h2 className="h4 mb-4">Login to Your Account</h2>
      <form onSubmit={onSubmit}>
        {loginError && (
          <div className="alert alert-danger" role="alert">
            {loginError}
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
        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </div>
      </form>
    </div>
  );
}; 