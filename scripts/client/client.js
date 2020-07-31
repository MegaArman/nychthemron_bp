const system = client.registerSystem(0,0);

const CYCLE_CHANGE_EVENT = "client:cycleChange";
const CLIENT_ENTER_EVENT = "client:clientEnter";
const UI_LOAD_CYCLE_EVENT = "server:loadCycle";

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
		// const eventDataDefaults = {narf: false};
		system.registerEventData(CYCLE_CHANGE_EVENT, {});

		this.listenForEvent(UI_LOAD_CYCLE_EVENT, () =>
		{
			print("client heard u server");
			let eventdata = this.createEventData("minecraft:send_ui_event");
			eventdata.data.eventIdentifier = "loadcycles";
			eventdata.data.data = "yum";
			this.broadcastEvent("minecraft:send_ui_event", eventdata);
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
	// loadEventData.data.options.is_showing_menu = false;
	// loadEventData.data.options.absorbs_input = true;
	// loadEventData.data.options.always_accepts_input  = true;
	// loadEventData.data.options.render_game_behind = false;
	// loadEventData.data.options.should_steal_mouse = true;
	// loadEventData.data.options.force_render_below = true;
	system.broadcastEvent("minecraft:load_ui", loadEventData);

	// clientplayer = eventData.data.player
	// let event = this.createEventData("Main:addplayer")
	// event.data = clientplayer
	// this.broadcastEvent("Main:addplayer", event)
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

	// print(eventData);
  if(eventDataStr === "closepressed")
	{
		this.close();
	}
	else
	{
		// let pinkyEventData = clientSystem.createEventData("example:pinky");
		// pinkyEventData.data.narf = true;
		//
		// clientSystem.broadcastEvent("example:pinky", pinkyEventData);

		// print("gonna broadcast to server" + eventData);
		system.broadcastEvent(CYCLE_CHANGE_EVENT, eventData);
	}
};

system.close = function ()
{
	let event = this.createEventData("minecraft:unload_ui");
  event.data.path = "main.html";
	this.broadcastEvent("minecraft:unload_ui", event);
};
