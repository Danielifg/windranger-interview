import {ethers, run, upgrades} from "hardhat"
import {deployContract} from "../test/framework/contracts"
import {BigNumber as BN} from "ethers"


async function main() {
    const signers = await ethers.getSigners()
    const rewardToken = await deployContract<ERC20Mock>("ERC20Mock")
    const provider = await ethers.getDefaultProvider()
    const blockNumber: any = await provider.getBlockNumber()
     const lockUpStartTime = (
        await provider.getBlock(blockNumber)
    ).timestamp
    const currentTimeStamp: Date = new Date(lockUpStartTime * 1000)
    const date = new Date()
    date.setDate(currentTimeStamp.getDate() + 7)
    const lockUpEndTime = (date.getTime() * 1000) / 1000

    const stakingContract = await deployContract<Staking>(
        "Staking",
        rewardToken.address,
        BN.from(lockUpStartTime),
        BN.from(lockUpEndTime)
    )
}

main()
    .then(process.exit(0))
    .catch((err) => console.log(err))
