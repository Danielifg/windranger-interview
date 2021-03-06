// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;
import "hardhat/console.sol";
import "./mocks/ERC20Mock.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
  *  @title Simple Staking contract
  *  @dev rewards mock token on staking
  */
contract Staking {
    using SafeERC20 for IERC20;
    mapping(address => uint256) public balances;
    uint256 public lockupStartTime;
    uint256 public lockupEndTime;
    address public ADMIN;

    uint256 MINIMUM_DEPOSTI = 1 ether;
    uint256 constant PRECISION = 10**5;

    event Stake(address sender, uint256 amount);
    event Withdraw(address sender, uint256 amount, uint256 rewardAmount);
    event DepositRwrdTokenFunds(uint256 amount);

    IERC20 public rewardToken;

    modifier onlyAdmin() {
        require(msg.sender == ADMIN, "Not an admin");
        _;
    }

    /**
    * @notice define reward token and lock period
    * @param _rewardToken Address of reward token to give on stake
    * @param _lockupStartTime lockup start time
    * @param _lockupEndTime lockup end time to be able to withdraw
    */
    constructor(
        address _rewardToken,
        uint256 _lockupStartTime,
        uint256 _lockupEndTime
    ) {
        ADMIN = msg.sender;
        rewardToken = IERC20(_rewardToken);
        lockupStartTime = _lockupStartTime;
        lockupEndTime = _lockupEndTime;
    }

   /**
    * @notice Deposit funds for reward token
    * @dev only Admin access
    * @param amount amount to transfer to contract of reward token
    */
    function setRewardTokenFunds(uint256 amount) public onlyAdmin {
        SafeERC20.safeTransferFrom(
            rewardToken,
            msg.sender,
            address(this),
            amount
        );
        emit DepositRwrdTokenFunds(amount);
    }

   /**
    * @notice Stake Eth into contract
    * @dev only accessibke during lockup period
    */
    function stake() public payable {
        require(
            block.timestamp > lockupStartTime,
            "Start luckup period haven't start"
        );
        require(
            msg.value > MINIMUM_DEPOSTI,
            "Less than minimum deposit amount"
        );
        balances[msg.sender] += msg.value;
        emit Stake(msg.sender, balances[msg.sender]);
    }

   /**
    * @notice Withdraw Eth
    * @dev rewards tokens on withdraw after lock period end
    */
    function withdraw(uint256 amount) public {
        require(
            block.timestamp > lockupEndTime,
            "Staking cooldown period of 7 days"
        );
        require(amount <= balances[msg.sender], "Not enough funds");
        uint256 contractRwrdSupply = IERC20(rewardToken).balanceOf(
            address(this)
        );

        // Send withdrawal amount
        balances[msg.sender] -= amount;
        (bool success, ) = msg.sender.call{value: amount}(" ");
        require(success, "Transfer failed.");

        // Send reward amount
        uint256 rewardAmount = ((contractRwrdSupply * PRECISION) /
            balances[msg.sender]) * PRECISION;
        SafeERC20.safeApprove(IERC20(rewardToken), msg.sender, rewardAmount);
        IERC20(rewardToken).transfer(msg.sender, rewardAmount);

        emit Withdraw(msg.sender, amount, rewardAmount);
    }

    /**
    * @notice Updtaes lockup endtime 
    * @dev only admin, useful for extending lockup periods
    */
    function updateLockupEndTime(uint256 _lockupEndTime) external onlyAdmin {
        lockupEndTime = _lockupEndTime;
    }

    // Depositis only allowed on staking calls
    fallback() external payable {
        revert("Only deposit through staking");
    }
}
