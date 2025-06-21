const express = require('express');
const line = require('@line/bot-sdk');
const cron = require('node-cron');

// 建議改用環境變數設定 Token 和 Secret，避免直接寫死
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || 'miteCrm5LO12yKC3bkA0JUyXJmG1Ij7njpw7gnBmy5a6tHvdh256tKfcDHLC8FAk8ukcU8FDVbW3jdxgjYMsvrVKsUk90Up6WYAcBgcuW+u2bf4+HQo150rAqoazAlRDux3XoIGDqR93usVORUcpbwdB04t89/1O/w1cDnyilFU=',
  channelSecret: process.env.CHANNEL_SECRET || '2331849964c6f9dad76337152a665c61',
};

const client = new line.Client(config);
const app = express();

// 使用 LINE middleware 解析 webhook 訊息
app.use(line.middleware(config));

// Webhook 路由
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

// 處理收到的事件
function handleEvent(event) {
  // 非文字訊息直接忽略
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

  // 回覆用戶訊息
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText,
  });
}

// 設定每天晚上 8 點 (20:00) 自動推播訊息
// cron 表達式 '0 20 * * *' 表示每天 20:00 執行一次
cron.schedule('0 20 * * *', () => {
  // TODO: 將下面 to 改成你要推播的用戶ID或群組ID
  const toUserId = '你的用戶ID';

  const pushMessage = {
    type: 'text',
    text: '🛒 今日懶人神器推薦：https://affiliate-link.example.com',
  };

  client.pushMessage(toUserId, pushMessage)
    .then(() => console.log('✅ 每晚8點推播完成'))
    .catch((err) => console.error('❌ 推播錯誤', err));
});

// Render 服務使用的 port，預設 10000
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
// Render 會指定 PORT，沒指定就用 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
