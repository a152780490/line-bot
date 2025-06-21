const express = require('express');
const line = require('@line/bot-sdk');

// 請務必改成用環境變數，勿直接寫死密鑰（以下僅供測試）
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '你的AccessToken',
  channelSecret: process.env.CHANNEL_SECRET || '你的ChannelSecret',
};

const client = new line.Client(config);
const app = express();

// 使用 LINE 的 middleware 解析訊息
app.use(line.middleware(config));

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

// Render 用的 Port 必須是 process.env.PORT
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
