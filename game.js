// StormChaser.js for Perlenspiel 3.2

// Storm Chaser
// By James D'Addario

// The "use strict" directive in the following line is important. Don't alter or remove it!
"use strict";

/*jslint nomen: true, white: true */
/*global PS */

//** Game Variables **//

// game board object variable
var gameBoard = {

	// dimensions of the game
	Width : 13,
	Height : 13,

	// the bottom row of the screen
	bottom : 12,
	
	// timer of the game, this variable divided by 60 is the framerate
	fps : 6,

	// colors for the game screen
	color_BG : 0x2C2E30,
	color_Screen: 0x07638F
};

// points counter
var points_Current = 0;

// Player Character object
var playerCharacter = {

	// Location variables. The player always starts in the middle column on the bottom row.
	x : 6,
	y : 12,

	// Jumping boolean. Player ascends while true, descends to bottom of the screen while false
	isJumping : false,

	// Health point variable
	health : 5,

	// Player color
	beadColor : 0xDE0F00
};

// Player projectile
var projectile = {

	// Location variables
	x : 0,
	y : 0,

	// Boolean for whether or not the projectile is active and moving
	isActive : false,

	// Color
	beadColor : 0x00E566
};

var activeProjectiles = [];

// Raindrop object data
var raindrop = {

	// Damage caused by a raindrop
	damage : 1,

	// Raindrop color
	beadColor : 0x0086F7
};

var rainSpawner = {

	// Location variables
	x : 0,
	y : 0,

	// Countdown to next raindrop
	countDown_Current : 5,
	countDown_Max : 10
}

var raindropX = [];
var raindropY = [];

//** Game Functions **//

//everything in this function occurs once every frame
function update_Global(){

	update_Jump();

	if (projectile.isActive)
		update_Projectile();

	update_Raindropper();

	if (raindropY.Length > 0){

		update_Raindrops();
	}
}

//jumping function for the player
function update_Jump(){

	if (playerCharacter.isJumping) {

		erase_Bead(playerCharacter.x, playerCharacter.y);
		playerCharacter.y--;
		draw_Player();

		if (playerCharacter.y == 9){
			playerCharacter.isJumping = false;
		}
	} else if (playerCharacter.y != 12) {

		erase_Bead(playerCharacter.x, playerCharacter.y);
		playerCharacter.y++;
		draw_Player();
	}
}

//function for the player projectile movement
function update_Projectile(){

	erase_Bead(projectile.x, projectile.y);

	if (projectile.y != 0){

		projectile.y--;
		draw_Projectile(projectile.x, projectile.y);
	} else {

		projectile.isActive = false;
	}
}

//function for the raindrop spawner
function update_Raindropper (){

	rainSpawner.countDown_Current--;

	if (rainSpawner.countDown_Current <= 0){

		//spawn a raindrop at this location and then choose a new location
		raindropX.push(rainSpawner.x);
		raindropY.push(rainSpawner.y);

		draw_Raindrop(rainSpawner.x, rainSpawner.y);

		rainSpawner.countDown_Current = rainSpawner.countDown_Max;
		rainSpawner.x = PS.random(12);
	}
}

function update_Raindrops(){

	for (var i = 0; i < raindropY.Length; i++){

		erase_Bead(raindropX[i], raindropY[i]);
		raindropY[i]++;
		draw_Raindrop(raindropX[i], raindropY[i]);

		//TODO: check if it is colliding with the player character

		//if it hits the player, deal one damage

		//if it hits the ground, add one point
		if (raindropY(i) == 12){

			erase_Bead(raindropX(i), raindropY(i));
			raindropX.splice(i, 1;
			raindropY.splice(i, 1);
		}
	}
}

//** Draw Functions **//
function draw_Player () {

	PS.data(playerCharacter.x, playerCharacter.y, playerCharacter.data);
	PS.color(playerCharacter.x, playerCharacter.y, playerCharacter.beadColor);
}

function draw_Projectile() {

	PS.data (projectile.x, projectile.y, projectile.data);
	PS.color (projectile.x, projectile.y, projectile.beadColor);
}

function draw_Raindrop(x, y){

	PS.data (x, y, raindrop.data);
	PS.color (x, y, raindrop.beadColor);
}

function erase_Bead (x, y) {

	PS.data (x, y, 0);
	PS.color (x, y, gameBoard.color_Screen);	
}

//** Perlenspiel Functions **//

/* NOTE: All functions below this line are part of the functionality of Perlenspiel
		I did not write any of the functions below, though I did make a few additions.*/

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
[system] = an object containing engine and platform information; see API documentation for details.
[options] = an object with optional parameters; see API documentation for details.
*/

PS.init = function( system, options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.init() called\n" );

	// This function should normally begin with a call to PS.gridSize( x, y )
	// where x and y are the desired initial dimensions of the grid.
	// Call PS.gridSize() FIRST to avoid problems!
	// The sample call below sets the grid to the default dimensions (8 x 8).
	// Uncomment the following code line and change the x and y parameters as needed.

	PS.gridSize( gameBoard.Width, gameBoard.Height );

	// This is also a good place to display your game title or a welcome message
	// in the status line above the grid.
	// Uncomment the following code line and change the string parameter as needed.

	//PS.statusText( "Points: " + points_Current);

	// Add any other initialization code you need here.
	PS.gridColor (gameBoard.color_BG);
	PS.border (PS.ALL, PS.ALL, 0);
	PS.color (PS.ALL, PS.ALL, gameBoard.color_Screen);

	draw_Player();
	PS.timerStart (gameBoard.fps, update_Global)
};

/*
PS.touch ( x, y, data, options )
Called when the mouse button is clicked on a bead, or when a bead is touched.
It doesn't have to do anything.
[x] = zero-based x-position of the bead on the grid.
[y] = zero-based y-position of the bead on the grid.
[data] = the data value assigned to this bead by a call to PS.data(); default = 0.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.touch() event handler:

/*

PS.touch = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );

	// Add code here for mouse clicks/touches over a bead.
};

*/

/*
PS.release ( x, y, data, options )
Called when the mouse button is released over a bead, or when a touch is lifted off a bead
It doesn't have to do anything
[x] = zero-based x-position of the bead on the grid
[y] = zero-based y-position of the bead on the grid
[data] = the data value assigned to this bead by a call to PS.data(); default = 0.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.release() event handler:

/*

PS.release = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead.
};

*/

/*
PS.enter ( x, y, button, data, options )
Called when the mouse/touch enters a bead.
It doesn't have to do anything.
[x] = zero-based x-position of the bead on the grid.
[y] = zero-based y-position of the bead on the grid.
[data] = the data value assigned to this bead by a call to PS.data(); default = 0.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.enter() event handler:

/*

PS.enter = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead.
};

*/

/*
PS.exit ( x, y, data, options )
Called when the mouse cursor/touch exits a bead.
It doesn't have to do anything.
[x] = zero-based x-position of the bead on the grid.
[y] = zero-based y-position of the bead on the grid.
[data] = the data value associated with this bead, 0 if none has been set.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.exit() event handler:

/*

PS.exit = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead.
};

*/

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
It doesn't have to do anything.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.exitGrid() event handler:

/*

PS.exitGrid = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid.
};

*/

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
It doesn't have to do anything.
[key] = ASCII code of the pressed key, or one of the PS.KEY constants documented at:
http://users.wpi.edu/~bmoriarty/ps/constants.html
[shift] = true if shift key is held down, else false.
[ctrl] = true if control key is held down, else false.
[options] = an object with optional parameters; see API documentation for details.
*/

PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is pressed.
	switch (key) {

		//move the player left if they are not at the left edge of the screen
		case PS.KEY_ARROW_LEFT:
			if (playerCharacter.x > 0){

				//TODO: check to see if there's a raindrop or lightning bolt there

				erase_Bead(playerCharacter.x, playerCharacter.y);
				playerCharacter.x--;
				draw_Player();
			}
			break;

		//move the player right if they are not at the right edge of the screen
		case PS.KEY_ARROW_RIGHT:
			if (playerCharacter.x < gameBoard.Width - 1){

				//TODO: check to see if there's a raindrop or lightning bolt there

				erase_Bead (playerCharacter.x, playerCharacter.y);
				playerCharacter.x++;
				draw_Player();
			}
			break;

		//jump when the player hits the up arrow
		case PS.KEY_ARROW_UP:
			if (!playerCharacter.isJumping && playerCharacter.y == 12){

				playerCharacter.isJumping = true;
			}
			break;

		//shoot a projectile when the player hits tab
		case PS.KEY_TAB:
			if (!projectile.isActive){

				projectile.x = playerCharacter.x;
				projectile.y = playerCharacter.y - 1;
				projectile.isActive = true;
				draw_Projectile();
			}
			break;
	}
};

/*
PS.keyUp ( key, shift, ctrl, options )
Called when a key on the keyboard is released.
It doesn't have to do anything.
[key] = ASCII code of the pressed key, or one of the PS.KEY constants documented at:
http://users.wpi.edu/~bmoriarty/ps/constants.html
[shift] = true if shift key is held down, else false.
[ctrl] = true if control key is held down, else false.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.keyUp() event handler:

/*

PS.keyUp = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.
};

*/

/*
PS.input ( sensors, options )
Called when an input device event (other than mouse/touch/keyboard) is detected.
It doesn't have to do anything.
[sensors] = an object with sensor information; see API documentation for details.
[options] = an object with optional parameters; see API documentation for details.
NOTE: Mouse wheel events occur ONLY when the cursor is positioned over the grid.
*/

// Uncomment the following BLOCK to expose PS.input() event handler:

/*

PS.input = function( sensors, options ) {
	// Uncomment the following code lines to inspect first parameter:

//	 var device = sensors.wheel; // check for scroll wheel
//
//	 if ( device ) {
//	   PS.debug( "PS.input(): " + device + "\n" );
//	 }

	// Add code here for when an input event is detected.
};

*/

/*
PS.shutdown ( options )
Called when the browser window running Perlenspiel is about to close.
It doesn't have to do anything.
[options] = an object with optional parameters; see API documentation for details.
NOTE: This event is only used for applications utilizing server communication.
*/

// Uncomment the following BLOCK to expose PS.shutdown() event handler:

/*

PS.shutdown = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "Daisy, Daisy ...\n" );

	// Add code here for when Perlenspiel is about to close.
};

*/

/*
Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
Perlenspiel is Copyright © 2009-17 Worcester Polytechnic Institute.
This file is part of Perlenspiel.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with Perlenspiel. If not, see <http://www.gnu.org/licenses/>.
*/