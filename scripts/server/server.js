const system = server.registerSystem(0, 0);
let command = "minecraft:execute_command";

system.initialize = function ()
{
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

const ticksPerSec = 20;
let dayLength = 40;
let nightLength = 100;
let tickCount = 0;
let isDay = true;

const print = (message) =>
{
	const chatEventData = system
			.createEventData("minecraft:display_chat_event");
	chatEventData.data.message = message;
	system
		.broadcastEvent("minecraft:display_chat_event", chatEventData);
};

system.update = function()
{
	tickCount++;
	// print("tick");
	if (isDay && (tickCount % dayLength === 0))
	{
		print("night noww");
		this.executeCommand("/time set night", () =>
		{
		});
		isDay = false;
	}
	else if (!isDay && (tickCount % nightLength === 0))
	{
		print("day now");
		this.executeCommand("/time set day", () =>
		{
		});
		isDay = true;
	}
};
