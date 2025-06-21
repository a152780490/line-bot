const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || 'miteCrm5LO12yKC3bkA0JUyXJmG1Ij7njpw7gnBmy5a6tHvdh256tKfcDHLC8FAk8ukcU8FDVbW3jdxgjYMsvrVKsUk90Up6WYAcBgcuW+u2bf4+HQo150rAqoazAlRDux3XoIGDqR93usVORUcpbwdB04t89/1O/w1cDnyilFU=',
  channelSecret: process.env.CHANNEL_SECRET || '2331849964c6f9dad76337152a665c61',
};

const client = new line.Client(config);
const app = express();

app.use(line.middleware(config));

app.post('/webhook', (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.status(200).send('OK'))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  const text = event.message.text.toLowerCase();

  let reply = '我聽不懂你說什麼，可以說「你好」、「再見」或「幫助」試試看。';

  if (text.includes('你好')) {
    reply = '你好！很高興和你聊天！';
  } else if (text.includes('再見')) {
    reply = '再見囉！期待下次見！';
  } else if (text.includes('幫助')) {
    reply = '你可以跟我說「你好」、「再見」，或問我股票代碼喔！';
  } else if (text.startsWith('股票')) {
    const stock = text.replace('股票', '').trim();
    if (/^\d{4}$/.test(stock)) {
      reply = `股票代號 ${stock} 現在的價格是 $${(Math.random()*100+100).toFixed(2)}（模擬）`;
    } else {
      reply = '請輸入正確的股票代碼（4位數字），例如：股票 2330';
    }
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: reply,
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

