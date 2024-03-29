/**
 * @author jonas
 */

var gameScene;
var doc = new GLGE.Document();
doc.onLoad=function(){
	//create the renderer
	var gameRenderer=new GLGE.Renderer(document.getElementById('canvas'));
	//gameScene=new GLGE.Scene();
	gameScene=doc.getElement("scene");
	gameRenderer.setScene(gameScene);

	var mouse=new GLGE.MouseInput(document.getElementById('canvas'));
	var keys=new GLGE.KeyInput();

	doc.getElement("OBCircle").pickable=false;

	var manstate="stand";
	var manvel=[0,0,0];
	var manpos=[0,0,45];
	var manrot=0;
	var manrotvel=0;
	var armatue=doc.getElement("AMArmature");
	var manwalk=doc.getElement("ACArmature_walk");
	var manjump=doc.getElement("ACArmature_Jump");
	var manwalkback=doc.getElement("ACArmature_walkback");
	var manstand=doc.getElement("ACArmature_stand");
	var manland=doc.getElement("ACArmature_Land");
	var manfly=doc.getElement("ACArmature_Fly");
	var mantime=0;
	var incx = 0;
	var incy = 0;
	var dt = 0;
	var time = 0;


	var jumplistener=function(data){
		armatue.setAction(manfly,200,true);
	};
	var landlistener=function(data){
		if(manstate!="stand"){
			armatue.setAction(manstand,200,true);
			manstate="stand";
			manvel=[0,0,0];
		}
	}

	manland.addEventListener("animFinished",landlistener);	
	manjump.addEventListener("animFinished",jumplistener);


	function manlogic(){
		var matrix=armatue.getModelMatrix();
		incx=matrix[0];
		incy=matrix[4];
		time=(new Date()).getTime();
		dt=(time-mantime)/1000;
		
		var camera=gameScene.camera;
		var position=camera.getPosition();
		
		if(dt<1){
			var target=[manpos[0]-incx*40,manpos[1]-incy*40,manpos[2]+20];
			camera.setLocX(position.x+(target[0]-position.x)*dt);
			camera.setLocY(position.y+(target[1]-position.y)*dt);
			camera.setLocZ(position.z+(target[2]-position.z)*dt);
			camera.Lookat([manpos[0],manpos[1],manpos[2]+7]);
		}
		
		/*
		if(keys.isKeyPressed(GLGE.KI_SPACE)){
			if(manstate!="jump" && manstate!="land"){
				manstate="jump";
				armatue.setAction(manjump,150);
				manvel=[15*incx,15*incy,50];
			}
		}
		
		if(keys.isKeyPressed(GLGE.KI_UP_ARROW) && manstate!="jump" && manstate!="land"){
			if(manstate!="walk"){
				manstate="walk";
				armatue.setAction(manwalk,150,true);
				manvel=[25*incx,25*incy,0];
			}
		}else if(keys.isKeyPressed(GLGE.KI_UP_ARROW) && (manstate=="jump" || manstate=="land")){
			manvel[0]=manvel[0]+20*incx*dt;
			manvel[1]=manvel[1]+20*incy*dt;
		}else if(manstate=="walk"){
			manstate="stand";
			armatue.setAction(manstand,150,true);
			manvel=[0,0,0];
		}
		if(keys.isKeyPressed(GLGE.KI_DOWN_ARROW) && manstate!="jump"){
			if(manstate!="walkback"){
				manstate="walkback";
				armatue.setAction(manwalkback,150,true);
				manvel=[-15*incx,-15*incy,0];
			}
		}else if(manstate=="walkback"){
			manstate="stand";
			armatue.setAction(manstand,150,true);
			manvel=[0,0,0];
		}
		
		if(keys.isKeyPressed(GLGE.KI_LEFT_ARROW) && manstate!="jump"){
			if(manstate!="walk" && manrotvel==0){
				manstate="turn";
				manvel=[0,0,0];
				armatue.setAction(manwalk,150,true);
			}else if(manstate=="walk"){
				manvel=[10*incx,10*incy,0];
			}
			if(manstate!="walkback"){
				manrotvel=3;
			}
		}else if(keys.isKeyPressed(GLGE.KI_RIGHT_ARROW) && manstate!="jump"){
			if(manstate!="walk" && manrotvel==0){
				manstate="turn";
				manvel=[0,0,0];
				armatue.setAction(manwalk,150,true);
			}else if(manstate=="walk"){
				manvel=[10*incx,10*incy,0];
			}
			if(manstate!="walkback"){
				manrotvel=-3;
			}
		}else{
			if(manstate=="turn"){
				armatue.setAction(manstand,150,true);
				manvel=[0,0,0];
			}
			manrotvel=0;
		}
		*/
		
		if(manvel[0]>0 || manvel[1]>0){
			var dirtotal=Math.sqrt(manvel[0]*manvel[0]+manvel[1]*manvel[1]);
			var dirx=manvel[0]/dirtotal;
			var diry=manvel[1]/dirtotal;
			var xdist=gameScene.ray([manpos[0],manpos[1],manpos[2]-6],[-dirx,-diry,0]);
			xdist=((xdist.distance*100)|0)/100;
			if(xdist<3 && xdist>0){
				manvel[0]=0;
				manvel[1]=0;
			}
		}
		
		if(mantime>0){
			mantime=time;
			manpos[0]=manpos[0]+manvel[0]*dt;
			manpos[1]=manpos[1]+manvel[1]*dt;
			manpos[2]=manpos[2]+manvel[2]*dt;
			manrot=manrot+manrotvel*dt;
			armatue.setLocX(manpos[0]);
			armatue.setLocY(manpos[1]);
			armatue.setLocZ(manpos[2]);
			armatue.setRotZ(manrot);
			var zdist=gameScene.ray([manpos[0],manpos[1],manpos[2]],[0,0,1]);
            if(zdist != null){
			zdist=((zdist.distance*100)|0)/100;
			if(zdist>7.81){
				manvel[2]=manvel[2]-70*dt;
			}else if(zdist<7.81){
				manpos[2]=manpos[2]+(7.81-zdist);
				manstate="land";
				armatue.setAction(manland,150);
				manvel=[15*incx,15*incy,0];
			}
            }
            else{
            	manpos[2]=manpos[2]+(7.81-zdist);
				manstate="land";
				armatue.setAction(manland,150);
				manvel=[15*incx,15*incy,0];
            }
		}else{
			mantime=(new Date()).getTime();
		}
	}


	function render(){
		manlogic();
		gameRenderer.render();
		requestAnimationFrame(render);
	}
	render();
}
// Preloader configurations are optional. They improve the accuracy of the preloader.
var preloaderConfiguration1 = {XMLQuota: 0.13, numXMLFiles: 1}; // Example 1 (active)
var preloaderConfiguration2 = {XMLQuota: 0.30, XMLBytes: 852605}; // Example 2 

doc.load("plat.xml", preloaderConfiguration1);
// alternative: doc.load("plat.xml", preloaderConfiguration2);
// alternative: doc.load("plat.xml", true);
// alternative: doc.load("plat.xml"); // In this case you may not use the preloader gui because preloading is disabled.

GLGE.GUI.useLibrary("jQuery"); // use the jQuery progress-bar

var preloaderGUI = new GLGE.GUI.Preloader(); // use the preloader gui-gadget to display the progress
preloaderGUI.setDocumentLoader(doc.preloader);
preloaderGUI.addToDOM(document.getElementById('container'));
