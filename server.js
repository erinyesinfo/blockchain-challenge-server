require("dotenv").config();
const express = require("express");
const helmet = require('helmet');
const cors = require("cors");

const solanaweb3 = require('@solana/web3.js');
let searchAddress = 'rFqFJ9g7TGBD8Ed7TPDnvGKZ5pWLPDyxLcvcH2eRCtt';
const endpoint = `https://cosmopolitan-stylish-reel.solana-devnet.discover.quiknode.pro/${process.env.ENDPOINT}/`;
const solanaConnetion = new solanaweb3.Connection(endpoint);

const app = express();

let whitelist = [
  process.env.PATH_TO_FRONTEND,
  process.env.PATH_TO_FRONTEND_2
];
let corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    // reflect (enable) the requested origin in the CORS response
    corsOptions = {
      credentials: true,
      origin: true,
      optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    }
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
};

app.use(helmet());
app.use(cors(corsOptionsDelegate));

app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", async (req, res, next) => {
    res.send("Hello")
});

app.get("/read", async (req, res, next) => {
    const pubKey = new solanaweb3.PublicKey(searchAddress);
    let transactionList = await solanaConnetion.getSignaturesForAddress(pubKey, { limit: parseInt(process.env.LIMIT) });
    let signatureList = transactionList.map(transaction => transaction.signature);
    let transactionDetails = await solanaConnetion.getParsedTransactions(signatureList);
    let data = [], instructions = {};
    transactionList.forEach((transaction, i) => {
        const date = new Date(transaction.blockTime * 1000);
        const transactionInstructions = transactionDetails[i].transaction.message.instructions;
        
        transactionInstructions.forEach((instruction, i2) => {
            instructions = {
                'transaction_instructions_1': `${instruction.program ? instruction.program + ":": ""} ${instruction.programId.toString()}`,
                'transaction_instructions_2': `${instruction.program ? instruction.program + ":": ""} ${instruction.programId.toString()}`,
                'transaction_instructions_3': `${instruction.program ? instruction.program + ":": ""} ${instruction.programId.toString()}`,
            }
        })
        data = [...data, {
            'transaction_number': i+1,
            'slot': transaction.slot,
            'signature': transaction.signature,
            'time': new Date(date).toString(),
            'status': transaction.confirmationStatus,
            instructions
        }];
    })
    return res.send(JSON.stringify(data))
});

app.post("/update", async (req, res, next) => {
    const { address } = req.body;
    let pubKey;
    try {
        pubKey = new solanaweb3.PublicKey(address || searchAddress);
    } catch(e) {
        return res.status(404).send("error")
    }
    let transactionList = await solanaConnetion.getSignaturesForAddress(pubKey, { limit: parseInt(process.env.LIMIT) });
    let signatureList = transactionList.map(transaction => transaction.signature);
    let transactionDetails = await solanaConnetion.getParsedTransactions(signatureList);
    let data = [], instructions = {};
    transactionList.forEach((transaction, i) => {
        const date = new Date(transaction.blockTime * 1000);
        const transactionInstructions = transactionDetails[i].transaction.message.instructions;
        
        transactionInstructions.forEach((instruction, i2) => {
            instructions = {
                'transaction_instructions_1': `${instruction.program ? instruction.program + ":": ""} ${instruction.programId.toString()}`,
                'transaction_instructions_2': `${instruction.program ? instruction.program + ":": ""} ${instruction.programId.toString()}`,
                'transaction_instructions_3': `${instruction.program ? instruction.program + ":": ""} ${instruction.programId.toString()}`,
            }
        })
        data = [...data, {
            'transaction_number': i+1,
            'slot': transaction.slot,
            'signature': transaction.signature,
            'time': new Date(date).toString(),
            'status': transaction.confirmationStatus,
            instructions
        }];
    })
    return res.send(JSON.stringify(data))
});


app.listen(process.env.PORT);
