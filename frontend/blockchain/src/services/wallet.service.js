import { BrowserProvider, Contract } from "ethers";
import ABI from "../../abi.json";

const WALLET_STORAGE_KEY = "producttrace_wallet";
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const getInjectedProvider = () => {
  if (typeof window === "undefined") return null;
  return window.ethereum || null;
};

const getBrowserProvider = () => {
  const injectedProvider = getInjectedProvider();
  if (!injectedProvider) return null;
  return new BrowserProvider(injectedProvider);
};

const normalizeAddress = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value?.address === "string") return value.address;
  return "";
};

export const connectWalletWithEthers = async () => {
  const provider = getBrowserProvider();
  if (!provider) {
    throw new Error("Không tìm thấy MetaMask. Vui lòng cài extension trước.");
  }

  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  if (!address) {
    throw new Error("Không nhận được tài khoản từ MetaMask.");
  }

  return address;
};

export const getConnectedWalletWithEthers = async () => {
  const provider = getBrowserProvider();
  if (!provider) return "";

  const accounts = await provider.listAccounts();
  if (!accounts?.length) return "";

  return normalizeAddress(accounts[0]);
};

export const subscribeWalletChanges = (onAddressChanged) => {
  const injectedProvider = getInjectedProvider();
  if (!injectedProvider) {
    return () => {};
  }

  const handler = (accounts) => {
    const nextAddress =
      Array.isArray(accounts) && accounts.length
        ? normalizeAddress(accounts[0])
        : "";
    onAddressChanged(nextAddress);
  };

  injectedProvider.on("accountsChanged", handler);

  return () => {
    injectedProvider.removeListener("accountsChanged", handler);
  };
};

export const switchToFlareNetwork = async () => {
  const provider = getInjectedProvider();
  if (!provider) throw new Error("No wallet");

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x72" }], // 114
    });
  } catch (err) {
    if (err.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x72",
            chainName: "Flare Coston2",
            rpcUrls: ["https://coston2.enosys.global/ext/C/rpc"],
            nativeCurrency: {
              name: "Coston2 FLR",
              symbol: "C2FLR",
              decimals: 18,
            },
          },
        ],
      });
    } else {
      throw err;
    }
  }
};

export const addProductContract = async (uuid, hash) => {
  const provider = getBrowserProvider();
  if (!provider) throw new Error("MetaMask not found");

  const signer = await provider.getSigner();
  const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);
  const network = await provider.getNetwork();
  if (network.chainId !== 114n) {
    await switchToFlareNetwork();
  }
  const tx = await contract.addProduct(uuid, hash);
  const receipt = await tx.wait();
  return receipt.hash;
};

export const updateProductContract = async (uuid, newHash) => {
  try {
    const provider = getBrowserProvider();
    if (!provider) throw new Error("MetaMask not found");

    const signer = await provider.getSigner();

    const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);


    const tx = await contract.updateProduct(uuid, newHash);
    const receipt = await tx.wait();

    return receipt.hash;
  } catch (err) {
    console.error("FULL ERROR:", err);
    console.error("Reason:", err.reason);
    console.error("Data:", err.data);
    throw err;
  }
};

export { WALLET_STORAGE_KEY };
