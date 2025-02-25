const {article,proper} = require("../modules/lang");

module.exports = {
	help: cfg => "Register a new " + cfg.lang + "",
	usage: cfg =>  ["register <name> <brackets> - Register a new " + cfg.lang + ".\n\t<name> - the " + cfg.lang + "'s name, for multi-word names surround this argument in single or double quotes.\n\t<brackets> - the word 'text' surrounded by any characters on one or both sides"],
	desc: cfg => "Example use: `register Test >text<` - registers " + article(cfg) + " " + cfg.lang + " named 'Test' that is triggered by messages surrounded by ><\nBrackets can be anything, one sided or both. For example `text<<` and `T:text` are both valid\nNote that you can enter multi-word names by surrounding the full name in single or double quotes `'like this'` or `\"like this\"`.",
	permitted: () => true,
	groupArgs: true,
	execute: async (bot, msg, args, cfg) => {
		if(!args[0]) return bot.cmds.help.execute(bot, msg, ["register"], cfg);

		//check arguments
		let brackets = msg.content.slice(msg.content.indexOf(args[0])+args[0].length+1).trim().split("text");
		let name = args[0].trim();
		let member = (await bot.db.query("SELECT name,brackets FROM Members WHERE user_id = $1::VARCHAR(32) AND (LOWER(name) = LOWER($2::VARCHAR(32)) OR brackets = $3)",[msg.author.id,name,brackets || []])).rows[0];
		if(!args[1]) return "Missing argument 'brackets'. Try `" + cfg.prefix + "help register` for usage details.";
		if(name.length < 1 || name.length > 76)	return "Name must be between 1 and 76 characters.";
		if(brackets.length < 2)	return "No 'text' found to detect brackets with. For the last part of your command, enter the word 'text' surrounded by any characters.\nThis determines how the bot detects if it should replace a message.";
		if(!brackets[0] && !brackets[1]) return "Need something surrounding 'text'.";
		if(member && member.name.toLowerCase() == name.toLowerCase())	return proper(cfg.lang) + " with that name under your user account already exists.";
		if(member && member.brackets[0] == brackets[0] && member.brackets[1] == brackets[1]) return proper(cfg.lang) + " with those brackets under your user account already exists.";
		
		//add member
		await bot.db.addMember(msg.author.id,name,brackets.slice(0,2));
		return `${proper(cfg.lang)} registered successfully!\nName: ${name}\nBrackets: ${brackets[0]}text${brackets[1]}\nTo proxy using this ${cfg.lang}, enter a message like \`${brackets[0]}hello${brackets[1]}\`\n*Please check that the name and brackets are correct, if they aren't, try re-registering using "quotation marks" around the name!*`; 
	}
};
