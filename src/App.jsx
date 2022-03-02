import React from "react";
import {useEffect, useState} from "react";
import {ethers} from "ethers";
import abi from "./utils/WavePortal.json";
import './App.css';

const App = () => {


  const [currentAccount,  setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0xfee8504e722F25382D9825F3b1CB0fdb56696Df7";
  const contractABI = abi.abi;

  const getAllWaves = async () => {
    try {
      const {ethereum} = window;
      if(ethereum) {

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer   = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address : wave.waver,
            timestamp : new Date( wave.timestamp * 1000 ),
            message : wave.message
          });
        });

        setAllWaves(wavesCleaned);
        
      }else{
        console.log("Ethereum object doesn't exist!");
      } 
    } catch(error){
      console.log(error);
    }
  }

  useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);

  
  const checkIfWalletConnected = async () => {
    try{
      const {ethereum} = window;

      if(!ethereum){
        console.log('Make sure you have your ethereum wallet connected');
      }
      else{
        console.log('We have the ethereum object , ', ethereum);
      }

      const accounts = await ethereum.request({method : "eth_accounts"});

      if(accounts.length !== 0){
        const account = accounts[0];
        console.log("Account found ", account);
        setCurrentAccount(account);
        getAllWaves();
      }else{
        console.log('No account found');
      }
    }catch(error){
      cosole.log(error);
    } 
  }

  const wave = async () => {
    try {
      const {ethereum} = window;

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum); 
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave("this is a message");
        console.log("Mining..", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total wave count ..... ', count.toNumber());
      }else{
        console.log('Ethereum object does not exist');
      }
    } catch(error){
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try{
      const {ethereum} = window;

      if(!ethereum){
        alert("Get Metamask");
        return;
      }
      const accounts = await ethereum.request({method : "eth_requestAccounts"});
      console.log("Connected account : ", accouts[0]);
      setCurrentAccount(accounts[0]);
    }catch(error){
      console.log(error);
    }
    
  }

  useEffect(() => {
    checkIfWalletConnected();
  }, [])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am Mahendra and I am learning to deploy a Dapp. Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
      

      {!currentAccount && (
        <button className = "waveButton" onClick = {connectWallet}> 
        Connect Wallet
      </button>)}


      {(allWaves.len > 0) && (<p> No waves! </p>)}  
      {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
      })}

    </div>
   </div>
  );
}

export default App