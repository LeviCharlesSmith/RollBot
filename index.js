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
