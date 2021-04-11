const token = process.env.TOKEN;

const Bot = require('node-telegram-bot-api');
let bot;

if(process.env.NODE_ENV === 'production') {
  bot = new Bot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
  bot = new Bot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

function getRandomCongrats(name) {
  return 'С Днем Рождения, ' + name + '!';
}

bot.on('message', (msg) => {
  if (msg.text === '') {
    bot.sendMessage(msg.chat.id, 'Введите имя поздравителя');
    return;
  }

  bot.sendMessage(msg.chat.id, getRandomCongrats(msg.text), {parse_mode: 'HTML'});
});

module.exports = bot;
