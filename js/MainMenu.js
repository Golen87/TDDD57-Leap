var Main = Main || {};

Main.MainMenu = function() {};

Main.MainMenu.prototype = {
	create: function() {
		Main.game.stage.backgroundColor = '#ff0000';

		/* Input */

		var key = Main.game.input.keyboard.addKey( Phaser.Keyboard.SPACEBAR );
		key.onDown.add( function() {this.startGame();}, this );

		this.state.start( 'Game' );
	},
	startGame: function ()
	{
		this.state.start( 'Game' );
	},
};