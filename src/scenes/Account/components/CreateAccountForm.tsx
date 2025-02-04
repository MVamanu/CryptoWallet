import React, { useState } from 'react';
import { UserCredentials } from '../../../models/Account';

interface CreateAccountFormProps {
  onSubmit: (credentials: UserCredentials) => void;
  onCancel: () => void;
}

export const CreateAccountForm: React.FC<CreateAccountFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [credentials, setCredentials] = useState<UserCredentials>({
    username: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setCredentials(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (credentials.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    onSubmit(credentials);
  };

  return (
    <div className="create-account-form">
      <h2 className="h4 mb-4">Create New Account</h2>
      <form onSubmit={handleSubmit}>
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
            onChange={handleChange}
            required
            minLength={3}
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
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="d-grid gap-2">
          <button type="submit" className="btn btn-primary">
            Create Account
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