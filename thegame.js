/**
 * @author jonas
 */

var TestGame = {};

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


TestGame.Controller = function(system) {
	this.system = system;
	this.mouse = new GLGE.MouseInput(document.getElementById('canvas'));
	this.keys = new GLGE.KeyInput();
	this.thePlayer = new TestGame.ThePlayer(system.scene, system.doc);
};
TestGame.Controller.prototype.process = function() {
	// preprocess players
	this.thePlayer.preProcess();
	
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


TestGame.ThePlayer = function(scene, doc) {
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
TestGame.ThePlayer.prototype.jump = function() {
	if (this.manstate!="jump" && this.manstate!="land"){
		this.manstate="jump";
		this.armatue.setAction(this.manjump,150);
		this.manvel=[15*this.incx,15*this.incy,50];
	}
};
TestGame.ThePlayer.prototype.walk = function() {
	if (this.manstate!="jump" && this.manstate!="land") {
		if(this.manstate!="walk"){
			this.manstate="walk";
			this.armatue.setAction(this.manwalk,150,true);
			this.manvel=[25*this.incx,25*this.incy,0];
		}
	}else if (this.manstate=="jump" || this.manstate=="land") {
		this.manvel[0]=this.manvel[0]+20*this.incx*this.dt;
		this.manvel[1]=this.manvel[1]+20*this.incy*this.dt;
	}
};
TestGame.ThePlayer.prototype.standIfWalk = function() {
	if (this.manstate=="walk") {
		this.manstate="stand";
		this.armatue.setAction(this.manstand,150,true);
		this.manvel=[0,0,0];
	}
};
TestGame.ThePlayer.prototype.walkBack = function() {
	if (this.manstate != "jump" && this.manstate!="walkback") {
		this.manstate="walkback";
		this.armatue.setAction(this.manwalkback,150,true);
		this.manvel=[-15*this.incx,-15*this.incy,0];
	}
};
TestGame.ThePlayer.prototype.standIfWalkBack = function() {
	if(this.manstate=="walkback"){
		this.manstate="stand";
		this.armatue.setAction(this.manstand,150,true);
		this.manvel=[0,0,0];
	}
};
TestGame.ThePlayer.prototype.turnLeft = function() {
	if (this.manstate!="jump") {
		if(this.manstate!="walk" && this.manrotvel==0){
			this.manstate="turn";
			this.manvel=[0,0,0];
			this.armatue.setAction(this.manwalk,150,true);
		}else if(this.manstate=="walk"){
			this.manvel=[10*this.incx,10*this.incy,0];
		}
		if(this.manstate!="walkback"){
			this.manrotvel=3;
		}
	}
};
TestGame.ThePlayer.prototype.turnRight = function() {
	if (this.manstate!="jump"){
		if(this.manstate!="walk" && this.manrotvel==0){
			this.manstate="turn";
			this.manvel=[0,0,0];
			this.armatue.setAction(this.manwalk,150,true);
		}else if(this.manstate=="walk"){
			this.manvel=[10*this.incx,10*this.incy,0];
		}
		if(this.manstate!="walkback"){
			this.manrotvel=-3;
		}
	}
};
TestGame.ThePlayer.prototype.standIfTurn = function() {
	if (this.manstate=="turn"){
		this.armatue.setAction(this.manstand,150,true);
		this.manvel=[0,0,0];
	}
	this.manrotvel=0;
};
TestGame.ThePlayer.prototype.preProcess = function() {
	var matrix=this.armatue.getModelMatrix();
	this.incx=matrix[0];
	this.incy=matrix[4];
	this.time=(new Date()).getTime();
	this.dt=(this.time-this.mantime)/1000;
	
	var camera = this.scene.camera;
	var position = camera.getPosition();
	
	if (this.dt<1) {
		var target=[this.manpos[0]-this.incx*40, this.manpos[1]-this.incy*40, this.manpos[2]+20];
		camera.setLocX(position.x+(target[0]-position.x)*this.dt);
		camera.setLocY(position.y+(target[1]-position.y)*this.dt);
		camera.setLocZ(position.z+(target[2]-position.z)*this.dt);
		camera.Lookat([this.manpos[0], this.manpos[1], this.manpos[2]+7]);
	}
};
TestGame.ThePlayer.prototype.process = function() {
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
		this.mantime=this.time;
		this.manpos[0]=this.manpos[0]+this.manvel[0]*this.dt;
		this.manpos[1]=this.manpos[1]+this.manvel[1]*this.dt;
		this.manpos[2]=this.manpos[2]+this.manvel[2]*this.dt;
		this.manrot=this.manrot+this.manrotvel*this.dt;
		this.armatue.setLocX(this.manpos[0]);
		this.armatue.setLocY(this.manpos[1]);
		this.armatue.setLocZ(this.manpos[2]);
		this.armatue.setRotZ(this.manrot);
		var zdist=this.scene.ray([this.manpos[0], this.manpos[1], this.manpos[2]],[0,0,1]);
		if (zdist != null){
			zdist=((zdist.distance*100)|0)/100;
			if(zdist>7.81){
				this.manvel[2]=this.manvel[2]-70*this.dt;
			}else if(zdist<7.81){
				this.manpos[2]=this.manpos[2]+(7.81-zdist);
				this.manstate="land";
				this.armatue.setAction(this.manland,150);
				this.manvel=[15*this.incx,15*this.incy,0];
			}
		} else {
			this.manpos[2]=this.manpos[2]+(7.81-zdist);
			this.manstate="land";
			this.armatue.setAction(this.manland,150);
			this.manvel=[15*this.incx,15*this.incy,0];
		}
	} else {
		this.mantime=(new Date()).getTime();
	}
};

TestGame.System();

