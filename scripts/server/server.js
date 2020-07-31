const system = server.registerSystem(0, 0);
let command = "minecraft:execute_command";

const CYCLE_CHANGE_EVENT = "client:cycleChange";
const ticksPerSec = 20;
const cyclesList =
	[
		{"name": "sunrise", "duration": 50, "value": "sunrise"},
		{"name": "day", "duration": 600, "value": "day"},
		{"name": "sunset", "duration": 50, "value": 12250},
		{"name": "night", "duration": 500, "value": 18000}
	];
let tickCount = 0;
let currentCycleIndex = 0;

const print = (message) =>
{
	const chatEventData = system
			.createEventData("minecraft:display_chat_event");
	chatEventData.data.message = message;
	system
		.broadcastEvent("minecraft:display_chat_event", chatEventData);
};

system.initialize = function ()
{
	const scriptLoggerConfig = system.
	createEventData("minecraft:script_logger_config");
	scriptLoggerConfig.data.log_errors = true;
	scriptLoggerConfig.data.log_information = true;
	scriptLoggerConfig.data.log_warnings = true;
	system
		.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);
	//--
	system.executeCommand("/gamerule doDaylightCycle false", () =>
	{
	});
	system
	.listenForEvent(CYCLE_CHANGE_EVENT, eventData =>
		{
			// print("eventData received in server" + eventData.data);

			const msg = JSON.parse(eventData.data);
			const cycleLengthTicks = Number(msg.cycleLength) * ticksPerSec;
			const cycleToChangeIndex =
				cyclesList.findIndex((cycle) => cycle.name === msg.cycleID);
			// cyclesList[cycleToChangeIndex].duration = cycleLengthSec;
			cyclesList[cycleToChangeIndex].duration = cycleLengthTicks;
			const str = JSON.stringify(cyclesList);
			// print("str is " + str);
			this.save(str);
		});
	this.registerEventData("Main:loadui", {});
	this.registerEventData("Main:loadmenu", {});
	this
	.listenForEvent("minecraft:block_interacted_with",
		(eventData) => this.onUsed(eventData));
};

system.runcommand = function (event)
{
	let name = this.getComponent(event.data.clientplayer, "minecraft:nameable");
	let eventdata = this.createEventData(command);
	eventdata.data.command =
		`/execute @p[name=${name.data.name}] ~~~ ${event.data.data}`;
	this.broadcastEvent(command, eventdata);
};

system.onUsed = function(eventData)
{
	let player = eventData.data.player;
	let handContainer = system.getComponent(player, "minecraft:hand_container");
	let item = handContainer.data[0];
	if(player.__identifier__ === "minecraft:player")
	{
		if (item.item === "planetary_days:ui_item")
		{
			let event = system.createEventData("Main:loadui");
			event.data=eventData;
			system.broadcastEvent("Main:loadui", event);
		}
   }
};

system.command = function(command)
{
	let data = this.createEventData("minecraft:execute_command");
	data.data.command = command;
	this.broadcastEvent("minecraft:execute_command", data);
};
const escapeRegExp = (string) =>
{
  // return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
	const regex = /"/gi;
	// print("trying to regex on " + string);
	return string.replace(regex, '\\"');
};

system.save = function(saveData)
{
	// print("save data is " + saveData);
	const escapedJSON = escapeRegExp(saveData);
	const query = system.registerQuery();
	const entities = system.getEntitiesFromQuery(query)
		.filter( entity =>
			entity.__identifier__ === "nychthemeron:cycle_lengths");

	if (entities.length === 0)
	{
		// print("need to create it");
		const e = this.createEntity("entity", "nychthemeron:cycle_lengths");
		entities.push(e);
	}
	const e = entities[0];
	// print("ents are " + JSON.stringify(e));

	const tags = system.getComponent(e, "minecraft:tag").data[0];
	// const deserial = tags.replace(/\\/g,"");
	// const escaped = escapeRegExp(deserial);
	if (tags !== undefined && tags !== "")
	{
	print("tags are " + tags);

	const escapedTags = escapeRegExp(tags);
	// const escapedTags = escapeRegExp(JSON.stringify(tags));
	print("escape tags are " + escapedTags);
		system.executeCommand(
			`/tag @e[type=nychthemeron:cycle_lengths] remove "${escapedTags}"`,
			(commandResultData) =>
			{
				print("tried to remove " + JSON.stringify(commandResultData));
			});
}
	system.executeCommand(
		`/tag @e[type=nychthemeron:cycle_lengths] add "${escapedJSON}"`,
		() =>
		{
			system
			.executeCommand("/tag @e[type=nychthemeron:cycle_lengths] list",
			(commandResultData) =>
			{
				const tags =
					commandResultData.data.statusMessage.split("tags: ").pop();
				print("new tags " + tags);
			});
		});

};

system.update = function()
{
	tickCount++;
	if (tickCount % cyclesList[currentCycleIndex].duration === 0)
	{
			currentCycleIndex++;
			if (currentCycleIndex === cyclesList.length)
			{
				currentCycleIndex = 0;
			}
			const cycleValue = cyclesList[currentCycleIndex].value;
			this.executeCommand(`/time set ${cycleValue}`, () =>
			{
			});
	}
};
