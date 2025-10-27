import { useState, useEffect } from 'react';
// import { SEPOLIA_CONFIG } from '../config/contracts';
import { FhevmInstance } from '../utils';
import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';
import { initSDK } from '@zama-fhe/relayer-sdk/bundle';

export const useFhevmInstance = () => {
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initFhevm = async () => {
      try {
        setIsLoading(true);

        // Initialize the SDK
        await initSDK();
        
        // Create instance with Sepolia config
        const config = {
          ...SepoliaConfig
        };
        
        const fhevmInstance = await createInstance(config);
        setInstance(fhevmInstance);
        
        setError(null);
      } catch (err) {
        console.error('Failed to initialize FHEVM instance:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize FHEVM');
      } finally {
        setIsLoading(false);
      }
    };

    initFhevm();
  }, []);

  return { instance, isLoading, error };
};