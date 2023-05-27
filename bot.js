// import the required libraries
import { Wallet, BigNumber, ethers, providers } from "ethers";
import {
    FlashbotsBundleProvider,
    FlashbotsBundleResolution,
} from "@flashbots/ethers-provider-bundle";
import * as dotenv from "dotenv";

dotenv.config();

const provider = new providers.JsonRpcProvider(PROVIDER_LINK);

const authSigner = new Wallet(PRIVATE_KEY, provider);
