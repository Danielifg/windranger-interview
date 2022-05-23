import {ethers,run,upgrades} from 'hardhat';

async function main(){
    const signers = await ethers.getSigners();

}

main()
.then(process.exit(0))
.catch(err=>console.log(err))