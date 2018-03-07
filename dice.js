/**
 * BCLearningNetwork.com
 * Dice Simulation
 * @author Colin Bernard (colinjbernard@hotmail.com)
 * February 2018
 */


//// VARIABLES ////

var mute = false;
var FPS = 20;

var STAGE_WIDTH, STAGE_HEIGHT;

var gameStarted = false;

var totalRolls = 0;
var totalRollsText;

var chartContainer;

var chartData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var currentDie1 = null;
var currentDie2 = null;


// Chrome 1+
var isChrome = !!window.chrome && !!window.chrome.webstore;


function init() {
 	STAGE_WIDTH = parseInt(document.getElementById("gameCanvas").getAttribute("width"));
	STAGE_HEIGHT = parseInt(document.getElementById("gameCanvas").getAttribute("height"));

	// init state object
	stage = new createjs.Stage("gameCanvas"); // canvas id is gameCanvas
	stage.mouseEventsEnabled = true;
	stage.enableMouseOver(); // Default, checks the mouse 20 times/second for hovering cursor changes

	setupManifest(); // preloadJS
	startPreload();

	stage.update();
}

function update(event) {
 	if (gameStarted) {

  }

	stage.update(event);
}

function endGame() {
 	gameStarted = false;
}

function initGraphics() {

  initMuteUnMuteButtons();

  rollButton.x = rollButtonPressed.x = 450;
  rollButton.y = rollButtonPressed.y = 455;
  rollButtonPressed.cursor = "pointer";
  stage.addChild(rollButton);

  resetButton.x = resetButtonPressed.x = 450;
  resetButton.y = resetButtonPressed.y = 535;
  resetButton.cursor = "pointer";
  stage.addChild(resetButton);

  totalRollsText = new createjs.Text("Total Rolls: " + totalRolls, "bold 31px Arial", "black");
  updateTotalRolls();
  stage.addChild(totalRollsText);

  initChart();

  updateDice(dice[0], dice[0]);

  initListeners();

  // start the game
	gameStarted = true;
	stage.update();
}

function reset() {
  playSound("click");
  for (var i = 0; i < chartData.length; i++) {
    chartData[i] = 0;
  }
  totalRolls = 0;

  updateTotalRolls();
  stage.removeChild(chartContainer);
  initChart();
}

function updateDice(die1, die2) {
  stage.removeChild(currentDie1);
  currentDie1 = Object.create(die1);
  currentDie1.x = 50;
  currentDie1.y = 400;
  stage.addChild(currentDie1);

  stage.removeChild(currentDie2);
  currentDie2 = Object.create(die2);
  currentDie2.x = 200;
  currentDie2.y = 400;
  stage.addChild(currentDie2);
}

function roll() {
  totalRolls++;
  updateTotalRolls();

  playSound("roll");

  var die1 =  Math.floor(Math.random() * ((6 - 1) + 1) + 1);
  var die2 =  Math.floor(Math.random() * ((6 - 1) + 1) + 1);

  updateDice(dice[die1 - 1], dice[die2 - 1]);

  var random = die1 + die2;
  chartData[random - 2]++;
  stage.removeChild(chartContainer);
  initChart();
}


function initChart() {
  chartContainer = new createjs.Container();
  stage.addChild(chartContainer);

  // calculate chart scale
  var max = chartData[0];
  for (var i = 1; i < chartData.length; i++) {
      if (chartData[i] > max) {
        max = chartData[i];
      }
  }
  var chartScale = 240 / max;

  // dimensions
  var barWidth = 40;
  var barSpace = 45;

  var chartWidth = barSpace * chartData.length;

  for (var i = 0; i < chartData.length; i++) {
    let height = chartData[i];

    // sum of dice
    var xAxis = new createjs.Text(i + 2, "26px Arial", "black");
    xAxis.x = barSpace * i + barWidth/2 - xAxis.getMeasuredWidth()/2;
    xAxis.y = xAxis.getMeasuredHeight() + 30;
    chartContainer.addChild(xAxis);

    // frequency of sums
    var label = new createjs.Text(chartData[i], "26px Arial", "black");
    label.x = barSpace * i + barWidth/2 - label.getMeasuredWidth()/2;
    label.y = label.getMeasuredHeight() - 12;
    chartContainer.addChild(label);

    if (height > 0) {
      let bar = new createjs.Shape();

      // draw the bar
      bar.graphics
        .setStrokeStyle(2)
        .beginStroke("black")
        .beginLinearGradientFill(["#0d5ee0", "#073f99"], [0, 1], 0, -height * chartScale, 0, 0)
        .drawRoundRectComplex(barSpace * i, -height * chartScale, barWidth, height * chartScale, 5, 5, 0, 0)
      chartContainer.addChild(bar);

    }
  }

  chartContainer.scaleX = chartContainer.scaleY = 0.85;
  chartContainer.y = 300;
  chartContainer.x = STAGE_WIDTH/2 - 135;
}

/*
 * Adds the mute and unmute buttons to the stage and defines listeners
 */
function initMuteUnMuteButtons() {
	var hitArea = new createjs.Shape();
	hitArea.graphics.beginFill("#000").drawRect(0, 0, muteButton.image.width, muteButton.image.height);
	muteButton.hitArea = unmuteButton.hitArea = hitArea;

	muteButton.x = unmuteButton.x = 5;
	muteButton.y = unmuteButton.y = 5;

	muteButton.cursor = "pointer";
	unmuteButton.cursor = "pointer";

	muteButton.on("click", toggleMute);
	unmuteButton.on("click", toggleMute);

	stage.addChild(unmuteButton);
}

function initListeners() {
  rollButton.on("mouseover", function() {
    stage.addChild(rollButtonPressed);
    stage.removeChild(rollButton);
  });
  rollButtonPressed.on("mouseout", function() {
    stage.addChild(rollButton);
    stage.removeChild(rollButtonPressed);
  });
  rollButtonPressed.on("click", roll);

  resetButton.on("mouseover", function() {
    stage.addChild(resetButtonPressed);
    stage.removeChild(resetButton);
  });
  resetButtonPressed.on("mouseout", function() {
    stage.addChild(resetButton);
    stage.removeChild(resetButtonPressed);
  });

  resetButtonPressed.on("click", reset);
}

function updateTotalRolls() {
  totalRollsText.text = "Total Rolls: " + totalRolls;
  totalRollsText.x = 595 - totalRollsText.getMeasuredWidth();
  totalRollsText.y = 425 - totalRollsText.getMeasuredHeight()/2;
}




//////////////////////// PRELOADJS FUNCTIONS

// bitmap variables
var muteButton, unmuteButton;
var background;
var dice = [];
var rollButton, rollButtonPressed;
var resetButton, resetButtonPressed;

function setupManifest() {
 	manifest = [
    {
      src: "sounds/click.mp3",
      id: "click"
    },
    {
      src: "sounds/dice.mp3",
      id: "roll"
    },
    {
      src: "images/mute.png",
      id: "mute"
    },
    {
      src: "images/unmute.png",
      id: "unmute"
    },
    {
      src: "images/background.png",
      id: "background"
    },
    {
      src: "images/roll_btn.png",
      id: "rollButton"
    },
    {
      src: "images/roll_btn_pressed.png",
      id: "rollButtonPressed"
    },
    {
      src: "images/reset_btn.png",
      id: "resetButton"
    },
    {
      src: "images/reset_btn_pressed.png",
      id: "resetButtonPressed"
    },
    {
      src: "images/dice/one.png",
      id: "dice1"
    },
    {
      src: "images/dice/two.png",
      id: "dice2"
    },
    {
      src: "images/dice/three.png",
      id: "dice3"
    },
    {
      src: "images/dice/four.png",
      id: "dice4"
    },
    {
      src: "images/dice/five.png",
      id: "dice5"
    },
    {
      src: "images/dice/six.png",
      id: "dice6"
    },
    {
      src: "images/roll_btn.png",
      id: "rollButton"
    }
 	];
}


function startPreload() {
	preload = new createjs.LoadQueue(true);
    preload.installPlugin(createjs.Sound);
    preload.on("fileload", handleFileLoad);
    preload.on("progress", handleFileProgress);
    preload.on("complete", loadComplete);
    preload.on("error", loadError);
    preload.loadManifest(manifest);
}

function handleFileLoad(event) {
	console.log("A file has loaded of type: " + event.item.type);
  // create bitmaps of images
  if (event.item.id == "mute") {
    muteButton = new createjs.Bitmap(event.result);
  } else if (event.item.id == "unmute") {
    unmuteButton = new createjs.Bitmap(event.result);
  } else if (event.item.id.includes("dice")) {
    dice.push(new createjs.Bitmap(event.result));
  } else if (event.item.id == "background") {
    background = new createjs.Bitmap(event.result);
  } else if (event.item.id == "rollButton") {
    rollButton = new createjs.Bitmap(event.result);
  } else if (event.item.id == "rollButtonPressed") {
    rollButtonPressed = new createjs.Bitmap(event.result);
  } else if (event.item.id == "resetButton") {
    resetButton = new createjs.Bitmap(event.result);
  } else if (event.item.id == "resetButtonPressed") {
    resetButtonPressed = new createjs.Bitmap(event.result);
  }
}

function loadError(evt) {
    console.log("Error!",evt.text);
}

// not currently used as load time is short
function handleFileProgress(event) {

}

/*
 * Displays the start screen.
 */
function loadComplete(event) {
  console.log("Finished Loading Assets");

  // ticker calls update function, set the FPS
	createjs.Ticker.setFPS(FPS);
	createjs.Ticker.addEventListener("tick", update); // call update function

  stage.addChild(background);
  stage.update();
  initGraphics();
}

///////////////////////////////////// END PRELOADJS FUNCTIONS
