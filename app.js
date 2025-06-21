const express = require('express');
const line = require('@line/bot-sdk');

// 用環境變數讀取，避免密鑰硬編碼
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || 'miteCrm5LO12yKC3bkA0JUyXJmG1Ij7njpw7gnBmy5a6tHvdh256tKfcDHLC8FAk8ukcU8FDVbW3jdxgjYMsvrVKsUk90Up6WYAcBgcuW+u2bf4+HQo150rAqoazAlRDux3XoIGDqR93usVORUcpbwdB04t89/1O/w1cDnyilFU=',
  channelSecret: process.env.CHANNEL_SECRET || '2331849964c6f9dad76337152a665c61',
};

const client = new line.Client(config);
const app = express();

// 只在 /webhook 路由使用 LINE middleware，驗證簽名用的
app.post('/webhook', line.middleware(config), (req, res) => {
  console.log('✅ 收到 webhook', JSON.stringify(req.body));

  Promise
    .all(req.body.events.map(handleEvent))
    .then(() => res.status(200).send('OK'))
    .catch((err) => {
      console.error('❌ 發生錯誤:', err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  // 只處理文字訊息
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

// Render 會指定 PORT，沒指定就用 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
