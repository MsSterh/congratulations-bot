const token = process.env.TOKEN;

const Bot = require('node-telegram-bot-api');
let bot;

const admin = require('firebase-admin');

let serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.GOOGLE_FIREBASE_URL
  });
}

const writeData = (text) => {
  admin.database().ref('items').push().set(text);
};

const getRandomData = (id) => {
  let ref = admin.database().ref('items');
  ref.once('value', function (snapshot) {
    const items = Object.values(snapshot.val());
    const randomCongrat = items[Math.floor(Math.random() * items.length)];
    bot.sendMessage(id, randomCongrat, {parse_mode: 'HTML'});
  });
};


if (process.env.NODE_ENV === 'production') {
  bot = new Bot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
  bot = new Bot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

const defaultMessage = '/list - список доступных команд\n' +
'/add - добавление нового поздравления в список, через пробел\n' +
'/get - получение рандомного поздравления\n';

bot.on('message', (msg) => {
  if (msg.text.startsWith('/start') || msg.text.startsWith('/list')) {
    bot.sendMessage(msg.chat.id, defaultMessage, {parse_mode: 'HTML'});
    return;
  }

  if (msg.text.startsWith('/add ')) {
    writeData(msg.text.slice(5));
    msg.text.slice(5);
    bot.sendMessage(msg.chat.id, 'Новое поздравление успешно добавлено в список!');
    return;
  }

  if (msg.text.startsWith('/get')) {
    getRandomData(msg.chat.id);
    return;
  }

  bot.sendMessage(msg.chat.id, defaultMessage, {parse_mode: 'HTML'});
});

module.exports = bot;
