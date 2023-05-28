// import the required libraries
import { Wallet, BigNumber, ethers, providers } from "ethers";
import {
    FlashbotsBundleProvider,
    FlashbotsBundleResolution,
} from "@flashbots/ethers-provider-bundle";
import * as dotenv from "dotenv";

dotenv.config();

// setup the provider
const provider = new providers.JsonRpcProvider(PROVIDER_LINK);

// create a unique flashbots id
const authSigner = new Wallet(PRIVATE_KEY, provider);

// create the flashbots provider insider a start function
const start = async () => {
    const flashbotsProvider = await FlashbotsBundleProvider.create(
        provider,
        authSigner,
        FLASHBOTS_PROVIDER_LINK
    );
};

start();
