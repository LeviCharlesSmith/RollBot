/*jshint esversion: 6 */
var Discord = require('discord.io');
var logger = require('winston');
const sqlite3 = require("sqlite3");
var sql = new sqlite3.Database("./spells");
var auth = require('./auth.json');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
  token: auth.token,
  autorun: true
});

function spell(name, callback) {
  var spellData = sql.get("SELECT * FROM spells WHERE LOWER(name) = '" + name.toLowerCase() + "'", [], (err, row) => {
    if (err) {
      return console.error(err.message);
    }

    return row ?
      callback(row) :
      console.log('No row found.');
  });
  return spellData;
}

//Returns help text
function help() {
  return "Hi! I'm RollBot and here are all my commands: \n" +
    "`" + "/help" + "`" + "   your reading this now! \n" +
    "`" + "/roll 1d20" + "`" + "   roll a die, use + and - to add modifiers \n" +
    "`" + "/roll stats" + "`" + "   generate your attributes by typing /roll stats \n" +
    "`" + "/order set [name1] [name2]" + "`" + "   save your turn order so you don’t forget \n" +
    "`" + "/order list" + "`" + "   view the current turn order \n" +
    "`" + "/order add [name]" + "`" + "   add someone to the end of the turn order \n" +
    "`" + "/view" + "`" + "   view the current turn order \n" +
    "`" + "/spell [spellname]" + "`" + "view info on any spell in the database";
}

//Stores turn order.
var turnOrder = [];
var turnOrderCurrent = 0;

// Set turn order to entered list.
function orderSet(list) {
  turnOrder = list;
}

// Add to end of turn order.
function orderAdd(name) {
  turnOrder.push(name);
}

// Display turn order.
function orderDisplay() {
  return turnOrder;
}

// Does the math for generating dice rolls
function generateRoll(times = 1, sides = 2, bonus = 0, comment = "") {
  var rolls = [];

  for (var i = 0; times > i; i++) {
rolls.push(Math.floor(Math.random() * sides) + 1 + (bonus?bonus:0));  }
  console.log(rolls);
  return rolls;
}

bot.on('ready', function(evt) {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function(user, userID, channelID, message, evt) {
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`
  if (message.substring(0, 1) == '/') {
    var args = message.substring(1).split(' ');
    var cmd = args[0];

    args = args.splice(1);
    switch (cmd) {

      //  !spell
      case 'spell':
        spell(args[0], c => {
          bot.sendMessage({
            to: channelID,
            message: "<@!" + userID + ">\n" +
              "```\n" +
              "Spell Name: " + c.name + "\n" +
              "Casting Time: " + c.casting_time + "\n" +
              "Description: " + c.description + "\n" +
              "Duration: " + c.duration + "\n" +
              "Spell Level: " + c.level + "\n" +
              "Range: " + c.range + "\n" +
              "School: " + c.school + "\n" +
              "```"
          });
        });
        break;

        //	!help
      case 'help':
        bot.sendMessage({
          to: channelID,
          message: "<@!" + userID + ">\n\n" + help()
        });
        break;

        //!roll
      case 'roll':
        var rx = /(?<num>\d)(?<delim>[a-zA-Z])(?<sides>\d*)(?<modsign>[+-])?(?<mod>\d*)?/gm;
        args = rx.exec(args[0]);
        var rolls = generateRoll(parseInt(args.groups.num), parseInt(args.groups.sides), parseInt(args.groups.modsign + args.groups.mod));

        bot.sendMessage({
          to: channelID,
          message: "<@!" + userID + ">\n" +
            "`" + args.groups.num + "d" + args.groups.sides + ((typeof(args.groups.modsign) == "undefined") ? "" : args.groups.modsign) + ((typeof(args.groups.mod) == "undefined") ? "" : args.groups.mod) + "`" + " = " + rolls.join(", ") + "\n Total: " + rolls.reduce((a, b) => a + b)
        });

        break;


        //	!order
      case 'order':
        var subcmd = args[0];

        args = args.splice(1);
        switch (subcmd) {
          case 'list':
            var returnString = "";
            var returnIndex = 0;
            for (let name of turnOrder) {
              returnString += (++returnIndex + ": " + name + "\n");
            }
            bot.sendMessage({
              to: channelID,
              message: "<@!" + userID + ">\n" +
                "The turn order is:\n" +
                returnString
            });
            break;
          case 'add':
            orderAdd(args[0]);
            break;
          case 'set':
            orderSet(args);
            break;
        }
        break;
    }
  }
});
