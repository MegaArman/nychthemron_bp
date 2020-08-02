const system = client.registerSystem(0,0);

const CYCLE_CHANGE_EVENT = "client:cycleChange";
const CLIENT_ENTER_EVENT = "client:clientEnter";
const UI_LOAD_CYCLE_EVENT = "server:loadCycle";
let cyclesClientView = "";
system.initialize = function()
{
	const scriptLoggerConfig =
		system.createEventData("minecraft:script_logger_config");

	scriptLoggerConfig.data.log_errors = true;
	scriptLoggerConfig.data.log_information = true;
	scriptLoggerConfig.data.log_warnings = true;
	system
		.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);

	this.listenForEvent("Main:loadmenu", (event) => this.onmenu(event));
	this.listenForEvent("Main:loadui", (event) => this.onload(event));
	this.listenForEvent("minecraft:ui_event",
		(eventdata) => this.onUIMessage(eventdata));

	system.registerEventData(CLIENT_ENTER_EVENT, {});
	this.listenForEvent("minecraft:client_entered_world",
		(eventData) =>
		{
			this.entered(eventData);
			this.broadcastEvent(CLIENT_ENTER_EVENT, eventData);
		});
		system.registerEventData(CYCLE_CHANGE_EVENT, {});

		this.listenForEvent(UI_LOAD_CYCLE_EVENT, (serverData) =>
		{
			cyclesClientView = serverData.data.message;

		});
};

system.update = function()
{
};

const print = (message) =>
{
	const chatEventData = system
			.createEventData("minecraft:display_chat_event");
	chatEventData.data.message = message;
	system
		.broadcastEvent("minecraft:display_chat_event", chatEventData);
};

system.entered = function (eventData)
{
	let loadEventData = this.createEventData("minecraft:load_ui");
	loadEventData.data.path = "main.html";
	system.broadcastEvent("minecraft:load_ui", loadEventData);
};

system.onload = function (event)
{
		let ui = this.createEventData("minecraft:load_ui");
		ui.data.path = "main.html";
		this.broadcastEvent("minecraft:load_ui", ui);
};

system.onUIMessage = function (eventData)
{
	const eventDataStr = eventData.data;

  if(eventDataStr === "closepressed")
	{
		print("will close");
		this.close();
	}
	else if (eventDataStr === "ui_loaded")
	{
		print("we know");
		if (cyclesClientView !== "" && cyclesClientView !== undefined)
		{
			let eventdata = this.createEventData("minecraft:send_ui_event");
			eventdata.data.eventIdentifier = "loadcycles";
			const cyclesList = cyclesClientView;
			eventdata.data.data = cyclesList;
			print("send client: " + cyclesList);
			this.broadcastEvent("minecraft:send_ui_event", eventdata);
		}
	}
	else
	{
		system.broadcastEvent(CYCLE_CHANGE_EVENT, eventData);
	}
};

system.close = function ()
{
	let event = this.createEventData("minecraft:unload_ui");
  event.data.path = "main.html";
	this.broadcastEvent("minecraft:unload_ui", event);
};
