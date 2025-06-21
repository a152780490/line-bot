const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '你的AccessToken',
  channelSecret: process.env.CHANNEL_SECRET || '你的ChannelSecret',
};

const client = new line.Client(config);
const app = express();

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

  let replyText = '你好，我是懶人神器小助手，請輸入「推薦」來看推薦商品。';

  if (userMsg.includes('你好')) {
    replyText = '你好啊！很高興認識你～';
  } else if (userMsg.includes('再見')) {
    replyText = '再見！期待下次聊天～';
  } else if (userMsg.includes('幫助')) {
    replyText = '請問需要什麼幫助呢？';
  } else if (userMsg.includes('推薦')) {
    replyText = `今日推薦：屈臣氏熱銷商品！點此購買👉\nhttps://affiliate.api.rakuten.com.tw/redirect?nw=tw&site=afl&ar=8e695938e08d5ad6c86f697b1809fba5a5885451a9b4c42a5f7aeac8eaec15496821bd616eda6de8&cs=845286406c464239fae7a5487bd36567&pr=6df508f53784c75f&ap=pr%3D6df508f53784c75f&e=1&url=https%3A%2F%2Fwww.rakuten.com.tw%2Fshop%2Fwatsons%3Fscid%3Drafp-%26utm_source%3Dindividual%26utm_medium%3Drafp-ind69097%26utm_campaign%3Dshop_URL_PC`;
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

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

// Render 會指定 PORT，沒指定就用 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
