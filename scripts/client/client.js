const system = client.registerSystem(0,0);
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
	this.listenForEvent("minecraft:client_entered_world",
		(eventData) => this.entered(eventData));
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

system.onUIMessage = function (eventdata)
{
	let eventData = eventdata.data;
	print(eventData);
  if(eventData === "closepressed")
	{
		this.close();
	}
	else
	{
		const keyPressEvent = JSON.parse(eventData);
		print("cycle length " + keyPressEvent.cycleLength);
	}
};

system.close = function ()
{
	let event = this.createEventData("minecraft:unload_ui");
  event.data.path = "main.html";
	this.broadcastEvent("minecraft:unload_ui", event);
};
