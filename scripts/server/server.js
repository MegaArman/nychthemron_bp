const system = server.registerSystem(0, 0);
let command = "minecraft:execute_command";

const CYCLE_CHANGE_EVENT = "client:cycleChange";
const CLIENT_ENTER_EVENT = "client:clientEnter";
const UI_LOAD_CYCLE_EVENT = "server:loadCycle";

const ticksPerSec = 20;
let cyclesList =
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
	.listenForEvent(CYCLE_CHANGE_EVENT, (eventData) =>
		{
			const msg = JSON.parse(eventData.data);
			const cycleLengthTicks = Number(msg.cycleLength) * ticksPerSec;
			const cycleToChangeIndex =
				cyclesList.findIndex((cycle) => cycle.name === msg.cycleID);
			cyclesList[cycleToChangeIndex].duration = cycleLengthTicks;
			const str = JSON.stringify(cyclesList);
			this.save(str);
		});

		system.listenForEvent(CLIENT_ENTER_EVENT, () =>
		{
			const query = system.registerQuery();
			const entities = system.getEntitiesFromQuery(query)
				.filter( entity =>
					entity.__identifier__ === "nychthemeron:cycle_lengths");

			if (entities.length !== 0)
			{
				const e = entities[0];
				const tags = system.getComponent(e, "minecraft:tag").data[0];
				cyclesList = JSON.parse(tags);

			}
						print("current " + JSON.stringify(cyclesList));
		});

	this.registerEventData("Main:loadui", {});
	this.registerEventData("Main:loadmenu", {});
	this
	.listenForEvent("minecraft:block_interacted_with",
		(eventData) => this.onUsed(eventData));

	system.registerEventData(UI_LOAD_CYCLE_EVENT, {});
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
	const regex = /"/gi;
	return string.replace(regex, '\\"');
};

system.save = function(saveData)
{
	const escapedJSON = escapeRegExp(saveData);
	const query = system.registerQuery();
	const entities = system.getEntitiesFromQuery(query)
		.filter( entity =>
			entity.__identifier__ === "nychthemeron:cycle_lengths");

	if (entities.length === 0)
	{
		const e = this.createEntity("entity", "nychthemeron:cycle_lengths");
		entities.push(e);
	}
	const e = entities[0];
	const tags = system.getComponent(e, "minecraft:tag").data[0];
	if (tags !== undefined && tags !== "")
	{
		const escapedTags = escapeRegExp(tags);
			system.executeCommand(
				`/tag @e[type=nychthemeron:cycle_lengths] remove "${escapedTags}"`,
				() =>
				{
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
  if (tickCount === 100)
  {
		print("server gonna broadcast");
		let eventData = this.createEventData("minecraft:display_chat_event");
		system.broadcastEvent(UI_LOAD_CYCLE_EVENT, eventData);
  }

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
