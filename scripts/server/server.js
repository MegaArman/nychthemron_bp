const system = server.registerSystem(0, 0);
let command = "minecraft:execute_command";

const CYCLE_CHANGE_EVENT = "client:cycleChange";
const ticksPerSec = 20;
const cyclesList =
	[
		{"name": "sunrise", "duration": 50},
		{"name": "day", "duration": 600},
		{"name": "sunset", "duration": 50},
		{"name": "night", "duration": 500}
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
	system.executeCommand("/gamerule doDaylightCycle false", () =>
	{
	});
	system
	.listenForEvent(CYCLE_CHANGE_EVENT, eventData =>
		{
			// print("eventData received in server" + eventData.data);

			const msg = JSON.parse(eventData.data);
			const cycleLengthSec = Number(msg.cycleLength) * ticksPerSec;
			const cycleToChangeIndex =
				cyclesList.findIndex((cycle) => cycle.name === msg.cycleID);
			cyclesList[cycleToChangeIndex].duration = cycleLengthSec;
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
			const newCycleName = cyclesList[currentCycleIndex].name;
			this.executeCommand(`/time set ${newCycleName}`, () =>
			{
				// print(`/time set ${newCycleName}`);
			});
	}
};
