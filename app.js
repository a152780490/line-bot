const express = require('express');
const line = require('@line/bot-sdk');
const cron = require('node-cron');

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || 'miteCrm5LO12yKC3bkA0JUyXJmG1Ij7njpw7gnBmy5a6tHvdh256tKfcDHLC8FAk8ukcU8FDVbW3jdxgjYMsvrVKsUk90Up6WYAcBgcuW+u2bf4+HQo150rAqoazAlRDux3XoIGDqR93usVORUcpbwdB04t89/1O/w1cDnyilFU=',
  channelSecret: process.env.CHANNEL_SECRET || '2331849964c6f9dad76337152a665c61',
};

const client = new line.Client(config);
const app = express();

app.use(line.middleware(config));

app.post('/webhook', (req, res) => {
  console.log('✅ 收到 webhook:', JSON.stringify(req.body));
  Promise
    .all(req.body.events.map(handleEvent))
    .then(() => res.status(200).send('OK'))
    .catch((err) => {
      console.error('❌ 發生錯誤:', err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userMsg = event.message.text.trim().toLowerCase();
  console.log('收到訊息:', userMsg);

  let replyText = '你好，我是懶人助手小神器！';

  if (userMsg.includes('你好')) {
    replyText = '你好啊！很高興認識你～';
  } else if (userMsg.includes('再見')) {
    replyText = '再見！期待下次聊天～';
  } else if (userMsg.includes('幫助')) {
    replyText = '請問需要什麼幫助呢？';
  } else if (userMsg.startsWith('股票')) {
    const stockCode = userMsg.replace('股票', '').trim();
    if (/^\d{4}$/.test(stockCode)) {
      replyText = `股票代號 ${stockCode} 的即時股價為：$${(Math.random() * 100 + 100).toFixed(2)}（模擬資料）`;
    } else {
      replyText = '請輸入正確的股票代碼（4碼數字），例如：股票 2330';
    }
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText,
  });
}

// 每天 20:00 自動推播樂天聯盟連結
cron.schedule('0 20 * * *', () => {
  const toUserId = '你的用戶ID'; // 可改為動態用戶儲存邏輯
  const pushMessage = {
    type: 'text',
    text: '🛒 今日懶人神器推薦：\n屈臣氏Watsons 👉 https://affiliate.api.rakuten.com.tw/redirect?nw=tw&site=afl&ar=8e695938e08d5ad6c86f697b1809fba5a5885451a9b4c42a5f7aeac8eaec15496821bd616eda6de8&cs=845286406c464239fae7a5487bd36567&pr=6df508f53784c75f&ap=pr%3D6df508f53784c75f&e=1&url=https%3A%2F%2Fwww.rakuten.com.tw%2Fshop%2Fwatsons%3Fscid%3Drafp-%26utm_source%3Dindividual%26utm_medium%3Drafp-ind69097%26utm_campaign%3Dshop_URL_PC'
  };

  client.pushMessage(toUserId, pushMessage)
    .then(() => console.log('✅ 每晚8點推播完成'))
    .catch((err) => console.error('❌ 推播錯誤', err));
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
