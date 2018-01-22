var Main = Main || {};

Main.Boot = function() {};

Main.Boot.prototype = {
	preload: function() {
	},
	create: function() {
		this.game.physics.startSystem( Phaser.Physics.ARCADE );
		this.state.start( 'Preload' );
	},
};
