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
	fps : 8,

	// colors for the game screen
	color_BG : 0x2C2E30,
	color_Screen: 0x07638F,

	// game over boolean
	gameOver : false
};

// points counters
var points_Current = 0;

//number of raindrops that have hit the ground and not the player
var raindropCounter = 0;
//number of raindrops required to hit the ground to earn one point
var raindropsForPoint = 5;

//current difficulty leve
var difficulty_Cur = 1;
var difficulty_Next = 1;

// Player Character object
var playerCharacter = {

	// Location variables. The player always starts in the middle column on the bottom row.
	x : 6,
	y : 12,

	// Jumping boolean. Player ascends while true, descends to bottom of the screen while false
	isJumping : false,

	// Health point variable
	health : 10,

	// Player color
	beadColor : 0xDE0F00,

	// Player data
	data : "playerCharacter"
};

// Player projectile
var projectile = {

	// Location variables
	x : 0,
	y : 0,

	// Boolean for whether or not the projectile is active and moving
	isActive : false,

	// Color
	beadColor : 0x00E566,

	// Projectile data
	data : "projectile"
};

// Raindrop object data
var raindrop = {

	// Damage caused by a raindrop
	damage : 1,

	// Raindrop color
	beadColor : 0x0086F7,

	// Raindrop data
	data : "raindrop"
};

// raindrop spawner object variable
var rainSpawner = {

	// Location variables
	x : 0,
	y : 0,

	// Countdown to next raindrop
	countDown_Current : 5,
	countDown_Min : 2,
	countDown_Max : 10
}

// Lightning object variable
var thunderCloud1 = {

	// Location variables
	x : 1,
	y : 1,

	// Current X move direction (positive 1 or negative 1)
	moveXDir : 1,

	// Countdown to next lightning strike
	countDown_Current : 5,
	countDown_Min : 10,
	countDown_Max : 20,

	// Boolean to determine whether it is active or not
	isActive : false,

	// Cloud color
	beadColor : 0xFFFFFF,

	// Cloud data
	data : "cloud"
}

var thunderCloud2 = {

	// Location variables
	x : 1,
	y : 3,

	// Current X move direction (positive 1 or negative 1)
	moveXDir : 1,

	// Countdown to next lightning strike
	countDown_Current : 5,
	countDown_Min : 10,
	countDown_Max : 20,

	// Boolean to determine whether it is active or not
	isActive : false,

	// Cloud color
	beadColor : 0xFFFFFF,

	// Cloud data
	data : "cloud"
}

var thunderCloud3 = {

	// Location variables
	x : 1,
	y : 5,

	// Current X move direction (positive 1 or negative 1)
	moveXDir : 1,

	// Countdown to next lightning strike
	countDown_Current : 5,
	countDown_Min : 10,
	countDown_Max : 20,

	// Boolean to determine whether it is active or not
	isActive : false,

	// Cloud color
	beadColor : 0xFFFFFF,

	// Cloud data
	data : "cloud"
}

// Lightning object data
var lightning = {

	// Damage caused by lightning
	damage : 2,

	// Lightning color
	beadColor : 0xFFEC44,
	// Flashing color
	flashColor : 0x000000,

	// Lightning data
	data : "lightning"
}

var raindropX = [];
var raindropY = [];

var lightX = [];
var lightY = [];
var lightFlash = [];

var shockX = [];
var shockY = [];
var shockDir = [];

var flashingColor = true;

//** Game Functions **//

//everything in this function occurs once every frame
function update_Global(){

	if (!gameBoard.gameOver){

		//first, let's handle jumps
		update_Jump();
	
		//then we handle projectiles (if we shot a projectile)
		if (projectile.isActive)
			update_Projectile();
	
		//update the rain next
		update_Raindropper();
	
		if (raindropY.length > 0){
	
			update_Raindrops();
		}
	
		//then update thunderclouds
		if (thunderCloud1.isActive)
			update_ThunderCloud();
	
		//then update lightning
		if (lightY.length > 0)
			update_Lightning();

		//finally, update our shockwaves
		if (shockY.length > 0)
			update_Shockwave();
	}
}

//jumping function for the player
function update_Jump(){

	//if isJumping is true, handle ascension
	if (playerCharacter.isJumping) {

		//check if we're about to hit lightning or a raindrop
		var rainCheck = PS.data(playerCharacter.x, playerCharacter.y - 1) == "raindrop";
		var lightCheck = PS.data(playerCharacter.x, playerCharacter.y - 1) == "lightning";

		if (rainCheck){
			dealDamageToPlayer (raindrop.damage); 
			//get rid of the raindrop
			erase_Bead (playerCharacter.x, playerCharacter.y - 1);
		} else if (lightCheck) {
			dealDamageToPlayer (lightning.damage);
			//get rid of the lightning
			erase_Bead (playerCharacter.x, playerCharacter.y - 1);
		}

		//move the player character
		erase_Bead(playerCharacter.x, playerCharacter.y);
		playerCharacter.y--;
		draw_Player();

		if (playerCharacter.y == 9){
			playerCharacter.isJumping = false;
		}
	}
	//if we are not jumping and we are not on the ground, handle descent
	else if (playerCharacter.y != 12) {

		//check if we're about to hit lightning or a raindrop
		var rainCheck = PS.data(playerCharacter.x, playerCharacter.y + 1) == "raindrop";
		var lightCheck = PS.data(playerCharacter.x, playerCharacter.y + 1) == "lightning";

		if (rainCheck){
			dealDamageToPlayer (raindrop.damage); 
			//get rid of the raindrop
			erase_Bead (playerCharacter.x, playerCharacter.y + 1);
		} else if (lightCheck) {
			dealDamageToPlayer (lightning.damage);
			//get rid of the lightning
			erase_Bead (playerCharacter.x, playerCharacter.y + 1);
		}

		//move the player character
		erase_Bead(playerCharacter.x, playerCharacter.y);
		playerCharacter.y++;
		draw_Player();
	}
}

//function for the player projectile movement
function update_Projectile(){

	//remove the bead
	erase_Bead(projectile.x, projectile.y);

	//TODO: we need to check if we're about to hit a raindrop or thunder cloud

	//if we are not at the top, move up
	if (projectile.y != 0){

		projectile.y--;
		draw_Projectile(projectile.x, projectile.y);
	}
	//if the projectile IS at the top, deactivate it so we can fire again
	else {

		projectile.isActive = false;
	}
}

//function for the raindrop spawner
function update_Raindropper (){

	//run our countdown
	rainSpawner.countDown_Current--;

	//if our timer hits 0, spawn a raindrop
	if (rainSpawner.countDown_Current <= 0){

		//spawn a raindrop at this location and then choose a new location
		raindropX.push(rainSpawner.x);
		raindropY.push(rainSpawner.y);

		draw_Raindrop(rainSpawner.x, rainSpawner.y);

		//reset our timer and move to a new location
		rainSpawner.countDown_Current = Math.floor(Math.random() * rainSpawner.countDown_Max) + rainSpawner.countDown_Min;
		rainSpawner.x = PS.random(12);
	}
}

function update_Raindrops(){

	for (var i = 0; i < raindropY.length; i++){

		//we will need to remove the bead first to get rid of all data at that point
		erase_Bead(raindropX[i], raindropY[i]);	
		
		//if the bead is not at the bottom, move it down one space
		if (raindropY[i] < 12){

			//variable for checking if the player is in the way
			var playerCheck = false;

			//if we are about to move to the bottom, make a player check
			if (raindropY[i] == 11){

				playerCheck = PS.data(raindropX[i], raindropY[i] + 1) == "playerCharacter" ? true : false;
			}

			//move down one space
			raindropY[i]++;

			//if we do not hit the player, draw the bead properly
			if (!playerCheck){

				draw_Raindrop(raindropX[i], raindropY[i]);
			}
			//if we do hit the player, remove the bead from the game and deal damage to the player
			else {

				//remove the raindrop from the game
				erase_Bead(raindropX[i], raindropY[i]);
				raindropX.splice(i, 1);
				raindropY.splice(i, 1);

				//we will need to redraw the player after deleting the raindrop data
				draw_Player();
				//deal one damage
				dealDamageToPlayer(raindrop.damage);
			}
		}
		//if we are at the bottom, check to see if the player moved into us. If they have, deal one damage. If they have not, grant 1 point
		else {

			var playerCheck = PS.data(raindropX[i], raindropY[i]) == "playerCharacter" ? true : false;

			if (playerCheck){

				//remove the raindrop from the game
				erase_Bead(raindropX[i], raindropY[i]);
				raindropX.splice(i, 1);
				raindropY.splice(i, 1);

				//we will need to redraw the player after deleting the raindrop data
				draw_Player();
				//deal one damage
				dealDamageToPlayer(raindrop.damage);
			} else {

				//remove the raindrop from the game
				erase_Bead(raindropX[i], raindropY[i]);
				raindropX.splice(i, 1);
				raindropY.splice(i, 1);

				//redraw the player just in case
				draw_Player();

				//add one to the raindropCounter
				raindropCounter++;

				//if we have enough raindrops hitting the ground, grant a point and reset the counter
				if (raindropCounter > raindropsForPoint){

					gainPoints(1);

					raindropCounter = 0;
				}
			}
		}
	}
}

//handles the live update of the thunder clouds
function update_ThunderCloud (){

	//only operate if it is active
	if (thunderCloud1.isActive){

		//erase all six beads of the cloud
		erase_Cloud(thunderCloud1.x, thunderCloud1.y);
		//move the cloud one space in its current movement direction
		thunderCloud1.x += (1 * thunderCloud1.moveXDir);
		//draw the cloud at the new position
		draw_ThunderCloud(1);

		//if the cloud is at the edge of a screen, reverse its movement direction
		if (thunderCloud1.x == 11 && thunderCloud1.moveXDir == 1 || thunderCloud1.x == 1 && thunderCloud1.moveXDir == -1)
			thunderCloud1.moveXDir *= -1;

		//check its current timer to see when it should drop a lightning bolt
		thunderCloud1.countDown_Current--;

		if (thunderCloud1.countDown_Current <= 0){

			//choose a random number between 1 and 10. On a 1, spawn a flashing bolt. Anything else has a normal lightning bolt
			var boltChoice = PS.random(10);

			//spawn a flashing bolt
			if (boltChoice == 1){

				lightX.push(thunderCloud1.x);
				lightY.push(thunderCloud1.y);
				lightFlash.push(true);

				draw_Lightning(thunderCloud1.x, thunderCloud1.y + 1, lightning.beadColor);
			}
			//spawn a normal bolt of lightning
			else {

				lightX.push(thunderCloud1.x);
				lightY.push(thunderCloud1.y);
				lightFlash.push(false);

				draw_Lightning(thunderCloud1.x, thunderCloud1.y + 1, lightning.beadColor);
			}


			//after dropping a lightning bolt, randomize the timer.
			thunderCloud1.countDown_Current = Math.floor(Math.random() * thunderCloud1.countDown_Max) + thunderCloud1.countDown_Min;
		}
	}

	// thunderCloud2 activity
	if (thunderCloud2.isActive){

		//erase all six beads of the cloud
		erase_Cloud(thunderCloud2.x, thunderCloud2.y);
		//move the cloud one space in its current movement direction
		thunderCloud2.x += (1 * thunderCloud2.moveXDir);
		//draw the cloud at the new position
		draw_ThunderCloud(2);

		//if the cloud is at the edge of a screen, reverse its movement direction
		if (thunderCloud2.x == 11 && thunderCloud2.moveXDir == 1 || thunderCloud2.x == 1 && thunderCloud2.moveXDir == -1)
			thunderCloud2.moveXDir *= -1;

		//check its current timer to see when it should drop a lightning bolt
		thunderCloud2.countDown_Current--;

		if (thunderCloud2.countDown_Current <= 0){

			//choose a random number between 1 and 10. On a 1, spawn a flashing bolt. Anything else has a normal lightning bolt
			var boltChoice = PS.random(10);

			//spawn a flashing bolt
			if (boltChoice == 1){

				lightX.push(thunderCloud2.x);
				lightY.push(thunderCloud2.y);
				lightFlash.push(true);

				draw_Lightning(thunderCloud2.x, thunderCloud2.y + 1, lightning.beadColor);
			}
			//spawn a normal bolt of lightning
			else {

				lightX.push(thunderCloud2.x);
				lightY.push(thunderCloud2.y);
				lightFlash.push(false);

				draw_Lightning(thunderCloud2.x, thunderCloud2.y + 1, lightning.beadColor);
			}


			//after dropping a lightning bolt, randomize the timer.
			thunderCloud2.countDown_Current = Math.floor(Math.random() * thunderCloud2.countDown_Max) + thunderCloud2.countDown_Min;
		}
	}

	// thunderCloud3 activity
	if (thunderCloud3.isActive){

		//erase all six beads of the cloud
		erase_Cloud(thunderCloud3.x, thunderCloud3.y);
		//move the cloud one space in its current movement direction
		thunderCloud3.x += (1 * thunderCloud3.moveXDir);
		//draw the cloud at the new position
		draw_ThunderCloud(3);

		//if the cloud is at the edge of a screen, reverse its movement direction
		if (thunderCloud3.x == 11 && thunderCloud3.moveXDir == 1 || thunderCloud3.x == 1 && thunderCloud3.moveXDir == -1)
			thunderCloud3.moveXDir *= -1;

		//check its current timer to see when it should drop a lightning bolt
		thunderCloud3.countDown_Current--;

		if (thunderCloud3.countDown_Current <= 0){

			//choose a random number between 1 and 10. On a 1, spawn a flashing bolt. Anything else has a normal lightning bolt
			var boltChoice = PS.random(10);

			//spawn a flashing bolt
			if (boltChoice == 1){

				lightX.push(thunderCloud3.x);
				lightY.push(thunderCloud3.y);
				lightFlash.push(true);

				draw_Lightning(thunderCloud3.x, thunderCloud3.y + 1, lightning.beadColor);
			}
			//spawn a normal bolt of lightning
			else {

				lightX.push(thunderCloud3.x);
				lightY.push(thunderCloud3.y);
				lightFlash.push(false);

				draw_Lightning(thunderCloud3.x, thunderCloud3.y + 1, lightning.beadColor);
			}


			//after dropping a lightning bolt, randomize the timer.
			thunderCloud3.countDown_Current = Math.floor(Math.random() * thunderCloud3.countDown_Max) + thunderCloud3.countDown_Min;
		}
	}
}

function update_Lightning(){

	//only toggle flashingColor once per frame!
	flashingColor = !flashingColor;

	for (var i = 0; i < lightY.length; i++){

		//we will need to remove the beads first to get rid of all data at that point
		erase_Bead(lightX[i], lightY[i]);
		erase_Bead(lightX[i], lightY[i] - 1);
		
		//if the bead is not at the bottom, move it down two spaces
		if (lightY[i] < 12){

			//variable for checking if the player is in the way
			var playerCheck = false;

			//if we are about to move to the bottom, make a player check
			if (lightY[i] == 11){

				playerCheck = PS.data(lightX[i], lightY[i] + 1) == "playerCharacter" ? true : false;

				//if we did not hit at the main point for the bolt, check the other half of the bolt
				if (!playerCheck){

					var playerCheck = PS.data(lightX[i], lightY[i]) == "playerCharacter" ? true : false;
				}

				//only move down one space to avoid going out of bounds
				lightY[i]++;
			} else {

				//move down two spaces
				lightY[i] += 2;
			}

			//if we do not hit the player, draw the beads properly
			if (!playerCheck){

				//if we're supposed to show a flashing bolt this frame
				if (lightFlash[i] && flashingColor){

					draw_Lightning(lightX[i], lightY[i], lightning.flashColor);
				}
				//otherwise show it normally
				else {
					draw_Lightning(lightX[i], lightY[i], lightning.beadColor);
				}
			}
			//if we do hit the player, remove the beads from the game and deal damage to the player
			else {

				//deal damage
				dealDamageToPlayer(lightning.damage);

				//remove the lightning bolt from the game
				erase_Bead(lightX[i], lightY[i]);
				erase_Bead(lightX[i], lightY[i] - 1);
				lightX.splice(i, 1);
				lightY.splice(i, 1);
				lightFlash.splice(i, 1);

				//we will need to redraw the player after deleting the raindrop data
				draw_Player();
			}
		}
		//if we are at the bottom, check to see if the player moved into us. If they have, deal one damage. If they have not, grant 1 point
		else {

			var playerCheck = PS.data(lightX[i], lightY[i]) == "playerCharacter" ? true : false;

			//if we did not hit at the main point for the bolt, check the other half of the bolt
			if (!playerCheck){

				var playerCheck = PS.data(lightX[i], lightY[i] - 1) == "playerCharacter" ? true : false;
			}

			if (playerCheck){

				//deal damage
				dealDamageToPlayer(lightning.damage);

				//remove the lightning bolt from the game
				erase_Bead(lightX[i], lightY[i]);
				erase_Bead(lightX[i], lightY[i] - 1);
				lightX.splice(i, 1);
				lightY.splice(i, 1);
				lightFlash.splice(i, 1);

				//we will need to redraw the player after deleting the lightning data
				draw_Player();
			} else {

				//if this was a flashing bolt, give three points
				var boltBonus = lightFlash[i] ? 2 : 1;
				//gain 1 point
				gainPoints(boltBonus);

				if (lightFlash[i]){

					//spawn to the left and right at the same y position but only if we are not at that edge
					if (shockX[i] != 0){

						shockX.push(lightX[i] - 1);
						shockY.push(lightY[i]);
						//set it to move left
						shockDir.push (-1);
						//draw the object
						draw_Shockwave(lightX[i] - 1, lightY[i], lightning.beadColor);
					}

					if (shockX[i] != 12){

						shockX.push(lightX[i] + 1);
						shockY.push(lightY[i]);
						//set it to move right
						shockDir.push(1);
						//draw the object
						draw_Shockwave(lightX[i] + 1, lightY[i], lightning.beadColor);
					}
				}

				//remove the lightning bolt from the game
				erase_Bead(lightX[i], lightY[i]);
				erase_Bead(lightX[i], lightY[i] - 1);
				lightX.splice(i, 1);
				lightY.splice(i, 1);
				lightFlash.splice(i, 1);

				//redraw the player just in case
				draw_Player();
			}
		}
	}
}

function update_Shockwave(){

	var thisColor = flashingColor ? lightning.flashColor : lightning.beadColor;

	for (var i = 0; i < shockX.length; i++){

		//check if we're hitting a wall and destroy the object if so
		if (shockDir[i] == -1 && shockX[i] == 0 || shockDir[i] == 1 && shockX[i] == 12){

			//we should check for player collision first
			var playerCheck = PS.data(shockX[i], shockY[i]) == "playerCharacter" ? true : false;

			erase_Bead(shockX[i], shockY[i]);
			shockX.splice(i, 1);
			shockY.splice(i, 1);
			shockDir.splice(i, 1);

			//if we hit the player, deal damage and redraw them
			if (playerCheck){

				dealDamageToPlayer(lightning.damage);
				draw_Player();
			}
			//otherwise, give the player some points
			else {

				gainPoints(3);
			}
		}
		//otherwise, move normally
		else {

			//erase the bead first
			erase_Bead(shockX[i], shockY[i]);

			//check to see if we are about to collide with the player before moving
			var playerCheck = PS.data(shockX[i] + shockDir[i], shockY[i]) == "playerCharacter" ? true : false;

			//if we will collide the player, deal damage
			if (playerCheck){

				erase_Bead(shockX[i], shockY[i]);
				shockX.splice(i, 1);
				shockY.splice(i, 1);
				shockDir.splice(i, 1);

				dealDamageToPlayer(lightning.damage);
				draw_Player();
			}
			//otherwise move one space forward and redraw the bead
			else {

				shockX[i] += shockDir[i];
				draw_Shockwave(shockX[i], shockY[i], thisColor);
			}
		}
	}
}

//take an integer and subtract it from the player's health
function dealDamageToPlayer(damage){

	playerCharacter.health -= damage;

	PS.statusText( "Points: " + points_Current + "\n" + "Health: " + playerCharacter.health);
	PS.statusColor(PS.COLOR_WHITE);

	//redraw the player for edge cases of it being erased
	draw_Player();

	//if we have 0 or less health, game over
	if (playerCharacter.health <= 0){
		
		gameBoard.gameOver = true;

		//give a unique message for various levels of difficulty
		var scoreText = "";

		if (difficulty_Cur < 3)
			scoreText = "Try a bit harder next time!\n";
		else if (difficulty_Cur < 7)
			scoreText = "Not too bad...\n";
		else if (difficulty_Cur < 10)
			scoreText = "You're doing great!\n";
		else if (difficulty_Cur < 12)
			scoreText = "Hey, you're pretty good at this.\n";
		else if (difficulty_Cur < 15)
			scoreText = "Keep it up!\n";
		else
			scoreText = "Holy moly. You are amazing!.\n";

		PS.color (PS.ALL, PS.ALL, PS.COLOR_BLACK);
		PS.debug ("GAME OVER\n" + scoreText + "Please refresh the page to play again!\n")
	}
}

//take an integer in and add it to the player's total points
function gainPoints (points){

	//add our new points
	points_Current += points;

	PS.statusText( "Points: " + points_Current + "\n" + "Health: " + playerCharacter.health);
	PS.statusColor(PS.COLOR_WHITE);

	//count down to the next increase in difficulty
	difficulty_Next -= points;

	//when we reach a new level of difficulty, reset our counter and check to see if we should activate a new thundercloud or increase rainfall
	if (difficulty_Next <= 0){

		difficulty_Cur++;

		difficulty_Next = 2 + (2 * difficulty_Cur);


		if (!thunderCloud1.isActive && difficulty_Cur == 2){

			thunderCloud1.isActive = true;

			draw_ThunderCloud(1);
		}

		if (difficulty_Cur == 5){

			rainSpawner.countDown_Max = 8;
		}

		if (!thunderCloud2.isActive && difficulty_Cur == 7){

			thunderCloud2.isActive = true;

			draw_ThunderCloud(2);

			rainSpawner.countDown_Max = 7;
		}

		if (difficulty_Cur == 10){

			rainSpawner.countDown_Max = 5;
		}

		if (!thunderCloud3.isActive && difficulty_Cur == 13){

			thunderCloud3.isActive = true;

			draw_ThunderCloud(3);

			rainSpawner.countDown_Max = 4;
		}

		if (difficulty_Cur == 15){

			rainSpawner.countDown_Max = 3;
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

function draw_ThunderCloud (cloudNum) {

	switch (cloudNum){

		case 1:

			//the "main" square
			PS.data(thunderCloud1.x, thunderCloud1.y, thunderCloud1.data);
			PS.color(thunderCloud1.x, thunderCloud1.y, thunderCloud1.beadColor);

			//left y = 0
			PS.data(thunderCloud1.x - 1, thunderCloud1.y, thunderCloud1.data);
			PS.color(thunderCloud1.x - 1, thunderCloud1.y, thunderCloud1.beadColor);

			//right y = 0
			PS.data(thunderCloud1.x + 1, thunderCloud1.y, thunderCloud1.data);
			PS.color(thunderCloud1.x + 1, thunderCloud1.y, thunderCloud1.beadColor);

			//top left
			PS.data(thunderCloud1.x - 1, thunderCloud1.y - 1, thunderCloud1.data);
			PS.color(thunderCloud1.x - 1, thunderCloud1.y - 1, thunderCloud1.beadColor);

			//top center
			PS.data(thunderCloud1.x, thunderCloud1.y - 1, thunderCloud1.data);
			PS.color(thunderCloud1.x, thunderCloud1.y - 1, thunderCloud1.beadColor);

			//top right
			PS.data(thunderCloud1.x + 1, thunderCloud1.y - 1, thunderCloud1.data);
			PS.color(thunderCloud1.x + 1, thunderCloud1.y - 1, thunderCloud1.beadColor);

			break;

		case 2:

			//the "main" square
			PS.data(thunderCloud2.x, thunderCloud2.y, thunderCloud2.data);
			PS.color(thunderCloud2.x, thunderCloud2.y, thunderCloud2.beadColor);

			//left y = 0
			PS.data(thunderCloud2.x - 1, thunderCloud2.y, thunderCloud2.data);
			PS.color(thunderCloud2.x - 1, thunderCloud2.y, thunderCloud2.beadColor);

			//right y = 0
			PS.data(thunderCloud2.x + 1, thunderCloud2.y, thunderCloud2.data);
			PS.color(thunderCloud2.x + 1, thunderCloud2.y, thunderCloud2.beadColor);

			//top left
			PS.data(thunderCloud2.x - 1, thunderCloud2.y - 1, thunderCloud2.data);
			PS.color(thunderCloud2.x - 1, thunderCloud2.y - 1, thunderCloud2.beadColor);

			//top center
			PS.data(thunderCloud2.x, thunderCloud2.y - 1, thunderCloud2.data);
			PS.color(thunderCloud2.x, thunderCloud2.y - 1, thunderCloud2.beadColor);

			//top right
			PS.data(thunderCloud2.x + 1, thunderCloud2.y - 1, thunderCloud2.data);
			PS.color(thunderCloud2.x + 1, thunderCloud2.y - 1, thunderCloud2.beadColor);

			break;

		case 3:

			//the "main" square
			PS.data(thunderCloud3.x, thunderCloud3.y, thunderCloud3.data);
			PS.color(thunderCloud3.x, thunderCloud3.y, thunderCloud3.beadColor);

			//left y = 0
			PS.data(thunderCloud3.x - 1, thunderCloud3.y, thunderCloud3.data);
			PS.color(thunderCloud3.x - 1, thunderCloud3.y, thunderCloud3.beadColor);

			//right y = 0
			PS.data(thunderCloud3.x + 1, thunderCloud3.y, thunderCloud3.data);
			PS.color(thunderCloud3.x + 1, thunderCloud3.y, thunderCloud3.beadColor);

			//top left
			PS.data(thunderCloud3.x - 1, thunderCloud3.y - 1, thunderCloud3.data);
			PS.color(thunderCloud3.x - 1, thunderCloud3.y - 1, thunderCloud3.beadColor);

			//top center
			PS.data(thunderCloud3.x, thunderCloud3.y - 1, thunderCloud3.data);
			PS.color(thunderCloud3.x, thunderCloud3.y - 1, thunderCloud3.beadColor);

			//top right
			PS.data(thunderCloud3.x + 1, thunderCloud3.y - 1, thunderCloud3.data);
			PS.color(thunderCloud3.x + 1, thunderCloud3.y - 1, thunderCloud3.beadColor);

			break;
	}
}

function draw_Lightning (x, y, currentColor) {

	PS.data (x, y, lightning.data);
	PS.color (x, y, currentColor);
	PS.data (x, y - 1, lightning.data);
	PS.color (x, y - 1, currentColor);
}

function draw_Shockwave (x, y, currentColor) {

	PS.data (x, y, lightning.data);
	PS.color (x, y, currentColor);
}

function erase_Bead (x, y) {

	PS.data (x, y, 0);
	PS.color (x, y, gameBoard.color_Screen);	
}

//erase the six beads around the point for a cloud object
function erase_Cloud (x, y) {

	PS.data (x, y, 0);
	PS.color (x, y, gameBoard.color_Screen);

	PS.data (x - 1, y, 0);
	PS.color (x - 1, y, gameBoard.color_Screen);

	PS.data (x + 1, y, 0);
	PS.color (x + 1, y, gameBoard.color_Screen);

	PS.data (x - 1, y - 1, 0);
	PS.color (x - 1, y - 1, gameBoard.color_Screen);

	PS.data (x, y - 1, 0);
	PS.color (x, y - 1, gameBoard.color_Screen);

	PS.data (x + 1, y - 1, 0);
	PS.color (x + 1, y - 1, gameBoard.color_Screen);
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

	PS.statusText( "Points: " + points_Current + "\n" + "Health: " + playerCharacter.health);
	PS.statusColor(PS.COLOR_WHITE);

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

	//only check this if we do not have a game over

	if (!gameBoard.gameOver){

		// Add code here for when a key is pressed.
		switch (key) {
	
			//move the player left if they are not at the left edge of the screen
			case PS.KEY_ARROW_LEFT:
				if (playerCharacter.x > 0){
	
					//TODO: check to see if there's a raindrop or lightning bolt there
					var rainCheck = PS.data(playerCharacter.x - 1, playerCharacter.y) == "raindrop" ? true : false;
					var lightCheck = PS.data(playerCharacter.x - 1, playerCharacter.y) == "lightning" ? true : false;
	
					erase_Bead(playerCharacter.x, playerCharacter.y);
					playerCharacter.x--;
	
					if (rainCheck){
	
						dealDamageToPlayer (raindrop.damage); 
					} else if (lightCheck) {
	
						dealDamageToPlayer (lightning.damage);
					}
	
					draw_Player();
				}
				break;
	
			//move the player right if they are not at the right edge of the screen
			case PS.KEY_ARROW_RIGHT:
				if (playerCharacter.x < gameBoard.Width - 1){
	
					//TODO: check to see if there's a raindrop or lightning bolt there
					var rainCheck = PS.data(playerCharacter.x + 1, playerCharacter.y) == "raindrop" ? true : false;
					var lightCheck = PS.data(playerCharacter.x + 1, playerCharacter.y) == "lightning" ? true : false;
	
					erase_Bead (playerCharacter.x, playerCharacter.y);
					playerCharacter.x++;
	
					if (rainCheck){
	
						dealDamageToPlayer (raindrop.damage); 
					} else if (lightCheck) {
	
						dealDamageToPlayer (lightning.damage);
					}
	
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