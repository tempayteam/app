/* global BigInt */
import { useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { publicClient } from "./wagmiConfig";

const targetChainId = parseInt(process.env.REACT_APP_CHAIN_ID, 10);


export const readContractData = async (address, abi, functionName, args = []) => {
  // return useContractRead({
  //   address,
  //   abi,
  //   functionName,
  //   args,
  //   targetChainId,
  // });
  return await publicClient.readContract({
    address,
    abi,
    functionName,
    args,
    chainId: targetChainId,
    gas: BigInt(3000000),
  });

};

// export const prepareContractWriteData = async (address, abi, functionName, args = []) => {

//   return await prepareWriteContract({
//     address,
//     abi,
//     functionName,
//     targetChainId: bscTestnet.id,
//   })
// }



// export const usePrepareContractData = (address, abi, functionName, args = []) => {
//   const { config, error } = usePrepareContractWrite({
//     address,
//     abi,
//     functionName,
//     args,
//     targetChainId,
//   });


//   // const waitForTransaction = useWaitForTransaction();

//   // const executeWrite = async () => {
//   //   try {
//   //     const { hash } = await write();
//   //     const result = await waitForTransaction({ hash });
//   //     return result;
//   //   } catch (error) {
//   //     throw error;
//   //   }
//   // };

//   return { config };
// };

export const ContractWrite = ({ address, abi, functionName, initialArgs = [], enabled = true }) => {

  // const [writeSuccessResponse, setWriteSuccessResponse] = useState(null);
  // const [writeErrorResponse, setWriteErrorResponse] = useState(null);
  // const [transactionHash, setTransactionHash] = useState(null);
  const [args, setArgs] = useState(initialArgs);


  // const { config } = usePrepareContractWrite({
  //   address,
  //   abi,
  //   functionName,
  //   args,
  //   targetChainId,
  //   enabled,
  //   onSuccess(data) {
  //     console.log("Success", data);
  //   },
  //   onError(error) {
  //     console.log("Error", error);
  //     // setPrepareErrorResponse(error)
  //     // fireErrorToast(PREPARE_ERROR_MSG)
  //   },
  // });
  const { writeContract, data: transactionHash, error: writeErrorResponse, } = useWriteContract({
    address,
    abi,
    functionName,
    args,
    chainId: targetChainId,
    gas: BigInt(3000000),
  });
  console.log(writeErrorResponse)


  const { isSuccess: writeSuccessResponse } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  const updateArgs = (newArgs) => {
    setArgs(newArgs);
  };

  return { writeContract, writeSuccessResponse, writeErrorResponse, updateArgs, args, transactionHash };
};