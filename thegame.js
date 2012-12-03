/**
 * @author jonas
 */

// namespace
var TestGame = {};


/**
 * System
 */
TestGame.System = function() {
	this.scene = null;
	this.doc = new GLGE.Document();
	this.renderer = null;
	this.controller = null;
	
	var thiz = this;
	
	this.doc.onLoad = function() {
		//create the renderer
		thiz.renderer = new GLGE.Renderer(document.getElementById('canvas'));
		//MACHT KEIN SINN: thiz.scene=new GLGE.Scene();
		thiz.scene = thiz.doc.getElement("scene");
		thiz.renderer.setScene(thiz.scene);
	
		thiz.controller = new TestGame.Controller(thiz);
	
		thiz.doc.getElement("OBCircle").pickable=false;
		
		// main loop
		function mainLoop(){
			thiz.controller.process();
			thiz.renderer.render();
			requestAnimationFrame(mainLoop);
		}
		mainLoop();

	};
	
	// let's go
	// Preloader configurations are optional. They improve the accuracy of the preloader.
	var preloaderConfiguration1 = {XMLQuota: 0.13, numXMLFiles: 1}; // Example 1 (active)
	var preloaderConfiguration2 = {XMLQuota: 0.30, XMLBytes: 852605}; // Example 2 
	
	this.doc.load("plat.xml", preloaderConfiguration1);
	// alternative: doc.load("plat.xml", preloaderConfiguration2);
	// alternative: doc.load("plat.xml", true);
	// alternative: doc.load("plat.xml"); // In this case you may not use the preloader gui because preloading is disabled.
	
	GLGE.GUI.useLibrary("jQuery"); // use the jQuery progress-bar
	
	var preloaderGUI = new GLGE.GUI.Preloader(); // use the preloader gui-gadget to display the progress
	preloaderGUI.setDocumentLoader(this.doc.preloader);
	preloaderGUI.addToDOM(document.getElementById('container'));

};


/**
 * Controller
 * handle hardware input
 */
TestGame.Controller = function(system) {
	this.system = system;
	this.mouse = new GLGE.MouseInput(document.getElementById('canvas'));
	this.keys = new GLGE.KeyInput();
	this.thePlayer = new TestGame.ThePlayer(system.scene, system.doc);
	
	var thiz = this;
	document.addEventListener("mousemove", function(e) {
	  var movementX = e.movementX       ||
                  e.mozMovementX    ||
                  e.webkitMovementX ||
                  0,
      movementY = e.movementY       ||
                  e.mozMovementY    ||
                  e.webkitMovementY ||
                  0;
                  
    thiz.thePlayer.personController.updatePitchYaw(movementX, movementY);
 
  // Print the mouse movement delta values
  //console.log("movementX=" + movementX, "movementY=" + movementY);
	}, false);
};
TestGame.Controller.prototype.process = function() {
	// preprocess players
	this.thePlayer.preProcess(this.mouse);
	
	// jump
	if (this.keys.isKeyPressed(GLGE.KI_SPACE)) {
		this.thePlayer.jump();
	}
	
	// move forward & stop
	if (this.keys.isKeyPressed(GLGE.KI_UP_ARROW)) {
		this.thePlayer.walk();
	} else {
		this.thePlayer.standIfWalk();
	}

	// move backward & stop
	if (this.keys.isKeyPressed(GLGE.KI_DOWN_ARROW)) {
		this.thePlayer.walkBack();
	} else {
		this.thePlayer.standIfWalkBack();
	}
	
	if (this.keys.isKeyPressed(GLGE.KI_LEFT_ARROW)) {
		this.thePlayer.turnLeft();
	} else if(this.keys.isKeyPressed(GLGE.KI_RIGHT_ARROW)) {
		this.thePlayer.turnRight();
	} else {
		this.thePlayer.standIfTurn();
	}
	
	// process players
	this.thePlayer.process();
};


/**
 * Interface IPersonController
 */
TestGame.IPersonController = function() {};
TestGame.IPersonController.jump = function() {throw "Not implemented";};
TestGame.IPersonController.walk = function() {throw "Not implemented";};
TestGame.IPersonController.standIfWalk = function() {throw "Not implemented";};
TestGame.IPersonController.walkBack = function() {throw "Not implemented";};
TestGame.IPersonController.standIfWalkBack = function() {throw "Not implemented";};
TestGame.IPersonController.turnLeft = function() {throw "Not implemented";};
TestGame.IPersonController.turnRight = function() {throw "Not implemented";};
TestGame.IPersonController.standIfTurn = function() {throw "Not implemented";};
TestGame.IPersonController.preProcess = function() {throw "Not implemented";};
TestGame.IPersonController.process = function() {throw "Not implemented";};


/**
 * Implementation for First Person Perspective
 */
TestGame.FirstPersonController = function(scene, doc) {
	this.scene = scene;
	this.camera = this.scene.camera;
	this.camera.setLoc(0, 0, 45);
	this.camera.setRot(1.5, 0, 0);
	
	this.now = 0;
	this.lasttime = parseInt(new Date().getTime());
	this.yaw = 0; // TOP -0.38; DOWN 0.41
	this.pitch = 0;
}
TestGame.FirstPersonController.prototype = new TestGame.IPersonController();
TestGame.FirstPersonController.prototype.jump = function() {};
TestGame.FirstPersonController.prototype.walk = function() {};
TestGame.FirstPersonController.prototype.standIfWalk = function() {};
TestGame.FirstPersonController.prototype.walkBack = function() {};
TestGame.FirstPersonController.prototype.standIfWalkBack = function() {};
TestGame.FirstPersonController.prototype.turnLeft = function() {};
TestGame.FirstPersonController.prototype.turnRight = function() {};
TestGame.FirstPersonController.prototype.standIfTurn = function() {};
TestGame.FirstPersonController.prototype.preProcess = function() {
	this.now=parseInt(new Date().getTime());
};
TestGame.FirstPersonController.prototype.process = function() {
	//this.camera.setRot(this.rotX, this.rotY, 0);
	this.lasttime = this.now;
};
TestGame.FirstPersonController.prototype.updatePitchYaw = function(x, y) {
	this.pitch -= x/300;
	this.yaw += y/300;
	if (this.yaw < -0.38) this.yaw = -0.38;
	else if (this.yaw > 0.41) this.yaw = 0.41;
};
TestGame.FirstPersonController.prototype.cameraMove = function(mouse) {
	
		var mousepos=mouse.getMousePosition();
		mousepos.x=mousepos.x-document.getElementById("container").offsetLeft;
		mousepos.y=mousepos.y-document.getElementById("container").offsetTop;
		
		var camera=this.camera;
		camerarot=camera.getRotation();
		//inc=(mousepos.y-(document.getElementById('canvas').offsetHeight/2))/500;
		inc = this.yaw;
		//console.log(inc);
		var trans=GLGE.mulMat4Vec4(camera.getRotMatrix(),[0,0,-1,1]);
		var mag=Math.pow(Math.pow(trans[0],2)+Math.pow(trans[1],2),0.5);
		trans[0]=trans[0]/mag;
		trans[1]=trans[1]/mag;
		camera.setRotX(1.56-trans[1]*inc);
		camera.setRotZ(-trans[0]*inc);
		/*
		var width=document.getElementById('canvas').offsetWidth;
		if(mousepos.x<width*0.3){
			var turn=Math.pow((mousepos.x-width*0.3)/(width*0.3),2)*0.005*(this.now-this.lasttime);
			camera.setRotY(camerarot.y+turn);
		}
		if(mousepos.x>width*0.7){
			var turn=Math.pow((mousepos.x-width*0.7)/(width*0.3),2)*0.005*(this.now-this.lasttime);
			camera.setRotY(camerarot.y-turn);
		}
		*/
		camera.setRotY(this.pitch);
			
	//this.rotX += 0.01;
};


/**
 * Implementation for Third Person Perspective
 */
TestGame.ThirdPersonController = function(scene, doc) {
	this.scene = scene;
	this.manstate="stand";
	this.manvel=[0,0,0];
	this.manpos=[0,0,45];
	this.manrot=0;
	this.manrotvel=0;
	this.armatue=doc.getElement("AMArmature");
	this.manwalk=doc.getElement("ACArmature_walk");
	this.manjump=doc.getElement("ACArmature_Jump");
	this.manwalkback=doc.getElement("ACArmature_walkback");
	this.manstand=doc.getElement("ACArmature_stand");
	this.manland=doc.getElement("ACArmature_Land");
	this.manfly=doc.getElement("ACArmature_Fly");
	this.mantime=0;
	this.incx = 0;
	this.incy = 0;
	this.dt = 0;
	this.time = 0;
	

	thiz = this;
	this.jumplistener=function(data){
		thiz.armatue.setAction(thiz.manfly,200,true);
	};
	this.landlistener=function(data){
		if(thiz.manstate!="stand"){
			thiz.armatue.setAction(thiz.manstand,200,true);
			thiz.manstate="stand";
			thiz.manvel=[0,0,0];
		}
	}

	this.manland.addEventListener("animFinished", this.landlistener);
	this.manjump.addEventListener("animFinished", this.jumplistener);
};
TestGame.ThirdPersonController.prototype = new TestGame.IPersonController();
TestGame.ThirdPersonController.prototype.jump = function() {
	if (this.manstate!="jump" && this.manstate!="land"){
		this.manstate="jump";
		this.armatue.setAction(this.manjump,150);
		this.manvel=[15*this.incx,15*this.incy,50];
	}
};
TestGame.ThirdPersonController.prototype.walk = function() {
	if (this.manstate!="jump" && this.manstate!="land") {
		if(this.manstate!="walk"){
			this.manstate="walk";
			this.armatue.setAction(this.manwalk,150,true);
			this.manvel=[50*this.incx,50*this.incy,0];
		}
	}else if (this.manstate=="jump" || this.manstate=="land") {
		this.manvel[0]=this.manvel[0]+20*this.incx*this.dt;
		this.manvel[1]=this.manvel[1]+20*this.incy*this.dt;
	}
};
TestGame.ThirdPersonController.prototype.standIfWalk = function() {
	if (this.manstate=="walk") {
		this.manstate="stand";
		this.armatue.setAction(this.manstand,150,true);
		this.manvel=[0,0,0];
	}
};
TestGame.ThirdPersonController.prototype.walkBack = function() {
	if (this.manstate != "jump" && this.manstate!="walkback") {
		this.manstate="walkback";
		this.armatue.setAction(this.manwalkback,150,true);
		this.manvel=[-30*this.incx,-30*this.incy,0];
	}
};
TestGame.ThirdPersonController.prototype.standIfWalkBack = function() {
	if(this.manstate=="walkback"){
		this.manstate="stand";
		this.armatue.setAction(this.manstand,150,true);
		this.manvel=[0,0,0];
	}
};
TestGame.ThirdPersonController.prototype.turnLeft = function() {
	if (this.manstate!="jump") {
		if(this.manstate!="walk" && this.manrotvel==0){
			this.manstate="turn";
			this.manvel=[0,0,0];
			this.armatue.setAction(this.manwalk,150,true);
		}else if(this.manstate=="walk"){
			this.manvel=[40*this.incx,40*this.incy,0];
		}
		if(this.manstate!="walkback"){
			this.manrotvel=3;
		}
	}
};
TestGame.ThirdPersonController.prototype.turnRight = function() {
	if (this.manstate!="jump"){
		if(this.manstate!="walk" && this.manrotvel==0){
			this.manstate="turn";
			this.manvel=[0,0,0];
			this.armatue.setAction(this.manwalk,150,true);
		}else if(this.manstate=="walk"){
			this.manvel=[40*this.incx,40*this.incy,0];
		}
		if(this.manstate!="walkback"){
			this.manrotvel=-3;
		}
	}
};
TestGame.ThirdPersonController.prototype.standIfTurn = function() {
	if (this.manstate=="turn"){
		this.armatue.setAction(this.manstand,150,true);
		this.manvel=[0,0,0];
	}
	this.manrotvel=0;
};
TestGame.ThirdPersonController.prototype.preProcess = function() {
	var matrix=this.armatue.getModelMatrix();
	this.incx=matrix[0];
	this.incy=matrix[4];
	this.time=(new Date()).getTime();
	this.dt=(this.time-this.mantime)/1000;
	
	
	// set position for 3rd person camera
	if (this.dt<1) {
		var camera = this.scene.camera;
		var position = camera.getPosition();
		
		var target=[this.manpos[0]-this.incx*30, this.manpos[1]-this.incy*30, this.manpos[2]+20];
		camera.setLocX(position.x+(target[0]-position.x)*this.dt);
		camera.setLocY(position.y+(target[1]-position.y)*this.dt);
		camera.setLocZ(position.z+(target[2]-position.z)*this.dt);
		camera.Lookat([this.manpos[0], this.manpos[1], this.manpos[2]+7]);
	}
};
TestGame.ThirdPersonController.prototype.process = function() {
	// wall collision detection
	if (this.manvel[0]>0 || this.manvel[1]>0) {
		var dirtotal=Math.sqrt(this.manvel[0]*this.manvel[0]+this.manvel[1]*this.manvel[1]);
		var dirx=this.manvel[0]/dirtotal;
		var diry=this.manvel[1]/dirtotal;
		var xdist=this.scene.ray([this.manpos[0], this.manpos[1], this.manpos[2]-6],[-dirx,-diry,0]);
		xdist=((xdist.distance*100)|0)/100;
		if(xdist<3 && xdist>0){
			this.manvel[0]=0;
			this.manvel[1]=0;
		}
	}
	
	if (this.mantime>0){
		// move and turn player model
		this.mantime=this.time;
		this.manpos[0]=this.manpos[0]+this.manvel[0]*this.dt;
		this.manpos[1]=this.manpos[1]+this.manvel[1]*this.dt;
		this.manpos[2]=this.manpos[2]+this.manvel[2]*this.dt;
		this.manrot=this.manrot+this.manrotvel*this.dt;
		this.armatue.setLocX(this.manpos[0]);
		this.armatue.setLocY(this.manpos[1]);
		this.armatue.setLocZ(this.manpos[2]);
		this.armatue.setRotZ(this.manrot);
		
		// bottom collision detection
		var zdist=this.scene.ray([this.manpos[0], this.manpos[1], this.manpos[2]],[0,0,1]);
		if (zdist != null){
			zdist=((zdist.distance*100)|0)/100;
			if(zdist>7.81){
				// free fall
				this.manvel[2]=this.manvel[2]-70*this.dt;
			}else if(zdist<7.81){
				// land
				this.manpos[2]=this.manpos[2]+(7.81-zdist);
				this.manstate="land";
				this.armatue.setAction(this.manland,150);
				this.manvel=[15*this.incx,15*this.incy,0];
			}
		} else {
			// ???
			this.manpos[2]=this.manpos[2]+(7.81-zdist);
			this.manstate="land";
			this.armatue.setAction(this.manland,150);
			this.manvel=[15*this.incx,15*this.incy,0];
		}
	} else {
		this.mantime=(new Date()).getTime();
	}
};


/**
 * The own Player
 */
TestGame.ThePlayer = function(scene, doc) {
	//this.personController = new TestGame.ThirdPersonController(scene, doc);
	this.personController = new TestGame.FirstPersonController(scene, doc);
};
TestGame.ThePlayer.prototype.jump = function() {
	this.personController.jump();
};
TestGame.ThePlayer.prototype.walk = function() {
	this.personController.walk();
};
TestGame.ThePlayer.prototype.standIfWalk = function() {
	this.personController.standIfWalk();
};
TestGame.ThePlayer.prototype.walkBack = function() {
	this.personController.walkBack();
};
TestGame.ThePlayer.prototype.standIfWalkBack = function() {
	this.personController.standIfWalkBack();
};
TestGame.ThePlayer.prototype.turnLeft = function() {
	this.personController.turnLeft();
};
TestGame.ThePlayer.prototype.turnRight = function() {
	this.personController.turnRight();
};
TestGame.ThePlayer.prototype.standIfTurn = function() {
	this.personController.standIfTurn();
};
TestGame.ThePlayer.prototype.preProcess = function(mouse) {
	this.personController.preProcess();
	this.personController.cameraMove(mouse);
};
TestGame.ThePlayer.prototype.process = function() {
	this.personController.process();
};


// start
g = new TestGame.System();







// Pointer Lock
var elem;
 
function fullscreenChange() {
  if (document.webkitFullscreenElement === elem ||
      document.mozFullscreenElement === elem ||
      document.mozFullScreenElement === elem) { // Older API upper case 'S'.
    // Element is fullscreen, now we can request pointer lock
    elem.requestPointerLock = elem.requestPointerLock    ||
                              elem.mozRequestPointerLock ||
                              elem.webkitRequestPointerLock;
    elem.requestPointerLock();
  }
}
 
document.addEventListener('fullscreenchange', fullscreenChange, false);
document.addEventListener('mozfullscreenchange', fullscreenChange, false);
document.addEventListener('webkitfullscreenchange', fullscreenChange, false);
 
function pointerLockChange() {
  if (document.mozPointerLockElement === elem ||
      document.webkitPointerLockElement === elem) {
    console.log("Pointer Lock was successful.");
  } else {
    console.log("Pointer Lock was lost.");
  }
}
 
document.addEventListener('pointerlockchange', pointerLockChange, false);
document.addEventListener('mozpointerlockchange', pointerLockChange, false);
document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
 
function pointerLockError() {
  console.log("Error while locking pointer.");
}
 
document.addEventListener('pointerlockerror', pointerLockError, false);
document.addEventListener('mozpointerlockerror', pointerLockError, false);
document.addEventListener('webkitpointerlockerror', pointerLockError, false);
 
function lockPointer() {
  elem = document.getElementById('canvas');
  // Start by going fullscreen with the element.  Current implementations
  // require the element to be in fullscreen before requesting pointer
  // lock--something that will likely change in the future.
  elem.requestFullscreen = elem.requestFullscreen    ||
                           elem.mozRequestFullscreen ||
                           elem.mozRequestFullScreen || // Older API upper case 'S'.
                           elem.webkitRequestFullscreen;
  elem.requestFullscreen();
}

