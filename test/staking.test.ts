// Start - Support direct Mocha run & debug
import "hardhat"
import "@nomiclabs/hardhat-ethers"
// End - Support direct Mocha run & debug
import {ethers} from "hardhat"
require("dotenv").config({path: "../.env"})
import chai, {expect} from "chai"

import {solidity} from "ethereum-waffle"
import {Staking, ERC20Mock} from "../typechain-types"
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers"
import {successfulTransaction} from "./framework/transaction"
import {
    verifyStakeEvent,
    verifyWithdrawEvent,
    verifySetRewardTokenFundsEvent
} from "./contract/verify-staking-events"
import {deployContract} from "./framework/contracts"
import {BigNumber as BN} from "ethers"

// Wires up Waffle with Chai
chai.use(solidity)

describe("Staking", () => {
    before(async function () {
        // Deploy Mock reward Token
        this.rewardToken = await deployContract<ERC20Mock>("ERC20Mock")
        const signers = await ethers.getSigners()
        this.admin = <SignerWithAddress> signers[0]
        this.user1 = <SignerWithAddress> signers[1]
    })

    beforeEach(async function () {
        this.provider = await ethers.getDefaultProvider()
        const blockNumber: Number = await this.provider.getBlockNumber()
        this.lockUpStartTime = (
            await this.provider.getBlock(blockNumber)
        ).timestamp
        const currentTimeStamp: Date = new Date(this.lockUpStartTime * 1000)
        const date = new Date()
        date.setDate(currentTimeStamp.getDate() + 7)
        this.lockUpEndTime = (date.getTime() * 1000) / 1000

        this.stakingContract = await deployContract<Staking>(
            "Staking",
            this.rewardToken.address,
            BN.from(this.lockUpStartTime),
            BN.from(this.lockUpEndTime)
        )
        this.withdrawAmount = ethers.utils.parseUnits("2", "ether")
    })

    it("Admin should deposit funds for staking rewards", async function () {
        const depositAmount = ethers.utils.parseUnits("3", "ether")
        // Approve Staking contract  before deposit
        this.rewardToken
            .connect(this.admin)
            .approve(this.stakingContract.address, depositAmount)
        const depositReceipt = await successfulTransaction(
            this.stakingContract
                .connect(this.admin)
                .setRewardTokenFunds(depositAmount)
        )

        const rewardTokenBalance: BN = await this.rewardToken.balanceOf(
            this.stakingContract.address
        )
        expect(BN.from(rewardTokenBalance)).equals(depositAmount)

        verifySetRewardTokenFundsEvent(depositReceipt, depositAmount)
    })

    it("User should stake within lockup period", async function () {
        const stakingAmount = ethers.utils.parseUnits("2", "ether")
        const stakeReceipt = await successfulTransaction(
            this.stakingContract
                .connect(this.user1)
                .stake({value: stakingAmount})
        )
        const user1Stakes = await this.stakingContract.balances(
            this.user1.address
        )
        expect(BN.from(stakingAmount)).equals(user1Stakes)

        verifyStakeEvent(stakeReceipt, user1Stakes)
    })

    it("User should withdraw after lockupEndTime", async function () {
        const testWithdrawAmount = ethers.utils.parseUnits("5", "ether")
        this.rewardToken
            .connect(this.admin)
            .approve(this.stakingContract.address, testWithdrawAmount)
        this.stakingContract
            .connect(this.admin)
            .setRewardTokenFunds(testWithdrawAmount)
        this.stakingContract
            .connect(this.user1)
            .stake({value: testWithdrawAmount})

        // Withdraw
        await this.stakingContract.updateLockupEndTime(this.lockUpStartTime)
        const withdrawReceipt = await successfulTransaction(
            this.stakingContract
                .connect(this.user1)
                .withdraw(this.withdrawAmount)
        )
        const user1RewardBalance: BN = await this.rewardToken.balanceOf(
            this.user1.address
        )
        verifyWithdrawEvent(
            withdrawReceipt,
            this.withdrawAmount,
            user1RewardBalance
        )
    })
})
