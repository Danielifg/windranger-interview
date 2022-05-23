import {BigNumber, Event} from 'ethers'
import {expect} from 'chai'
import {StakeEvent, WithdrawEvent, DepositRwrdTokenFundsEvent} from '../../typechain-types/Staking'

/**
 * Validates the event shape and converts the arguments of a StoreEvent.
 *
 * @param event whose content is expected to match a StakeEvent.
 *              If expectation are not met, test will be failed.
 */
export function stakeEvent(event: Event): {sender: string, amount: BigNumber} {
    const stake = event as StakeEvent
    expect(stake.args).is.not.undefined

    const args = stake.args
    expect(args?.values).is.not.undefined

    return {sender: args.sender,amount: args.amount}
}

export function withdrawEvent(event: Event): {sender: string, amount: BigNumber, rewardAmount : BigNumber} {
    const withdraw = event as WithdrawEvent
    expect(withdraw.args).is.not.undefined

    const args = withdraw.args
    expect(args?.values).is.not.undefined

    return {sender: args.sender,amount: args.amount, rewardAmount: args.rewardAmount}
}

export function setRewardTokenFundsEvent(event: Event): {amount: BigNumber} {
    const stake = event as DepositRwrdTokenFundsEvent
    expect(stake.args).is.not.undefined

    const args = stake.args
    expect(args?.values).is.not.undefined

    return {amount: args.amount}
}