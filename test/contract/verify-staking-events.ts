import {stakeEvent, withdrawEvent, setRewardTokenFundsEvent} from './staking-events';
import {event} from '../framework/events'
import {expect} from 'chai'
import {ContractReceipt,BigNumber} from 'ethers'

/**
 * Verifies the StakeEvent, when expectation are not met the test fails.
 *
 * @param receipt expected to contain the StoreEvent, whose payload will be verified.
 * @param expectedValue expectation for the value field of the given StoreEvent.
 */
export function verifyStakeEvent(
    receipt: ContractReceipt,
    expectedValue: BigNumber
): void {
    const actualEvent = stakeEvent(event('Stake', receipt))

    expect(actualEvent.amount, 'Staked value matches').equals(
        expectedValue
    )
}

/**
 * Verifies the StakeEvent, when expectation are not met the test fails.
 *
 * @param receipt expected to contain the StoreEvent, whose payload will be verified.
 * @param expectedValue expectation for the value field of the given StoreEvent.
 */
export function verifyWithdrawEvent(
    receipt: ContractReceipt,
    withdrawValue: BigNumber,
    rewardsValue: BigNumber
): void {
    const actualEvent = withdrawEvent(event('Withdraw', receipt))
    expect(actualEvent.amount, 'WithdrawEvent value matches').equals(withdrawValue)
    expect(actualEvent.rewardAmount, 'WithdrawEvent value matches').equals(rewardsValue)
}

/**
 * Verifies the StakeEvent, when expectation are not met the test fails.
 *
 * @param receipt expected to contain the StoreEvent, whose payload will be verified.
 * @param expectedValue expectation for the value field of the given StoreEvent.
 */
 export function verifySetRewardTokenFundsEvent(
    receipt: ContractReceipt,
    expectedValue: BigNumber
): void {
    const actualEvent = setRewardTokenFundsEvent(event('DepositRwrdTokenFunds', receipt))

    expect(actualEvent.amount, 'setRewardTokenFundsEvent value matches').equals(
        expectedValue
    )
}
