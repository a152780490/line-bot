const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: 'miteCrm5LO12yKC3bkA0JUyXJmG1Ij7njpw7gnBmy5a6tHvdh256tKfcDHLC8FAk8ukcU8FDVbW3jdxgjYMsvrVKsUk90Up6WYAcBgcuW+u2bf4+HQo150rAqoazAlRDux3XoIGDqR93usVORUcpbwdB04t89/1O/w1cDnyilFU=',
  channelSecret: '2331849964c6f9dad76337152a665c61',
};

const client = new Client(config);
const app = express();

app.use(middleware(config));

app.post('/webhook', (req, res) => {
  console.log('✅ 收到 webhook');
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

  let replyText = '你好，我是小幫手';

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
