const micro_height=100;
const micro_width=100;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const SPEED= 50;
const AMPLITUDE=50;
const SIZE=1;
const NP=10;
const rigi=5;
const krigi=0.9;
const CLAMPED=1;
var DAMP=0.05;
var firstMic = 1;
var myId = 0;
var nbMicro = 0;
var l=Math.floor(canvas.height/NP); //length of a row
var midl=Math.pow(l,2)/2-l/2;
var r=1;
var redstyle=0;
var bluestyle= 0;
var tempx,tempy,tempvx,tempvy,i,b,j,k,f,v,vunx,vuny,vdeuxx,vdeuxy,diffun,diffdeux,average,self,start, mousedown,press,radioval,firstmic=0;
var tab=[];
var tabuffer=[];
var previoustab=[];
var tabtaken=[];
var tabsin=[];

frequency=document.querySelector("#freq");
amplitude=document.querySelector("#gain");
DB=document.querySelector("#db");
damping=document.querySelector("#damp");

//////////////INITIALISATION////////
function initialisation() {
  
  console.log("initialisation");
  for (i=0;i<Math.floor( canvas.height/NP);i++){
    for (j=0;j<Math.floor(canvas.width/NP);j++){
      
      addNewPart(i,j);
      }
    }
}
function addNewPart(x,y){
  tab.push({ x:(x*NP),y:(y*NP),z:SIZE,active:1,v:0});
  tabuffer.push({ x:(x*NP),y:(y*NP),z:SIZE});
  previoustab.push({ x:(x*NP),y:(y*NP),z:SIZE});
}
///////////ENGINE////////////////////
function engine(){
  setSin();
  //setMics();
  var m=0;
  for (m=0;m<r;m++){
    nextStep();
  }
  render();
}
function setSin(){
  for (i=0;i<tabsin.length;i++)
    {
      tab[tabsin[i].i].v=tabsin[i].valueUpdate();
      tabsin[i].step++;
    }
  
}
function setMic(i,a){
    tab[i].v+=
     tab[i+l].v+=
     amplitude.value*(a-DB.value)/100;
  //tab[i-l].v+= amplitude.value*(a-DB.value)/100;
 
  }
function taken(i){
  var u=0;
  for(u=0;u<tabtaken.length;u++)
    {
      if (tabtaken[i]===i){return 1}
    }
  return 0;
}
function addSin(i){
  var u=0;
  if (taken(i)){
    return;
  }
  else{
    let sin= new Sin(210-frequency.value,amplitude.value,i); 
    console.log("sin :",sin.valueUpdate());
    tabtaken.push(i);
    tabsin.push(sin);
    }
} 
function Sin(freq,amp,i){
  this.i=i;
  this.step=0;
  this.amp=amp;
  this.freq=freq;
  
  this.valueUpdate= function(){
    return (Math.cos(((this.step/this.freq)*2*Math.PI))*this.amp);
    this.step++;};
    //console.log((Math.cos(((this.step/this.freq)*2*Math.PI))*this.amp));
}
function nextStep (){
  var act,temp,spd,d,self=0
  for(i=0;i<tab.length;i++)
    {
      self=tab[i].z;
      if(i>l&&i&& i%l && (i%l)-l+1 && i<l*(l-1)){
        act=tab[i+l].active+tab[i-l].active
          +tab[i-1].active+tab[i+1].active;
        if(!act){act=1}
       // temp=(up(i)+down(i)+left(i)+right(i))*(rigi-1)/(act*rigi)+(tab[i].z)*1/rigi 
        d=(self*4-(up(i)+down(i)+left(i)+right(i)))/4;
        spd=tab[i].v-krigi*d-tab[i].v*DAMP;
        temp=spd+tab[i].z;
      ;
        tabuffer[i].z=temp;
        tab[i].v=spd;
      }
      else{disable(i);
        temp=0;
        switch (i) {
          case 0:{ 
        temp=down(i)+right(i);
          if (!temp){temp=SIZE;}
          act=tab[i+l].active+tab[i+1].active;  
          }break;
          case l-1:{
        temp=up(i)+right(i)
          if (!temp){temp=SIZE;}
          act=tab[i+l].active+tab[i-1].active;  
          }break;
          case tab.length-l:{
        temp=down(i)+left(i);
          if (!temp){temp=SIZE;}
          act=tab[i-l].active+tab[i+1].active;  
          }break;
          case tab.length-1:{
        temp=up(i)+left(i);
          if (!temp){temp=SIZE;}
            
          }
          }
        if (temp){
          if(CLAMPED){
            temp=SIZE;
          }
          else{
            temp=temp*(rigi-1)/(act*rigi)+(tab[i].z)*1/rigi;
          }
        }
        else {
          if (((i%l)-l+1)===0&&i){
            temp=up(i)+right(i)+left(i);
            act=tab[i+l].active+tab[i-l].active
          +tab[i-1].active;
          }
          if(i%l===0&&i!==l&&i){
           temp=right(i)+down(i)+left(i);
            act=tab[i+l].active+tab[i-l].active
          +tab[i+1].active;
          }
          if(i<l*l-1&&i>l*l-l-1){
            temp=up(i)+down(i)+left(i);
            act=tab[i-l].active
          +tab[i-1].active+tab[i+1].active;
          }
          if(i<l&&i>0){
            temp=up(i)+down(i)+right(i);
            act=tab[i+l].active+tab[i-1].active+tab[i+1].active;
          }
          if(!act){act=1}
          temp=(temp*(rigi-1)/(act*rigi)+(tab[i].z)*1/rigi)/2;
          temp+=previoustab[i].z*1/2;
          previoustab[i].z=temp;
        }
        tabuffer[i].z=temp;
          }
        }
  for(i=0;i<tab.length;i++)
    {
      tab[i].z=tabuffer[i].z
    }
}
function down(i){
  return tab[i+1].z*tab[i+1].active;}
function up(i){
  return tab[i-1].z*tab[i-1].active;}
function left(i){
  return tab[i-l].z*tab[i-l].active;}
function right(i){
  return tab[i+l].z*tab[i+l].active;}
function disable(a){
  tab[a].active=0;
}
function unable(a){
  tab[a].active=1;
}
function toggle(a){
  tab[a].active ? tab[a].active=0:tab[a].active=1;
}
function makeWave(e){
  if (press){
      var x = event.pageX - elemLeft,
        y = event.pageY - elemTop;
      console.log("i move in make wave");
      if (ielement(x,y)!=b){
         wave(x,y)}
      b=ielement(x,y);
   }
}
function wave(x,y){
  tab[ielement(x,y)].v+=-SPEED;
}
function clear(){
  removeMicro();
  tabsin=[];
}



////////////CLICK////////////////////

var elemLeft = canvas.offsetLeft,
    elemTop = canvas.offsetTop,
    context = canvas.getContext('2d'),
    elements = [];

onmousemove = function(e){
  switch (radioval){
      case "Mic":{
                 };break;
      case "Wall":{wallMaker(e)
      };break;
      case "Wave":{makeWave(e);
                   console.log(radioval);
                  };break;
    
     // case "Nothing":{};break;  
    }
  
}
//onmousemove = wallMaker(e);
damping.oninput = function() {
  DAMP= this.value;
};
canvas.addEventListener('mouseup', function(event) {
  press=0;
  firstmic=0;
}, false);  
canvas.addEventListener('mousedown', function(event) {
    console.log("click");
    press=1;
    var temp=0;
    var x = event.pageX - elemLeft,
        y = event.pageY - elemTop;
  //switch ()
  for(i=0;i<radio.length;i++){
    if (radio[i].checked){
      temp=radio[i].value;
    }
    radioval=temp;
    switch (temp){
      case "Mic":{
        addMicro(x,y)
                 };break;
      case "Wall":{
      };break;
      case "Wave":{makeWave(event);};break;
        case "Sin":{
          addSin(ielement(x,y));
        }
     // case "Nothing":{};break;  
    }
  }
}, false);
var btn = document.getElementById('startbtn');
var radio = document.getElementById('radio');
var clr = document.getElementById('clear');
btn.addEventListener('click', getSound);
clr.addEventListener('click',clear);
function startMachine(){
  start ? start=0 : start=1;
  if (start){getSound}
  
  
}
function toggleSend(){
  send ? send=0 : send=1;
  
} 

////////////////WALLS////////////////////////
function wallMaker(event){
  if (press){
      var x = event.pageX - elemLeft,
        y = event.pageY - elemTop;
      if (ielement(x,y)!=b){
         makeWall(x,y)}
      b=ielement(x,y);
   }
}
function makeWall(x,y){
  toggle(ielement(x,y));
  window.requestAnimationFrame(render);
  console.log("i made a wall",ielement(x,y) );
}
function ielement(x,y){
  var temp=Math.round((x/NP))*l+Math.round(y/NP);
  if (temp<tab.length&&temp>0){
    return temp;
    }
  else {return midl};
}

////////////RENDER///////////////////
function render(){
  var xsize,ysize,xpos,ypos=10;
  var up,right,diag=0;
  var r,g,b,avr=0;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(i=0;i<tab.length;i++){
    
    if(i){
      ctx.beginPath();
      up=tab[i-1];
      right=tab[i+l];
      diag=tab[i-1+l];
      
      
    }
    if(tab[i].active){
      if(tab[i].z<=0){//downhill value
        
        
        b=126;
        r=0;
        g=-256*tab[i].z/200;
        if (g<0){g*=-1;}
        ctx.fillStyle='rgb(' +  r +', ' + g + ',' + b + ','+ 0.95 + ')';
        xsize=SIZE;
        ysize=SIZE;
        ctx.moveTo(tab[i].x , tab[i].y-tab[i].z/2);
      ctx.lineTo(up.x, up.y-up.z/2);
      ctx.lineTo(diag.x, diag.y-diag.z/2);
      ctx.lineTo(right.x, right.y-right.z/2);
      ctx.closePath();
         ctx.fill();
    
      }
      
      else{//uphill value
        avr=tab[i].z+up.z+diag.z+right.z;
        avr*=1/4;
        b=125;
        r=256*avr/100;
        g=0;
        
        
        
        if (g<0){g*=-1;}
        ctx.fillStyle='rgb(' +  r +', ' 
                         + g + ',' + b + ','+1 +')';
      xsize=SIZE;
      ysize=SIZE;

      ctx.moveTo(tab[i].x-xsize/4 , tab[i].y-tab[i].z/2);
      ctx.lineTo(up.x, up.y-up.z/2);
      ctx.lineTo(diag.x, diag.y-diag.z/2);
      ctx.lineTo(right.x, right.y-right.z/2);
      ctx.closePath();
        ctx.fill();
        
      }
    }
    else {
      ctx.fillStyle='rgb(' +  250 +', ' 
                         + 240 + ',' + 256 + ','+0+')';
      ctx.fillRect(tab[i].x-2*SIZE , tab[i].y-2*SIZE, 4*SIZE,4*SIZE);//walls
      }
    }
  ctx.stroke();
  //ctx.fill();
}
////////////MAIN/////////////////////
function main(){
  f=1;
  v=1;
  
  send=0;
  console.log("main");
  initialisation();
}
console.clear();
main();


/////////////AUDIO/////////////
navigator.getUserMedia = navigator.getUserMedia ||
                     navigator.webkitGetUserMedia ||
                     navigator.mozGetUserMedia;
function getSound(){
  if(navigator.getUserMedia){
  navigator.mediaDevices.getUserMedia({audio : true})
  .then(function(flux) {

    audioContext = new AudioContext();
    analyseur = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(flux);
    javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
    analyseur.fftSize = 1024;

    microphone.connect(analyseur);
    analyseur.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);
    javascriptNode.onaudioprocess = function() {
        var tab = new Uint8Array(analyseur.frequencyBinCount);
        analyseur.getByteFrequencyData(tab);
        var values = 0;

        for (var i = 0; i < tab.length; i++) {
          values += (tab[i]);
        }
        average = values / tab.length;
        setAverage(average);
        if (firstMic){
          engine();
        }
       /*
        for(var i = 0; i < nbMicro; ++i){
          //setAverage(i);
        }
      */      //  engine();
      /*
      
        if (send){
          state.set(values / tab.length);
        }*/

    }
    })
    .catch(function(err) {
      console.log("The following error occured: " + err.name);
  });
  }
}
/////////////FIREBASE////////////
var tabPersonne = firebase.database().ref('tabPersonne');


function addPersonneOnline(personne){
   myId = tabPersonne.push(personne);
}
function addMicroOnline(micro){
   var tabMicro = firebase.database().ref(myId);
   micro.id = tabMicro.push(micro);
}
function removeMicroOnline(){
  var p = firebase.database().ref(myId);
  p.remove();
}
function setAverage(data){
  var fb = firebase.database().ref(myId);
  fb.once('value', function(snapshot) {
  snapshot.forEach(function(child) {
    //child.forEach(function(sousChild){
      child.ref.update({
        average : data
      });
   // });
  });
});
  
}
function clearAll(){}
//Quitte la page
/*
var depart = firebase.database().ref(myId);
depart.onDisconnect().remove();
*/

var change = firebase.database().ref('tabPersonne');
change.on('value',newData);
function newData(data){
  
  var fb = firebase.database().ref('tabPersonne');
  fb.once('value', function(snapshot) {
    snapshot.forEach(function(child) {
      child.forEach(function(sousChild){
        var content = sousChild.val();
        setMic(content.i,content.average);
      });
   // });
  });
});

  engine();
}
///////////FONCTION ADD MAP

function addMicro(x,y){
  var monMicro = new Object();
  monMicro.x = x; 
  monMicro.y = y; 
  monMicro.i=ielement(x,y);
  monMicro.average = 0;
    if(firstMic === 0){
       addMicroLocal(monMicro);
    }else{
       addPersonne(monMicro);
    }  
  }
function removeMicro(){
  for(var i = 0; i < nbMicro; ++i){
      maPersonne[i] = null;
      nbMicro = 0;
      firstMic = 1;
      removeMicroOnline();
    }
  }
var maPersonne = new Array();
function addPersonne(micro){
  maPersonne.push(micro);
  ++nbMicro;
  firstMic = 0;
  addPersonneOnline(maPersonne);
}
function addMicroLocal(micro){
   maPersonne[nbMicro] = micro;
   ++nbMicro;
   addMicroOnline(micro);
}
function removeAllLocal(){
  for(var i = 0; i < nbMicro;++i){
    maPersonne[i] = null;
    nbMicro = 0;
    firstMic = 1;  
  }
  var p = firebase.database().ref('tabPersonne');
  p.remove();
}