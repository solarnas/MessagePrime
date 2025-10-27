import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, CONFIDENTIAL_TRADE_ABI } from '../config/contracts';

export const useRegistrationStatus = () => {
  const { address, isConnected } = useAccount();

  const {
    data: registrationData,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.CONFIDENTIAL_TRADE as `0x${string}`,
    abi: CONFIDENTIAL_TRADE_ABI,
    functionName: 'getUserRegistration',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  // registrationData is now a UserRegistration struct
  const userReg = registrationData as { encryptedProxyAddress: `0x${string}`; isRegistered: boolean; registrationTime: bigint } | undefined;
  const isRegistered = userReg ? userReg.isRegistered : false;
  const registrationTimestamp = userReg ? userReg.registrationTime : BigInt(0);
  
  // encryptedProxyAddress is already a bytes32 hex string
  const encryptedAddress = userReg && userReg.encryptedProxyAddress !== '0x0000000000000000000000000000000000000000000000000000000000000000' 
    ? userReg.encryptedProxyAddress 
    : null;

  return {
    isRegistered,
    registrationTimestamp,
    encryptedAddress,
    isLoading,
    isError,
    refetch,
  };
};