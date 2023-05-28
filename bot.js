// import the required libraries
import { Wallet, BigNumber, ethers, providers } from "ethers"
import {
    FlashbotsBundleProvider,
    FlashbotsBundleResolution,
} from "@flashbots/ethers-provider-bundle"
import * as dotenv from "dotenv"

dotenv.config()

// setup the provider
const provider = new providers.JsonRpcProvider(PROVIDER_LINK)

// create a unique flashbots id
const authSigner = new Wallet(PRIVATE_KEY, provider)

// create the flashbots provider insider a start function
const start = async () => {
    const flashbotsProvider = await FlashbotsBundleProvider.create(
        provider,
        authSigner,
        FLASHBOTS_PROVIDER_LINK
    )

    // setup the required gas and block variables
    const GWEI = BigNumber.from(10).pow(9)
    const LEGACY_GAS_PRICE = GWEI.mul(13)
    const PRIORITY_FEE = GWEI.mul(100)
    const blockNumber = await provider.getBlockNumber()
    const block = await provider.getBlock(blockNumber)
    const maxBaseFeeInFutureBlock =
        FlashbotsBundleProvider.getMaxBaseFeeInFutureBlock(
            block.baseFeePerGas,
            6
        ) // 6 blocks in the future
    const amountInEther = "0.001"

    // create the signed transfer transactions using both types
    const signedTransactions = await flashbotsProvider.signBundle([
        {
            // both transactions are the same but one is type 1 and the other is type 2 after the fas changes
            signer: authSigner,
            transaction: {
                to: ADDRESS_SEND_TO,
                type: 2,
                maxFeePerGas: PRIORITY_FEE.add(maxBaseFeeInFutureBlock),
                maxPriorityFeePerGas: PRIORITY_FEE,
                data: "0x",
                chainId: 11155111, // sepolia
                value: ethers.utils.parseEther(amountInEther),
            },
        },
        // we need this second tx because flashbots only accept bundles that use at least 42000 gas
        {
            signer: authSigner,
            transaction: {
                to: ADDRESS_SEND_TO,
                gasPrice: LEGACY_GAS_PRICE,
                data: "0x",
                value: ethers.utils.parseEther(amountInEther),
            },
        },
    ])

    // run a flashbots simulation to make sure that it works
    console.log(new Date())
    console.log("Starting to run the simulation...")
    const simulation = await flashbotsProvider.simulate(
        signedTransactions,
        blockNumber + 1
    )
    console.log(new Date())

    // check the result of the simulation
    if (simulation.firstRevert) {
        return console.log(`Simulation Error: ${simulation.firstRevert.error}`)
    } else {
        console.log(`Simulation Success: ${blockNumber}`)
    }

    // send 10 bundles to guarantee inclusion in a flashbots generated block
    for (let i = 1; i <= 10; ++i) {
        const bunldeSubmission = await flashbotsProvider.sendRawBundle(
            signedTransactions,
            blockNumber + i
        )
        console.log("bundle submitted, waiting", bunldeSubmission.bundleHash)

        const waitResponse = await bunldeSubmission.wait()
        console.log(`Wait response: ${FlashbotsBundleResolution[waitResponse]}`)
        if (waitResponse === FlashbotsBundleResolution.BundleIncluded) {
            console.log("Bundle included")
            process.exit(0)
        } else {
            console.log({
                bundleStats: await flashbotsProvider.getBundleStats(
                    simulation.bundleHash,
                    blockNumber + i
                ),
                userStats: await flashbotsProvider.getUserStats(),
            })
        }
    }
}

start()
