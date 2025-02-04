import React from 'react';

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(seedphrase);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
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
            placeholder="Enter your recovery phrase"
            required
          />
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