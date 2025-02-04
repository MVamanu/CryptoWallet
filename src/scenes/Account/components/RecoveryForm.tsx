import React, { useState } from 'react';
import { ValidationUtils } from '../../../utils/ValidationUtils';

interface RecoveryFormProps {
  seedphrase: string;
  onChange: (value: string) => void;
  onSubmit: (phrase: string) => void;
  onCancel: () => void;
}

export const RecoveryForm: React.FC<RecoveryFormProps> = ({
  seedphrase,
  onChange,
  onSubmit,
  onCancel
}) => {
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validare cu limitare de timp
    const startTime = Date.now();
    if (!ValidationUtils.seedPhrase(seedphrase)) {
      setError('Invalid recovery phrase format');
      return;
    }
    // Verifică timpul de execuție
    if (Date.now() - startTime > 100) {
      console.warn('Validation took too long');
    }

    onSubmit(seedphrase);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Limitează lungimea input-ului
    if (value.length <= 1000) {
      onChange(value);
      setError('');
    }
  };

  return (
    <div className="recovery-form">
      <h2 className="h4 mb-4">Recover Account</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="seedphrase" className="form-label">Recovery Phrase</label>
          <input
            type="text"
            className="form-control"
            id="seedphrase"
            value={seedphrase}
            onChange={handleChange}
            placeholder="Enter your 12-word recovery phrase"
            maxLength={1000}
            required
          />
          {error && (
            <div className="text-danger mt-1">
              <small>{error}</small>
            </div>
          )}
        </div>
        <div className="d-grid gap-2">
          <button type="submit" className="btn btn-primary">
            Recover
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