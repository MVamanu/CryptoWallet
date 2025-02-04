export const ValidationUtils = {
  // Limitează lungimea și folosește regex simple
  username: (value: string): boolean => {
    if (value.length > 50) return false;
    return /^[a-zA-Z0-9_-]{3,50}$/.test(value);
  },

  // Validare simplă pentru seed phrase
  seedPhrase: (value: string): boolean => {
    if (value.length > 1000) return false; // Previne input-uri prea lungi
    return value.trim().split(/\s+/).length === 12; // Verifică numărul de cuvinte
  },

  // Validare pentru adresă ETH
  ethAddress: (value: string): boolean => {
    if (value.length !== 42) return false;
    return /^0x[a-fA-F0-9]{40}$/.test(value);
  }
}; 