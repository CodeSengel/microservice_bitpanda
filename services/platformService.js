const axios = require("axios");
const _ = require("lodash");

const base_url = "https://api.bitpanda.com/v1/";
let fiattransactionResponse;

let endpoints = {
  fiattransaction: base_url + "fiatwallets/transactions",
  cryptotransaction: base_url + "wallets/transactions",
};

const getDataFiat = async (item) => {
  let fiatDepositDetails = [];
  let fiatDepositAmount = 0;
  let fiatwithdrawalDetails = [];
  let fiatwithdrawalAmount = 0;
  const headers = { "X-Api-Key": item };

  try {
    fiattransactionResponse = await axios.default.get(
      endpoints.fiattransaction,
      {
        params: { page_size: 1000 },
        headers,
      }
    );
  } catch (error) {
    console.log("voici l erreur data fiat ");
    throw error;
  }
  const fiattransactionData = fiattransactionResponse.data.data;

  fiattransactionData.forEach((element) => {
    if (element.attributes.type == "deposit") {
      fiatDepositDetails.push(element);
      fiatDepositAmount =
        fiatDepositAmount + parseFloat(element.attributes.amount);
    }
    if (element.attributes.type == "withdrawal") {
      fiatwithdrawalDetails.push(element);
      fiatwithdrawalAmount =
        fiatwithdrawalAmount + parseFloat(element.attributes.amount);
    }
  });
  return {
    deposit: { details: fiatDepositDetails, total: fiatDepositAmount },
    withdrawal: { details: fiatwithdrawalDetails, total: fiatwithdrawalAmount },
  };
};

function regrouperParCle(donnees, cle) {
  const groupes = {};

  donnees.forEach((element) => {
    const valeurCle = element[cle];

    if (!groupes[valeurCle]) {
      groupes[valeurCle] = [];
    }

    groupes[valeurCle].push(element);
  });

  return groupes;
}

function transformBuylist(buylist) {
  const transformedBuylist = {};

  Object.keys(buylist).forEach((coin) => {
    const coinData = buylist[coin];
    const total = coinData.reduce(
      (acc, item) => acc + parseFloat(item.attributes.amount),
      0
    );
    const invest = coinData.reduce(
      (acc, item) => acc + parseFloat(item.attributes.amount_eur),
      0
    );
    const fee = coinData.reduce(
      (acc, item) => acc + parseFloat(item.attributes.fee),
      0
    );
    const averageprice = invest / total;

    transformedBuylist[coin] = {
      buy: {
        total,
        invest,
        fee,
        averageprice,
        buydetails: coinData, // Laissez tous les attributs par défaut
      },
    };
  });

  return transformedBuylist;
}

function transformSelllist(selllist) {
  const transformSelllist = {};

  Object.keys(selllist).forEach((coin) => {
    const coinData = selllist[coin];
    const total = coinData.reduce(
      (acc, item) => acc + parseFloat(item.attributes.amount),
      0
    );
    const recipe = coinData.reduce(
      (acc, item) => acc + parseFloat(item.attributes.amount_eur),
      0
    );
    const fee = coinData.reduce(
      (acc, item) => acc + parseFloat(item.attributes.fee),
      0
    );
    const averageprice = recipe / total;

    transformSelllist[coin] = {
      sell: {
        total,
        recipe,
        fee,
        averageprice,
        selldetails: coinData, // Laissez tous les attributs par défaut
      },
    };
  });

  return transformSelllist;
}

function transformDepositlist(depositlist) {
  const transformDepositlist = {};

  Object.keys(depositlist).forEach((coin) => {
    const coinData = depositlist[coin];
    const total = coinData.reduce(
      (acc, item) => acc + parseFloat(item.attributes.amount),
      0
    );
    const fee = coinData.reduce(
      (acc, item) => acc + parseFloat(item.attributes.fee),
      0
    );

    transformDepositlist[coin] = {
      deposit: {
        total,
        fee,
        depositdetails: coinData, // Laissez tous les attributs par défaut
      },
    };
  });

  return transformDepositlist;
}

function transformwithdrawallist(withdrawallist) {
  const transformwithdrawallist = {};

  Object.keys(withdrawallist).forEach((coin) => {
    const coinData = withdrawallist[coin];
    const total = coinData.reduce(
      (acc, item) => acc + parseFloat(item.attributes.amount),
      0
    );
    const fee = coinData.reduce(
      (acc, item) => acc + parseFloat(item.attributes.fee),
      0
    );

    transformwithdrawallist[coin] = {
      withdrawal: {
        total,
        fee,
        withdrawaldetails: coinData, // Laissez tous les attributs par défaut
      },
    };
  });

  return transformwithdrawallist;
}

function transformBuylist(buylist) {
  const transformedBuylist = {};

  Object.keys(buylist).forEach((coin) => {
    const coinData = buylist[coin];
    const total = coinData.reduce(
      (acc, item) => acc + parseFloat(item.attributes.amount),
      0
    );
    const invest = coinData.reduce(
      (acc, item) => acc + parseFloat(item.attributes.amount_eur),
      0
    );
    const fee = coinData.reduce(
      (acc, item) => acc + parseFloat(item.attributes.fee),
      0
    );
    const averageprice = invest / total;

    transformedBuylist[coin] = {
      buy: {
        total,
        invest,
        fee,
        averageprice,
        buydetails: coinData, // Laissez tous les attributs par défaut
      },
    };
  });

  return transformedBuylist;
}

// Fonction pour regrouper par coin
function regrouperParCoin(data) {
  const result = {};
  for (const type in data) {
    for (const coin in data[type]) {
      if (!result[coin]) {
        result[coin] = {};
      }
      result[coin][type] = data[type][coin];
    }
  }
  return result;
}

const getDataCrypto = async (item) => {
  const headers = { "X-Api-Key": item };
  let cryptotransactionResponse;

  let cryptoDataRaw = {
    buyList: [],
    sellList: [],
    depositList: [],
    withdrawalList: [],
    transferList: [],
    //rewards:[]
    refundList: [],
    icoList: [],
  };

  try {
    cryptotransactionResponse = await axios.default.get(
      endpoints.cryptotransaction,
      {
        params: { page_size: 10000, status: "finished" },
        headers,
      }
    );
  } catch (error) {
    console.log("voici l erreur datacrypto ");
    throw error;
  }

  // different type : buy, sell, deposit, withdrawal, transfer, refund or ico.

  const cryptotransactionData = cryptotransactionResponse.data.data;
  cryptotransactionData.forEach((element) => {
    if (element.attributes.cryptocoin_symbol) {
      element.coin = element.attributes.cryptocoin_symbol;
    }

    if (element.attributes.type == "buy") {
      cryptoDataRaw.buyList.push(element);
    }
    if (element.attributes.type == "sell") {
      cryptoDataRaw.sellList.push(element);
    }
    if (element.attributes.type == "deposit") {
      cryptoDataRaw.depositList.push(element);
    }
    if (element.attributes.type == "withdrawal") {
      cryptoDataRaw.withdrawalList.push(element);
    }
    if (element.attributes.type == "transfer") {
      cryptoDataRaw.transferList.push(element);
    }
    if (element.attributes.type == "refund") {
      cryptoDataRaw.refundList.push(element);
    }
    if (element.attributes.type == "ico") {
      cryptoDataRaw.icoList.push(element);
    }
  });

  Object.keys(cryptoDataRaw).forEach((prop) => {
    console.log(`Propriété : ${prop}`);
    console.log(`Length :`, cryptoDataRaw[prop].length);
    if (cryptoDataRaw[prop].length > 0) {
      cryptoDataRaw[prop] = regrouperParCle(cryptoDataRaw[prop], "coin");
      if (prop == "buyList") {
        cryptoDataRaw[prop] = transformBuylist(cryptoDataRaw[prop]); // transform to format "coin" : {"buy":{"total":120, "invest":1000,"PRU":22,"buydetails":[]}}
      }
      if (prop == "sellList") {
        cryptoDataRaw[prop] = transformSelllist(cryptoDataRaw[prop]);
      }

      if (prop == "depositList") {
        cryptoDataRaw[prop] = transformDepositlist(cryptoDataRaw[prop]);
      }
      if (prop == "withdrawalList") {
        cryptoDataRaw[prop] = transformwithdrawallist(cryptoDataRaw[prop]);
      }

      if (prop == "transferList") {
        cryptoDataRaw[prop] = transformtransfertlist(cryptoDataRaw[prop]);
      }
    }
    // Faites ce que vous voulez avec chaque propriété ici
  });

  // rewards

  let groupedData;
  try {
    groupedData = regrouperParCoin(cryptoDataRaw); //
  } catch (error) {
    console.log(error);
  }

  return groupedData;
};

function usePlarform() {
  const getData = async (item) => {
    const fiatData = await getDataFiat(item);
    let cryptoData;
    try {
      cryptoData = await getDataCrypto(item);
    } catch (error) {
      console.log(error);
    }

    return { fiatData, cryptoData };
  };

  return {
    getData,
  };
}

module.exports = usePlarform;
