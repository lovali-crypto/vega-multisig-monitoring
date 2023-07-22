const { Web3 } = require('web3');
const axios = require('axios');
require('dotenv').config(); 


// Set up the connection to the Ethereum network
const web3 = new Web3(process.env.ETH_NODE_ADDRESS);

const contractABI = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"nonce","type":"uint256"}],"name":"NonceBurnt","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"new_signer","type":"address"},{"indexed":false,"internalType":"uint256","name":"nonce","type":"uint256"}],"name":"SignerAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"old_signer","type":"address"},{"indexed":false,"internalType":"uint256","name":"nonce","type":"uint256"}],"name":"SignerRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16","name":"new_threshold","type":"uint16"},{"indexed":false,"internalType":"uint256","name":"nonce","type":"uint256"}],"name":"ThresholdSet","type":"event"},{"inputs":[{"internalType":"address","name":"new_signer","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"bytes","name":"signatures","type":"bytes"}],"name":"add_signer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"bytes","name":"signatures","type":"bytes"}],"name":"burn_nonce","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"get_current_threshold","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"get_valid_signer_count","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"nonce","type":"uint256"}],"name":"is_nonce_used","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"signer_address","type":"address"}],"name":"is_valid_signer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"old_signer","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"bytes","name":"signatures","type":"bytes"}],"name":"remove_signer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"new_threshold","type":"uint16"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"bytes","name":"signatures","type":"bytes"}],"name":"set_threshold","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"signers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"signatures","type":"bytes"},{"internalType":"bytes","name":"message","type":"bytes"},{"internalType":"uint256","name":"nonce","type":"uint256"}],"name":"verify_signatures","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}
];

const contractAddress = process.env.VEGA_MULTISIG_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);
const BOT_TOKEN = process.env.TG_BOT_TOKEN;
const CHAT_ID = process.env.TG_CHAT_ID; 
const HEALTHCHECK_ENDPOINT = process.env.HEALTHCHECK_ENDPOINT;

async function isValidSigner(validator) {
  try {
    const result = await contract.methods.is_valid_signer(validator).call();
    return result;
  } catch (error) {
    console.error('Error calling read method:', error);
  }
}

async function getValidSignerCount() {
    try {
      const result = await contract.methods.get_valid_signer_count().call();
      return result;
    } catch (error) {
      console.error('Error calling read method:', error);
    }
  }

async function getNodes() {
    try {
      const response = await axios.get(process.env.VEGA_REST_ENDPOINT);
      const data = response.data;
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
    
}

async function sendTelegramMessage(message) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const data = {
      chat_id: CHAT_ID,
      text: message,
    };
    const response = await axios.post(url, data);
    console.log('Telegram message sent:', response.data);
  } catch (error) {
    console.error('Error sending Telegram message:', error.message);
  }
}

async function start() {
    const signerCount = await getValidSignerCount();
    console.log('Number of signers: ', signerCount);
    let nodes = await getNodes();
    validators = nodes.nodes.edges;
    //console.log('Validators:', validators);

    validators.sort((a, b) => b.node.stakedTotal - a.node.stakedTotal);

    //console.log(validators);

    for(let i = 0; i < validators.length; i++){
        if(i < signerCount){
            console.log(validators[i].node.name, " should be in the multisignature contract");
            if(!(await isValidSigner(validators[i].node.ethereumAddress))){
                sendTelegramMessage("ERROR!! Need to add " + validators[i].node.ethereumAddress + ". It should be in the multisignature contract but it's not there")
            }
            else{
                console.log("OK")
            }
        }
        else{
            console.log(validators[i].node.name, " should not be in the multisignature contract");
            if(await isValidSigner(validators[i].node.ethereumAddress)){
                sendTelegramMessage("ERROR!! Need to remove " + validators[i].node.ethereumAddress + ". It should not be in the multisignature contract but it's there")
                console.log("ERROR!! ", validators[i].node.ethereumAddress, isValidSigner(validators[i].node.ethereumAddress))
            }
            else{
                console.log("OK")
            }
        }
    }

    if (HEALTHCHECK_ENDPOINT){
        await axios.get(HEALTHCHECK_ENDPOINT);
    }
    
 }
  
// Call start
start();