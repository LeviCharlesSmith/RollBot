var Discord = require('discord.io');
var logger = require('winston');
const sqlite3 = require("sqlite3");
var sql = new sqlite3.Database("./spells");
var auth = require('./auth.json');
