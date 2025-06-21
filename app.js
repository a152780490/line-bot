const express = require('express');
const line = require('@line/bot-sdk');
const cron = require('node-cron');

// LINE Bot 設定，用環境變數或直接填
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '你的ChannelAccessToken',
  channelSecret: process.env.CHANNEL_SECRET || '你的ChannelSecret',
};

const client = new line.Client(config);
const app = express();

// 簽章驗證 middleware
app.use(line.middleware(config));

// 用來存曾經互動過的用戶ID，實務請改用資料庫存
const userIds = new Set();

// webhook 接收事件
app.post('/webhook', (req, res) => {
  Promise
    .all(req.body.events.map(async (event) => {
      // 如果是文字訊息，存用戶ID
      if (event.type === 'message' && event.message.type === 'text') {
        userIds.add(event.source.userId);
      }
      // 處理事件
      return handleEvent(event);
    }))
    .then(() => res.status(200).send('OK'))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  const userMsg = event.message.text.trim().toLowerCase();
  let replyText = '你好，我是你的懶人助手小神器！';

  if (userMsg.includes('你好')) {
    replyText = '你好啊！很高興認識你～';
  } else if (userMsg.includes('再見')) {
    replyText = '再見！期待下次聊天～';
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText,
  });
}

// 定時任務：每天晚上 8 點自動推播訊息給所有互動過用戶
cron.schedule('0 20 * * *', () => {
  console.log('開始推播給所有用戶，共:', userIds.size, '位');

  userIds.forEach(userId => {
    client.pushMessage(userId, {
      type: 'text',
      text: '🛒 今日懶人神器推薦：https://affiliate-link.example.com',
    }).then(() => {
      console.log(`推播成功給用戶: ${userId}`);
    }).catch(err => {
      console.error(`推播失敗給用戶: ${userId}`, err);
    });
  });
});

// 監聽 port (Render 指定環境變數 PORT)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
