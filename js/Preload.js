var Main = Main || {};

//loading the game assets
Main.Preload = function() {};

Main.Preload.prototype = {
	preload: function () {
		this.game.stage.backgroundColor = '#00ff00';
	},
	create: function () {
		this.state.start( 'MainMenu' );
	}
};
