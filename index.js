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

bot.on('message', function (user, userID, channelID, message, evt) {
	// Our bot needs to know if it will execute a command
	// It will listen for messages that will start with `!`
	if (message.substring(0, 1) == '!') {
		var args = message.substring(1).split(' ');
		var cmd = args[0];

		args = args.splice(1);
		switch(cmd) {

			//  !spell
			case 'spell':
				spell(args[0], c => {
					bot.sendMessage({
						to: channelID,
						message:
							"<@!" + userID + ">\n" +
							"```\n" +
							"Spell Name: "   + c.name         + "\n" +
							"Casting Time: " + c.casting_time + "\n" +
							"Description: "  + c.description  + "\n" +
							"Duration: "     + c.duration     + "\n" +
							"Spell Level: "  + c.level        + "\n" +
							"Range: "        + c.range        + "\n" +
							"School: "       + c.school       + "\n" +
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
			        args = args.join().split("");
			        var rolls = generateRoll(args[0], args[2], args[3], args[4], args[5], args[6], args [7])

							if (args[4] === "+") {
			        bot.sendMessage({
			          to: channelID,
									message:  "<@!" + userID + ">\n" +
 			            "`" + args[0] + "d" + args[2] + args[3] + "+" + args[5] + "`" + ": " + (parseInt(rolls) + parseInt(args[5] + args[6] + args[7]))
								})
							} else if (args[4] === '-') {
								bot.sendMessage({
				          to: channelID,
										message:  "<@!" + userID + ">\n" +
	 			            "`" + args[0] + "d" + args[2] + args[3] + "-" + args[5] + "`" + ": " + (parseInt(rolls) - parseInt(args[5] + args[6] + args[7]))
									})
							} else {
								bot.sendMessage({
				          to: channelID,
										message:  "<@!" + userID + ">\n" +
	 			            "`" + args[0] + "d" + args[2] + args[3] + "`" + ": " + (parseInt(rolls))
									})
							}
			            break;
      //	!order
      case 'order':
        var subcmd = args[0];

        args = args.splice(1);
        switch(subcmd) {
          case 'list':
            var returnString = "";
            var returnIndex = 0;
            for (let name of turnOrder) {
              returnString += (++returnIndex + ": " + name + "\n");
            }
            bot.sendMessage({
              to: channelID,
              message:
                "<@!" + userID + ">\n" +
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
