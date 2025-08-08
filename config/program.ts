import { RustUndead } from "@/types/idlTypes";
import { PublicKey } from "@solana/web3.js";
import undeadIdl from "../idl/undead.json";

export const PROGRAM_ID = new PublicKey(
  "HYHburusRpKcHxcMrrE2oh9DgysGpfpJTeDMDHuTf4Q9"
);

export const DELEGATION_PROGRAM_ID = new PublicKey(
  "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
);

// Export both the IDL and the TypeScript type
export const PROGRAM_IDL = undeadIdl;
export type RustUndeadProgram = RustUndead;

export const authority = new PublicKey(
  "7gyjmugBPxx93NvdegiKz8JHeAaRYC8EbeFFuogWB9zX"
);
