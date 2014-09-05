!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Gibber=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
!function(e,t){"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?module.exports=t():e.Gibberish=t()}(this,function(){function createInput(){console.log("connecting audio input..."),navigator.webkitGetUserMedia({audio:!0},function(e){console.log("audio input connected"),Gibberish.mediaStreamSource=Gibberish.context.createMediaStreamSource(e),Gibberish.mediaStreamSource.connect(Gibberish.node),_hasInput=!0},function(){console.log("error opening audio input")})}var Gibberish={memo:{},codeblock:[],analysisCodeblock:[],analysisUgens:[],dirtied:[],id:0,isDirty:!1,out:null,debug:!1,callback:"",audioFiles:{},sequencers:[],callbackArgs:["input"],callbackObjects:[],analysisCallbackArgs:[],analysisCallbackObjects:[],createCallback:function(){this.memo={},this.codeblock.length=0,this.callbackArgs.length=0,this.callbackObjects.length=0,this.analysisCallbackArgs.length=0,this.dirtied.length=0,this.codestring="",this.args=["input"],this.memo={},this.out.codegen();var e=this.codeblock.slice(0);if(this.analysisUgens.length>0){this.analysisCodeblock.length=0;for(var t=0;t<this.analysisUgens.length;t++)this.analysisCallbackArgs.push(this.analysisUgens[t].analysisSymbol)}if(this.args=this.args.concat(this.callbackArgs),this.args=this.args.concat(this.analysisCallbackArgs),this.codestring+=e.join("	"),this.codestring+="\n	",this.analysisUgens.length>0){this.analysisCodeblock.length=0;for(var t=0;t<this.analysisUgens.length;t++)this.codeblock.length=0,this.analysisUgens[t].analysisCodegen();this.codestring+=this.analysisCodeblock.join("\n	"),this.codestring+="\n	"}return this.codestring+="return "+this.out.variable+";\n",this.callbackString=this.codestring,this.debug&&console.log(this.callbackString),[this.args,this.codestring]},audioProcess:function(e){var t,i,n=e.outputBuffer.getChannelData(0),s=e.outputBuffer.getChannelData(1),r=e.inputBuffer.getChannelData(0),a=Gibberish,o=a.callback,h=a.sequencers,u=(Gibberish.out.callback,a.callbackObjects.slice(0));u.unshift(0);for(var c=0,l=e.outputBuffer.length;l>c;c++){for(var b=0;b<h.length;b++)h[b].tick();if(a.isDirty){t=a.createCallback();try{o=a.callback=new Function(t[0],t[1])}catch(e){console.error("ERROR WITH CALLBACK : \n\n",t)}a.isDirty=!1,u=a.callbackObjects.slice(0),u.unshift(0)}u[0]=r[c],i=o.apply(null,u),n[c]=i[0],s[c]=i[1]}},audioProcessFirefox:function(e){var t,i=Gibberish,n=i.callback,s=i.sequencers,r=i.callbackObjects.slice(0);r.unshift(0);for(var a=0,o=e.length;o>a;a+=2){for(var h=0;h<s.length;h++)s[h].tick();if(i.isDirty){t=i.createCallback();try{n=i.callback=new Function(t[0],t[1])}catch(u){console.error("ERROR WITH CALLBACK : \n\n",n)}i.isDirty=!1,r=i.callbackObjects.slice(0),r.unshift(0)}var c=n.apply(null,r);e[a]=c[0],e[a+1]=c[1]}},clear:function(){this.out.inputs.length=0,this.analysisUgens.length=0,this.sequencers.length=0,this.callbackArgs.length=2,this.callbackObjects.length=1,Gibberish.dirty(this.out)},dirty:function(e){if("undefined"!=typeof e){for(var t=!1,i=0;i<this.dirtied.length;i++)this.dirtied[i].variable===e.variable&&(t=!0);t||(this.isDirty=!0,this.dirtied.push(e))}else this.isDirty=!0},generateSymbol:function(e){return e+"_"+this.id++},AudioDataDestination:function(e,t){var i=new Audio;i.mozSetup(2,e);var n,s=0,r=e/2,a=null;setInterval(function(){var e;if(a){if(e=i.mozWriteAudio(a.subarray(n)),s+=e,n+=e,n<a.length)return;a=null}var o=i.mozCurrentSampleOffset(),h=o+r-s;if(h>0){var u=new Float32Array(h);t(u),e=i.mozWriteAudio(u),o=i.mozCurrentSampleOffset(),e<u.length&&(a=u,n=e),s+=e}},100)},init:function(){var e,t,i="undefined"==typeof arguments[0]?1024:arguments[0];return"undefined"!=typeof webkitAudioContext?e=webkitAudioContext:"undefined"!=typeof AudioContext&&(e=AudioContext),t=function(){if("undefined"!=typeof e){if(document&&document.documentElement&&"ontouchstart"in document.documentElement&&(window.removeEventListener("touchstart",t),"ontouchstart"in document.documentElement)){var i=Gibberish.context.createBufferSource();i.connect(Gibberish.context.destination),i.noteOn(0)}}else alert("Your browser does not support javascript audio synthesis. Please download a modern web browser that is not Internet Explorer.");Gibberish.onstart&&Gibberish.onstart()},Gibberish.context=new e,Gibberish.node=Gibberish.context.createScriptProcessor(i,2,2,Gibberish.context.sampleRate),Gibberish.node.onaudioprocess=Gibberish.audioProcess,Gibberish.node.connect(Gibberish.context.destination),Gibberish.out=new Gibberish.Bus2,Gibberish.out.codegen(),Gibberish.dirty(Gibberish.out),document&&document.documentElement&&"ontouchstart"in document.documentElement?window.addEventListener("touchstart",t):t(),this},makePanner:function(){for(var e=[],t=[],i=Math.sqrt(2)/2,n=0;1024>n;n++){var s=-1+n/1024*2;e[n]=i*(Math.cos(s)-Math.sin(s)),t[n]=i*(Math.cos(s)+Math.sin(s))}return function(i,n,s){var r,a,o,h,u,c,l="object"==typeof i,b=l?i[0]:i,p=l?i[1]:i;return r=1023*(n+1)/2,a=0|r,o=r-a,a=1023&a,h=1023===a?0:a+1,u=e[a],c=e[h],s[0]=(u+o*(c-u))*b,u=t[a],c=t[h],s[1]=(u+o*(c-u))*p,s}},defineUgenProperty:function(e,t,i){var n=i.properties[e]={value:t,binops:[],parent:i,name:e};Object.defineProperty(i,e,{configurable:!0,get:function(){return n.value},set:function(e){n.value=e,Gibberish.dirty(i)}})},polyInit:function(e){e.mod=e.polyMod,e.removeMod=e.removePolyMod,e.voicesClear=function(){if(e.children.length>0){for(var t=0;t<e.children.length;t++)e.children[t].disconnect();e.children.length=0,e.voiceCount=0}};for(var t in e.polyProperties)!function(t){var i=e.polyProperties[t];Object.defineProperty(e,t,{configurable:!0,get:function(){return i},set:function(n){i=n;for(var s=0;s<e.children.length;s++)e.children[s][t]=i}})}(t);var i=e.maxVoices;Object.defineProperty(e,"maxVoices",{get:function(){return i},set:function(e){i=e,this.voicesClear(),this.initVoices()}})},interpolate:function(e,t){var i=0|t,n=i+1>e.length-1?0:i+1;return frac=t-i,e[i]+frac*(e[n]-e[i])},pushUnique:function(e,t){for(var i=e,n=!0,s=0;s<t.length;s++)if(i===t[s]){n=!1;break}n&&t.push(i)},"export":function(e,t){for(var i in Gibberish[e])t[i]=Gibberish[e][i]},ugen:function(){Gibberish.extend(this,{processProperties:function(){if("object"!=typeof arguments[0][0]||"undefined"!=typeof arguments[0][0].type||Array.isArray(arguments[0][0])||"op"===arguments[0][0].name){var e=0;for(var t in this.properties)"object"==typeof this.properties[t]&&"undefined"!=typeof this.properties[t].binops?"undefined"!=typeof arguments[0][e]&&(this.properties[t].value=arguments[0][e++]):"undefined"!=typeof arguments[0][e]&&(this.properties[t]=arguments[0][e++])}else{var i=arguments[0][0];for(var t in i)"undefined"!=typeof i[t]&&("object"==typeof this.properties[t]&&"undefined"!=typeof this.properties[t].binops?this.properties[t].value=i[t]:this[t]=i[t])}return this},valueOf:function(){return this.codegen(),this.variable},codegen:function(){var e="",t=null;if(Gibberish.memo[this.symbol])return Gibberish.memo[this.symbol];t=this.variable?this.variable:Gibberish.generateSymbol("v"),Gibberish.memo[this.symbol]=t,this.variable=t,e+="var "+t+" = "+this.symbol+"(";for(var i in this.properties){var n=this.properties[i],s="";if(Array.isArray(n.value)){0===n.value.length&&(s=0);for(var r=0;r<n.value.length;r++){var a=n.value[r];s+="object"==typeof a?null!==a?a.valueOf():"null":"function"==typeof n.value?n.value():n.value,s+=r<n.value.length-1?", ":""}}else"object"==typeof n.value?null!==n.value&&(s=n.value.codegen?n.value.valueOf():n.value):"undefined"!==n.name&&(s="function"==typeof n.value?n.value():n.value);if(0!=n.binops.length){for(var o=0;o<n.binops.length;o++)e+="(";for(var h=0;h<n.binops.length;h++){var u,c=n.binops[h];u="number"==typeof c.ugen?c.ugen:null!==c.ugen?c.ugen.valueOf():"null","="===c.binop?(e=e.replace(s,""),e+=u):"++"===c.binop?e+=" + Math.abs("+u+")":(0===h&&(e+=s),e+=" "+c.binop+" "+u+")")}}else e+=s;e+=", "}return" "===e.charAt(e.length-1)&&(e=e.slice(0,-2)),e+=");\n",this.codeblock=e,-1===Gibberish.codeblock.indexOf(this.codeblock)&&Gibberish.codeblock.push(this.codeblock),-1===Gibberish.callbackArgs.indexOf(this.symbol)&&"op"!==this.name&&Gibberish.callbackArgs.push(this.symbol),-1===Gibberish.callbackObjects.indexOf(this.callback)&&"op"!==this.name&&Gibberish.callbackObjects.push(this.callback),this.dirty=!1,t},init:function(){if(this.initalized||(this.symbol=Gibberish.generateSymbol(this.name),this.codeblock=null,this.variable=null),"undefined"==typeof this.properties&&(this.properties={}),!this.initialized){this.destinations=[];for(var e in this.properties)Gibberish.defineUgenProperty(e,this.properties[e],this)}if(arguments.length>0&&"object"==typeof arguments[0][0]&&"undefined"===arguments[0][0].type){var t=arguments[0][0];for(var e in t)this[e]=t[e]}return this.initialized=!0,this},mod:function(e,t,i){var n=this.properties[e],s={ugen:t,binop:i};n.binops.push(s),Gibberish.dirty(this)},removeMod:function(e,t){if("undefined"==typeof t)this.properties[e].binops.length=0;else if("number"==typeof t)this.properties[e].binops.splice(t,1);else if("object"==typeof t)for(var i=0,n=this.properties[e].binops.length;n>i;i++)this.properties[e].binops[i].ugen===t&&this.properties[e].binops.splice(i,1);Gibberish.dirty(this)},polyMod:function(e,t,i){for(var n=0;n<this.children.length;n++)this.children[n].mod(e,t,i);Gibberish.dirty(this)},removePolyMod:function(){var e=Array.prototype.slice.call(arguments,0);if("amp"!==arguments[0]&&"pan"!==arguments[0])for(var t=0;t<this.children.length;t++)this.children[t].removeMod.apply(this.children[t],e);else this.removeMod.apply(this,e);Gibberish.dirty(this)},smooth:function(e){var t=new Gibberish.OnePole;this.mod(e,t,"=")},connect:function(e,t){return"undefined"==typeof e&&(e=Gibberish.out),-1===this.destinations.indexOf(e)&&(e.addConnection(this,1,t),this.destinations.push(e)),this},send:function(e,t){return-1===this.destinations.indexOf(e)?(e.addConnection(this,t),this.destinations.push(e)):e.adjustSendAmount(this,t),this},disconnect:function(e,t){var i;if(e)i=this.destinations.indexOf(e),i>-1&&this.destinations.splice(i,1),e.removeConnection(this);else{for(var n=0;n<this.destinations.length;n++)this.destinations[n].removeConnection(this);this.destinations=[]}return Gibberish.dirty(this),this}})}};Array2=function(){this.length=0},Array2.prototype=[],Array2.prototype.remove=function(e,t){if(t="undefined"==typeof t?!0:t,"undefined"==typeof e){for(var i=0;i<this.length;i++)delete this[i];this.length=0}else if("number"==typeof e)this.splice(e,1);else if("string"==typeof e){for(var n=[],i=0;i<this.length;i++){var s=this[i];if(s.type===e||s.name===e){if(!t)return void this.splice(i,1);n.push(i)}}for(var i=0;i<n.length;i++)this.splice(n[i],1)}else if("object"==typeof e)for(var r=this.indexOf(e);r>-1;)this.splice(r,1),r=this.indexOf(e);this.parent&&Gibberish.dirty(this.parent)},Array2.prototype.get=function(e){if("number"==typeof e)return this[e];if("string"==typeof e)for(var t=0;t<this.length;t++){var i=this[t];if(i.name===e)return i}else if("object"==typeof e){var n=this.indexOf(e);if(n>-1)return this[n]}return null},Array2.prototype.replace=function(e,t){if(t.parent=this,t.input=e.input,"number"!=typeof e){var i=this.indexOf(e);i>-1&&this.splice(i,1,t)}else this.splice(e,1,t);this.parent&&Gibberish.dirty(this.parent)},Array2.prototype.insert=function(e,t){if(e.parent=this,this.input=this.parent,Array.isArray(e))for(var i=0;i<e.length;i++)this.splice(t+i,0,e[i]);else this.splice(t,0,e);this.parent&&Gibberish.dirty(this.parent)},Array2.prototype.add=function(){for(var e=0;e<arguments.length;e++)arguments[e].parent=this,arguments[e].input=this.parent,this.push(arguments[e]);this.parent&&(console.log("DIRTYING"),Gibberish.dirty(this.parent))};var rnd=Math.random;Gibberish.rndf=function(e,t,i,n){if(n="undefined"==typeof n?!0:n,"undefined"==typeof i&&"object"!=typeof e){1==arguments.length?(t=arguments[0],e=0):2==arguments.length?(e=arguments[0],t=arguments[1]):(e=0,t=1);var s=t-e,r=Math.random(),a=s*r;return e+a}var o=[],h=[];"undefined"==typeof i&&(i=t||e.length);for(var u=0;i>u;u++){var c;if("object"==typeof arguments[0])c=arguments[0][rndi(0,arguments[0].length-1)];else if(n)c=Gibberish.rndf(e,t);else{for(c=Gibberish.rndf(e,t);h.indexOf(c)>-1;)c=Gibberish.rndf(e,t);h.push(c)}o.push(c)}return o},Gibberish.Rndf=function(){{var e,t,i,n;Math.random}return 0===arguments.length?(e=0,t=1):1===arguments.length?(t=arguments[0],e=0):2===arguments.length?(e=arguments[0],t=arguments[1]):3===arguments.length?(e=arguments[0],t=arguments[1],i=arguments[2]):(e=arguments[0],t=arguments[1],i=arguments[2],n=arguments[3]),function(){var s,r,a;return r="function"==typeof e?e():e,a="function"==typeof t?t():t,s="undefined"==typeof i?Gibberish.rndf(r,a):Gibberish.rndf(r,a,i,n)}},Gibberish.rndi=function(e,t,i,n){var s;if(0===arguments.length?(e=0,t=1):1===arguments.length?(t=arguments[0],e=0):2===arguments.length?(e=arguments[0],t=arguments[1]):(e=arguments[0],t=arguments[1],i=arguments[2],n=arguments[3]),s=t-e,i>s&&(n=!0),"undefined"==typeof i)return s=t-e,Math.round(e+Math.random()*s);for(var r=[],a=[],o=0;i>o;o++){var h;if(n)h=Gibberish.rndi(e,t);else{for(h=Gibberish.rndi(e,t);a.indexOf(h)>-1;)h=Gibberish.rndi(e,t);a.push(h)}r.push(h)}return r},Gibberish.Rndi=function(){{var e,t,i,n,s;Math.random,Math.round}return 0===arguments.length?(e=0,t=1):1===arguments.length?(t=arguments[0],e=0):2===arguments.length?(e=arguments[0],t=arguments[1]):3===arguments.length?(e=arguments[0],t=arguments[1],i=arguments[2]):(e=arguments[0],t=arguments[1],i=arguments[2],n=arguments[3]),s=t-e,"number"==typeof i&&i>s&&(n=!0),function(){var s,r,a;return r="function"==typeof e?e():e,a="function"==typeof t?t():t,s="undefined"==typeof i?Gibberish.rndi(r,a):Gibberish.rndi(r,a,i,n)}},Gibberish.extend=function(e,t){for(var i in t){{i.split(".")}t[i]instanceof Array&&t[i].length<100?(e[i]=t[i].slice(0),"fx"===i&&(e[i].parent=t[i].parent)):"object"!=typeof t[i]||null===t[i]||t[i]instanceof Float32Array?e[i]=t[i]:(e[i]=e[i]||{},arguments.callee(e[i],t[i]))}return e},Function.prototype.clone=function(){return eval("["+this.toString()+"]")[0]},String.prototype.format=function(e,t,i){function n(){var n=this,s=arguments.length+1;for(e=0;s>e;i=arguments[e++])t=i,n=n.replace(RegExp("\\{"+(e-1)+"\\}","g"),t);return n}return n.native=String.prototype.format,n}(),Gibberish.future=function(e,t){var i=new Gibberish.Sequencer({values:[function(){},function(){e(),i.stop(),i.disconnect()}],durations:[t]}).start();return i.cancel=function(){i.stop(),i.disconnect()},i},Gibberish.Proxy=function(){var e=0;Gibberish.extend(this,{name:"proxy",type:"effect",properties:{},callback:function(){return e}}).init(),this.input=arguments[0],e=this.input.parent[this.input.name],delete this.input.parent[this.input.name],this.input.parent.properties[this.input.name].value=this,Object.defineProperty(this.input.parent,this.input.name,{get:function(){return e},set:function(t){e=t}}),Gibberish.dirty(this.input.parent)},Gibberish.Proxy.prototype=new Gibberish.ugen,Gibberish.Proxy2=function(){var e=arguments[0],t=arguments[1];Gibberish.extend(this,{name:"proxy2",type:"effect",properties:{},callback:function(){var i=e[t];return Array.isArray(i)?(i[0]+i[1]+i[2])/3:i}}).init(),this.getInput=function(){return e},this.setInput=function(t){e=t},this.getName=function(){return t},this.setName=function(e){t=e}},Gibberish.Proxy2.prototype=new Gibberish.ugen,Gibberish.Proxy3=function(){var e=arguments[0],t=arguments[1];Gibberish.extend(this,{name:"proxy3",type:"effect",properties:{},callback:function(){var i=e[t];return i||0}}),this.init(),this.codegen=function(){console.log(" CALLED "),this.variable||(this.variable=Gibberish.generateSymbol("v")),Gibberish.callbackArgs.push(this.symbol),Gibberish.callbackObjects.push(this.callback),this.codeblock="var "+this.variable+" = "+this.symbol+"("+e.properties[t].codegen()+");\n"}},Gibberish.Proxy3.prototype=new Gibberish.ugen,Gibberish.oscillator=function(){this.type="oscillator",this.oscillatorInit=function(){return this.fx=new Array2,this.fx.parent=this,this}},Gibberish.oscillator.prototype=new Gibberish.ugen,Gibberish._oscillator=new Gibberish.oscillator,Gibberish.Wavetable=function(){var e=0,t=null,i=Gibberish.context.sampleRate/1024,n=0;this.properties={frequency:440,amp:.25,sync:0},this.getTable=function(){return t},this.setTable=function(e){t=e,i=Gibberish.context.sampleRate/t.length},this.getTableFreq=function(){return i},this.setTableFreq=function(e){i=e},this.getPhase=function(){return e},this.setPhase=function(t){e=t},this.callback=function(s,r){var a,o,h,u,c,l;for(e+=s/i;e>=1024;)e-=1024;return a=0|e,o=e-a,a=1023&a,h=1023===a?0:a+1,u=t[a],c=t[h],0!==l&&(n=l),(u+o*(c-u))*r}},Gibberish.Wavetable.prototype=Gibberish._oscillator,Gibberish.Table=function(e){this.__proto__=new Gibberish.Wavetable,this.name="table";var t=2*Math.PI;if("undefined"==typeof e){e=new Float32Array(1024);for(var i=1024;i--;)e[i]=Math.sin(i/1024*t)}this.setTable(e),this.init(),this.oscillatorInit()},Gibberish.asmSine=function(e,t,i){"use asm";function n(){for(var e=1024,t=1024;e=e-1|0;)t-=1,h[e>>2]=+a(+(t/1024)*6.2848);c=44100/1024}function s(e,t,i){e=+e,t=+t,i=+i;var n=0,s=0,r=0,a=0,l=0,b=0;return o=+(o+e/c),o>=1024&&(o=+(o-1024)),n=+u(o),a=o-n,s=~~n,r=(s|0)==1024?0:s+1|0,l=+h[s>>2],b=+h[r>>2],+((l+a*(b-l))*t)}function r(e){return e|=0,+h[e>>2]}var a=e.Math.sin,o=0,h=new e.Float32Array(i),u=e.Math.floor,c=0;return{init:n,gen:s,get:r}},Gibberish.asmSine2=function(){this.properties={frequency:440,amp:.5,sr:Gibberish.context.sampleRate},this.name="sine";var e=new ArrayBuffer(4096),t=Gibberish.asmSine(window,null,e);return t.init(),this.getTable=function(){return e},this.get=t.get,this.callback=t.gen,this.init(),this.oscillatorInit(),this.processProperties(arguments),this},Gibberish.asmSine2.prototype=Gibberish._oscillator,Gibberish.Sine=function(){this.__proto__=new Gibberish.Wavetable,this.name="sine";for(var e=2*Math.PI,t=new Float32Array(1024),i=1024;i--;)t[i]=Math.sin(i/1024*e);this.setTable(t),this.init(arguments),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Sine2=function(){this.__proto__=new Gibberish.Sine,this.name="sine2";var e=this.__proto__.callback,t=Gibberish.makePanner(),i=[0,0];this.callback=function(n,s,r){var a=e(n,s);return i=t(a,r,i)},this.init(),this.oscillatorInit(),Gibberish.defineUgenProperty("pan",0,this),this.processProperties(arguments)},Gibberish.Square=function(){this.__proto__=new Gibberish.Wavetable,this.name="square";for(var e=(2*Math.PI,new Float32Array(1024)),t=1024;t--;)e[t]=t/1024>.5?1:-1;this.setTable(e),this.init(arguments),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Saw=function(){this.__proto__=new Gibberish.Wavetable,this.name="saw";for(var e=new Float32Array(1024),t=1024;t--;)e[t]=4*((t/1024/2+.25)%.5-.25);this.setTable(e),this.init(arguments),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Saw2=function(){this.__proto__=new Gibberish.Saw,this.name="saw2";var e=this.__proto__.callback,t=Gibberish.makePanner(),i=[0,0];this.callback=function(n,s,r){var a=e(n,s);return i=t(a,r,i)},this.init(),Gibberish.defineUgenProperty("pan",0,this)},Gibberish.Triangle=function(){this.__proto__=new Gibberish.Wavetable,this.name="triangle";for(var e=new Float32Array(1024),t=Math.abs,i=1024;i--;)e[i]=1-4*t((i/1024+.25)%1-.5);this.setTable(e),this.init(arguments),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Triangle2=function(){this.__proto__=new Gibberish.Triangle,this.name="triangle2";var e=this.__proto__.callback,t=Gibberish.makePanner(),i=[0,0];this.callback=function(n,s,r){var a=e(n,s);return t(a,r,i)},this.init(),this.oscillatorInit(),Gibberish.defineUgenProperty("pan",0,this),this.processProperties(arguments)},Gibberish.Saw3=function(){var e=0,t=0,i=2.5,n=-1.5,s=0,r=Math.sin,a=11;pi_2=2*Math.PI,flip=0,signHistory=0,ignore=!1,sr=Gibberish.context.sampleRate,Gibberish.extend(this,{name:"saw",properties:{frequency:440,amp:.15,sync:0,sr:Gibberish.context.sampleRate},callback:function(o){var h=o/sr,u=.5-h,c=a*u*u*u*u,l=.376-.752*h,b=1-2*h,p=0;return t+=h,t-=t>1?2:0,e=.5*(e+r(pi_2*(t+e*c))),p=i*e+n*s,s=e,p+=l,p*=b}}),Object.defineProperty(this,"scale",{get:function(){return a},set:function(e){a=e}}),this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Saw3.prototype=Gibberish._oscillator,Gibberish.PWM=function(){var e=0,t=0,i=0,n=0,s=0,r=2.5,a=-1.5,o=Math.sin,h=11;pi_2=2*Math.PI,test=0,sr=Gibberish.context.sampleRate,Gibberish.extend(this,{name:"pwm",properties:{frequency:440,amp:.15,pulsewidth:.05,sr:Gibberish.context.sampleRate},callback:function(u,c,l){var b=u/sr,p=.5-b,f=h*p*p*p*p,d=1-2*b,g=0;return s+=b,s-=s>1?2:0,e=.5*(e+o(pi_2*(s+e*f))),t=.5*(t+o(pi_2*(s+t*f+l))),g=t-e,g=r*g+a*(i-n),i=e,n=t,g*d*c}}),Object.defineProperty(this,"scale",{get:function(){return h},set:function(e){h=e}}),this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.PWM.prototype=Gibberish._oscillator,Gibberish.Noise=function(){var e=Math.random;Gibberish.extend(this,{name:"noise",properties:{amp:1},callback:function(t){return(2*e()-1)*t}}),this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Noise.prototype=Gibberish._oscillator,Gibberish.KarplusStrong=function(){var e=[0],t=0,i=Math.random,n=Gibberish.makePanner(),s=Gibberish.context.sampleRate,r=[0,0];Gibberish.extend(this,{name:"karplus_strong",frequency:0,properties:{blend:1,damping:0,amp:1,channels:2,pan:0},note:function(t){var n=Math.floor(s/t);e.length=0;for(var r=0;n>r;r++)e[r]=2*i()-1;this.frequency=t},callback:function(s,a,o,h,u){var c=e.shift(),l=i()>s?-1:1;a=a>0?a:0;var b=l*(c+t)*(.5-a/100);return t=b,e.push(b),b*=o,1===h?b:n(b,u,r)}}).init().oscillatorInit().processProperties(arguments)},Gibberish.KarplusStrong.prototype=Gibberish._oscillator,Gibberish.PolyKarplusStrong=function(){this.__proto__=new Gibberish.Bus2,Gibberish.extend(this,{name:"poly_karplus_strong",maxVoices:5,voiceCount:0,_frequency:0,polyProperties:{blend:1,damping:0},note:function(e,t){var i=this.children[this.voiceCount++];this.voiceCount>=this.maxVoices&&(this.voiceCount=0),i.note(e,t),this._frequency=e},initVoices:function(){for(var e=0;e<this.maxVoices;e++){var t={blend:this.blend,damping:this.damping,channels:2,amp:1},i=new Gibberish.KarplusStrong(t).connect(this);this.children.push(i)}}}),this.amp=1/this.maxVoices,this.children=[],"object"==typeof arguments[0]&&(this.maxVoices=arguments[0].maxVoices?arguments[0].maxVoices:this.maxVoices),Gibberish.polyInit(this),this.initVoices(),this.processProperties(arguments),this.initialized=!1,Gibberish._synth.oscillatorInit.call(this),Gibberish.dirty(this)},Gibberish.bus=function(){this.type="bus",this.inputCodegen=function(){var e,t=this.value.valueOf();return e=t+", "+this.amp,this.codeblock=e,e},this.addConnection=function(){var e=arguments[2],t={value:arguments[0],amp:arguments[1],codegen:this.inputCodegen,valueOf:function(){return this.codegen()}};"undefined"!=typeof e?this.inputs.splice(e,0,t):this.inputs.push(t),Gibberish.dirty(this)},this.removeConnection=function(e){for(var t=0;t<this.inputs.length;t++)if(this.inputs[t].value===e){this.inputs.splice(t,1),Gibberish.dirty(this);break}},this.adjustSendAmount=function(e,t){for(var i=0;i<this.inputs.length;i++)if(this.inputs[i].value===e){this.inputs[i].amp=t,Gibberish.dirty(this);break}},this.callback=function(){var e=arguments[arguments.length-2],t=arguments[arguments.length-1];output[0]=output[1]=0;for(var i=0;i<arguments.length-2;i+=2){var n="object"==typeof arguments[i],s=arguments[i+1];output[0]+=n?arguments[i][0]*s:arguments[i]*s,output[1]+=n?arguments[i][1]*s:arguments[i]*s}return output[0]*=e,output[1]*=e,panner(output,t,output)}},Gibberish.bus.prototype=new Gibberish.ugen,Gibberish._bus=new Gibberish.bus,Gibberish.Bus=function(){return Gibberish.extend(this,{name:"bus",properties:{inputs:[],amp:1},callback:function(){for(var e=0,t=arguments.length-1,i=arguments[t],n=0;t>n;n++)e+=arguments[n];return e*=i}}),this.init(),this.processProperties(arguments),this},Gibberish.Bus.prototype=Gibberish._bus,Gibberish.Bus2=function(){this.name="bus2",this.type="bus",this.properties={inputs:[],amp:1,pan:0};var e=[0,0],t=Gibberish.makePanner();this.callback=function(){var i=arguments,n=i.length,s=i[n-2],r=i[n-1];e[0]=e[1]=0;for(var a=0,o=n-2;o>a;a+=2){var h="object"==typeof i[a],u=i[a+1];e[0]+=h?i[a][0]*u||0:i[a]*u||0,e[1]+=h?i[a][1]*u||0:i[a]*u||0}return e[0]*=s,e[1]*=s,t(e,r,e)},this.show=function(){console.log(e,args)},this.getOutput=function(){return e},this.getArgs=function(){return args},this.init(arguments),this.processProperties(arguments)},Gibberish.Bus2.prototype=Gibberish._bus,Gibberish.envelope=function(){this.type="envelope"},Gibberish.envelope.prototype=new Gibberish.ugen,Gibberish._envelope=new Gibberish.envelope,Gibberish.ExponentialDecay=function(){var e=Math.pow,t=0,i=0;Gibberish.extend(this,{name:"ExponentialDecay",properties:{decay:.5,length:11050},callback:function(n,s){return t=e(n,i),i+=1/s,t},trigger:function(){i="number"==typeof arguments[0]?arguments[0]:0}}).init()},Gibberish.ExponentialDecay.prototype=Gibberish._envelope,Gibberish.Line=function(e,t,i,n){var s,r={name:"line",properties:{start:e||0,end:isNaN(t)?1:t,time:i||Gibberish.context.sampleRate,loops:n||!1},retrigger:function(e,t){a=0,this.start=s,this.end=e,this.time=t,o=(e-s)/t}},a=0,o=(t-e)/i;return this.callback=function(e,t,i,n){return s=i>a?e+a++*o:t,a=s>=t&&n?0:a,s},Gibberish.extend(this,r),this.init(),this},Gibberish.Line.prototype=Gibberish._envelope,Gibberish.AD=function(e,t){var i=0,n=0;Gibberish.extend(this,{name:"AD",properties:{attack:e||1e4,decay:t||1e4},run:function(){return n=0,i=0,this},callback:function(e,t){if(e=0>e?22050:e,t=0>t?22050:t,0===n){var s=1/e;i+=s,i>=1&&n++}else if(1===n){var s=1/t;i-=s,0>=i&&(i=0,n++)}return i},getState:function(){return n}}).init().processProperties(arguments)},Gibberish.AD.prototype=Gibberish._envelope,Gibberish.ADSR=function(e,t,i,n,s,r,a){var o={name:"adsr",type:"envelope",requireReleaseTrigger:"undefined"!=typeof a?a:!1,properties:{attack:isNaN(e)?1e4:e,decay:isNaN(t)?1e4:t,sustain:isNaN(i)?22050:i,release:isNaN(n)?1e4:n,attackLevel:s||1,sustainLevel:r||.5,releaseTrigger:0},run:function(){this.setPhase(0),this.setState(0)},stop:function(){this.releaseTrigger=1}};Gibberish.extend(this,o);var h=0,u=0,c=0,l=this;return this.callback=function(e,t,i,n,s,r,a){var o=0;return c=1===c?1:a,0===u?(o=h/e*s,++h/e===1&&(u++,h=t)):1===u?(o=h/t*(s-r)+r,--h<=0&&(null!==i?(u+=1,h=i):(u+=2,h=n))):2===u?(o=r,l.requireReleaseTrigger&&c?(u++,h=n,l.releaseTrigger=0,c=0):0!==h--||l.requireReleaseTrigger||(u++,h=n)):3===u&&(h--,o=h/n*r,0>=h&&u++),o},this.call=function(){return this.callback(this.attack,this.decay,this.sustain,this.release,this.attackLevel,this.sustainLevel,this.releaseTrigger)},this.setPhase=function(e){h=e},this.setState=function(e){u=e,h=0},this.getState=function(){return u},this.init(),this},Gibberish.ADSR.prototype=Gibberish._envelope,Gibberish.ADR=function(e,t,i,n,s){var r={name:"adr",type:"envelope",properties:{attack:isNaN(e)?11025:e,decay:isNaN(t)?11025:t,release:isNaN(i)?22050:i,attackLevel:n||1,releaseLevel:s||.2},run:function(){this.setPhase(0),this.setState(0)}};Gibberish.extend(this,r);var a=0,o=0;return this.callback=function(e,t,i,n,s){var r=0;return 0===o?(r=a/e*n,++a/e===1&&(o++,a=t)):1===o?(r=a/t*(n-s)+s,--a<=0&&(o+=1,a=i)):2===o&&(a--,r=a/i*s,0>=a&&o++),r},this.setPhase=function(e){a=e},this.setState=function(e){o=e,a=0},this.getState=function(){return o},this.init(),this},Gibberish.ADR.prototype=Gibberish._envelope,Gibberish.analysis=function(){this.type="analysis",this.codegen=function(){if(Gibberish.memo[this.symbol])return Gibberish.memo[this.symbol];var e=this.variable?this.variable:Gibberish.generateSymbol("v");return Gibberish.memo[this.symbol]=e,this.variable=e,Gibberish.callbackArgs.push(this.symbol),Gibberish.callbackObjects.push(this.callback),this.codeblock="var "+this.variable+" = "+this.symbol+"();\n",-1===Gibberish.codeblock.indexOf(this.codeblock)&&Gibberish.codeblock.push(this.codeblock),this.variable},this.analysisCodegen=function(){var e=0;this.input.codegen?(e=this.input.codegen(),e.indexOf("op")>-1&&console.log("ANALYSIS BUG")):e=this.input.value?"undefined"!=typeof this.input.value.codegen?this.input.value.codegen():this.input.value:"null";var t=this.analysisSymbol+"("+e+",";for(var i in this.properties)"input"!==i&&(t+=this[i]+",");return t=t.slice(0,-1),t+=");",this.analysisCodeblock=t,-1===Gibberish.analysisCodeblock.indexOf(this.analysisCodeblock)&&Gibberish.analysisCodeblock.push(this.analysisCodeblock),-1===Gibberish.callbackObjects.indexOf(this.analysisCallback)&&Gibberish.callbackObjects.push(this.analysisCallback),t},this.remove=function(){Gibberish.analysisUgens.splice(Gibberish.analysisUgens.indexOf(this),1)},this.analysisInit=function(){this.analysisSymbol=Gibberish.generateSymbol(this.name),Gibberish.analysisUgens.push(this),Gibberish.dirty()}},Gibberish.analysis.prototype=new Gibberish.ugen,Gibberish._analysis=new Gibberish.analysis,Gibberish.Follow=function(){this.name="follow",this.properties={input:0,bufferSize:4410,mult:1,useAbsoluteValue:!0};var e=Math.abs,t=[0],i=0,n=0,s=0;this.analysisCallback=function(r,a,o,h){"object"==typeof r&&(r=r[0]+r[1]),i+=h?e(r):r,i-=t[n],t[n]=h?e(r):r,n=(n+1)%a,t[n]=t[n]?t[n]:0,s=i/a*o},this.callback=this.getValue=function(){return s},this.init(),this.analysisInit(),this.processProperties(arguments);var r=(this.__lookupSetter__("bufferSize"),this.bufferSize);Object.defineProperty(this,"bufferSize",{get:function(){return r},set:function(e){r=e,i=0,t=[0],n=0}})},Gibberish.Follow.prototype=Gibberish._analysis,Gibberish.SingleSampleDelay=function(){this.name="single_sample_delay",this.properties={input:arguments[0]||0,amp:arguments[1]||1};var e=0;this.analysisCallback=function(t){e=t},this.callback=function(){return e},this.getValue=function(){return e},this.init(),this.analysisInit(),this.processProperties(arguments)},Gibberish.SingleSampleDelay.prototype=Gibberish._analysis,Gibberish.Record=function(e,t,i){var n=new Float32Array(t),s=0,r=!1,a=this;Gibberish.extend(this,{name:"record",oncomplete:i,properties:{input:0,size:t||0},analysisCallback:function(e,t){r&&(n[s++]="object"==typeof e?e[0]+e[1]:e,s>=t&&(r=!1,a.remove()))},record:function(){return s=0,r=!0,this},getBuffer:function(){return n},getPhase:function(){return s},remove:function(){"undefined"!=typeof this.oncomplete&&this.oncomplete();for(var e=0;e<Gibberish.analysisUgens.length;e++){var t=Gibberish.analysisUgens[e];if(t===this)return Gibberish.callbackArgs.indexOf(this.analysisSymbol)>-1&&Gibberish.callbackArgs.splice(Gibberish.callbackArgs.indexOf(this.analysisSymbol),1),Gibberish.callbackObjects.indexOf(this.analysisCallback)>-1&&Gibberish.callbackObjects.splice(Gibberish.callbackObjects.indexOf(this.analysisCallback),1),void Gibberish.analysisUgens.splice(e,1)}}}),this.properties.input=e,this.init(),this.analysisInit(),Gibberish.dirty()},Gibberish.Record.prototype=Gibberish._analysis,Gibberish.effect=function(){this.type="effect"},Gibberish.effect.prototype=new Gibberish.ugen,Gibberish._effect=new Gibberish.effect,Gibberish.Distortion=function(){var e=Math.abs,t=Math.log,i=Math.LN2;Gibberish.extend(this,{name:"distortion",properties:{input:0,amount:50},callback:function(n,s){var r;return s=s>2?s:2,"number"==typeof n?(r=n*s,n=r/(1+e(r))/(t(s)/i)):(r=n[0]*s,n[0]=r/(1+e(r))/(t(s)/i),r=n[1]*s,n[1]=r/(1+e(r))/(t(s)/i)),n}}).init().processProperties(arguments)},Gibberish.Distortion.prototype=Gibberish._effect,Gibberish.Gain=function(){Gibberish.extend(this,{name:"gain",properties:{input:0,amount:1},callback:function(e,t){return"number"==typeof e?e*=t:(e[0]*=t,e[1]*=t),e}}).init().processProperties(arguments)},Gibberish.Gain.prototype=Gibberish._effect,Gibberish.Delay=function(){var e=[],t=0;e.push(new Float32Array(2*Gibberish.context.sampleRate)),e.push(new Float32Array(2*Gibberish.context.sampleRate)),Gibberish.extend(this,{name:"delay",properties:{input:0,time:22050,feedback:.5,wet:1,dry:1},callback:function(i,n,s,r,a){var o="number"==typeof i?1:2,h=t++%88200,u=(h+(0|n))%88200;
return 1===o?(e[0][u]=(i+e[0][h])*s,i=i*a+e[0][h]*r):(e[0][u]=(i[0]+e[0][h])*s,i[0]=i[0]*a+e[0][h]*r,e[1][u]=(i[1]+e[1][h])*s,i[1]=i[1]*a+e[1][h]*r),i}});var i=Math.round(this.properties.time);Object.defineProperty(this,"time",{configurable:!0,get:function(){return i},set:function(e){i=Math.round(e),Gibberish.dirty(this)}}),this.init(),this.processProperties(arguments)},Gibberish.Delay.prototype=Gibberish._effect,Gibberish.Decimator=function(){var e=0,t=[],i=Math.pow,n=Math.floor;Gibberish.extend(this,{name:"decimator",properties:{input:0,bitDepth:16,sampleRate:1},callback:function(s,r,a){e+=a;var o="number"==typeof s?1:2;if(1===o){if(e>=1){var h=i(r,2);t[0]=n(s*h)/h,e-=1}s=t[0]}else{if(e>=1){var h=i(r,2);t[0]=n(s[0]*h)/h,t[1]=n(s[1]*h)/h,e-=1}s=t}return s}}).init().processProperties(arguments)},Gibberish.Decimator.prototype=Gibberish._effect,Gibberish.RingModulation=function(){var e=(new Gibberish.Sine).callback,t=[0,0];Gibberish.extend(this,{name:"ringmod",properties:{input:0,frequency:440,amp:.5,mix:.5},callback:function(i,n,s,r){var a="number"==typeof i?1:2,o=1===a?i:i[0],h=e(n,s);if(o=o*(1-r)+o*h*r,2===a){var u=i[1];return u=u*(1-r)+u*h*r,t[0]=o,t[1]=u,t}return o}}).init().processProperties(arguments)},Gibberish.RingModulation.prototype=Gibberish._effect,Gibberish.DCBlock=function(){var e=0,t=0;Gibberish.extend(this,{name:"dcblock",type:"effect",properties:{input:0},reset:function(){e=0,t=0},callback:function(i){var n=i-e+.9997*t;return e=i,t=n,n}}).init().processProperties(arguments)},Gibberish.DCBlock.prototype=Gibberish._effect,Gibberish.Tremolo=function(){var e=(new Gibberish.Sine).callback;Gibberish.extend(this,{name:"tremolo",type:"effect",properties:{input:0,frequency:2.5,amp:.5},callback:function(t,i,n){var s="number"==typeof t?1:2,r=e(i,n);return 1===s?t*=r:(t[0]*=r,t[1]*=r),t}}).init().processProperties(arguments)},Gibberish.Tremolo.prototype=Gibberish._effect,Gibberish.OnePole=function(){var e=0;Gibberish.extend(this,{name:"onepole",type:"effect",properties:{input:0,a0:.15,b1:.85},callback:function(t,i,n){var s=t*i+e*n;return e=s,s},smooth:function(t,i){this.input=i[t],e=this.input,i[t]=this,this.obj=i,this.property=t,this.oldSetter=i.__lookupSetter__(t),this.oldGetter=i.__lookupGetter__(t);var n=this;Object.defineProperty(i,t,{get:function(){return n.input},set:function(e){n.input=e}})},remove:function(){Object.defineProperty(this.obj,this.property,{get:this.oldGetter,set:this.oldSetter}),this.obj[this.property]=this.input}}).init().processProperties(arguments)},Gibberish.OnePole.prototype=Gibberish._effect,Gibberish.Filter24=function(){var e=[0,0,0,0],t=[0,0,0,0],i=[0,0],n=isNaN(arguments[0])?.1:arguments[0],s=isNaN(arguments[1])?3:arguments[1];_isLowPass="undefined"!=typeof arguments[2]?arguments[2]:!0,Gibberish.extend(this,{name:"filter24",properties:{input:0,cutoff:n,resonance:s,isLowPass:_isLowPass},callback:function(n,s,r,a){var o="number"==typeof n?1:2,h=1===o?n:n[0],u=e[3]*r;if(u=u>1?1:u,s=0>s?0:s,s=s>1?1:s,h-=u,e[0]=e[0]+(-e[0]+h)*s,e[1]=e[1]+(-e[1]+e[0])*s,e[2]=e[2]+(-e[2]+e[1])*s,e[3]=e[3]+(-e[3]+e[2])*s,h=a?e[3]:h-e[3],2===o){var c=n[1];return u=t[3]*r,u=u>1?1:u,c-=u,t[0]=t[0]+(-t[0]+c)*s,t[1]=t[1]+(-t[1]+t[0])*s,t[2]=t[2]+(-t[2]+t[1])*s,t[3]=t[3]+(-t[3]+t[2])*s,c=a?t[3]:c-t[3],i[0]=h,i[1]=c,i}return h}}).init().processProperties(arguments)},Gibberish.Filter24.prototype=Gibberish._effect,Gibberish.SVF=function(){var e=[0,0],t=[0,0],i=Math.PI,n=[0,0];Gibberish.extend(this,{name:"SVF",properties:{input:0,cutoff:440,Q:2,mode:0,sr:Gibberish.context.sampleRate},callback:function(s,r,a,o,h){var u="number"==typeof s?1:2,c=1===u?s:s[0],l=2*i*r/h;a=1/a;var b=t[0]+l*e[0],p=c-b-a*e[0],f=l*p+e[0],d=p+b;if(e[0]=f,t[0]=b,c=0===o?b:1===o?p:2===o?f:d,2===u){var g=s[1],b=t[1]+l*e[1],p=g-b-a*e[1],f=l*p+e[1],d=p+b;e[1]=f,t[1]=b,g=0===o?b:1===o?p:2===o?f:d,n[0]=c,n[1]=g}else n=c;return n}}).init().processProperties(arguments)},Gibberish.SVF.prototype=Gibberish._effect,Gibberish.Biquad=function(){var e=x2=y1=y2=0,t=[0,0],i=.001639,n=.003278,s=.001639,r=-1.955777,a=.960601,o="LP",h=2e3,u=.5,c=Gibberish.context.sampleRate;Gibberish.extend(this,{name:"biquad",properties:{input:null},calculateCoefficients:function(){switch(o){case"LP":var e=2*Math.PI*h/c,t=Math.sin(e),l=Math.cos(e),b=t/(2*u);i=(1-l)/2,n=1-l,s=i,a0=1+b,r=-2*l,a=1-b;break;case"HP":var e=2*Math.PI*h/c,t=Math.sin(e),l=Math.cos(e),b=t/(2*u);i=(1+l)/2,n=-(1+l),s=i,a0=1+b,r=-2*l,a=1-b;break;case"BP":var e=2*Math.PI*h/c,t=Math.sin(e),l=Math.cos(e),p=Math.log(2)/2*u*e/t,b=t*(Math.exp(p)-Math.exp(-p))/2;i=b,n=0,s=-b,a0=1+b,r=-2*l,a=1-b;break;default:return}i/=a0,n/=a0,s/=a0,r/=a0,a/=a0},callback:function(o){var h="number"==typeof o?1:2,u=0,c=0,l=1===h?o:o[0];return u=i*l+n*e+s*x2-r*y1-a*y2,x2=e,e=o,y2=y1,y1=u,2===h&&(inR=o[1],c=i*inR+n*e[1]+s*x2[1]-r*y1[1]-a*y2[1],x2[1]=e[1],e[1]=o[1],y2[1]=y1[1],y1[1]=c,t[0]=u,t[1]=c),1===h?u:t}}).init(),Object.defineProperties(this,{mode:{get:function(){return o},set:function(e){o=e,this.calculateCoefficients()}},cutoff:{get:function(){return h},set:function(e){h=e,this.calculateCoefficients()}},Q:{get:function(){return u},set:function(e){u=e,this.calculateCoefficients()}}}),this.processProperties(arguments),this.calculateCoefficients()},Gibberish.Biquad.prototype=Gibberish._effect,Gibberish.Flanger=function(){var e=[new Float32Array(88200),new Float32Array(88200)],t=88200,i=(new Gibberish.Sine).callback,n=Gibberish.interpolate,s=-100,r=0;Gibberish.extend(this,{name:"flanger",properties:{input:0,rate:.25,feedback:0,amount:125,offset:125},callback:function(a,o,h,u){var c="number"==typeof a?1:2,l=s+i(o,.95*u);l>t?l-=t:0>l&&(l+=t);var b=n(e[0],l);return e[0][r]=1===c?a+b*h:a[0]+b*h,2===c?(a[0]+=b,b=n(e[1],l),e[1][r]=a[1]+b*h,a[1]+=b):a+=b,++r>=t&&(r=0),++s>=t&&(s=0),a}}).init().processProperties(arguments),s=-1*this.offset},Gibberish.Flanger.prototype=Gibberish._effect,Gibberish.Vibrato=function(){var e=[new Float32Array(88200),new Float32Array(88200)],t=88200,i=(new Gibberish.Sine).callback,n=Gibberish.interpolate,s=-100,r=0;Gibberish.extend(this,{name:"vibrato",properties:{input:0,rate:5,amount:.5,offset:125},callback:function(a,o,h,u){var c="number"==typeof a?1:2,l=s+i(o,h*u-1);l>t?l-=t:0>l&&(l+=t);var b=n(e[0],l);return e[0][r]=1===c?a:a[0],2===c?(a[0]=b,b=n(e[1],l),e[1][r]=a[1],a[1]=b):a=b,++r>=t&&(r=0),++s>=t&&(s=0),a}}).init().processProperties(arguments),s=-1*this.offset},Gibberish.Vibrato.prototype=Gibberish._effect,Gibberish.BufferShuffler=function(){var e=[new Float32Array(88200),new Float32Array(88200)],t=88200,i=0,n=0,s=0,r=0,a=0,o=Math.random,h=1,u=!1,c=!1,l=!1,b=Gibberish.interpolate,p=!1,f=1,d=!1,g=Gibberish.rndf,m=[0,0];Gibberish.extend(this,{name:"buffer_shuffler",properties:{input:0,chance:.25,rate:11025,length:22050,reverseChange:.5,pitchChance:.5,pitchMin:.25,pitchMax:2,wet:1,dry:0},callback:function(y,G,v,k,x,_,w,A,S,P){var R="number"==typeof y?1:2;a?++r%(k-400)===0&&(u=!1,c=!0,h=1,r=0):(e[0][n]=1===R?y:y[0],e[1][n]=1===R?y:y[1],n++,n%=t,d=0===n?1:d,s++,s%v==0&&o()<G&&(l=o()<x,a=!0,l||(i=n-k,0>i&&(i=t+i)),p=o()<_,p&&(f=g(w,A)),h=1,u=!0,c=!1)),i+=l?-1*f:f,0>i?i+=t:i>=t&&(i-=t);var q,M,C,I,T=b(e[0],i);return u?(h-=.0025,C=T*(1-h),q=1===R?C+y*h:C+y[0]*h,2===R&&(I=b(e[1],i),C=I*(1-h),M=1===R?q:C+y[1]*h),.0025>=h&&(u=!1)):c?(h-=.0025,C=T*h,q=1===R?C+y*h:C+y[0]*(1-h),2===R&&(I=b(e[1],i),C=I*h,M=C+y[1]*(1-h)),.0025>=h&&(c=!1,a=!1,l=!1,f=1,p=0)):1===R?q=a&&d?T*S+y*P:y:(I=b(e[1],i),q=a&&d?T*S+y[0]*P:y[0],M=a&&d?I*S+y[1]*P:y[1]),m=[q,M],1===R?q:m}}).init().processProperties(arguments)},Gibberish.BufferShuffler.prototype=Gibberish._effect,Gibberish.AllPass=function(e){var t=-1,i=new Float32Array(e||500),n=i.length;Gibberish.extend(this,{name:"allpass",properties:{input:0},callback:function(e){t=++t%n;var s=i[t],r=-1*e+s;return i[t]=e+.5*s,r}})},Gibberish.Comb=function(e){var t=new Float32Array(e||1200),i=t.length,n=0,s=0;Gibberish.extend(this,{name:"comb",properties:{input:0,feedback:.84,damping:.2},callback:function(e,r,a){var o=++n%i,h=t[o];return s=h*(1-a)+s*a,t[o]=e+s*r,h}})},Gibberish.Reverb=function(){var e={combCount:8,combTuning:[1116,1188,1277,1356,1422,1491,1557,1617],allPassCount:4,allPassTuning:[556,441,341,225],allPassFeedback:.5,fixedGain:.015,scaleDamping:.4,scaleRoom:.28,offsetRoom:.7,stereoSpread:23},t=.84,i=[],n=[],s=[0,0];Gibberish.extend(this,{name:"reverb",roomSize:.5,properties:{input:0,wet:.5,dry:.55,roomSize:.84,damping:.5},callback:function(e,t,r,a,o){for(var h="object"==typeof e?2:1,u=1===h?e:e[0]+e[1],c=.015*u,l=c,b=0;8>b;b++){var p=i[b](c,.98*a,.4*o);l+=p}for(var b=0;4>b;b++)l=n[b](l);return s[0]=s[1]=u*r+l*t,s}}).init().processProperties(arguments),this.setFeedback=function(e){t=e};for(var r=0;8>r;r++)i.push(new Gibberish.Comb(e.combTuning[r]).callback);for(var r=0;4>r;r++)n.push(new Gibberish.AllPass(e.allPassTuning[r],e.allPassFeedback).callback)},Gibberish.Reverb.prototype=Gibberish._effect,Gibberish.Granulator=function(e){var t=[];buffer=null,interpolate=Gibberish.interpolate,panner=Gibberish.makePanner(),bufferLength=0,debug=0,write=0,self=this,out=[0,0],_out=[0,0],rndf=Gibberish.rndf,numberOfGrains=e.numberOfGrains||20,Gibberish.extend(this,{name:"granulator",bufferLength:88200,reverse:!0,spread:.5,properties:{speed:1,speedMin:-0,speedMax:0,grainSize:1e3,position:.5,positionMin:0,positionMax:0,amp:.2,fade:.1,pan:0,shouldWrite:!1},setBuffer:function(e){buffer=e,bufferLength=e.length},callback:function(e,i,n,s,r,a,o,h,u,c){for(var l=0;numberOfGrains>l;l++){var b=t[l];if(b._speed>0){b.pos>b.end&&(b.pos=(o+rndf(r,a))*buffer.length,b.start=b.pos,b.end=b.start+s,b._speed=e+rndf(i,n),b._speed=b._speed<.1?.1:b._speed,b._speed=b._speed<.1&&b._speed>0?.1:b._speed,b._speed=b._speed>-.1&&b._speed<0?-.1:b._speed,b.fadeAmount=b._speed*u*s,b.pan=rndf(-1*self.spread,self.spread));for(var p=b.pos;p>buffer.length;)p-=buffer.length;for(;0>p;)p+=buffer.length;var f=interpolate(buffer,p);f*=b.pos<b.fadeAmount+b.start?(b.pos-b.start)/b.fadeAmount:1,f*=b.pos>b.end-b.fadeAmount?(b.end-b.pos)/b.fadeAmount:1}else{b.pos<b.end&&(b.pos=(o+rndf(r,a))*buffer.length,b.start=b.pos,b.end=b.start-s,b._speed=e+rndf(i,n),b._speed=b._speed<.1&&b._speed>0?.1:b._speed,b._speed=b._speed>-.1&&b._speed<0?-.1:b._speed,b.fadeAmount=b._speed*u*s);for(var p=b.pos;p>buffer.length;)p-=buffer.length;for(;0>p;)p+=buffer.length;var f=interpolate(buffer,p);f*=b.pos>b.start-b.fadeAmount?(b.start-b.pos)/b.fadeAmount:1,f*=b.pos<b.end+b.fadeAmount?(b.end-b.pos)/b.fadeAmount:1}_out=panner(f*h,b.pan,_out),out[0]+=_out[0],out[1]+=_out[1],b.pos+=b._speed}return panner(out,c,out)}}).init().processProperties(arguments);for(var i=0;numberOfGrains>i;i++)t[i]={pos:self.position+Gibberish.rndf(self.positionMin,self.positionMax),_speed:self.speed+Gibberish.rndf(self.speedMin,self.speedMax)},t[i].start=t[i].pos,t[i].end=t[i].pos+self.grainSize,t[i].fadeAmount=t[i]._speed*self.fade*self.grainSize,t[i].pan=Gibberish.rndf(-1*self.spread,self.spread);"undefined"!=typeof e.buffer&&(buffer=e.buffer,bufferLength=buffer.length)},Gibberish.Granulator.prototype=Gibberish._effect,Gibberish.synth=function(){this.type="oscillator",this.oscillatorInit=function(){this.fx=new Array2,this.fx.parent=this}},Gibberish.synth.prototype=new Gibberish.ugen,Gibberish._synth=new Gibberish.synth,Gibberish.Synth=function(e){this.name="synth",this.properties={frequency:0,pulsewidth:.5,attack:22050,decay:22050,sustain:22050,release:22050,attackLevel:1,sustainLevel:.5,releaseTrigger:0,glide:.15,amp:.25,channels:2,pan:0,sr:Gibberish.context.sampleRate},this.note=function(e,n){if(0!==n){if("object"!=typeof this.frequency){if(t&&e===c)return void(this.releaseTrigger=1);this.frequency=c=e,this.releaseTrigger=0}else this.frequency[0]=c=e,this.releaseTrigger=0,Gibberish.dirty(this);"undefined"!=typeof n&&(this.amp=n),i.run()}else this.releaseTrigger=1},e=e||{};var t="undefined"==typeof e.useADSR?!1:e.useADSR,i=t?new Gibberish.ADSR:new Gibberish.AD,n=i.getState,s=i.callback,r=new Gibberish.PWM,a=r.callback,o=(new Gibberish.OnePole).callback,h=Gibberish.makePanner(),u=this,c=0,l=[0,0];i.requireReleaseTrigger=e.requireReleaseTrigger||!1,this.callback=function(e,i,r,c,b,p,f,d,g,m,y,G,v,k){m=m>=1?.99999:m,e=o(e,1-m,m);var x,_;return t?(x=s(r,c,b,p,f,d,g),g&&(u.releaseTrigger=0),n()<4?(_=a(e,1,i,k)*x*y,1===G?_:h(_,v,l)):(_=l[0]=l[1]=0,1===G?_:l)):n()<2?(x=s(r,c),_=a(e,1,i,k)*x*y,1===G?_:h(_,v,l)):(_=l[0]=l[1]=0,1===G?_:l)},this.getEnv=function(){return i},this.getOsc=function(){return r},this.setOsc=function(e){r=e,a=r.callback};var b="PWM";Object.defineProperty(this,"waveform",{get:function(){return b},set:function(e){this.setOsc(new Gibberish[e])}}),this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Synth.prototype=Gibberish._synth,Gibberish.PolySynth=function(){this.__proto__=new Gibberish.Bus2,Gibberish.extend(this,{name:"polysynth",maxVoices:5,voiceCount:0,frequencies:[],_frequency:0,polyProperties:{frequency:0,glide:0,attack:22050,decay:22050,pulsewidth:.5,waveform:"PWM"},note:function(e,t){var i=this.frequencies.indexOf(e),n=i>-1?i:this.voiceCount++,s=this.children[n];s.note(e,t),-1===i?(this.frequencies[n]=e,this._frequency=e,this.voiceCount>=this.maxVoices&&(this.voiceCount=0)):delete this.frequencies[n]},initVoices:function(){for(var e=0;e<this.maxVoices;e++){var t={waveform:this.waveform,attack:this.attack,decay:this.decay,pulsewidth:this.pulsewidth,channels:2,amp:1,useADSR:this.useADSR||!1,requireReleaseTrigger:this.requireReleaseTrigger||!1},i=new Gibberish.Synth(t).connect(this);this.children.push(i)}}}),this.amp=1/this.maxVoices,this.children=[],"object"==typeof arguments[0]&&(this.maxVoices=arguments[0].maxVoices?arguments[0].maxVoices:this.maxVoices,this.useADSR="undefined"!=typeof arguments[0].useADSR?arguments[0].useADSR:!1,this.requireReleaseTrigger="undefined"!=typeof arguments[0].requireReleaseTrigger?arguments[0].requireReleaseTrigger:!1),Gibberish.polyInit(this),this.initVoices(),this.processProperties(arguments),Gibberish._synth.oscillatorInit.call(this)},Gibberish.Synth2=function(e){this.name="synth2",this.properties={frequency:0,pulsewidth:.5,attack:22050,decay:22050,sustain:22050,release:22050,attackLevel:1,sustainLevel:.5,releaseTrigger:0,cutoff:.25,resonance:3.5,useLowPassFilter:!0,glide:.15,amp:.25,channels:1,pan:0,sr:Gibberish.context.sampleRate},this.note=function(e,n){if(0!==n){if("object"!=typeof this.frequency){if(t&&e===l)return void(this.releaseTrigger=1);this.frequency=l=e,this.releaseTrigger=0}else this.frequency[0]=l=e,this.releaseTrigger=0,Gibberish.dirty(this);"undefined"!=typeof n&&(this.amp=n),i.run()}else this.releaseTrigger=1},e=e||{};var t="undefined"==typeof e.useADSR?!1:e.useADSR,i=t?new Gibberish.ADSR:new Gibberish.AD,n=i.getState,s=i.callback,r=new Gibberish.PWM,a=r.callback,o=new Gibberish.Filter24,h=o.callback,u=(new Gibberish.OnePole).callback,c=Gibberish.makePanner(),l=0,b=this,p=[0,0];i.requireReleaseTrigger=e.requireReleaseTrigger||!1,this.callback=function(e,i,r,o,l,f,d,g,m,y,G,v,k,x,_,w,A){k=k>=1?.99999:k,e=u(e,1-k,k);var S,P;return t?(S=s(r,o,l,f,d,g,m),m&&(b.releaseTrigger=0),n()<4?(P=h(a(e,.15,i,A),y*S,G,v)*S*x,1===_?P:c(P,w,p)):(P=p[0]=p[1]=0,1===_?P:p)):n()<2?(S=s(r,o),P=h(a(e,.15,i,A),y*S,G,v)*S*x,1===_?P:c(P,w,p)):(P=p[0]=p[1]=0,1===_?P:p)},this.getUseADSR=function(){return t},this.getEnv=function(){return i},this.getOsc=function(){return r},this.setOsc=function(e){r=e,a=r.callback};var f="PWM";Object.defineProperty(this,"waveform",{get:function(){return f},set:function(e){this.setOsc(new Gibberish[e])}}),this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Synth2.prototype=Gibberish._synth,Gibberish.PolySynth2=function(){this.__proto__=new Gibberish.Bus2,Gibberish.extend(this,{name:"polysynth2",maxVoices:5,voiceCount:0,frequencies:[],_frequency:0,polyProperties:{frequency:0,glide:0,attack:22050,decay:22050,pulsewidth:.5,resonance:3.5,cutoff:.25,useLowPassFilter:!0,waveform:"PWM"},note:function(e,t){var i=this.frequencies.indexOf(e),n=i>-1?i:this.voiceCount++,s=this.children[n];s.note(e,t),-1===i?(this.frequencies[n]=e,this._frequency=e,this.voiceCount>=this.maxVoices&&(this.voiceCount=0)):delete this.frequencies[n]},initVoices:function(){this.dirty=!0;for(var e=0;e<this.maxVoices;e++){var t={attack:this.attack,decay:this.decay,pulsewidth:this.pulsewidth,channels:2,amp:1,useADSR:this.useADSR||!1,requireReleaseTrigger:this.requireReleaseTrigger||!1},i=new Gibberish.Synth2(t).connect(this);this.children.push(i)}}}),this.amp=1/this.maxVoices,this.children=[],"object"==typeof arguments[0]&&(this.maxVoices=arguments[0].maxVoices?arguments[0].maxVoices:this.maxVoices,this.useADSR="undefined"!=typeof arguments[0].useADSR?arguments[0].useADSR:!1,this.requireReleaseTrigger="undefined"!=typeof arguments[0].requireReleaseTrigger?arguments[0].requireReleaseTrigger:!1),Gibberish.polyInit(this),this.initVoices(),this.processProperties(arguments),Gibberish._synth.oscillatorInit.call(this)},Gibberish.FMSynth=function(e){this.name="fmSynth",this.properties={frequency:0,cmRatio:2,index:5,attack:22050,decay:22050,sustain:22050,release:22050,attackLevel:1,sustainLevel:.5,releaseTrigger:0,glide:.15,amp:.25,channels:2,pan:0},this.note=function(e,n){if(0!==n){if("object"!=typeof this.frequency){if(t&&e===l)return void(this.releaseTrigger=1);this.frequency=l=e,this.releaseTrigger=0}else this.frequency[0]=l=e,this.releaseTrigger=0,Gibberish.dirty(this);"undefined"!=typeof n&&(this.amp=n),i.run()}else this.releaseTrigger=1},e=e||{};var t="undefined"==typeof e.useADSR?!1:e.useADSR,i=t?new Gibberish.ADSR:new Gibberish.AD,n=i.getState,s=i.callback,r=(new Gibberish.Sine).callback,a=(new Gibberish.Sine).callback,o=(new Gibberish.OnePole).callback,h=Gibberish.makePanner(),u=[0,0],c=this,l=0;i.requireReleaseTrigger=e.requireReleaseTrigger||!1,this.callback=function(e,i,l,b,p,f,d,g,m,y,G,v,k,x){var _,w,A;return G>=1&&(G=.9999),e=o(e,1-G,G),t?(_=s(b,p,f,d,g,m,y),y&&(c.releaseTrigger=0),n()<4?(A=a(e*i,e*l)*_,w=r(e+A,1)*_*v,1===k?w:h(w,x,u)):(w=u[0]=u[1]=0,1===k?w:u)):n()<2?(_=s(b,p),A=a(e*i,e*l)*_,w=r(e+A,1)*_*v,1===k?w:h(w,x,u)):(w=u[0]=u[1]=0,1===k?w:u)},this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.FMSynth.prototype=Gibberish._synth,Gibberish.PolyFM=function(){this.__proto__=new Gibberish.Bus2,Gibberish.extend(this,{name:"polyfm",maxVoices:5,voiceCount:0,children:[],frequencies:[],_frequency:0,polyProperties:{glide:0,attack:22050,decay:22050,index:5,cmRatio:2},note:function(e,t){var i=this.frequencies.indexOf(e),n=i>-1?i:this.voiceCount++,s=this.children[n];s.note(e,t),-1===i?(this.frequencies[n]=e,this._frequency=e,this.voiceCount>=this.maxVoices&&(this.voiceCount=0)):delete this.frequencies[n]},initVoices:function(){for(var e=0;e<this.maxVoices;e++){var t={attack:this.attack,decay:this.decay,cmRatio:this.cmRatio,index:this.index,channels:2,useADSR:this.useADSR||!1,requireReleaseTrigger:this.requireReleaseTrigger||!1,amp:1},i=new Gibberish.FMSynth(t);i.connect(this),this.children.push(i)}}}),this.amp=1/this.maxVoices,this.children=[],"object"==typeof arguments[0]&&(this.maxVoices=arguments[0].maxVoices?arguments[0].maxVoices:this.maxVoices,this.useADSR="undefined"!=typeof arguments[0].useADSR?arguments[0].useADSR:!1,this.requireReleaseTrigger="undefined"!=typeof arguments[0].requireReleaseTrigger?arguments[0].requireReleaseTrigger:!1),Gibberish.polyInit(this),this.initVoices(),this.processProperties(arguments),Gibberish._synth.oscillatorInit.call(this)},Gibberish.Sampler=function(){function e(e){Gibberish.context.decodeAudioData(e,function(e){r=e.getChannelData(0),o.length=t=o.end=a=r.length,o.isPlaying=!0,o.buffers[o.file]=r,Gibberish.audioFiles[o.file]=r,o.onload&&o.onload(),0!==o.playOnLoad&&o.note(o.playOnLoad),o.isLoaded=!0},function(e){console.log("Error decoding file",e)})}var t=1,i=Gibberish.interpolate,n=Gibberish.makePanner(),s=[0,0],r=null,a=1,o=this;if(Gibberish.extend(this,{name:"sampler",file:null,isLoaded:!1,playOnLoad:0,buffers:{},properties:{pitch:1,amp:1,isRecording:!1,isPlaying:!0,input:0,length:0,start:0,end:1,loops:0,pan:0},_onload:function(e){r=e.channels[0],a=e.length,o.end=a,o.length=t=a,o.isPlaying=!0,Gibberish.audioFiles[o.file]=r,o.buffers[o.file]=r,o.onload&&o.onload(),0!==o.playOnLoad&&o.note(o.playOnLoad),o.isLoaded=!0},switchBuffer:function(e){if("string"==typeof e)"undefined"!=typeof o.buffers[e]&&(r=o.buffers[e],a=o.end=o.length=r.length);else if("number"==typeof e){var t=Object.keys(o.buffers);if(0===t.length)return;r=o.buffers[t[e]],a=o.end=o.length=r.length}},floatTo16BitPCM:function(e,t,i){for(var n=0;n<i.length-1;n++,t+=2){var s=Math.max(-1,Math.min(1,i[n]));e.setInt16(t,0>s?32768*s:32767*s,!0)}},encodeWAV:function(){function e(e,t,i){for(var n=0;n<i.length;n++)e.setUint8(t+n,i.charCodeAt(n))}var t=this.getBuffer(),i=new ArrayBuffer(44+2*t.length),n=new DataView(i),s=Gibberish.context.sampleRate;return e(n,0,"RIFF"),n.setUint32(4,32+2*t.length,!0),e(n,8,"WAVE"),e(n,12,"fmt "),n.setUint32(16,16,!0),n.setUint16(20,1,!0),n.setUint16(22,1,!0),n.setUint32(24,s,!0),n.setUint32(28,4*s,!0),n.setUint16(32,2,!0),n.setUint16(34,16,!0),e(n,36,"data"),n.setUint32(40,2*t.length,!0),this.floatTo16BitPCM(n,44,t),n},download:function(){var e=this.encodeWAV(),t=new Blob([e]),i=window.webkitURL.createObjectURL(t),n=window.document.createElement("a");n.href=i,n.download="output.wav";var s=document.createEvent("Event");s.initEvent("click",!0,!0),n.dispatchEvent(s)},note:function(e,i){switch(typeof e){case"number":this.pitch=e;break;case"function":this.pitch=e();break;case"object":Array.isArray(e)&&(this.pitch=e[0])}if("number"==typeof i&&(this.amp=i),null!==this.function){this.isPlaying=!0;var n;switch(typeof this.pitch){case"number":n=this.pitch;break;case"function":n=this.pitch();break;case"object":n=Array.isArray(this.pitch)?this.pitch[0]:this.pitch,"function"==typeof n&&(n=n())}t=n>0||"object"==typeof n?this.start:this.end}},getBuffer:function(){return r},setBuffer:function(e){r=e},getPhase:function(){return t},setPhase:function(e){t=e},getNumberOfBuffers:function(){return Object.keys(o.buffers).length-1},callback:function(e,a,o,h,u,c,l,b,p,f){var d=0;return t+=e,b>t&&t>0?(e>0?d=null!==r&&h?i(r,t):0:t>l?d=null!==r&&h?i(r,t):0:t=p?b:t,n(d*a,f,s)):(t=p&&e>0?l:t,t=p&&0>e?b:t,s[0]=s[1]=d,s)}}).init().oscillatorInit().processProperties(arguments),"undefined"!=typeof arguments[0]&&("string"==typeof arguments[0]?(this.file=arguments[0],this.pitch=0):"object"==typeof arguments[0]&&arguments[0].file&&(this.file=arguments[0].file)),"undefined"!=typeof Gibberish.audioFiles[this.file])r=Gibberish.audioFiles[this.file],this.end=this.bufferLength=r.length,this.buffers[this.file]=r,t=this.bufferLength,Gibberish.dirty(this),this.onload&&this.onload();else if(null!==this.file){var e,h=new XMLHttpRequest;h.open("GET",this.file,!0),h.responseType="arraybuffer",h.onload=function(){e(this.response)},h.send()}else"undefined"!=typeof this.buffer&&(this.isLoaded=!0,r=this.buffer,this.end=this.bufferLength=r.length||88200,t=this.bufferLength,arguments[0]&&arguments[0].loops&&(this.loops=1),Gibberish.dirty(this),this.onload&&this.onload())},Gibberish.Sampler.prototype=Gibberish._oscillator,Gibberish.Sampler.prototype.record=function(e,t){this.isRecording=!0;var i=this;return this.recorder=new Gibberish.Record(e,t,function(){i.setBuffer(this.getBuffer()),i.end=bufferLength=i.getBuffer().length,i.setPhase(i.end),i.isRecording=!1}).record(),this},Gibberish.MonoSynth=function(){Gibberish.extend(this,{name:"monosynth",properties:{attack:1e4,decay:1e4,cutoff:.2,resonance:2.5,amp1:1,amp2:1,amp3:1,filterMult:.3,isLowPass:!0,pulsewidth:.5,amp:.6,detune2:.01,detune3:-.01,octave2:1,octave3:-1,glide:0,pan:0,frequency:0,channels:2},waveform:"Saw3",note:function(e,n){"undefined"!=typeof n&&0!==n&&(this.amp=n),0!==n&&("object"!=typeof this.frequency?this.frequency=e:(this.frequency[0]=e,Gibberish.dirty(this)),i()>0&&t.run())},_note:function(e,i){if("object"!=typeof this.frequency){if(useADSR&&e===lastFrequency&&0===i)return void(this.releaseTrigger=1);0!==i&&(this.frequency=lastFrequency=e),this.releaseTrigger=0}else 0!==i&&(this.frequency[0]=lastFrequency=e),this.releaseTrigger=0,Gibberish.dirty(this);"undefined"!=typeof i&&0!==i&&(this.amp=i),0!==i&&t.run()}});var e=this.waveform;Object.defineProperty(this,"waveform",{get:function(){return e},set:function(t){e!==t&&(e=t,r=(new Gibberish[t]).callback,a=(new Gibberish[t]).callback,o=(new Gibberish[t]).callback)}});var t=new Gibberish.AD(this.attack,this.decay),i=t.getState,n=t.callback,s=(new Gibberish.Filter24).callback,r=new Gibberish[this.waveform](this.frequency,this.amp1).callback,a=new Gibberish[this.waveform](this.frequency2,this.amp2).callback,o=new Gibberish[this.waveform](this.frequency3,this.amp3).callback,h=(new Gibberish.OnePole).callback,u=Gibberish.makePanner(),c=[0,0];this.callback=function(e,t,l,b,p,f,d,g,m,y,G,v,k,x,_,w,A,S,P){if(i()<2){w>=1&&(w=.9999),S=h(S,1-w,w);var R=S;if(x>0)for(var q=0;x>q;q++)R*=2;else if(0>x)for(var q=0;q>x;q--)R/=2;var M=S;if(_>0)for(var q=0;_>q;q++)M*=2;else if(0>_)for(var q=0;q>_;q--)M/=2;R+=v>0?(2*S-S)*v:(S-S/2)*v,M+=k>0?(2*S-S)*k:(S-S/2)*k;var C=r(S,p,y)+a(R,f,y)+o(M,d,y),I=n(e,t),T=s(C,l+g*I,b,m,1)*I;return T*=G,c[0]=c[1]=T,1===P?c:u(T,A,c)}return c[0]=c[1]=0,c},this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.MonoSynth.prototype=Gibberish._synth,Gibberish.Binops={"export":function(e){Gibberish.export("Binops",e||window)},operator:function(){var e=new Gibberish.ugen,t=arguments[0],i=Array.prototype.slice.call(arguments,1);e.name="op",e.properties={};for(var n=0;n<i.length;n++)e.properties[n]=i[n];return e.init.apply(e,i),e.codegen=function(){var e,i="( ";e=Object.keys(this.properties);for(var n=0;n<e.length;n++){var s="object"==typeof this[n];i+=s?this[n].codegen():this[n],n<e.length-1&&(i+=" "+t+" ")}return i+=" )",this.codeblock=i,i},e.valueOf=function(){return e.codegen()},e},Add:function(){var e=Array.prototype.slice.call(arguments,0);return e.unshift("+"),Gibberish.Binops.operator.apply(null,e)},Sub:function(){var e=Array.prototype.slice.call(arguments,0);return e.unshift("-"),Gibberish.Binops.operator.apply(null,e)},Mul:function(){var e=Array.prototype.slice.call(arguments,0);return e.unshift("*"),Gibberish.Binops.operator.apply(null,e)},Div:function(){var e=Array.prototype.slice.call(arguments,0);return e.unshift("/"),Gibberish.Binops.operator.apply(null,e)},Mod:function(){var e=Array.prototype.slice.call(arguments,0);return e.unshift("%"),Gibberish.Binops.operator.apply(null,e)},Abs:function(){var e=Array.prototype.slice.call(arguments,0),t={name:"abs",properties:{},callback:Math.abs.bind(t)};return t.__proto__=new Gibberish.ugen,t.properties[0]=e[0],t.init(),t},Sqrt:function(){var e=(Array.prototype.slice.call(arguments,0),{name:"sqrt",properties:{},callback:Math.sqrt.bind(e)});return e.__proto__=new Gibberish.ugen,e.properties[i]=arguments[0],e.init(),e},Pow:function(){var e=Array.prototype.slice.call(arguments,0),t={name:"pow",properties:{},callback:Math.pow.bind(t)};t.__proto__=new Gibberish.ugen;for(var i=0;i<e.length;i++)t.properties[i]=e[i];return t.init(),console.log(t.callback),t},Clamp:function(){var e=Array.prototype.slice.call(arguments,0),t={name:"clamp",properties:{input:0,min:0,max:1},callback:function(e,t,i){return t>e?e=t:e>i&&(e=i),e}};return t.__proto__=new Gibberish.ugen,t.init(),t.processProperties(e),t},Merge:function(){var e=Array.prototype.slice.call(arguments,0),t={name:"merge",properties:{},callback:function(e){return e[0]+e[1]}};t.__proto__=new Gibberish.ugen;for(var i=0;i<e.length;i++)t.properties[i]=e[i];return t.init(),t},Map:function(e,t,i,n,s,r,a){var o=Math.pow,h=0,u=0,c={name:"map",properties:{input:e,outputMin:t,outputMax:i,inputMin:n,inputMax:s,curve:r||h,wrap:a||!1},callback:function(e,t,i,n,s,r,a){var h,c=i-t,l=s-n,b=(e-n)/l;return b>1?b=a?b%1:1:0>b&&(b=a?1+b%1:0),h=0===r?t+b*c:t+o(b,1.5)*c,u=h,h},getValue:function(){return u},invert:function(){var e=c.outputMin;c.outputMin=c.outputMax,c.outputMax=e}};return c.__proto__=new Gibberish.ugen,c.init(),c}},Gibberish.Time={bpm:120,"export":function(e){Gibberish.export("Time",e||window)},ms:function(e){return e*Gibberish.context.sampleRate/1e3},seconds:function(e){return e*Gibberish.context.sampleRate},beats:function(e){return function(){var t=Gibberish.context.sampleRate/(Gibberish.Time.bpm/60);return t*e}}},Gibberish.Sequencer2=function(){var e=this,t=0;Gibberish.extend(this,{target:null,key:null,values:null,valuesIndex:0,durations:null,durationsIndex:0,nextTime:0,playOnce:!1,repeatCount:0,repeatTarget:null,isConnected:!0,keysAndValues:null,counts:{},properties:{rate:1,isRunning:!1,nextTime:0},offset:0,name:"seq",callback:function(i,n,s){if(n){if(t>=s){if(null!==e.values){if(e.target){var r=e.values[e.valuesIndex++];"function"==typeof r&&(r=r()),"function"==typeof e.target[e.key]?e.target[e.key](r):e.target[e.key]=r}else"function"==typeof e.values[e.valuesIndex]&&e.values[e.valuesIndex++]();e.valuesIndex>=e.values.length&&(e.valuesIndex=0)}else if(null!==e.keysAndValues)for(var a in e.keysAndValues){var o=e.counts[a]++,r=e.keysAndValues[a][o];"function"==typeof r&&(r=r()),"function"==typeof e.target[a]?e.target[a](r):e.target[a]=r,e.counts[a]>=e.keysAndValues[a].length&&(e.counts[a]=0),e.chose&&e.chose(a,o)}else"function"==typeof e.target[e.key]&&e.target[e.key]();if(t-=s,Array.isArray(e.durations)){var h=e.durations[e.durationsIndex++];e.nextTime="function"==typeof h?h():h,e.chose&&e.chose("durations",e.durationsIndex-1),e.durationsIndex>=e.durations.length&&(e.durationsIndex=0)}else{var h=e.durations;e.nextTime="function"==typeof h?h():h}return e.repeatTarget&&(e.repeatCount++,e.repeatCount===e.repeatTarget&&(e.isRunning=!1,e.repeatCount=0)),0}t+=i}return 0},start:function(e){return e||(t=0),this.isRunning=!0,this},stop:function(){return this.isRunning=!1,this},repeat:function(e){return this.repeatTarget=e,this},shuffle:function(){for(i in this.keysAndValues)this.shuffleArray(this.keysAndValues[i])},shuffleArray:function(e){for(var t,i,n=e.length;n;t=parseInt(Math.random()*n),i=e[--n],e[n]=e[t],e[t]=i);}}),this.init(arguments),this.processProperties(arguments);for(var i in this.keysAndValues)this.counts[i]=0;this.oscillatorInit(),t+=this.offset,this.connect()},Gibberish.Sequencer2.prototype=Gibberish._oscillator,Gibberish.Sequencer=function(){Gibberish.extend(this,{target:null,key:null,values:null,valuesIndex:0,durations:null,durationsIndex:0,nextTime:0,phase:0,isRunning:!1,playOnce:!1,repeatCount:0,repeatTarget:null,isConnected:!0,keysAndValues:null,counts:{},offset:0,name:"seq",tick:function(){if(this.isRunning){if(this.phase>=this.nextTime){if(null!==this.values){if(this.target){var e=this.values[this.valuesIndex++];if("function"==typeof e)try{e=e()}catch(t){console.error("ERROR: Can't execute function triggered by Sequencer:\n"+e.toString()),this.values.splice(this.valuesIndex-1,1),this.valuesIndex--}"function"==typeof this.target[this.key]?this.target[this.key](e):this.target[this.key]=e}else if("function"==typeof this.values[this.valuesIndex])try{this.values[this.valuesIndex++]()}catch(t){console.error("ERROR: Can't execute function triggered by Sequencer:\n"+this.values[this.valuesIndex-1].toString()),this.values.splice(this.valuesIndex-1,1),this.valuesIndex--}this.valuesIndex>=this.values.length&&(this.valuesIndex=0)}else if(null!==this.keysAndValues)for(var i in this.keysAndValues){var n="function"==typeof this.keysAndValues[i].pick?this.keysAndValues[i].pick():this.counts[i]++,e=this.keysAndValues[i][n];if("function"==typeof e)try{e=e()}catch(t){console.error("ERROR: Can't execute function triggered by Sequencer:\n"+e.toString()),this.keysAndValues[i].splice(n,1),"function"!=typeof this.keysAndValues[i].pick&&this.counts[i]--}"function"==typeof this.target[i]?this.target[i](e):this.target[i]=e,this.counts[i]>=this.keysAndValues[i].length&&(this.counts[i]=0)}else"function"==typeof this.target[this.key]&&this.target[this.key]();
if(this.phase-=this.nextTime,Array.isArray(this.durations)){var s="function"==typeof this.durations.pick?this.durations[this.durations.pick()]:this.durations[this.durationsIndex++];this.nextTime="function"==typeof s?s():s,this.durationsIndex>=this.durations.length&&(this.durationsIndex=0)}else{var s=this.durations;this.nextTime="function"==typeof s?s():s}return void(this.repeatTarget&&(this.repeatCount++,this.repeatCount===this.repeatTarget&&(this.isRunning=!1,this.repeatCount=0)))}this.phase++}},start:function(e){return e||(this.phase=this.offset),this.isRunning=!0,this},stop:function(){return this.isRunning=!1,this},repeat:function(e){return this.repeatTarget=e,this},shuffle:function(){for(e in this.keysAndValues)this.shuffleArray(this.keysAndValues[e])},shuffleArray:function(e){for(var t,i,n=e.length;n;t=parseInt(Math.random()*n),i=e[--n],e[n]=e[t],e[t]=i);},disconnect:function(){var e=Gibberish.sequencers.indexOf(this);Gibberish.sequencers.splice(e,1),this.isConnected=!1},connect:function(){return-1===Gibberish.sequencers.indexOf(this)&&Gibberish.sequencers.push(this),this.isConnected=!0,this}});for(var e in arguments[0])this[e]=arguments[0][e];for(var e in this.keysAndValues)this.counts[e]=0;this.connect(),this.phase+=this.offset},Gibberish.Sequencer.prototype=Gibberish._oscillator,Gibberish.PolySeq=function(){var e=this,t=0,i=function(e,t){return t>e?-1:e>t?1:0};Gibberish.extend(this,{seqs:[],timeline:{},playOnce:!1,repeatCount:0,repeatTarget:null,isConnected:!1,properties:{rate:1,isRunning:!1,nextTime:0},offset:0,autofire:[],name:"polyseq",getPhase:function(){return t},timeModifier:null,add:function(i){i.valuesIndex=i.durationsIndex=0,e.seqs.push(i),null===i.durations&&e.autofire.push(i),"undefined"!=typeof e.timeline[t]?i.priority?e.timeline[t].unshift(i):e.timeline[t].push(i):e.timeline[t]=[i],!e.scale||"frequency"!==i.key&&"note"!==i.key||e.applyScale&&e.applyScale(),e.nextTime=t,i.shouldStop=!1},callback:function(n,s,r){var a;if(s){if(t>=r){var o=e.timeline[r],h=t-r;if("undefined"==typeof o)return;e.autofire.length&&(o=o.concat(e.autofire));for(var u=0;u<o.length;u++){var c=o[u];if(!c.shouldStop){var l=c.values.pick?c.values.pick():c.valuesIndex++%c.values.length,b=c.values[l];if("function"==typeof b&&(b=b()),c.target&&("function"==typeof c.target[c.key]?c.target[c.key](b):c.target[c.key]=b),e.chose&&e.chose(c.key,l),null!==c.durations){if(Array.isArray(c.durations)){var l=c.durations.pick?c.durations.pick():c.durationsIndex++,p=c.durations[l];a="function"==typeof p?p():p,c.durationsIndex>=c.durations.length&&(c.durationsIndex=0),e.chose&&e.chose("durations",l)}else{var p=c.durations;a="function"==typeof p?p():p}var f;f=null!==e.timeModifier?e.timeModifier(a)+t:a+t,f-=h,a-=h,"undefined"==typeof e.timeline[f]?e.timeline[f]=[c]:c.priority?e.timeline[f].unshift(c):e.timeline[f].push(c)}}}delete e.timeline[r];var d=Object.keys(e.timeline),g=d.length;if(g>1){for(var m=0;g>m;m++)d[m]=parseFloat(d[m]);d=d.sort(i),e.nextTime=d[0]}else e.nextTime=parseFloat(d[0])}t+=n}return 0},start:function(e,i){if(e&&this.offset){t=0,this.nextTime=this.offset;var n=""+this.offset;this.timeline={},this.timeline[n]=[];for(var s=0;s<this.seqs.length;s++){var r=this.seqs[s];r.valuesIndex=r.durationsIndex=r.shouldStop=0,this.timeline[n].push(r)}}else{t=0,this.nextTime=0,this.timeline={0:[]};for(var s=0;s<this.seqs.length;s++){var r=this.seqs[s];r.valuesIndex=r.durationsIndex=r.shouldStop=0,this.timeline[0].push(r)}}return this.isConnected||(this.connect(Gibberish.Master,i),this.isConnected=!0),this.isRunning=!0,this},stop:function(){return this.isRunning=!1,this.isConnected&&(this.disconnect(),this.isConnected=!1),this},repeat:function(e){return this.repeatTarget=e,this},shuffle:function(e){if("undefined"!=typeof e)for(var t=0;t<this.seqs.length;t++)this.seqs[t].key===e&&this.shuffleArray(this.seqs[t].values);else for(var t=0;t<this.seqs.length;t++)this.shuffleArray(this.seqs[t].values)},shuffleArray:function(e){for(var t,i,n=e.length;n;t=parseInt(Math.random()*n),i=e[--n],e[n]=e[t],e[t]=i);}}),this.init(arguments),this.processProperties(arguments),this.oscillatorInit()},Gibberish.PolySeq.prototype=Gibberish._oscillator;var _hasInput=!1;return Gibberish.Input=function(){var e=[];_hasInput||createInput(),this.type=this.name="input",this.fx=new Array2,this.fx.parent=this,this.properties={input:"input",amp:.5,channels:1},this.callback=function(t,i,n){return 1===n?e=t*i:(e[0]=t[0]*i,e[1]=t[1]*i),e},this.init(arguments),this.processProperties(arguments)},Gibberish.Input.prototype=new Gibberish.ugen,Gibberish.Kick=function(){var e=!1,t=(new Gibberish.SVF).callback,i=(new Gibberish.SVF).callback,n=.2,s=.8;Gibberish.extend(this,{name:"kick",properties:{pitch:50,__decay:20,__tone:1e3,amp:2,sr:Gibberish.context.sampleRate},callback:function(n,s,r,a,o){var h=e?60:0;return h=t(h,n,s,2,o),h=i(h,r,.5,0,o),h*=a,e=!1,h},note:function(t,i,n,s){"number"==typeof t&&(this.pitch=t),"number"==typeof i&&(this.decay=i),"number"==typeof n&&(this.tone=n),"number"==typeof s&&(this.amp=s),e=!0}}).init().oscillatorInit(),Object.defineProperties(this,{decay:{get:function(){return n},set:function(e){n=e>1?1:e,this.__decay=100*n}},tone:{get:function(){return s},set:function(e){s=e>1?1:e,this.__tone=220+1400*e}}}),this.processProperties(arguments)},Gibberish.Kick.prototype=Gibberish._oscillator,Gibberish.Conga=function(){var e=!1,t=(new Gibberish.SVF).callback;Gibberish.extend(this,{name:"conga",properties:{pitch:190,amp:2,sr:Gibberish.context.sampleRate},callback:function(i,n,s){var r=e?60:0;return r=t(r,i,50,2,s),r*=n,e=!1,r},note:function(t,i){"number"==typeof t&&(this.pitch=t),"number"==typeof i&&(this.amp=i),e=!0}}).init().oscillatorInit(),this.processProperties(arguments)},Gibberish.Conga.prototype=Gibberish._oscillator,Gibberish.Clave=function(){var e=!1,t=new Gibberish.SVF,i=t.callback;Gibberish.extend(this,{name:"clave",properties:{pitch:2500,amp:1,sr:Gibberish.context.sampleRate},callback:function(t,n,s){var r=e?2:0;return r=i(r,t,5,2,s),r*=n,e=!1,r},note:function(t,i){"number"==typeof t&&(this.pitch=t),"number"==typeof i&&(this.amp=i),e=!0}}).init().oscillatorInit(),this.bpf=t,this.processProperties(arguments)},Gibberish.Clave.prototype=Gibberish._oscillator,Gibberish.Tom=function(){var e=!1,t=(new Gibberish.SVF).callback,i=(new Gibberish.SVF).callback,n=new Gibberish.ExponentialDecay,s=n.callback,r=Math.random;Gibberish.extend(this,{name:"tom",properties:{pitch:80,amp:.5,sr:Gibberish.context.sampleRate},callback:function(n,a,o){var h,u=e?60:0;return u=t(u,n,30,2,o),h=16*r()-8,h=h>0?h:0,h*=s(.05,11025),h=i(h,120,.5,0,o),u+=h,u*=a,e=!1,u},note:function(t,i){"number"==typeof t&&(this.pitch=t),"number"==typeof i&&(this.amp=i),n.trigger(),e=!0}}).init().oscillatorInit(),n.trigger(1),this.processProperties(arguments)},Gibberish.Tom.prototype=Gibberish._oscillator,Gibberish.Cowbell=function(){var e=new Gibberish.Square,t=new Gibberish.Square,i=e.callback,n=t.callback,s=new Gibberish.SVF({mode:2}),r=s.callback,a=new Gibberish.ExponentialDecay(.0025,10500),o=a.callback;Gibberish.extend(this,{name:"cowbell",properties:{amp:1,pitch:560,bpfFreq:1e3,bpfRez:3,decay:22050,decayCoeff:1e-4,sr:Gibberish.context.sampleRate},callback:function(e,t,s,a,h,u,c){var l;return l=i(t,1,1,0),l+=n(845,1,1,0),l=r(l,s,a,2,c),l*=o(u,h),l*=e},note:function(e){a.trigger(),e&&(this.decay=e)}}).init().oscillatorInit().processProperties(arguments),this.bpf=s,this.eg=a,a.trigger(1)},Gibberish.Cowbell.prototype=Gibberish._oscillator,Gibberish.Snare=function(){var e=(new Gibberish.SVF).callback,t=(new Gibberish.SVF).callback,i=(new Gibberish.SVF).callback,n=new Gibberish.ExponentialDecay(.0025,11025),s=n.callback,r=Math.random,a=0;Gibberish.extend(this,{name:"snare",properties:{cutoff:1e3,decay:11025,tune:0,snappy:.5,amp:1,sr:Gibberish.context.sampleRate},callback:function(n,o,h,u,c,l){var b,p,f=0,d=0;return f=s(.0025,o),f>.005&&(d=(2*r()-1)*f,d=i(d,n+1e3*h,.5,1,l),d*=u,d=d>0?d:0,a=f,b=e(a,180*(h+1),15,2,l),p=t(a,330*(h+1),15,2,l),d+=b,d+=.8*p,d*=c),d},note:function(e,t,i,s){"number"==typeof e&&(this.tune=e),"number"==typeof s&&(this.cutoff=s),"number"==typeof i&&(this.snappy=i),"number"==typeof t&&(this.amp=t),n.trigger()}}).init().oscillatorInit().processProperties(arguments),n.trigger(1)},Gibberish.Snare.prototype=Gibberish._oscillator,Gibberish.Hat=function(){{var e=new Gibberish.Square,t=new Gibberish.Square,i=new Gibberish.Square,n=new Gibberish.Square,s=new Gibberish.Square,r=new Gibberish.Square,a=e.callback,o=t.callback,h=i.callback,u=n.callback,c=s.callback,l=r.callback,b=new Gibberish.SVF({mode:2}),p=b.callback,f=new Gibberish.Filter24,d=f.callback,g=new Gibberish.ExponentialDecay(.0025,10500),m=g.callback,y=new Gibberish.ExponentialDecay(.1,7500);y.callback}Gibberish.extend(this,{name:"hat",properties:{amp:1,pitch:325,bpfFreq:7e3,bpfRez:2,hpfFreq:.975,hpfRez:0,decay:3500,decay2:3e3,sr:Gibberish.context.sampleRate},callback:function(e,t,i,n,s,r,b,f,g){var y;return y=a(t,1,.5,0),y+=o(1.4471*t,.75,1,0),y+=h(1.617*t,1,1,0),y+=u(1.9265*t,1,1,0),y+=c(2.5028*t,1,1,0),y+=l(2.6637*t,.75,1,0),y=p(y,i,n,2,g),y*=m(.001,b),y=d(y,s,r,0,1),y*=e},note:function(e,t){g.trigger(),y.trigger(),e&&(this.decay=e),t&&(this.decay2=t)}}).init().oscillatorInit().processProperties(arguments),this.bpf=b,this.hpf=f,g.trigger(1),y.trigger(1)},Gibberish.Hat.prototype=Gibberish._oscillator,Gibberish});
},{}],2:[function(_dereq_,module,exports){
(function(){function t(t,e){return t=r[t],e=r[e],t.distance>e.distance?e.distance+12-t.distance:e.distance-t.distance}function e(t,e,i){for(;i>0;i--)t+=e;return t}function i(t,e){if("string"!=typeof t)return null;this.name=t,this.duration=e||4,this.accidental={value:0,sign:""};var i=t.match(/^([abcdefgh])(x|#|bb|b?)(-?\d*)/i);if(i&&t===i[0]&&0!==i[3].length)this.name=i[1].toLowerCase(),this.octave=parseFloat(i[3]),0!==i[2].length&&(this.accidental.sign=i[2].toLowerCase(),this.accidental.value=y[i[2]]);else{t=t.replace(/\u2032/g,"'").replace(/\u0375/g,",");var n=t.match(/^(,*)([abcdefgh])(x|#|bb|b?)([,\']*)$/i);if(!n||5!==n.length||t!==n[0])throw Error("Invalid note format");if(""===n[1]&&""===n[4])this.octave=n[2]===n[2].toLowerCase()?3:2;else if(""!==n[1]&&""===n[4]){if(n[2]===n[2].toLowerCase())throw Error("Invalid note format. Format must respect the Helmholtz notation.");this.octave=2-n[1].length}else{if(""!==n[1]||""===n[4])throw Error("Invalid note format");if(n[4].match(/^'+$/)){if(n[2]===n[2].toUpperCase())throw Error("Invalid note format. Format must respect the Helmholtz notation");this.octave=3+n[4].length}else{if(!n[4].match(/^,+$/))throw Error("Invalid characters after note name.");if(n[2]===n[2].toLowerCase())throw Error("Invalid note format. Format must respect the Helmholtz notation");this.octave=2-n[4].length}}this.name=n[2].toLowerCase(),0!==n[3].length&&(this.accidental.sign=n[3].toLowerCase(),this.accidental.value=y[n[3]])}}function n(t,e){if(!(t instanceof i))return null;e=e||"",this.name=t.name.toUpperCase()+t.accidental.sign+e,this.root=t,this.notes=[t],this.quality="major",this.type="major";var n,r,o,s,h,m=[],u=!1,c="quality",d=!1,p=!1,v=null;for(s=0,h=e.length;h>s;s++){for(n=e[s];" "===n||"("===n||")"===n;)n=e[++s];if(!n)break;if(r=n.charCodeAt(0),o=h>=s+3?e.substr(s,3):"","quality"===c)"M"===n||("maj"===o||916===r?(this.type="major",m.push("M7"),u=!0,(e[s+3]&&"7"===e[s+3]||916===r&&"7"===e[s+1])&&s++):"m"===n||"-"===n||"min"===o?this.quality=this.type="minor":111===r||176===r||"dim"===o?(this.quality="minor",this.type="diminished"):"+"===n||"aug"===o?(this.quality="major",this.type="augmented"):216===r||248===r?(this.quality="minor",this.type="diminished",m.push("m7"),u=!0):"sus"===o?(this.quality="sus",this.type=e[s+3]&&"2"===e[s+3]?"sus2":"sus4"):"5"===n?(this.quality="power",this.type="power"):s-=1),o in l&&(s+=2),c="";else if("#"===n)d=!0;else if("b"===n)p=!0;else if("5"===n)d?(v="A5","major"===this.quality&&(this.type="augmented")):p&&(v="d5","minor"===this.quality&&(this.type="diminished")),p=d=!1;else if("6"===n)m.push("M6"),p=d=!1;else if("7"===n)"diminished"===this.type?m.push("d7"):m.push("m7"),u=!0,p=d=!1;else if("9"===n)u||m.push("m7"),p?m.push("m9"):d?m.push("A9"):m.push("M9"),p=d=!1;else{if("1"!==n)throw Error("Unexpected character: '"+n+"' in chord name");n=e[++s],"1"===n?p?m.push("d11"):d?m.push("A11"):m.push("P11"):"3"===n&&(p?m.push("m13"):d?m.push("A13"):m.push("M13")),p=d=!1}}for(var y=0,g=f[this.type].length;g>y;y++)"5"===f[this.type][y][1]&&v?this.notes.push(a.interval(this.root,v)):this.notes.push(a.interval(this.root,f[this.type][y]));for(y=0,g=m.length;g>y;y++)this.notes.push(a.interval(this.root,m[y]))}var a={},r={c:{name:"c",distance:0,index:0},d:{name:"d",distance:2,index:1},e:{name:"e",distance:4,index:2},f:{name:"f",distance:5,index:3},g:{name:"g",distance:7,index:4},a:{name:"a",distance:9,index:5},b:{name:"b",distance:11,index:6},h:{name:"h",distance:11,index:6}},o=["c","d","e","f","g","a","b"],s={.25:"longa",.5:"breve",1:"whole",2:"half",4:"quarter",8:"eighth",16:"sixteenth",32:"thirty-second",64:"sixty-fourth",128:"hundred-twenty-eighth"},h=[{name:"unison",quality:"perfect",size:0},{name:"second",quality:"minor",size:1},{name:"third",quality:"minor",size:3},{name:"fourth",quality:"perfect",size:5},{name:"fifth",quality:"perfect",size:7},{name:"sixth",quality:"minor",size:8},{name:"seventh",quality:"minor",size:10},{name:"octave",quality:"perfect",size:12},{name:"ninth",quality:"minor",size:13},{name:"tenth",quality:"minor",size:15},{name:"eleventh",quality:"perfect",size:17},{name:"twelfth",quality:"perfect",size:19},{name:"thirteenth",quality:"minor",size:20},{name:"fourteenth",quality:"minor",size:22},{name:"fifteenth",quality:"perfect",size:24}],m={unison:0,second:1,third:2,fourth:3,fifth:4,sixth:5,seventh:6,octave:7,ninth:8,tenth:9,eleventh:10,twelfth:11,thirteenth:12,fourteenth:13,fifteenth:14},l={P:"perfect",M:"major",m:"minor",A:"augmented",d:"diminished",perf:"perfect",maj:"major",min:"minor",aug:"augmented",dim:"diminished"},u={perfect:"P",major:"M",minor:"m",augmented:"A",diminished:"d"},c={P:"P",M:"m",m:"M",A:"d",d:"A"},d={perfect:["diminished","perfect","augmented"],minor:["diminished","minor","major","augmented"]},f={major:["M3","P5"],minor:["m3","P5"],augmented:["M3","A5"],diminished:["m3","d5"],sus2:["M2","P5"],sus4:["P4","P5"],power:["P5"]},p={major:"M",minor:"m",augmented:"aug",diminished:"dim",power:"5"},v={"-2":"bb","-1":"b",0:"",1:"#",2:"x"},y={bb:-2,b:-1,"#":1,x:2};i.prototype={key:function(t){return t?7*(this.octave-1)+3+Math.ceil(r[this.name].distance/2):12*(this.octave-1)+4+r[this.name].distance+this.accidental.value},fq:function(t){return t=t||440,t*Math.pow(2,(this.key()-49)/12)},scale:function(t,e){return a.scale.list(this,t,e)},interval:function(t,e){return a.interval(this,t,e)},chord:function(t){return t=t||"major",t in p&&(t=p[t]),new n(this,t)},helmholtz:function(){var t,i=3>this.octave?this.name.toUpperCase():this.name.toLowerCase();return 2>=this.octave?(t=e("",",",2-this.octave),t+i+this.accidental.sign):(t=e("","'",this.octave-3),i+this.accidental.sign+t)},scientific:function(){return this.name.toUpperCase()+this.accidental.sign+("number"==typeof this.octave?this.octave:"")},enharmonics:function(){var t=[],e=this.key(),i=this.interval("m2","up"),n=this.interval("m2","down"),a=i.key()-i.accidental.value,r=n.key()-n.accidental.value,o=e-a;return 3>o&&o>-3&&(i.accidental={value:o,sign:v[o]},t.push(i)),o=e-r,3>o&&o>-3&&(n.accidental={value:o,sign:v[o]},t.push(n)),t},valueName:function(){return s[this.duration]},toString:function(t){return t="boolean"==typeof t?t:"number"==typeof this.octave?!1:!0,this.name.toLowerCase()+this.accidental.sign+(t?"":this.octave)}},n.prototype.dominant=function(t){return t=t||"",new n(this.root.interval("P5"),t)},n.prototype.subdominant=function(t){return t=t||"",new n(this.root.interval("P4"),t)},n.prototype.parallel=function(t){if(t=t||"","triad"!==this.chordType()||"diminished"===this.quality||"augmented"===this.quality)throw Error("Only major/minor triads have parallel chords");return"major"===this.quality?new n(this.root.interval("m3","down"),"m"):new n(this.root.interval("m3","up"))},n.prototype.chordType=function(){var t,e,i;if(2===this.notes.length)return"dyad";if(3===this.notes.length){e={unison:!1,third:!1,fifth:!1};for(var n=0,r=this.notes.length;r>n;n++)t=this.root.interval(this.notes[n]),i=h[parseFloat(a.interval.invert(t.simple)[1])-1],t.name in e?e[t.name]=!0:i.name in e&&(e[i.name]=!0);return e.unison&&e.third&&e.fifth?"triad":"trichord"}if(4===this.notes.length){e={unison:!1,third:!1,fifth:!1,seventh:!1};for(var n=0,r=this.notes.length;r>n;n++)t=this.root.interval(this.notes[n]),i=h[parseFloat(a.interval.invert(t.simple)[1])-1],t.name in e?e[t.name]=!0:i.name in e&&(e[i.name]=!0);if(e.unison&&e.third&&e.fifth&&e.seventh)return"tetrad"}return"unknown"},n.prototype.toString=function(){return this.name},a.note=function(t,e){return new i(t,e)},a.note.fromKey=function(t){var e=440*Math.pow(2,(t-49)/12);return a.frequency.note(e).note},a.chord=function(t){var e;if(e=t.match(/^([abcdefgh])(x|#|bb|b?)/i),e&&e[0])return new n(new i(e[0].toLowerCase()),t.substr(e[0].length));throw Error("Invalid Chord. Couldn't find note name")},a.frequency={note:function(t,e){e=e||440;var n,a,s,h,m,l,u;return n=Math.round(49+12*((Math.log(t)-Math.log(e))/Math.log(2))),u=e*Math.pow(2,(n-49)/12),l=1200*(Math.log(t/u)/Math.log(2)),a=Math.floor((n-4)/12),s=n-12*a-4,h=r[o[Math.round(s/2)]],m=h.name,s>h.distance?m+="#":h.distance>s&&(m+="b"),{note:new i(m+(a+1)),cents:l}}},a.interval=function(t,e,n){if("string"==typeof e){"down"===n&&(e=a.interval.invert(e));var r=l[e[0]],o=parseFloat(e.substr(1));if(!r||isNaN(o)||1>o)throw Error("Invalid string-interval format");return a.interval.from(t,{quality:r,interval:h[o-1].name},n)}if(e instanceof i&&t instanceof i)return a.interval.between(t,e);throw Error("Invalid parameters")},a.interval.from=function(e,n,a){n.direction=a||n.direction||"up";var s,l,u,c,f,p;if(f=m[n.interval],p=h[f],f>7&&(f-=7),f=r[e.name].index+f,f>o.length-1&&(f-=o.length),s=o[f],-1===d[p.quality].indexOf(n.quality)||-1===d[p.quality].indexOf(p.quality))throw Error("Invalid interval quality");return l=d[p.quality].indexOf(n.quality)-d[p.quality].indexOf(p.quality),u=p.size+l-t(e.name,s),e.octave&&(c=Math.floor((e.key()-e.accidental.value+t(e.name,s)-4)/12)+1+Math.floor(m[n.interval]/7)),u+=e.accidental.value,u>=11&&(u-=12),u>-3&&3>u&&(s+=v[u]),"down"===a&&c--,new i(s+(c||""))},a.interval.between=function(t,e){var i,n,a,o,s,m,l=t.key(),c=e.key();if(i=c-l,i>24||-25>i)throw Error("Too big interval. Highest interval is a augmented fifteenth (25 semitones)");return 0>i&&(o=t,t=e,e=o),a=r[e.name].index-r[t.name].index+7*(e.octave-t.octave),n=h[a],m=d[n.quality][Math.abs(i)-n.size+1],s=u[m]+(""+Number(a+1)),{name:n.name,quality:m,direction:i>0?"up":"down",simple:s}},a.interval.invert=function(t){if(2!==t.length&&3!==t.length)return!1;var e=c[t[0]],i=2===t.length?parseFloat(t[1]):parseFloat(t.substr(1));return i>8&&(i-=7),8!==i&&1!==i&&(i=9-i),e+(""+i)},a.scale={list:function(t,e,n){var r,o,s=[],h=[];if(!(t instanceof i))return!1;if("string"==typeof e&&(e=a.scale.scales[e],!e))return!1;for(s.push(t),n&&h.push(t.name+(t.accidental.sign||"")),r=0,o=e.length;o>r;r++)s.push(a.interval(t,e[r])),n&&h.push(s[r+1].name+(s[r+1].accidental.sign||""));return n?h:s},scales:{major:["M2","M3","P4","P5","M6","M7"],ionian:["M2","M3","P4","P5","M6","M7"],dorian:["M2","m3","P4","P5","M6","m7"],phrygian:["m2","m3","P4","P5","m6","m7"],lydian:["M2","M3","A4","P5","M6","M7"],mixolydian:["M2","M3","P4","P5","M6","m7"],minor:["M2","m3","P4","P5","m6","m7"],aeolian:["M2","m3","P4","P5","m6","m7"],locrian:["m2","m3","P4","d5","m6","m7"],majorpentatonic:["M2","M3","P5","M6"],minorpentatonic:["m3","P4","P5","m7"],chromatic:["m2","M2","m3","M3","P4","A4","P5","m6","M6","m7","M7"],harmonicchromatic:["m2","M2","m3","M3","P4","A4","P5","m6","M6","m7","M7"]}},module.exports=a})();
},{}],3:[function(_dereq_,module,exports){
!function() {
  "use strict"
  
  var fft,
      mappingProperties = { 
        value:{ min: 0, max: 255, output: LOGARITHMIC, wrap:false, timescale: 'graphics' } 
      },
      Gibberish = _dereq_( 'gibberish-dsp' ),
      Gibber,
      $ = _dereq_( '../dollar' ),
      curves = _dereq_('../mappings').outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC
  
  var Analysis = {
    FFT : function( fftSize, updateRate ) {
      if( typeof fft === 'undefined' ) {      
        fft = Gibberish.context.createAnalyser()
        Gibberish.node.connect( fft )
        fft.fftSize = fftSize || 32
        fft.updateRate = updateRate || 40
        
        fft.values = new Uint8Array( fft.frequencyBinCount )
        fft.children = []
                
        for( var i = 0; i < fft.frequencyBinCount; i++ ) {          
          !function() { 
            var num = i,
                child = {},
                _value = 0
  
            Object.defineProperties( child, {
              value: {
                configurable:true,
                get: function() { return _value },
                set: function(v) { _value = v }
              }
            })
            
            Gibber.createProxyProperties( child, $.extend( {}, mappingProperties) , false )
            fft[ num ] = child
            fft.children.push( child )
            
            child.type = 'mapping'
            child.index = num
            child.min = 0; child.max = 255; // needed to map directly to children
            
            child.valueOf = function() { return this.value() }
          }()
        }
        
        setInterval( function(){
          fft.getByteFrequencyData( fft.values );
          for( var i = 0; i < fft.values.length; i++ ) {
            fft[ i ].value = fft.values[ i ]
          }
        }, fft.updateRate );
      }else{
        if( fftSize ) fft.fftSize = fftSize
        if( updateRate ) fft.updateRate = updateRate
      }
      
      return fft
    },
    Follow : function( ugen, bufferSize ) {
      var follow = new Gibberish.Follow( ugen, bufferSize ),
          _mappingProperties = { value: { min: 0, max: 1, output: LOGARITHMIC, timescale: 'audio' } }

      Gibber.createProxyProperties( follow, _mappingProperties )

      return follow
    }
  }

  module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return Analysis }
  
}()
},{"../dollar":16,"../mappings":18,"gibberish-dsp":1}],4:[function(_dereq_,module,exports){
/**#Arp - Sequencer
The Arpeggiator takes a chord and plays the individual notes comprising it in succession, with different possible patterns.
It is basically an extended [Seq](javascript:Gibber.Environment.displayDocs('Seq'\)) object. The available patterns are:  
  
*	*up* : Play the notes in ascending order. After the top note, drop back to the bottom  
*	*down* : Play the notes in descending order. After the bottom note, jump to the top  
*	*updown* : Play the notes all the way up, and then play them all the way down. The top and bottom notes repeat when changing direction  
*	*updown2* : Play the notes all the way up, and then play them all the way down. The top and bottom notes DO NOT repeat when changing direction  
## Example Usage ##
`a = Sine();
b = Arp('c2m7', _32, 'updown2', 4).slave(s);
`
## Constructor
  **param** *notation* : String. The chord to be sequenced.  
  **param** *duration* : Integer. The duration for each note in the arpeggio.  
  **param** *pattern* : String. Default: "up". The ordering for the arpeggio.  
  **param** *mult* : Integer. How many octaves the arpeggio should span. The default is 1.
**/
!function() {
  
var theory = _dereq_('../../external/teoria.min'),
    $ = _dereq_( '../dollar' ),
    Seq    = _dereq_('../seq'),
    Gibber,
    Arp
    
Arp = function(notation, beats, pattern, mult, scale) {	
	var that = Seq()
  
  $.extend( that, {
  	name : "Arp",
  	notes : [],
  	pattern : pattern || "up",
  	notation : notation || "C4m7",
  	mult : mult || 1,
  	init : false,
  	speed : isNaN(beats) ? _4 : beats,
  	scale : scale || null,
    
    chord : function(_chord, shouldReset) {
  		var arr = [];
  		this.notation = _chord;
		
  		if(typeof this.scale === 'undefined' || this.scale === null && typeof _chord === 'string') {
        console.log( 'redoing notes...')
  			for(var i = 0; i < this.mult; i++) {
  				var tmp = [];
			
  				var _root = this.notation.slice(0,1);
  				var _octave, _quality;
  				if(isNaN(this.notation.charAt(1))) { 	// if true, then there is a sharp or flat...
  					_root += this.notation.charAt(1);	// ... so add it to the root name
  					_octave  = parseInt( this.notation.slice(2,3) );
  					_quality = this.notation.slice(3);
  				}else{
  					_octave  = parseInt( this.notation.slice(1,2) );
  					_quality = this.notation.slice(2);
  				}
  				_octave += i;

  				var _chord = theory.note(_root + _octave).chord(_quality);
  				for(var j = 0; j < _chord.notes.length; j++) {
  					var n = _chord.notes[j].fq();
  					tmp[j] = n;
  				}
  				arr = arr.concat(tmp);
  			}	

  		}else{
  			for(var i = 0; i < this.mult; i++) {
  				var tmp = [];
				
  				for(var j = 0; j < this.notation.length; j++) {
  					tmp[j] = this.notation[j] + (7 * i);
  				}
  				arr = arr.concat(tmp);
  			}	
  		}			
      this.notes = this.patterns[ this.pattern ]( arr )
      
      if( this.seqs[0] ) {
        this.seqs[0].values = this.notes
      }
  	},
	
	  set : function(_chord, _speed, _pattern, octaveMult, shouldReset) {
  		this.speed = _speed || this.speed;
  		this.pattern = _pattern || this.pattern;
  		this.mult = octaveMult || this.mult;
		
  		this.chord(_chord, shouldReset); // also sets sequence
  	},
		
	  patterns : {
    	up : function(array) {
    		return array;
    	},
    	down : function(array) {
    		return array.reverse();
    	},
    	updown : function(array) {
    		var _tmp = array.slice(0);
    		_tmp.reverse();
    		return array.concat(_tmp);
    	},
    	updown2 : function(array) { // do not repeat highest and lowest notes
    		var _tmp = array.slice(0);
    		_tmp.pop();
    		_tmp.reverse();
    		_tmp.pop();
    		return array.concat(_tmp);
    	}
    }
	});
	
  that.seq = that
  
  // I have no idea why I need this
  that.__shuffle = that.shuffle 
  that.shuffle = function() {
    that.__shuffle()
  }
  
  Gibber.createProxyMethods( that, [ 'shuffle','reset','chord' ] )
  
	that.chord( that.notation );	// this sets the initial sequence
  
  var target = null
  Object.defineProperty( that, 'target', {
    get: function() { return target },
    set: function(v) {
      target = v
      var _seq = {
        key: 'note',
        'target': target,
        values: that.notes,
        durations:Gibber.Clock.time( beats )
      }
      that.add( _seq )
      that.start()
    }
  })
  
  var speed = beats
  Object.defineProperty( that, 'speed', {
    get : function() { return speed },
    set : function( v ) {
      speed = v
      for( var i = 0; i < that.seqs.length; i++ ) {
        that.seqs[0].durations = Gibber.Clock.time( speed )
      }
    }
  })

	return that;
}

module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return Arp }

}()
},{"../../external/teoria.min":2,"../dollar":16,"../seq":19}],5:[function(_dereq_,module,exports){
!function() { 
  "use strict"
  
  var Input = {},
      Gibberish = _dereq_( 'gibberish-dsp' ),
      Gibber,
      curves = _dereq_('../mappings').outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC,
      mappingProperties = {
        amp: {
          min: 0, max: 1,
          hardMax:2,
          output: LOGARITHMIC,
          timescale: 'audio',
          dimensions:1
        },
        out: {
          min: 0, max: 1,
          output: LINEAR,
          timescale: 'audio',
          dimensions:1
        },
        //pan: { min: -1, max: 1, output: LINEAR, timescale: 'audio',},   
      },
      name = 'Input'

  Input = function() {
    var oscillator = new Gibberish.Input().connect( Gibber.Master ),
        args = Array.prototype.slice.call( arguments, 0 )
       
    oscillator.type = 'Gen'
    $.extend( true, oscillator, Gibber.ugen )
    
    oscillator.fx.ugen = oscillator
    
    Object.defineProperty(oscillator, '_', {
      get: function() { 
        oscillator.kill();
        return oscillator 
      },
      set: function() {}
    })    
    
    Gibber.createProxyProperties( oscillator, mappingProperties )
        
    Gibber.processArguments2( oscillator, args, name )

    oscillator.toString = function() { return '> ' + name }
    
    return oscillator
  }
  
  module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return Input }

}()
},{"../mappings":18,"gibberish-dsp":1}],6:[function(_dereq_,module,exports){
!function() {
  "use strict"
  
  var $ = _dereq_( '../dollar' ),//require('zepto-browserify').Zepto,
      Gibberish = _dereq_( 'gibberish-dsp' ),
      Gibber,
      curves = _dereq_('../mappings').outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC
      
  var types = [
    [ 'Bus2', 'Bus' ],
  ],
  mappingProperties = {
    amp: {
      min: 0, max: 1,
      output: LINEAR,
      timescale: 'audio',
    },
    pan: {
      min: -.75, max: .75,
      output: LINEAR,
      timescale: 'audio',
    },
    out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
  },
  init = false,
  Busses = {
    'mappingProperties': mappingProperties,
    Presets:{}
  }
  
  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      Busses[ name ] = function() {
        var obj = Gibber.processArguments( arguments, name )
        
        if( Array.isArray( obj ) ) {
          obj.unshift(0)
          obj = Gibber.construct( Gibberish[ type ], obj )
        }else{
          obj =  new Gibberish[ type ]( obj )
        }
        
        if(init) {
          obj.connect( Master )
        }else{
          init = true;
        }
        
        obj.type = 'Gen'
        
        Object.defineProperty(obj, '_', {
          get: function() { obj.kill(); return obj },
          set: function() {}
        })
      
        $.extend( true, obj, Gibber.ugen )
        
        obj.fx.ugen = obj
        
        Gibber.createProxyProperties( obj, mappingProperties )    
  
        return obj
      }
    })()
  }
  
  Busses[ 'Group' ] = function() {
    var obj = Gibber.processArguments( arguments, 'Bus2' ),
        inputs = []
    
    // if( Array.isArray( obj ) ) {
    //   if( obj.length > 0 ) {
    //     inputs = obj.slice( 0 )
    //     for( var i = 0; i < inputs.length; i++ ) {
    //       inputs[ i ].disconnect()
    //     }
    //   }
    // }else{
    //   if( obj ) {
    //     inputs = obj.inputs || [] 
    //   }else{
    //     inputs = []
    //   }
    // }
     
    obj =  new Gibberish[ 'Bus2' ]()

    if(init) {
      obj.connect( Master )
    }else{
      init = true;
    }
    
    obj.type = 'FX'
  
    $.extend( true, obj, Gibber.ugen )
    
    obj.fx.ugen = obj
    
    Gibber.createProxyProperties( obj, mappingProperties )    
    
    $.extend( obj, {
      add : function() {
        for( var i = 0; i < arguments.length; i++ ) {
          arguments[ i ].disconnect()
          arguments[ i ].connect( obj )
        }
      },
      remove : function() {
        for( var i = 0; i < arguments.length; i++ ) {
          arguments[ i ].disconnect( obj )
        }
      },
      free : function() {
        for( var i = 0; i < arguments.length; i++ ) {
          arguments[ i ].disconnect( obj )
          arguments[ i ].connect()
        }
      }
    })
    
    for( var i = 0; i < arguments.length; i++ ) {
      obj.add( arguments[ i ] )
    }
    
    return obj
  }
  
  module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return Busses }
  
}()
},{"../dollar":16,"../mappings":18,"gibberish-dsp":1}],7:[function(_dereq_,module,exports){
(function() {
  "use strict"
  
  var Percussion = { Presets:{} }, 
      Gibberish = _dereq_( 'gibberish-dsp' ),
      Gibber,
      $ = _dereq_( '../dollar' ),
      Clock = _dereq_('../clock'),
      curves = _dereq_('../mappings').outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC, 
      types = [
        'Kick',
        'Snare',
        'Hat',
        'Conga',
        'Cowbell',
        'Clave',
        'Tom',
      ],
      _mappingProperties = {
        Drums: {
          pitch: { min: .25, max: 4, output: LINEAR,     timescale: 'audio' },
          amp:   { min: 0,   max: 1, output: LOGARITHMIC,timescale: 'audio',},
          pan:   { min: 0,   max: 1, output: LINEAR,timescale: 'audio',},
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
        },
        XOX: {
          //pitch: { min: .25, max: 4, output: LINEAR, timescale: 'audio' },
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
          pan:   { min: 0,   max: 1, output: LINEAR,timescale: 'audio',},
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },      
        },
        Kick    : { 
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
        },
        Snare   : { 
          amp: { min: 0, max: 1, output: LOGARITHMIC, timescale: 'audio' },
          snappy: { min: .25, max: 1.5, output: LOGARITHMIC, timescale: 'audio' },
          tune: { min: 0, max: 2, output: LOGARITHMIC, timescale: 'audio' },
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },    
        },
        Hat     : { 
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
        },
        Conga   : { 
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
        },
        Cowbell : { 
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
        },
        Clave   : { 
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',}, },
        Tom     : { 
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',}, 
        },
      };

  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      Percussion[ name ] = function() {
        var args = Array.prototype.slice.call(arguments),
            obj
        
        if( typeof args[0] === 'object' && typeof args[0].maxVoices === 'undefined') { 
          args[0].maxVoices = 1
        }else if( typeof args[0] === 'undefined') {
          args[0] = { maxVoices:1 }
        }
        
        obj = Gibber.processArguments( args, name )
      
        if( Array.isArray( obj ) ) {
          obj = Gibber.construct( Gibberish[ type ], obj ).connect( Gibber.Master )
        }else{
          obj =  new Gibberish[ type ]( obj ).connect( Gibber.Master )
        }
      
        obj.type = 'Gen'
        
        $.extend( true, obj, Gibber.ugen )
        
        obj.fx.ugen = obj
        
        // override note method to allow note names
        obj._note = obj.note.bind(obj)
        obj.note = function() {
          var args = Array.prototype.splice.call( arguments, 0 )

          if( typeof args[0] === 'string' ) {
            args[0] = Gibber.Theory.Teoria.note( args[0] ).fq()
          }
          
          this._note.apply( this, args )
        }
        
        Gibber.createProxyProperties( obj, _mappingProperties[ name ] )
        Gibber.createProxyMethods( obj, [ 'note', 'send' ] )
        
        obj.toString = function() { return '> ' + name }
        
        Object.defineProperty(obj, '_', {
          get: function() { obj.kill(); return obj },
          set: function() {}
        })

        return obj
      }
    })()
  
  }
  
  Percussion[ 'Drums' ] = function(_sequence, _timeValue, _amp, _freq){    
    var args = Array.prototype.slice.call(arguments),
        obj = {}, 
        props = Gibber.processArguments( args, 'Drums' )
        
    $.extend( true, obj, props)
  
    if( Array.isArray( obj ) ) {
      obj = Gibber.construct( Gibberish.Bus2, obj ).connect( Gibber.Master )
    }else{
      obj =  new Gibberish.Bus2( obj ).connect( Gibber.Master )
    }
    
		obj.name = 'Drums'
    obj.type = 'Gen'
    obj.children = []
    
    $.extend( true, obj, Gibber.ugen )
    
    obj.fx.ugen = obj
  
    Object.defineProperty(obj, '_', { get: function() { obj.kill(); return obj }, set: function() {} })
		
  	obj.kit = Percussion.Drums.kits['default'];
    
  	if(typeof arguments[0] === "object") {
  		if(arguments[0].kit) {
  			obj.kit = Percussion.Drums.kits[arguments[0].kit];
  			arguments[0].kit = obj.kit;
  		}
  	}
    
	
  	for(var key in obj.kit) {
  		var drum = obj.kit[key];
  		obj[key] = { sampler: new Gibberish.Sampler({ file:drum.file, pitch:1, amp:drum.amp }), pitch:drum.pitch, amp:drum.amp }
  		obj[key].sampler.pan = drum.pan
  		obj[key].sampler.connect( obj )
  		obj[key].fx = obj[key].sampler.fx
  		obj.children.push( obj[key].sampler )
  	}
	
    obj.mod = obj.polyMod
    obj.removeMod = obj.removePolyMod
	
  	obj.connect();
    
    Gibber.createProxyProperties( obj, _mappingProperties[ 'Drums' ] )    
    
  	obj.pitch(1);
    
    if( typeof props !== 'undefined') {
      switch( $.type( props[0] ) ) {
        case 'string':
          var notes = props[0], _seqs = [], _durations = [], __durations = [], seqs = notes.split('|'), timeline = {}
          
          for( var i = 0; i < seqs.length; i++ ) {
            var seq = seqs[i], duration, hasTime = false, idx = seq.indexOf(',')

            if( idx > -1 ) {
              var _value = seq.substr( 0, idx ),
                  duration = seq.substr( idx + 1 )
              
              duration = eval(duration)
              hasTime = true
              seq = _value.trim().split('')
            }else{
              seq = seq.trim().split('')
              duration = 1 / seq.length  
            }
            
            if( seq.indexOf('.rnd(') > -1) {// || seq.indexOf('.random(') > -1 ) {
              seq = seq.split( '.rnd' )[0]
              seq = seq.split('').rnd()
            }
            
            if( typeof props[1] !== 'undefined') { duration = props[1] }
            
            obj.seq.add({
              key:'note',
              values:seq,
              durations:duration,
              target:obj
            })
          }

          break;
        case 'object':
      		if( typeof props[0].note === 'string' ) props[0].note = props[0].note.split("")
      		props[0].target = obj
          props[0].durations = props[0].durations ? Gibber.Clock.Time( props[0].durations ) : Gibber.Clock.Time( 1 / props[0].note.length )
          props[0].offset = props[0].offset ? Gibber.Clock.time( props[0].offset ) : 0
      	  //obj.seq = Seq( props[0] );
          
          break;

        case 'function': case 'array':
          var length = props[0].length || props[0].values.length,
              durations = typeof arguments[1] !== 'undefined' ? arguments[1] : Gibber.Clock.Time( 1 / length )
          
          if( typeof durations !== 'function' ) durations = Gibber.Clock.Time( durations )
              
          obj.seq.add({
            key:'note',
            values:[ props[0] ],
            durations: durations,
            target:obj
          })
          
          obj.pattern = obj.seq.seqs[ obj.seq.seqs.length - 1 ].values[ 0 ]
          
          break;
        default:
          break;
      }
    }

  	if( typeof props === "undefined" ) props = {};
	
  	if( props.pitch ) obj.pitch = props.pitch;
	
  	if( typeof props.snare !== "undefined" ) 	{ $.extend( obj.snare.sampler, props.snare ); $.extend( obj.snare, props.snare); }
  	if( typeof props.kick !== "undefined" ) 	{ $.extend( obj.kick.sampler, props.kick ); $.extend( obj.kick, props.kick); }
  	if( typeof props.hat !== "undefined" ) 	{ $.extend( obj.hat.sampler, props.hat ); $.extend( obj.hat, props.hat); }
  	if( typeof props.openHat !== "undefined" ) { $.extend( obj.openHat.sampler, props.openHat ); $.extend( obj.openHat, props.openHat); }
 	
  	obj.amp   = isNaN(_amp) ? 1 : _amp;
	
  	if( obj.seq && obj.seq.tick ) { Gibberish.future( obj.seq.tick, 1 ) }
    
    obj.note = function(nt) {
      var p = typeof obj.pitch === 'function' ? obj.pitch() : obj.pitch
      if( $.isArray( nt ) ) {
        for( var i = 0; i < nt.length; i++ ) {
          var note = nt[ i ]

          if( typeof note === 'string' ) {
        		for( var key in this.kit ) {
        			if( note === this.kit[ key ].symbol ) {
        				this[ key ].sampler.note( 1, this[key].amp );
                var p = this.pitch() 
                if( this[ key ].sampler.pitch !== p )
                  this[ key ].sampler.pitch = p
        				break;
        			}
        		}
          }else{
            var drum = obj[ Object.keys( obj.kit )[ note ] ]
            drum.sampler.note( 1, drum.sampler.amp )
            if( drum.sampler.pitch !== p )
              drum.sampler.pitch = p
          }
        }
      }else{
        if( typeof nt === 'string' ) {
      		for( var key in this.kit ) {
      			if( nt === this.kit[ key ].symbol ) {
      				this[ key ].sampler.note( 1, this[key].amp );
              var p = this.pitch() 
              if( this[ key ].sampler.pitch !== p )
                this[ key ].sampler.pitch = p
      				break;
      			}
      		}
        }else{
          var keys = Object.keys( obj.kit ),
              num = Math.abs( nt ),
              key = keys[ num % keys.length ], 
              drum = obj[ key ]
              
          drum.sampler.note( 1, drum.sampler.amp )
          
          if( drum.sampler.pitch !== p )
            drum.sampler.pitch = p
        }
      }
  	}
    
    obj.start = function() { obj.seq.start( true ) }
    obj.stop = function() { obj.seq.stop() }
    obj.shuffle = function() { obj.seq.shuffle() }
    obj.reset = function() { obj.seq.reset() }

    Gibber.createProxyMethods( obj, [ 'play','stop','shuffle','reset','start','send','note' ] )
            
    obj.seq.start( true )

    Object.defineProperties( obj, {
      offset: {
        get: function() { return obj.seq.offset },
        set: function(v) { obj.seq.offset = Gibber.Clock.time(v)}
      }
    })
        
    obj.toString = function() { return 'Drums : ' + obj.seq.seqs[0].values.join('') }
    
    return obj
  }
  
  Percussion[ 'EDrums' ] = function(_sequence, _timeValue, _amp, _freq){    
    var args = Array.prototype.slice.call(arguments),
        obj = {}, 
        props = Gibber.processArguments( args, 'Drums' )
        
    $.extend( true, obj, props)
  
    if( Array.isArray( obj ) ) {
      obj = Gibber.construct( Gibberish.Bus2, obj ).connect( Gibber.Master )
    }else{
      obj =  new Gibberish.Bus2( obj ).connect( Gibber.Master )
    }
    
    obj.name = 'XOX'
    obj.type = 'Gen'
    obj.children = []
    
    $.extend( true, obj, Gibber.ugen )
    
    obj.fx.ugen = obj
  
    Object.defineProperty(obj, '_', { get: function() { obj.kill(); return obj }, set: function() {} })
		
  	obj.pitch = 1;
  	/*obj.kit = Drums.kits['default'];
    
  	if(typeof arguments[0] === "object") {
  		if(arguments[0].kit) {
  			obj.kit = Drums.kits[arguments[0].kit];
  			arguments[0].kit = obj.kit;
  		}
  	}*/
	  
    // connect in note method
    obj.kick = Gibber.Percussion.Kick().disconnect()//new Gibberish.Kick()//.connect( obj )
    obj.snare = Gibber.Percussion.Snare().disconnect()//new Gibberish.Snare()//.connect( obj )
    obj.hat = Gibber.Percussion.Hat().disconnect()//new Gibberish.Hat()//.connect( obj )
    
    obj.kick.connect( obj )
    obj.snare.connect( obj )
    obj.hat.connect( obj )
    
    obj.children.push( obj.kick, obj.snare, obj.hat )
	
    obj.mod = obj.polyMod
    obj.removeMod = obj.removePolyMod

    obj.set = function( v ) { obj.seq.note = v.split('') }
    
    Gibber.createProxyProperties( obj, _mappingProperties[ 'XOX' ] )
    
    obj.start = function() { obj.seq.start( true ) }
    obj.stop = function() { obj.seq.stop() }
    obj.shuffle = function() { obj.seq.shuffle() }
    obj.reset = function() { obj.seq.reset() }

    Gibber.createProxyMethods( obj, [ 'play','stop','shuffle','reset','start','send' ] )

    if( typeof props !== 'undefined') {
      switch( $.type( props[0] ) ) {
        case 'string':
          var notes = props[0], _seqs = [], _durations = [], __durations = [], seqs = notes.split('|'), timeline = {}
          
          for( var i = 0; i < seqs.length; i++ ) {
            var seq = seqs[i], duration, hasTime = false, idx = seq.indexOf(',')

            if( idx > -1 ) {
              var _value = seq.substr( 0, idx ),
                  duration = seq.substr( idx + 1 )
              
              duration = eval(duration)
              hasTime = true
              seq = _value.trim().split('')
            }else{
              seq = seq.trim().split('')
              duration = 1 / seq.length  
            }
            
            if( seq.indexOf('.rnd(') > -1) {// || seq.indexOf('.random(') > -1 ) {
              seq = seq.split( '.rnd' )[0]
              seq = seq.split('').rnd()
            }else if( seq.indexOf('.random(') > -1 ) {
              seq = seq.split( '.random' )[0]
              seq = seq.split('').rnd()
            }
            
            if( typeof props[1] !== 'undefined') { duration = props[1] }
            
            obj.seq.add({
              key:'note',
              values:seq,
              durations:duration,
              target:obj
            })
          }  
          
          break;
        case 'object':
      		if( typeof props[0].note === 'string' ) props[0].note = props[0].note.split("")
      		props[0].target = obj
          props[0].durations = props[0].durations ? Gibber.Clock.Time( props[0].durations ) : Gibber.Clock.Time( 1 / props[0].note.length )
          props[0].offset = props[0].offset ? Gibber.Clock.time( props[0].offset ) : 0
      	  obj.seq = Seq( props[0] );
          
          break;
        default:
          break;
      }
    }

  	if( typeof props === "undefined" ) props = {};
	
  	if( props.pitch ) obj.pitch = props.pitch;
	
  	if( typeof props.snare !== "undefined" ) 	{ $.extend( obj.snare.sampler, props.snare ); $.extend( obj.snare, props.snare); }
  	if( typeof props.kick !== "undefined" ) 	{ $.extend( obj.kick.sampler, props.kick ); $.extend( obj.kick, props.kick); }
  	if( typeof props.hat !== "undefined" ) 	{ $.extend( obj.hat.sampler, props.hat ); $.extend( obj.hat, props.hat); }
  	if( typeof props.openHat !== "undefined" ) { $.extend( obj.openHat.sampler, props.openHat ); $.extend( obj.openHat, props.openHat); }
 	
  	obj.amp   = isNaN(_amp) ? 1 : _amp;
	
  	if( obj.seq.tick ) { Gibberish.future( obj.seq.tick,1 ) }

    var kcd = 1,
        scd = 1,
        hcd = 1,
        kf = null,
        sf = null,
        hf = null;
        
    obj.note = function(nt) {
      switch(nt) {
        case 'x': 
          if(kcd === 1) {
            //obj.kick.connect( obj ); 
            kcd = 0;
          }
          
          obj.kick.note();
          
          if( kf !== null ) {
            kf()
            kf = null
          }

          kf = Gibber.Utilities.future( function() {
              //obj.kick.disconnect()
              kcd = 1
              kf = null
          }, obj.kick.decay * 110000 ) 
          
          break;
          
        case 'o': 
          if(scd === 1) {
            //obj.snare.connect( obj ); 
            scd = 0;
          }
        
          obj.snare.note();
        
          if( sf !== null ) {
            sf()
            sf = null
          }

          sf = Gibber.Utilities.future( function() {
              //obj.snare.disconnect()
              scd = 1
              sf = null
          }, obj.snare.decay ) 
        
          break;
        case '*': 
          if(hcd === 1) {
            //obj.hat.connect( obj ); 
            hcd = 0;
          }
      
          obj.hat.note( 5000 );
      
          if( hf !== null ) {
            hf()
            hf = null
          }

          hf = Gibber.Utilities.future( function() {
              //obj.hat.disconnect()
              hcd = 1
              hf = null
          }, 5500 ) 
      
          break;

        case '-': 
          if(hcd === 1) {
            //obj.hat.connect( obj ); 
            hcd = 0;
          }
    
          obj.hat.note( 30000 );
    
          if( hf !== null ) {
            hf()
            hf = null
          }

          hf = Gibber.Utilities.future( function() {
              //obj.hat.disconnect()
              hcd = 1
              hf = null
          }, 30500 ) 
    
          break;
      }
  	}
    
    //Gibber.createProxyMethods( obj, [ 'play','stop','shuffle','reset' ] )

    // obj.kill = function() {
    //   var end = this.fx.length !== 0 ? this.fx[ this.fx.length - 1 ] : this
    //   end.disconnect()
    //        
    //   obj.seq.kill()
    // }
     
    obj.seq.start( true )
    
    obj.toString = function() { return 'EDrums : ' + obj.seq.seqs[0].values.join('') }
    
    return obj
  }
  
  Percussion.Drums.kits = {
  	original: {
  		kick:     { file:"resources/audiofiles/kick.wav",   symbol:'x', amp:1, pitch:1, pan:0 	},
  		snare:    { file:"resources/audiofiles/snare.wav", 	symbol:'o', amp:1, pitch:1, pan:.15 },
  		hat:      { file:"resources/audiofiles/hat.wav",    symbol:'*', amp:1, pitch:1, pan:-.1 },
  		openHat:  { file:"resources/audiofiles/openHat.wav",symbol:'-', amp:1, pitch:1, pan:-.2 },
  	},
  	electronic: {
  		kick:     { file:"resources/audiofiles/electronic/kick.wav",    symbol:'x', amp:1.5, pitch:1, pan:0 },
  		snare:    { file:"resources/audiofiles/electronic/snare.wav",   symbol:'o', amp:1.5, pitch:1, pan:.15 },
  		hat:      { file:"resources/audiofiles/electronic/hat.wav",     symbol:'*', amp:1.5, pitch:1, pan:-.1 },
  		openHat:  { file:"resources/audiofiles/electronic/openhat.wav", symbol:'-', amp:1.5, pitch:1, pan:-.2 },
  	},
  	beatbox: {
  	    in_tss: { file:'resources/audiofiles/beatbox/^tss.wav' , symbol:'T', amp:1, pitch:1, pan: 0.1 },
  	    f:      { file:'resources/audiofiles/beatbox/f.wav'    , symbol:'f', amp:1, pitch:1, pan:-0.1 },
  	    h:      { file:'resources/audiofiles/beatbox/h.wav'    , symbol:'h', amp:1, pitch:1, pan: 0.1 },
  	    s:      { file:'resources/audiofiles/beatbox/s.wav'    , symbol:'s', amp:1, pitch:1, pan:-0.1 },

  	    d:      { file:'resources/audiofiles/beatbox/d.wav'    , symbol:'d', amp:1, pitch:1, pan: 0.8 },
  	    t:      { file:'resources/audiofiles/beatbox/t.wav'    , symbol:'t', amp:1, pitch:1, pan: 0.4 },
  	    k:      { file:'resources/audiofiles/beatbox/k.wav'    , symbol:'k', amp:1, pitch:1, pan:-0.1 },
  	    in_k:   { file:'resources/audiofiles/beatbox/^k.wav'   , symbol:'K', amp:1, pitch:1, pan:-0.4 },
  	    eight:  { file:'resources/audiofiles/beatbox/8.wav'    , symbol:'8', amp:1, pitch:1, pan:-0.8 },

  	    psh:    { file:'resources/audiofiles/beatbox/psh.wav'  , symbol:'p', amp:1, pitch:1, pan: 0.1 },
  	    in_p:   { file:'resources/audiofiles/beatbox/^p.wav'   , symbol:'P', amp:1, pitch:1, pan:-0.1 },
  	    pf:     { file:'resources/audiofiles/beatbox/pf.wav'   , symbol:'F', amp:1, pitch:1, pan: 0.2 },
  	    phs:    { file:'resources/audiofiles/beatbox/phs.wav'  , symbol:'H', amp:1, pitch:1, pan:-0.2 },

  	    b:      { file:'resources/audiofiles/beatbox/b.wav'    , symbol:'b', amp:1, pitch:1, pan: 0.3 },
  	    dot:    { file:'resources/audiofiles/beatbox/dot.wav'  , symbol:'.', amp:1, pitch:1, pan: 0.0 },
  	    duf:    { file:'resources/audiofiles/beatbox/duf.wav'  , symbol:'D', amp:1, pitch:1, pan:-0.3 },

  	    o:      { file:'resources/audiofiles/beatbox/o.wav'    , symbol:'o', amp:1, pitch:1, pan: 0.6 },
  	    a:      { file:'resources/audiofiles/beatbox/a.wav'    , symbol:'a', amp:1, pitch:1, pan: 0.8 },
  	    u:      { file:'resources/audiofiles/beatbox/u.wav'    , symbol:'u', amp:1, pitch:1, pan:-0.8 },

  	    m:      { file:'resources/audiofiles/beatbox/m.wav'    , symbol:'m', amp:1, pitch:1, pan:-0.6 },
  	    n:      { file:'resources/audiofiles/beatbox/n.wav'    , symbol:'n', amp:1, pitch:1, pan: 0.0 },
  	},
  };
  Percussion.Drums.kits.default = Percussion.Drums.kits.electronic;
  
  
  module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return Percussion }
})()

},{"../clock":15,"../dollar":16,"../mappings":18,"gibberish-dsp":1}],8:[function(_dereq_,module,exports){
!function() {
  "use strict"
  
  var Envelopes = {},
      Gibberish = _dereq_( 'gibberish-dsp' ),
      Gibber,
      $ = _dereq_( '../dollar' ),
      Clock = _dereq_('../clock'),
      curves = _dereq_('../mappings').outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC,
      types = [
        'Line',    
      ],
      _mappingProperties = {
        Line: {
          start: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
          end: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
          time: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          }
        },
      };
  
  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      Envelopes[ name ] = function() {
        var args = Array.prototype.slice.call(arguments, 0),
            obj
            
        obj = new Gibberish[ type ]( args[0], args[1], Clock.time( args[2] ), args[3] )
        //obj.type = 'Env'
        obj.name = name
      
        $.extend( true, obj, Gibber.ugen )
        
        Gibber.createProxyProperties( obj, _mappingProperties[ name ] ) 
        
        Gibber.processArguments2( obj, args, obj.name )
        
        console.log( name + ' is created.' )
        return obj
      }
    })()
  }
  
  module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return Envelopes }

}()

},{"../clock":15,"../dollar":16,"../mappings":18,"gibberish-dsp":1}],9:[function(_dereq_,module,exports){
!function() {
  "use strict"
  
  var FX = { Presets: {} },
      Gibberish = _dereq_( 'gibberish-dsp' ),
      Gibber,
      $ = _dereq_( '../dollar' ),
      curves = _dereq_('../mappings').outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC
      
  // TODO: should this be completely moved into Gibberish? Is it useful inside there instead of just using Mul?
  Gibberish.Gain = function() {
  	Gibberish.extend(this, {
    	name: 'gain',
      type: 'effect',
    
      properties : {
        input  : 0,
        amount : 1, 
      },

      callback : function(input, amount) {
        if( isNaN(input) ) {
          input[0] *= amount
          input[1] *= amount
        }else{
          input *= amount
        }
    
        return input;
      }
    })
    .init()
    .processProperties(arguments);
  };
  Gibberish.Gain.prototype = Gibberish._effect;
  
  var types = [
    'Reverb',
    'Delay',
    'Flanger',
    'Vibrato',
    'Distortion',
    'Biquad',
    'Gain',
    'Filter24',    
    [ 'RingModulation', 'RingMod' ],
    [ 'BufferShuffler', 'Schizo' ],
    [ 'Decimator', 'Crush' ],
    'Tremolo',
  ],
  _mappingProperties = {
    Reverb: {
      roomSize: {
        min: .5, max: .995,
        output: LINEAR,
        timescale: 'audio',
      },
      damping: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Delay : {
      feedback: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
      time : {
        min: 50, max: 88200, // TODO: Fix... problem with loading order, should be : Gibberish.context.sampleRate * 2,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    RingMod : {
      frequency : {
        min: 20, max: 3000,
        output: LINEAR,
        timescale: 'audio',
      },
      amp: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
      mix: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Flanger : {
      rate : {
        min: .01, max: 20,
        output: LOGARITHMIC,
        timescale: 'audio',
      },
      feedback: {
        min: 0, max: .99,
        output: LINEAR,
        timescale: 'audio',
      },
      amount: {
        min: 25, max: 300,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Gain : {
      amount: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
    },
    Vibrato : {
      rate : {
        min: .2, max: 8,
        output: LOGARITHMIC,
        timescale: 'audio',
      },
      amount: {
        min: 25, max: 300,
        output: LINEAR,
        timescale: 'audio',
      },
      feedback: {
        min: .45, max: .55,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Filter24 : {
      cutoff : {
        min: 0, max: .7,
        output: LINEAR,
        timescale: 'audio',
      },
      resonance: {
        min: 0, max: 5.5,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    LPF : {
      cutoff : {
        min: 0.05, max: .7,
        output: LINEAR,
        timescale: 'audio',
      },
      resonance: {
        min: 0, max: 5.5,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    HPF : {
      cutoff : {
        min: 0, max: .7,
        output: LINEAR,
        timescale: 'audio',
      },
      resonance: {
        min: 0, max: 5.5,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Crush : {
      bitDepth : {
        min: 1, max: 16,
        output: LINEAR,
        timescale: 'audio',
      },
      sampleRate: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
      amp: {
        min: 0, max: 1,
        output: LOGARITHMIC,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Schizo: {
      amp: {
        min: 0, max: 1,
        output: LOGARITHMIC,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Tremolo: {
      amp: {
        min: 0, max: 1,
        output: LOGARITHMIC,
        timescale: 'audio',
      },
      frequency : {
        min: .05, max: 20,
        output: LOGARITHMIC,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    }
  };
  
  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      FX[ name ] = function() {
        var args = Array.prototype.slice.call(arguments, 0),
            obj
            
        obj = new Gibberish[ type ]()
        obj.type = 'FX'
        obj.name = name
      
        $.extend( true, obj, Gibber.ugen )
        
        Gibber.createProxyProperties( obj, _mappingProperties[ name ] ) 
        
        Gibber.createProxyMethods( obj, [ 'send' ] )
        
        Gibber.processArguments2( obj, args, obj.name )
        
        args.input = 0
        
        obj.toString = function() { return '> ' + name }
        
        return obj
      }
    })()
  }
  
  FX.Chorus = function( rate, feedback, amount ) {
  	var _rate = rate || 1, 
    	  _amount = amount || ms( 1 ),
        _feedback = feedback || 0,
    	  that = Flanger( _rate, _feedback, _amount, ms( 1 ) * 30 )
      
  	that.name = 'Chorus'
    that.type = 'FX'
    
  	return that
  }
  
  FX.LPF = function( cutoff, resonance ) {
    var _cutoff = isNaN(cutoff) ? .2 : cutoff,
        _resonance = isNaN( resonance ) ? 3.5 : resonance, 
        that = Filter24( _cutoff, _resonance, true )
    
  	that.name = 'LPF'
    that.type = 'FX'
    
  	return that
  }
  
  FX.HPF = function( cutoff, resonance ) {
  	var _cutoff = isNaN( cutoff ) ? .25 : cutoff,
        _resonance = isNaN( resonance ) ? 3.5 : resonance, 
        that = Filter24( _cutoff, _resonance, true )
    
    that.isLowPass = false
  	that.name = 'HPF'
    that.type = 'FX'
    
  	return that
  }
  
  FX.Presets.Schizo = {
		sane: {
			chance: .1,
			reverseChance: 0,
			pitchChance: .5,
			mix:.5,
		},
		borderline: {
			chance: .1,		
			pitchChance: .25,
			reverseChance: .5,
			mix: 1,
		},
		paranoid: {
			chance: .2,
			reverseChance: .5,
			pitchChance: .5,
			mix: 1,
		},
	};
  
  FX.Presets.Reverb = {
  	space : {
  		roomSize: .99,
  		damping: .23,
  		wet: .75,
  		dry: .25,
  	},
    small : {
      roomSize: .6,
      damping: .75,
      wet: .15,
      dry: .85,
    },
    medium: {
      roomSize: .8,
      damping: .5,
      wet: .35,
      dry: .65,
    },
    large: {
      roomSize: .85,
      damping: .3,
      wet: .55,
      dry: .45,
    }
  }
  
  module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return FX }

}()

},{"../dollar":16,"../mappings":18,"gibberish-dsp":1}],10:[function(_dereq_,module,exports){
!function() {
  "use strict"
  
  var $ = _dereq_( '../dollar' ),
      Oscillators = { Presets: {} },
      Gibberish = _dereq_( 'gibberish-dsp' ),
      Gibber,
      curves = _dereq_('../mappings').outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC
  
  var types = [
    'Sine',
    'Triangle',
    'Saw',
    'Square',
    'Noise',
    'PWM',
  ],
  mappingProperties = {
    frequency: {
      min: 50, max: 3200,
      hardMin:.01, hardMax:22050,
      output: LOGARITHMIC,
      timescale: 'audio',
      dimensions:1
    },
    amp: {
      min: 0, max: 1,
      hardMax:2,
      output: LOGARITHMIC,
      timescale: 'audio',
      dimensions:1
    },
    pulsewidth : {
      min: 0.01, max: .99,
      output: LINEAR,
      timescale: 'audio',
      dimensions:1
    },
    out: {
      min: 0, max: 1,
      output: LINEAR,
      timescale: 'audio',
      dimensions:1
    },
    pan: { min: -1, max: 1, output: LOGARITHMIC, timescale: 'audio',},   
    note: { 
      min: 50, max: 3200, 
      hardMin:.01, hardMax:22050,
      output: LOGARITHMIC, 
      timescale: 'audio', 
      doNotProxy:true 
    },
  }
  
  for( var i = 0; i < types.length; i++ ) {
    !function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]

      Oscillators[ name ] = function() {
        var oscillator = new Gibberish[ type ]().connect( Gibber.Master ),
            args = Array.prototype.slice.call( arguments, 0 )
           
        oscillator.type = 'Gen'
        $.extend( true, oscillator, Gibber.ugen )
        
        oscillator.fx.ugen = oscillator
        
        Object.defineProperty(oscillator, '_', {
          get: function() { 
            oscillator.kill();
            return oscillator 
          },
          set: function() {}
        })
        
        if( typeof oscillator.note === 'undefined' ) {
          oscillator.note = function( pitch ) {
            var freq = this.frequency()
            if( typeof freq === 'number' || typeof freq === 'function' ) {
              this.frequency = typeof pitch === 'function' ? pitch() : pitch
            }else{
              freq[ 0 ] = pitch
            }
          }
        }
        
        oscillator.name = name
        
        Gibber.createProxyProperties( oscillator, mappingProperties )

        var proxyMethods = [ 'note','send' ]
        
        if( name === 'Sampler' ) { proxyMethods.push( 'pickBuffer' ) }
        
        Gibber.createProxyMethods( oscillator, proxyMethods )

        Gibber.processArguments2( oscillator, args, name )

        oscillator.toString = function() { return '> ' + name }
        
        return oscillator
      }
    }()
  }
  
  // $script.ready('gibber', function() {
  // 
  // })
  
  Oscillators.Wavetable = function( table ) {
    var oscillator = new Gibberish.Table().connect( Gibber.Master )
    if( table ) oscillator.setTable( table )
    
    oscillator.type = 'Gen'

    $.extend( true, oscillator, Gibber.ugen )

    oscillator.fx.ugen = oscillator
    
    Object.defineProperty(oscillator, '_', {
      get: function() { 
        oscillator.kill();
        return oscillator 
      },
      set: function() {}
    })
    
    if( typeof oscillator.note === 'undefined' ) {
      oscillator.note = function( pitch ) {
        var freq = this.frequency()
        if( typeof freq === 'number' || typeof freq === 'function' ) {
          this.frequency = typeof pitch === 'function' ? pitch() : pitch
        }else{
          freq[ 0 ] = pitch
        }
      }
    }
    
    Gibber.createProxyProperties( oscillator, {
      frequency: {
        min: 50, max: 3200,
        output: LOGARITHMIC,
        timescale: 'audio',
        dimensions:1
      },
      amp: {
        min: 0, max: 1,
        output: LOGARITHMIC,
        timescale: 'audio',
        dimensions:1
      },
      out: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
        dimensions:1
      },
    })
    
    Gibber.createProxyMethods( oscillator, ['note'] )
    
    obj.toString = function() { return '> Wavetable' }
    return oscillator
  }
  
  Oscillators.Grains = function() {
    var props = typeof arguments[0] === 'object' ? arguments[0] : arguments[1],
        bufferLength = props.bufferLength || 88200,
        a = Sampler().record( props.input, bufferLength ),
        oscillator
  
    if(typeof arguments[0] === 'string') {
      var preset = Gibber.Presets.Grains[ arguments[0] ]
      if( typeof props !== 'undefined') $.extend( preset, props )
      oscillator = new Gibberish.Granulator( preset )
    }else{
      oscillator = new Gibberish.Granulator( props )
    }
  
    oscillator.loop = function(min, max, time, shouldLoop) {
      var curPos = this.position
  		min = isNaN(min) ? .25 : min;
  		max = isNaN(max) ? .75 : max;
  		time = isNaN(time) ? Gibber.Clock.time( 1 ) : Gibber.Clock.time( time );
	
  		shouldLoop = typeof shouldLoop === "undefined" ? true : shouldLoop;
    
      this.position = new Gibberish.Line( min, max, time, shouldLoop )
  
  		var mappingObject = this;
  		if(shouldLoop === false) {
  			future( function() { mappingObject.position = curPos }, Gibber.Clock.time( time ) );
  		}
  	}

    future( function() {
  	  oscillator.setBuffer( a.getBuffer() );
      oscillator.connect()
  	  oscillator.loop( 0, 1, bufferLength ); // min looping automatically
    
      a.disconnect()
    }, bufferLength + 1)
    
    oscillator.type = 'Gen'

    $.extend( true, oscillator, Gibber.ugen )

    oscillator.fx.ugen = oscillator

    Object.defineProperty(oscillator, '_', {
      get: function() { 
        oscillator.disconnect(); 
        return oscillator 
      },
      set: function() {}
    })
    
    oscillator.toString = function() { return 'Grains' }
    return oscillator
  }
  
  Oscillators.Presets.Grains = {
  	tight : {
  		numberOfGrains : 10,
  		grainSize : 44 * 25,
  		positionMin : -.05,
      positionMax : .05,
      speedMin : -.1,
      speedMax : .1,
  		shouldReverse : false,
  	},
  	cloudy : {
  		numberOfGrains : 20,
  		positionMin : -.25,
      positionMax : .25,
      speedMin : -.1,
      speedMax : 4,
  		grainSize : 44 * 100,
  		shouldReverse : true,
  	},
    flurry : {
      speed:2,
      speedMin:-2,
      speedMax:2,
      position:0,
      positionMin:0,
      positionMax:0,
      numberOfGrains:20,
      grainSize : 44 * 25,
    },  
  }
  
  module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return Oscillators }

}()
},{"../dollar":16,"../mappings":18,"gibberish-dsp":1}],11:[function(_dereq_,module,exports){
!function() {
  "use strict";
  
  var PostProcessing,
      Gibberish = _dereq_( 'gibberish-dsp' ),
      Gibber,
      compressor = null, 
      end = null,
      hishelf = null,
      lowshelf = null,
      postgraph = null,
      init = function() {
        postgraph = [ Gibberish.node, Gibberish.context.destination ]
      },
      disconnectGraph = function() {
        for( var i = 0; i < postgraph.length - 1; i++ ) {
          postgraph[ i ].disconnect( postgraph[ i + 1 ] )
        }
      },
      connectGraph = function() {
        for( var i = 0; i < postgraph.length - 1; i++ ) {
          postgraph[ i ].connect( postgraph[ i + 1 ] )
        }
      },
      insert = function( node, position ) { 
        if( typeof position !== 'undefined' ) {
          if( position > 0 && position < postgraph.length - 1 ) {
            disconnectGraph()
            postgraph.splice( position, 0, node )
          }else{
            console.error( 'Invalid position for inserting into postprocessing graph: ', position )
            return
          }
        }else{
          disconnectGraph()
          postgraph.splice( 1, 0, node )
        }
      
        connectGraph()
      };
  
  var PP = PostProcessing = {
    Compressor : function( position ) {
      if( compressor === null ) {
        
        compressor = Gibberish.context.createDynamicsCompressor()
        
        var _threshold = compressor.threshold,
            _ratio     = compressor.ratio,
            _attack    = compressor.attack,
            _release    = compressor.release
            
        Object.defineProperties( compressor, {
          threshold: {
            get: function()  { return _threshold.value },
            set: function(v) { _threshold.value = v }
          },
          ratio: {
            get: function()  { return _ratio.value },
            set: function(v) { _ratio.value = v }
          },
          attack: {
            get: function()  { return _attack.value },
            set: function(v) { _attack.value = v }
          },
          release: {
            get: function()  { return _release.value },
            set: function(v) { _release.value = v }
          },
        }) 
        
        PP.insert( compressor, position )
      }
      
      return compressor
    },
    
    LowShelf : function( position ) {
      if( lowshelf === null ) {
        lowshelf = Gibberish.context.createBiquadFilter()
            
        lowshelf.type = 3 // lowshelf
        lowshelf.frequency.value = 220
        lowshelf.Q.value = 0
        lowshelf.gain.value = 6
        
        var _gain       = lowshelf.gain,
            _frequency  = lowshelf.frequency,
            _Q          = lowshelf.Q
            
            
        Object.defineProperties( lowshelf, {
          frequency: {
            get: function()  { return _frequency.value },
            set: function(v) { _frequency.value = v }
          },
          gain: {
            get: function()  { return _gain.value },
            set: function(v) { _gain.value = v }
          },
          Q: {
            get: function()  { return _Q.value },
            set: function(v) { _Q.value = v }
          },
        })
        
        PP.insert( lowshelf, position )
      }
      
      return lowshelf
    },
    
    HiShelf : function( position ) {
      if( hishelf === null ) {
        hishelf = Gibberish.context.createBiquadFilter()
            
        hishelf.type = 4 // hishelf
        hishelf.frequency.value = 880
        hishelf.Q.value = 0
        hishelf.gain.value = 6
        
        var _gain       = hishelf.gain,
            _frequency  = hishelf.frequency,
            _Q          = hishelf.Q
            
        Object.defineProperties( hishelf, {
          frequency: {
            get: function()  { return _frequency.value },
            set: function(v) { _frequency.value = v }
          },
          gain: {
            get: function()  { return _gain.value },
            set: function(v) { _gain.value = v }
          },
          Q: {
            get: function()  { return _Q.value },
            set: function(v) { _Q.value = v }
          },
        })
        
        PP.insert( hishelf, position )
      }
      
      return hishelf
    },
  }
  
  module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return PostProcessing }
  
}()
},{"gibberish-dsp":1}],12:[function(_dereq_,module,exports){
!function() { 
  "use strict"
  
  var Samplers = { Presets:{} },
      Gibberish = _dereq_( 'gibberish-dsp' ),
      Gibber,
      $ = _dereq_( '../dollar' ),
      Clock = _dereq_('../clock'),
      curves = _dereq_('../mappings').outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC

  var mappingProperties = {
    amp: {
      min: 0, max: 1,
      hardMax:2,
      output: LOGARITHMIC,
      timescale: 'audio',
      dimensions:1
    },
    pitch: {
      min: 1, max: 4,
      hardMin: .01, hardMax: 20,      
      output: LOGARITHMIC,
      timescale: 'audio',
    },
    out: {
      min: 0, max: 1,
      output: LINEAR,
      timescale: 'audio',
      dimensions:1
    },
    pan: { min: -1, max: 1, output: LOGARITHMIC, timescale: 'audio',},   
    note: { 
      min: 50, max: 3200, 
      hardMin:.01, hardMax:22050,
      output: LOGARITHMIC, 
      timescale: 'audio', 
      doNotProxy:true 
    },
  }
  
  Samplers.Sampler = function() {
    var oscillator = new Gibberish.Sampler().connect( Gibber.Master ),
        args = Array.prototype.slice.call( arguments, 0 ),
        name = 'Sampler'
         
      oscillator.type = 'Gen'
      $.extend( true, oscillator, Gibber.ugen )
      
      oscillator.fx.ugen = oscillator
      
      Object.defineProperty(oscillator, '_', {
        get: function() { 
          oscillator.kill();
          return oscillator 
        },
        set: function() {}
      })
      
      if( typeof oscillator.note === 'undefined' ) {
        oscillator.note = function( pitch ) {
          var freq = this.frequency()
          if( typeof freq === 'number' || typeof freq === 'function' ) {
            this.frequency = typeof pitch === 'function' ? pitch() : pitch
          }else{
            freq[ 0 ] = pitch
          }
        }
      }
      
      Gibber.createProxyProperties( oscillator, mappingProperties )

      var proxyMethods = [ 'note', 'pickBuffer' ]
      
      Gibber.createProxyMethods( oscillator, proxyMethods )

      Gibber.processArguments2( oscillator, args, name )

      oscillator.toString = function() { return name }
      
      return oscillator
  }
  
  Gibberish.Sampler.prototype.readFile = function( file ) {
    var that = this
    if( file.isFile ) {
      file.file( function( file ) {
        that.readFile( file )
      })
      return
    }
    var reader = new FileReader()
    
    reader.readAsArrayBuffer( file );

    reader.onload = function (event) {
      Gibberish.context.decodeAudioData( reader.result, function(_buffer) {
        var buffer = _buffer.getChannelData(0)
        that.setBuffer( buffer )
  			that.length = that.end = buffer.length
        that.buffers[ file.name ] = buffer
    
        that.isPlaying = true;
			
  			console.log("LOADED", file.name, buffer.length);
  			Gibberish.audioFiles[ file.name ] = buffer;
	
        if(that.onload) that.onload();
  
        if(that.playOnLoad !== 0) that.note( that.playOnLoad );
  
  			that.isLoaded = true;
      })
    }
  }
  
  Gibberish.Sampler.prototype.ondrop = function( files ) {
    for( var i = 0; i < files.length; i++ ) {
      ( function(_that) { 
        var file = files[ i ],
            reader = new FileReader(),
            that = _that, item;
        
        item = file.webkitGetAsEntry()
        
        if( item.isDirectory ) {
          var dirReader = item.createReader()
      		dirReader.readEntries( function( entries ){
      			var idx = entries.length;
      			while(idx--){
      				_that.readFile( entries[idx] );
      			}	
      		})
        }else{
          _that.readFile( item )
        }
      })( this )
    }
  }
  
  Gibberish.Sampler.prototype.pickBuffer = function() {
    this.switchBuffer( rndi( 0, this.getNumberOfBuffers() ) )
  }
  
  Gibberish.Sampler.prototype.record = function(input, recordLength) {
    this.isRecording = true;
    console.log( 'starting recording' )
    var self = this;

    this.recorder = new Gibberish.Record(input, Gibber.Clock.time( recordLength ), function() {
      console.log( 'recording finished' )
      self.setBuffer( this.getBuffer() );
      self.length = self.end = self.getBuffer().length;
      self.setPhase( self.length )
      self.isRecording = false;
    })
    .record();

    return this;
  };
  

  Samplers.Looper = function(input, length, numberOfLoops) {
  	var that = Bus();
    $.extend( that, {
      children : [],
      input : input,
      length : Clock.time(length),
      numberOfLoops : numberOfLoops,
      pitch : 1,
      currentLoop : 0,
      loop : function() {
        that.children[ that.currentLoop ].record( that.input, that.length );
    
        var seq = {
          target: that.children[ that.currentLoop],
          durations: that.length,
          key:'note',
          values: [ null ] 
        }

        that.seq.add( seq )
        that.seq.start()
        
        future(that.nextLoop, length);

        return that;
      },
      nextLoop : function() {
    		that.children[++that.currentLoop].record(that.input, that.length);
    		if(that.currentLoop < that.numberOfLoops - 1) {
    			future(that.nextLoop, length);
    		}
        var seq = {
          target: that.children[ that.currentLoop ],
          durations: that.length,
          key:'note',
          values: [ null ] 
        }

        that.seq.add( seq )
    	},
    })
    
    var __pitch = 1
    Object.defineProperty( that, 'pitch', {
      configurable:true,
      get: function() {
        return __pitch
      },
      set: function(v) {
        __pitch = v
        for( var i = 0; i < that.children.length; i++ ) {
          that.children[ i ].pitch = __pitch
        }
      }
    })
    
  	for(var i = 0; i < numberOfLoops; i++) {
  		that.children.push( Sampler({ pitch:that.pitch })._ );	
  		that.children[i].send(that, 1);
  	}
    
    Gibber.createProxyProperties( that, { pitch:mappingProperties.pitch } )
        
    that.stop = function() { that.seq.stop(); }
    that.play = function() { that.seq.play(); }
	
  	return that;
  }
  
  module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return Samplers }  
}()
},{"../clock":15,"../dollar":16,"../mappings":18,"gibberish-dsp":1}],13:[function(_dereq_,module,exports){
!function() {
  "use strict"
  
  var Synths = { Presets: {} },
      Gibberish = _dereq_( 'gibberish-dsp' ),
      Gibber,
      $ = _dereq_( '../dollar' ),
      Clock = _dereq_('../clock')( Gibber ),
      curves = _dereq_('../mappings').outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC

  var types = [
    [ 'PolySynth', 'Synth' ],
    [ 'PolyFM', 'FM' ],
    [ 'PolySynth2', 'Synth2' ],
    [ 'MonoSynth', 'Mono' ],
    [ 'PolyKarplusStrong', 'Pluck' ],
  ],
  _mappingProperties = {
    Synth: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },
      frequency: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      pulsewidth :{ min: 0.01, max: .99, output: LINEAR, timescale: 'audio' },
      attack: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      decay: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      sustain: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      release: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio',},   
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },   
    },
    Synth2: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },
      frequency: { min: 50, max: 3200, output: LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      pulsewidth :{ min: 0.01, max: .99, output: LINEAR, timescale: 'audio' },
      attack: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      decay: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      sustain: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      release: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      cutoff : { min: 0, max: .7, output: LINEAR, timescale: 'audio' },
      resonance: { min: 0, max: 5.5, output: LINEAR, timescale: 'audio' },
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },                
    },
    Mono: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },
      frequency: { min: 50, max: 3200, output: LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      pulsewidth :{ min: 0.01, max: .99, output: LINEAR, timescale: 'audio' },
      attack: { min:Clock.maxMeasures + 1, max: 176400, output: LOGARITHMIC, timescale:'audio'},
      decay: { min:Clock.maxMeasures + 1, max: 176400, output: LOGARITHMIC, timescale:'audio'},
      cutoff : { min: 0, max: .7, output: LINEAR, timescale: 'audio' },
      detune2: { min: 0, max: .15, output: LINEAR, timescale: 'audio' },
      detune3: { min: 0, max: .15, output: LINEAR, timescale: 'audio' },
      glide: { min:.99, max:.999995, output: LINEAR, timescale: 'audio'},
      resonance: { min: 0, max: 5.5, output: LINEAR, timescale: 'audio' },
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    FM: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },
      frequency: { min: 50, max: 3200, output: LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      attack: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      decay: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      sustain: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      release: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio'},
      cmRatio : { min:.1, max:50, output:LINEAR, timescale:'audio' },
      index: { min:.1, max:50, output:LINEAR, timescale:'audio' },
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },     
    },
    Pluck: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },    
      frequency: { min: 50, max: 3200, output: LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      blend :{ min: 0, max: 1, output: LINEAR, timescale: 'audio' },
      damping :{ min: 0, max: 1, output: LINEAR, timescale: 'audio' },
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },     
    },
  }

  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      Synths[ name ] = function() {
        var args = Array.prototype.slice.call(arguments),
            obj,
            mv = 1,
            adsr = false,
            scale,
            requireReleaseTrigger = true
        
        if( typeof args[0] === 'object' ) {
          if(typeof args[0].maxVoices !== 'undefined') { 
            if( args[0].maxVoices ) mv = args[0].maxVoices
          }
          if( typeof args[0].useADSR !== 'undefined' ) {
            adsr = args[0].useADSR
            if( typeof args[0].requireReleaseTrigger !== 'undefined' ) {
              requireReleaseTrigger = args[0].requireReleaseTrigger
            }
          }else{
            requireReleaseTrigger = false
          }
          if( typeof args[0].useADSR !== 'undefined' ) {
            adsr = args[0].useADSR
          }
          if( typeof args[0].scale !== 'undefined' ) {
            scale = args[0].scale
          } 
        }
        
        obj = new Gibberish[ type ]({ maxVoices: mv, useADSR:adsr, requireReleaseTrigger:requireReleaseTrigger, scale:scale }).connect( Gibber.Master )
        obj.type = 'Gen'
        
        $.extend( true, obj, Gibber.ugen )
        
        obj.fx.ugen = obj
        
        // override note method to allow note names
        obj._note = obj.note.bind( obj )
        obj.note = function() {
          var args = Array.prototype.splice.call( arguments, 0 )
        
          if( typeof args[0] === 'string' ) {
            args[0] = Gibber.Theory.Teoria.note( args[0] ).fq()
          }else{
            if( typeof args[0] === 'object' ) { // for interface elements etc.
              args[0] = args[0].valueOf()
            }
            if( args[0] < Gibber.minNoteFrequency ) {
              var scale = obj.scale || Gibber.scale,
                  note  = scale.notes[ args[ 0 ] ]
                  
              if( obj.octave && obj.octave !== 0 ) {
                var sign = obj.octave > 0 ? 1 : 0,
                    num  = Math.abs( obj.octave )
                
                for( var i = 0; i < num; i++ ) {
                  note *= sign ? 2 : .5
                }
              }
              
              args[ 0 ] = note
            }
          }
          
          this._note.apply( this, args )
          
          return this 
        }
        
        obj.chord = Gibber.Theory.chord
      
        Object.defineProperty(obj, '_', {
          get: function() { obj.kill(); return obj },
          set: function() {}
        })
        
        //obj, _key, shouldSeq, shouldRamp, dict, _useMappings, priority
        Gibber.createProxyProperties( obj, _mappingProperties[ name ] )
        
        Gibber.createProxyMethods( obj, [ 'note', 'chord', 'send' ] )
                
        obj.name = name 
        
        Gibber.processArguments2( obj, args, obj.name )
        
        obj.toString = function() { return '> ' + name }
        
        // define a continuous frequency mapping abstraction for all synths with children
        if( name !== 'Mono' ) {
          var __frequency = obj._frequency
          Object.defineProperty( obj, 'frequency', {
            configurable: true,
            get: function() { return this._frequency },
            set: function(v) { 
               __frequency = v;
               if( this.children ) {
                 for( var i = 0; i < this.children.length; i++ ) {
                   if( typeof this.children[i].frequency === 'number' ) {
                     this.children[i].frequency = __frequency
                   }else{
                     this.children[i].frequency[0] = __frequency
                   }
                 }
               }
            }
          })
        }
        
        var __scale;
        Object.defineProperty(obj, 'scale', {
          get: function() { return __scale },
          set: function(v) {
            __scale = v;
            obj.seq.scale = __scale
          }
        })
        
        return obj
      }
    })()
  
  }
  
  Synths.Presets.Synth = {
  	short:  { attack: 44, decay: 1/16, },
  	bleep:  { waveform:'Sine', attack:44, decay:1/16 },
    rhodes: { waveform:'Sine', maxVoices:4, presetInit: function() { this.fx.add( Gibber.FX.Tremolo(2, .2) ) }, attack:44, decay:1 },
    calvin: { waveform:'PWM',  maxVoices:4, amp:.075, presetInit: function() { this.fx.add( Gibber.FX.Delay(1/6,.5), Gibber.FX.Vibrato() ) }, attack:44, decay:1/4 }    
  }
  
  Synths.Presets.Synth2 = {
    pad2: { waveform:'Saw', maxVoices:4, attack:1.5, decay:1/2, cutoff:.3, filterMult:.35, resonance:4.5, amp:1.25 },
    pad4: { waveform:'Saw', maxVoices:4, attack:2, decay:2, cutoff:.3, filterMult:.35, resonance:4.5, amp:1.25 },     
  }
  
  Synths.Presets.Mono = {
  	short : { attack: 44, decay: 1/16,},
  
  	lead : {
  		presetInit : function() { this.fx.add( Gibber.FX.Delay(1/4, .35), Gibber.FX.Reverb() ) },
  		attack: 1/8,
  		decay:1/2,
  		octave3:0,
  		cutoff:.2,
  		filterMult:.5,
  		resonance:5,
  		isLowPass: false,
  	},

  	winsome : {
  		presetInit : function() { 
        //this.fx.add( Delay(1/4, .35), Reverb() ) 
        this.lfo = Gibber.Oscillators.Sine( .234375 )._
        
        this.lfo.amp = .075
        this.lfo.frequency = 2
        
        this.cutoff = this.lfo
        this.detune2 = this.lfo
      },
  		attack: Clock.maxMeasures,
  		decay:1,
  		cutoff:.2,
  	},
  	bass : { 
      attack: Clock.maxMeasures,
  		decay:	1/8 - Clock.maxMeasures,
      octave: -2,
  		octave2 : -1,
  		cutoff: .5,
  		filterMult:.2,
  		resonance:1,
  	},
    bass2 : {
      attack: Clock.maxMeasures,
  		decay:	1/6,
      octave: -2,
  		octave2 : 0,
  		octave3 : 0,      
  		cutoff: .5,
  		filterMult:.2,
  		resonance:1,
      amp:.65
    },
  
  	easy : {
  		attack: Clock.maxMeasures,
  		decay:2,
  		octave2:0,
  		octave3:0,
  		cutoff:.3,
      glide:.9995,
  	},
    
  	easyfx : {
  		attack: Clock.maxMeasures,
  		decay:2,
      presetInit: function() {
        this.fx.add( Gibber.FX.Delay(1/6, .3) )
      },
      amp:.3,
  		octave2:0,
  		octave3:0,
  		cutoff:.3,
      glide:.9995,
  	},
  
    dark : {
      resonance:0,
      attack:44,
      cutoff:.075,
      amp:.35,
      filterMult:0
    },

    dark2 : {
      filterMult:.1,
      attack: Clock.maxMeasures,
      octave2:0,
      octave3:0,
      decay:1/4,
      amp:.45,
    },
    
    noise: {
      resonance:20,
      decay:1/2,
      cutoff:.3,
      glide:.99995,
      detune3:0,
      detune2:0,
      filterMult:0,
      presetInit: function() { this.fx.add( Gibber.FX.Gain(.1), Gibber.FX.Delay(1/6,.35) ) }
    },
  }
  
  Synths.Presets.FM = {
    stabs:{
      maxVoices:4,
			cmRatio : 1 / 1.0007,
			index	: 5,
			attack: Clock.maxMeasures,
			decay	: 1/8,
      amp:.1,
      presetInit: function() {
        this.bus = Gibber.Busses.Bus().fx.add( Gibber.FX.Delay(1/8,.75), Gibber.FX.LPF({ resonance:4 }) )
        this.bus.fx[1].cutoff = Gibber.Binops.Add(.25, Gibber.Oscilators.Sine(.1,.2)._ )
        this.send( this.bus, .65 )
      },
    },
    bass : {
      cmRatio:1,
      index:3,
      presetInit: function() { this.attack = ms(1); },
      decay:1/16,
      octave:-2
    },
		glockenspiel : {
			cmRatio	: 3.5307,
			index 	: 1,
			attack	: 44,
			decay	: 44100,
		},
		radio : { //ljp
			cmRatio	: 1,
			index	: 40,
			attack	: 300 * 44.1,
			decay	: 500 * 44.1,
		},
		noise : { //ljp
			cmRatio	: 0.04,
			index	: 1000,
			attack	: 1 * 44.1,
			decay	: 100 * 44.1,
		},
		frog : { //ljp
			cmRatio	: 0.1,
			index	: 2.0,
			attack	: 300 * 44.1,
			decay	: 5 * 44.1,
		},
		gong : {
			cmRatio : 1.4,
			index	: .95,
			attack	: 44.1,
			decay	: 5000 * 44.1,
		},
		drum : {
			cmRatio : 1.40007,
			index	: 2,
			attack	: 44,
			decay	: 44100,
		},
		drum2 : {
			cmRatio: 1 + Math.sqrt(2),
			index: .2,
			attack: 44,
			decay: 20 * 44.1,
		},
		brass : {
      maxVoices:4,
			cmRatio : 1 / 1.0007,
			index	: 5,
			attack	: 4100,
			decay	: 1,
		},
		clarinet : {
			cmRatio	: 3 / 2,
			index	: 1.5,
			attack	: 50 * 44.1,
			decay	: 200 * 44.1,
		}
	};
  
  module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return Synths }

}()

},{"../clock":15,"../dollar":16,"../mappings":18,"gibberish-dsp":1}],14:[function(_dereq_,module,exports){
!function() {
  "use strict"

var teoria = _dereq_('../../external/teoria.min'),
    $ = _dereq_( '../dollar' ),
    Gibber

var Theory = {
  Teoria: teoria,
  Scale : function(_root, _mode) {
  	var that = {
  		root: typeof _root === "string" ? teoria.note(_root) : _root,
  		notes: [],
      degree:1,
		
  		chord : function(_notes, _offset) {
  			var _chord = [];
  			_offset = _offset || 0;
			  
  			for(var i = 0; i < _notes.length; i++) {
  				_chord.push( this.notes[ _notes[i] + _offset ] );
  			}
  			return _chord;
  		},
		
  		create : function() {
        var __root = typeof that.root() === 'object' ? that.root() : teoria.note( that.root() ),
            __mode = that.mode() || mode 
            
  			this.notes.length = 0
      
  			if( Gibber.Theory.Scales[ __mode ] ) {
  				var scale = Gibber.Theory.Scales[ __mode ]( __root )
  				scale.create( this.degree )
  				this.notes = scale.notes
  			}
  		},
		
  		set : function(_root, _mode) {
  			if(Array.isArray(arguments[0])) {
  				this.root = arguments[0][0];
  				this.mode = arguments[0][1];
  			}else{
  				this.root = _root;
  				this.mode = _mode;
  			}
  		},
  	};
	  
  	var mode = _mode || "aeolian";
  	Object.defineProperty( that, "mode", {
      configurable:true,
  		get: function() { return mode; },
  		set: function( val ) { 
        mode = val; 
        that.create(); 
      }	
  	});
  
  	var root = that.root;
  	Object.defineProperty(that, "root", {
      configurable:true,
  		get: function() { return root; },
  		set: function(val) { 
  			root = typeof val === "string" ? teoria.note( val ) : val; 
  			that.create();
  		}	
  	});
    
    var degree = that.degree;
    Object.defineProperty(that, "degree", {
      configurable:true,
      get: function() { return degree; },
      set: function(val) {
        degree = val;
        that.create( degree );
      }  
    });
	  
    // createProxyProperty: function( obj, _key, shouldSeq, shouldRamp, dict, _useMappings ) {
    
    Gibber.createProxyProperty( that, 'root', true, false, null, false, 1 )
    Gibber.createProxyProperty( that, 'mode', true, false, null, false, 1 )
    Gibber.createProxyProperty( that, 'degree', true, false, null, false, 1 )    
    
    $.subscribe( '/gibber/clear', function() {
      that.seq.isConnected = false
      that.seq.isRunning = false
      that.seq.destinations.length = 0
    })  
    
  	that.create();
    that.toString = function() { return 'Scale: ' + that.root() + ', ' + that.mode() }
  	return that;
  },
  
  CustomScale : function( ___degree ) {
    var that = {
      notes : [],
      degree: ___degree || 1,
      ratios: arguments[1] || [ 1, 1.10, 1.25, 1.3333, 1.5, 1.666, 1.75 ],
	
      create : function( _degree ) {
        // if( typeof _degree === 'number' ) this.degree = _degree
        //console.log("CREATE!!!!", that.degree )
        this.notes = [];
  
        var scaleRoot = this.root;
      
        for( var octave = 0; octave < 8; octave++ ) {
          for( var num = 0; num < this.ratios.length; num++ ) {	
            var degreeNumber = num + _degree - 1
            var tempRoot = scaleRoot * ( 1 + Math.floor( degreeNumber / this.ratios.length ) )
            this.notes.push( tempRoot * this.ratios[ degreeNumber % this.ratios.length ] );
          }
          scaleRoot *= 2;
        }
      
        scaleRoot = this.root;
  	    var negCount = 8;
        for(var octave = -1; octave >= -8; octave--) {
          scaleRoot /= 2;
          for( var num = 0; num < this.ratios.length; num++ ) {
  		      var noteNum = octave * this.ratios.length + num;
            var degreeNumber = num + _degree - 1
            var tempRoot = scaleRoot * ( 1 + Math.floor( degreeNumber / this.ratios.length ) )
            this.notes[noteNum] = tempRoot * this.ratios[ degreeNumber % this.ratios.length ];
          }
        }	
      },
	
    	chord : function(_notes, _offset) {
    		var _chord = [];
    		_offset = _offset || 0;
			
    		for(var i = 0; i < _notes.length; i++) {
    			_chord.push( this.notes[_notes[i] + _offset] );
    		}
    		return _chord;
    	},	
    }

    var _root = arguments[0] || 440;
    Object.defineProperty(that, "root", {
      get : function() { return _root; },
      
      set : function(val) { 
    		if(typeof val === "number") {
    			_root = val;
    		}else if (typeof val === "string") {
    			_root = Theory.Teoria.note(val).fq();
    		}else if (typeof val === 'object') {
    			_root = val.fq();
    		}
        
    		this.create(_root); 
      }
    });
    
    // var __degree = that.degree;
    // Object.defineProperty(that, "degree", {
    //       configurable:true,
    //   get: function() { return __degree; },
    //   set: function(val) {
    //     __degree = val;
    //     that.create();
    //   }  
    // });
    
  	// var mode = _mode || "aeolian";
//     Object.defineProperty( that, "mode", {
//       get: function() { return mode; },
//       set: function( val ) { mode = val; this.create(); }  
//     });
    
    that.root = _root;                   
    //that.create();
      
    return that;
  },
  
  Scales : {
    Major: function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8 ])},
    Ionian: function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8 ])},    
    Dorian: function( root ) { return Theory.CustomScale( root, [1, 9/8, 6/5, 4/3, 3/2, 5/3, 9/5 ])},
    Phrygian: function( root ) { return Theory.CustomScale( root, [1, 16/15, 6/5, 4/3, 3/2, 8/5, 9/5 ])},
    Lydian: function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 45/32, 3/2, 5/3, 15/8 ])},
    Mixolydian: function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 4/3, 3/2, 8/5, 9/5 ])},
    Minor: function( root ) { return Theory.CustomScale( root, [1, 9/8, 6/5, 4/3, 3/2, 8/5, 9/5 ])},     
    Aeolian : function( root ) { return Theory.CustomScale( root, [1, 9/8, 6/5, 4/3, 3/2, 8/5, 9/5 ])}, 
    Locrian : function( root ) { return Theory.CustomScale( root, [1, 16/15, 6/5, 4/3, 62/45, 8/5, 15/8 ])},
    MajorPentatonic : function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 3/2, 5/3 ] ) },
    MinorPentatonic : function( root ) { return Theory.CustomScale( root, [1, 6/5, 4/3, 3/2, 15/8] ) },
    Chromatic: function( root ) { return Theory.CustomScale( root, [1, 16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 15/8, 9/5 ])},
  	// Scales contributed by Luke Taylor
  	// Half-Whole or Octatonic Scale
  	//http://en.wikipedia.org/wiki/Octatonic_scale
    
  	HalfWhole : function(root) { return Theory.CustomScale( root, [ 1,1.059463,1.189207,1.259921,1.414214,1.498307,1.681793, 1.781797 ]); },

  	//Whole-Half or Octatonic Scale http://en.wikipedia.org/wiki/Octatonic_scale
  	WholeHalf : function(root) { return Theory.CustomScale( root, [ 1,1.122462,1.189207,1.334840,1.414214,1.587401,1.681793, 1.887749 ]); },

  	//Pythagorean Tuning http://en.wikipedia.org/wiki/Pythagorean_tuning

  	//Chromatic scale in Pythagorean tuning
  	Pythagorean : function(root) { return Theory.CustomScale( root, [ 1, 256/243, 9/8, 32/27, 81/64, 4/3, 729/512, 3/2, 128/81, 27/16, 16/9, 243/128 ]); },

  	//Major Pythagorean
  	PythagoreanMajor : function(root) { return Theory.CustomScale( root, [ 1, 9/8, 81/64, 4/3, 3/2, 27/16, 243/128 ]); },

  	//Major Pythagorean
  	PythagoreanMinor : function(root) { return Theory.CustomScale( root, [ 1, 9/8, 32/27, 4/3, 3/2, 128/81, 16/9 ]); },
	
  	// 5-limit Just Intonation http://en.wikipedia.org/wiki/List_of_intervals_in_5-limit_just_intonation
  	//Chromatic scale in 5-limit just intonation
  	Limit5 : function(root) { return Theory.CustomScale( root, [ 1, 16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 9/5, 15/8 ]); },

  	//Major scale in 5-limit
  	Limit5Major : function(root) { return Theory.CustomScale( root, [ 1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8 ]); },

  	//Minor scale in 5-limit
  	Limit5Minor : function(root) { return Theory.CustomScale( root, [ 1, 9/8, 6/5, 4/3, 3/2, 8/5, 9/5 ]); },

  	// Messiaen's modes of limited transposition http://en.wikipedia.org/wiki/Modes_of_limited_transposition
  	Mess3 : function(root) { return Theory.CustomScale( root, [1,1.122462, 1.189207, 1.259921, 1.414214, 1.498307, 1.587401, 1.781797, 1.887749 ]) },
  	Mess4 : function(root) { return Theory.CustomScale( root, [1, 1.059463, 1.122462, 1.334840, 1.414214, 1.498307, 1.587401, 1.887749 ]) },
  	Mess5 : function(root) { return Theory.CustomScale( root, [1, 1.059463, 1.334840, 1.414214, 1.498307, 1.887749 ]) },
  	Mess6 : function(root) { return Theory.CustomScale( root, [1, 1.122462, 1.259921, 1.334840, 1.414214, 1.587401, 1.781797, 1.887749 ]) },
  	Mess7 : function(root) { return Theory.CustomScale( root, [1, 1.059463, 1.122462, 1.189207, 1.334840, 1.414214, 1.498307, 1.587401, 1.681793, 1.887749 ]) },

  	//And, a personal (anthony garcia) favorite synthetic mode, lydian flat 7:
  	Adams : function(root) { return Theory.CustomScale( root, [1, 1.122462, 1.259921, 1.414214, 1.498307, 1.681793, 1.781797 ]) },

  	//5 tone equal temperament //http://en.wikipedia.org/wiki/Equal_temperament#5_and_7_tone_temperaments_in_ethnomusicology
  	Equal5Tone : function(root) { return Theory.CustomScale( root, [ 1, 1.15, 1.32, 1.35, 1.52, 1.74 ]); },

  	//7 tone equal temperament
  	//http://en.wikipedia.org/wiki/Equal_temperament#5_and_7_tone_temperaments_in_ethnomusicology
  	Equal7Tone : function(root) { return Theory.CustomScale( root, [ 1, 1.1, 1.22, 1.35, 1.49, 1.64, 1.81 ]); },

  	Just : function(root) { return Theory.CustomScale( root, [ 1, 1.0417, 1.1250, 1.2000, 1.2500, 1.3333, 1.4063, 1.5, 1.6, 1.6667, 1.8, 1.8750] ); },
    
    Shruti: function(root) { return Theory.CustomScale( root, [1,256/243,16/15,10/9,9/8,32/27,6/5,5/4,81/64,4/3,27/20,45/32,729/512,3/2,128/81,8/5,5/3,27/16,16/9,9/5,15/8,243/128,2] ); },
  },
  
	chord : function( val, volume ) {
		this.notation = val;
			
		if( typeof this.notation === "string" ) {
			var _root = this.notation.slice( 0,1 ),
          _octave, 
          _quality;
          
			if( isNaN( this.notation.charAt( 1 ) ) ) { 	// if true, then there is a sharp or flat...
				_root += this.notation.charAt( 1 );	// ... so add it to the root name
				_octave = parseInt( this.notation.slice( 2,3 ) );
				_quality = this.notation.slice( 3 );
			}else{
				_octave = parseInt( this.notation.slice( 1, 2 ) );
				_quality = this.notation.slice( 2 );
			}
		
			var _chord = teoria.note( _root + _octave ).chord( _quality );
			for( var j = 0; j < _chord.notes.length; j++ ) {
				var n = _chord.notes[ j ];
				this.note( typeof note === 'number' ? note : n.fq() );
			}
    }else{
			for( var k = 0; k < this.notation.length; k++ ) {
				var _note = this.scale ? this.scale.notes[ this.notation[k] ] : this.notation[ k ],
            note

        switch( typeof _note ) {
          case 'number':
            note = _note
            break;
          case 'object':
            note = _note.fq()
            break;
          case 'string':
            note = Theory.Teoria.note( _note ).fq();
            break;
        }
        
        this.note( note )
			}
		}

		if( typeof arguments[ 1 ] !== "undefined" ) {
			this.amp = arguments[ 1 ];
		}
	
		return this;
	}

}

module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return Theory; }
//window.Scale = Gibber.Theory.Scale

}()
},{"../../external/teoria.min":2,"../dollar":16}],15:[function(_dereq_,module,exports){
(function() {
  
"use strict"
var times = [],
    $ = _dereq_( './dollar' ),//require('zepto-browserify').Zepto,
    curves = _dereq_('./mappings').outputCurves,
    LINEAR = curves.LINEAR,
    LOGARITHMIC = curves.LOGARITHMIC, 
    Gibberish = _dereq_( 'gibberish-dsp' ),
    Gibber

var Clock = {
  seq : null, 
  bpm : null,
  maxMeasures: 44,
  baseBPM : 120,
  metronome : null,
  currentBeat : 0,
  beatsPerMeasure : 4,
  codeToExecute : [],
  signature: { lower: 4, upper: 4 },
  sequencers:[],
  timeProperties : [ 'attack', 'decay', 'sustain', 'release', 'offset', 'time' ],
  phase : 0,
  
  processBeat : function() {
    Clock.currentBeat = Clock.currentBeat >= Clock.signature.upper ? 1 : Clock.currentBeat + 1
    
    if( Clock.currentBeat === 1 && Clock.codeToExecute.length > 0) {
      
      for( var i = 0; i < Clock.codeToExecute.length; i++ ) {
        try {
					if( typeof Clock.codeToExecute[ i ].function === 'function' ) {
						Clock.codeToExecute[ i ].function()
					}else{
	          Gibber.run( Clock.codeToExecute[ i ].code, Clock.codeToExecute[ i ].pos, Clock.codeToExecute[ i ].cm )
					}
        }catch( e ) {
          console.error( "FAILED TO EXECUTE CODE:", Clock.codeToExecute[ i ].code , e)
        }
      }
      
      Clock.codeToExecute.length = 0
    }
    
    if( Clock.metronome !== null ) {
      Clock.metronome.draw( Clock.currentBeat, Clock.signature.upper )
    }
    
    Clock.phase += Clock.beats( 1 )
  },
  
  getTimeSinceStart : function() {
    return Clock.phase + Clock.seq.phase
  },
  
  reset : function() {
    this.phase = 0
    this.currentBeat = 0
    this.rate = 1
    this.start()
  },
  
  tap : function() {
    var time = Gibber.Clock.getTimeSinceStart()
    if( times[2] && time - times[2] > 88200 ) {
      times.length = 0
    }
    times.unshift( time )
  
    while( times.length > 3 ) times.pop()
  
    if( times.length === 3) {
    	var average = ((times[0] + times[1]) - times[2] * 2) / 3.,
          bps = 44100 / average,
          bpm = bps * 60
    
      Gibber.Clock.bpm = bpm
    }
  },
  
  start : function( shouldInit ) {    
    if( shouldInit ) {
      $.extend( this, {
        properties: { rate: 1 },
        name:'master_clock',
        callback : function( rate ) {
          return rate
        }
      })
    
      this.__proto__ = new Gibberish.ugen()
      this.__proto__.init.call( this )

      var bpm = this.baseBPM
      Object.defineProperty(Clock, 'bpm', {
        get: function() { return bpm },
        set: function(v) { 
          bpm = v;
          Clock.rate = bpm / Clock.baseBPM
        }
      })
      
      Object.defineProperty(this, 'timeSignature', {
        get: function() { return Clock.signature.upper + '/' + Clock.signature.lower },
        set: function(v) { 
          var values = v.split('/')
          if( values.length === 2 && ( values[0] !== Clock.signature.upper || values[1] !== Clock.signature.lower ) ) {
            Clock.signature.upper = parseInt( values[0] )
            Clock.signature.lower = parseInt( values[1] )
            Clock.currentBeat = Clock.currentBeat != 1 ? 0 : 1
          }
        }
      })
      
      Gibber.createProxyProperties( this, {
        rate : { min: .1, max: 2, output: LINEAR, timescale: 'audio' },
        bpm : { min: 20, max: 200, output: LINEAR, timescale: 'audio' },        
      })
    }
    
    Clock.seq = new Gibberish.PolySeq({
      seqs : [{
        target:Clock,
        values: [ Clock.processBeat.bind( Clock ) ],
        durations:[ 1/4 ],
      }],
      rate: Clock,
    })
    Clock.seq.connect().start()
    Clock.seq.timeModifier = Clock.time.bind( Clock )
  },
  
  addMetronome: function( metronome ) {
    this.metronome = metronome
    this.metronome.init()
  },
  
  time : function(v) {
    var timeInSamples, beat;
    
    if( v < this.maxMeasures ) {
      timeInSamples = Clock.beats( v * Clock.signature.lower )
    }else{
      timeInSamples = v
    }
        
    return timeInSamples
  },
  
  Time : function(v) {
    var timeFunction, beat;
    
    if( v < this.maxMeasures ) {
      timeFunction = Clock.Beats( v * Clock.signature.lower )
    }else{
      timeFunction = Clock.Beats( v )
    }
    
    return timeFunction
  },
  
  beats : function(val) {
    var sampleRate = typeof Gibberish.context !== 'undefined' ? Gibberish.context.sampleRate : 44100,
        samplesPerBeat = sampleRate / ( Clock.baseBPM / 60 )
        
    return samplesPerBeat * ( val * ( 4 / Clock.signature.lower ) );
  },
  
  Beats : function(val) {
    return function() {
      return Gibber.Clock.beats( val )
    }
  }
}

module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return Clock; }

})()



},{"./dollar":16,"./mappings":18,"gibberish-dsp":1}],16:[function(_dereq_,module,exports){
(function (global){
!function() {

"use strict"

var hasZepto = typeof Zepto === 'function',
    hasJQuery = typeof jQuery === 'function',
    has$ = typeof global.$ === 'object' || typeof global.$ === 'function',
    $ = null,
    hasConflict = hasZepto || hasJQuery || has$,
    isArray = Array.isArray,
    isObject = function( obj ) { return typeof obj === 'object' },
    isPlainObject = function( obj ) {
      return isObject(obj) && Object.getPrototypeOf( obj ) == Object.prototype
    }

if( !hasConflict ) {
  $ = {}
}else if( hasJQuery ) {
  $ = jQuery 
}else if( hasZepto ) {
  $ = Zepto
}else if( has$ ){
  $ = global.$
}else{
  $ = {}
}

// taken from Zepto: zeptojs.com
function extend(target, source, deep) {
  for (var key in source)
    if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
      if (isPlainObject(source[key]) && !isPlainObject(target[key]))
        target[key] = {}
      if (isArray(source[key]) && !isArray(target[key]))
        target[key] = []
      extend(target[key], source[key], deep)
    }
    else if (source[key] !== undefined) target[key] = source[key]
}

if( !hasConflict ) {
  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function( target ){
    var deep, args = Array.prototype.slice.call(arguments, 1)

    if (typeof target === 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }
  
  $.isArray = Array.isArray 
  $.isPlainObject = isPlainObject

  $.type = function( val ) {
    return typeof val
  }
}

var events = {}
$.subscribe   = function( key, fcn ) { 
  if( typeof events[ key ] === 'undefined' ) {
    events[ key ] = []
  }
  events[ key ].push( fcn )
}

$.unsubscribe = function( key, fcn ) {
  if( typeof events[ key ] !== 'undefined' ) {
    var arr = events[ key ]
    
    arr.splice( arr.indexOf( fcn ), 1 )
  }
}

$.publish = function( key, data ) {
  if( typeof events[ key ] !== 'undefined' ) {
    var arr = events[ key ]
    for( var i = 0; i < arr.length; i++ ) {
      arr[ i ]( data )
    }
  }
}

module.exports = $

}()
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],17:[function(_dereq_,module,exports){
(function() {
//"use strict" 
// can't use strict because eval is used to evaluate user code in the run method
// I should wrap this in a Function call instead...

var $ = _dereq_( './dollar' )

var Gibber = {
  Presets: {},
  GraphicsLib: {},
  Binops: {},
  scale : null,
  minNoteFrequency:50,
  started:false,
  
  export: function( target ) {
    $.extend( target, Gibber.Busses )       
    $.extend( target, Gibber.Oscillators )
    $.extend( target, Gibber.Synths )
    $.extend( target, Gibber.Percussion )
    $.extend( target, Gibber.Envelopes )
    $.extend( target, Gibber.FX )
    $.extend( target, Gibber.Seqs )    
    $.extend( target, Gibber.Samplers )
    $.extend( target, Gibber.PostProcessing )      
    $.extend( target, Gibber.Theory )
    $.extend( target, Gibber.Analysis ) 
    
    target.future = Gibber.Utilities.future
    target.solo = Gibber.Utilities.solo    
    
		target.Clock = Gibber.Clock
    target.Seq = Gibber.Seq
    target.Arp = Gibber.Arp // move Arp to sequencers?
    target.ScaleSeq = Gibber.ScaleSeq

    target.Rndi = Gibber.Utilities.Rndi
    target.Rndf = Gibber.Utilities.Rndf     
    target.rndi = Gibber.Utilities.rndi
    target.rndf = Gibber.Utilities.rndf

		target.module = Gibber.import
    Gibber.Audio.Time.export( target )
    target.sec = target.seconds
    Gibber.Audio.Binops.export( target )    
  },
  
  init: function( _options ) {                        
      if( typeof window === 'undefined' ) { // check for node.js
        window = GLOBAL // is this a good idea? makes a global window available in all files required in node
        document = GLOBAL.document = false
      }else if( typeof GLOBAL !== 'undefined' ) { // I can't remember why I put this in there...
        if( !GLOBAL.document ) document = GLOBAL.document = false
      }
      
      var options = {
        globalize: true,
        canvas: null,
        target: window
      }
      
      Gibber.Utilities.Rndi = Gibber.Audio.Rndi
      Gibber.Utilities.Rndf = Gibber.Audio.Rndf
      Gibber.Utilities.rndi = Gibber.Audio.rndi
      Gibber.Utilities.rndf = Gibber.Audio.rndf
      
      if( typeof _options === 'object' ) $.extend( options, _options )

      $.extend( Gibber.Presets, Gibber.Synths.Presets )
      $.extend( Gibber.Presets, Gibber.Percussion.Presets )
      $.extend( Gibber.Presets, Gibber.FX.Presets )
      $.extend( Gibber.Presets, Gibber.FX.Presets )
      
      $.extend( Gibber.Binops, Gibber.Audio.Binops )
      
      if( options.globalize ) Gibber.export( options.target )
      
      options.target.$ = $ // geez louise
            
      Gibber.Utilities.init()
      
      // post-processing depends on having context instantiated
      var __onstart = null
      if( Gibber.Audio.onstart ) __onstart = Gibber.Audio.onstart
      
      if( !Gibber.Audio.context ) { Gibber.Audio.context = { sampleRate:44100 } }
      
      Gibber.Audio.onstart = function() {
  			//Gibber.Esprima = window.esprima
        //Gibber.AudioPostProcessing.init()
        //Gibber.interfaceIsReady()
        
        Gibber.Clock.start( true )
                
        if( __onstart !== null ) { __onstart() }
      }
      
      Gibber.Audio.init()
      
      Gibber.Master = Gibber.Busses.Bus().connect( Gibber.Audio.out )

      if( options.globalize ) {
        options.target.Master = Gibber.Master
      }

      Gibber.Master.type = 'Bus'
      Gibber.Master.name = 'Master'

      $.extend( true, Gibber.Master, Gibber.ugen ) 
      Gibber.Master.fx.ugen = Gibber.Master
      
      Gibber.isInstrument = true// window.isInstrument // TODO: better way to do this without global?
      //Gibber.createMappingAbstractions( Master, Gibber.Busses.mappingProperties )
      
      // override so that all ugens connect to Gibber's Master bus by default
      Gibber.Audio.ugen.connect = 
        Gibber.Audio._oscillator.connect =
        Gibber.Audio._synth.connect =
        Gibber.Audio._effect.connect =
        Gibber.Audio._bus.connect =
        Gibber.connect;
        
      Gibber.Audio.defineUgenProperty = Gibber.defineUgenProperty
      
      //$script.ready('environment', function() {
        //if( !window.isInstrument ) {
        //  Gibber.Clock.addMetronome( Gibber.Environment.Metronome )
        //}
      Gibber.scale = Gibber.Theory.Scale( 'c4','Minor' )
      //})
  },
  interfaceIsReady : function() {
    if( !Gibber.started ) {
      if( typeof Gibber.Audio.context.currentTime !== 'undefined' ) {
        Gibber.started = true
        if( Gibber.isInstrument ) eval( loadFile.text )
      }
    }
  },
  Modules : {},
 	import : function( path, exportTo ) {
    var _done = null;
    console.log( 'Loading module ' + path + '...' )

    if( path.indexOf( 'http:' ) === -1 ) { 
      console.log( 'loading via post', path )
      $.post(
        Gibber.Environment.SERVER_URL + '/gibber/'+path, {},
        function( d ) {
          d = JSON.parse( d )
          eval( d.text )
          
          if( exportTo && Gibber.Modules[ path ] ) {
            $.extend( exportTo, Gibber.Modules[ path ] )
            Gibber.Modules[ path ] = exportTo
          }  
          if( Gibber.Modules[ path ] ) {
            if( Gibber.Modules[ path ].init ) {
              Gibber.Modules[ path ].init()
            }
            console.log( 'Module ' + path + ' is now loaded.' )
          }else{
            console.log( 'Publication ' + path + ' is loaded. It may not be a valid module.')
          }
          
          if( _done !== null ) { _done( Gibber.Modules[ path ] ) }

          return false;
        }
      )
    }else{
      $script.get( path, function() { 
        // can't be guaranteed a that a module will be created... 
        console.log( 'Module ' + path + ' is now loaded.' )
        if( _done !== null ) { _done() }
      })
    }
    return { done: function( fcn ) { _done =  fcn } }
 	},  
  // override for Gibber.Audio method
  defineUgenProperty : function(key, initValue, obj) {
    var isTimeProp = Gibber.Clock.timeProperties.indexOf(key) > -1,
        prop = obj.properties[key] = {
          value:  isTimeProp ? Gibber.Clock.time( initValue ) : initValue,
          binops: [],
          parent : obj,
          name : key,
        },
        mappingName = key.charAt(0).toUpperCase() + key.slice(1);
    
    Object.defineProperty(obj, key, {
      configurable: true,
      get: function() { return prop.value },
      set: function(val) { 
        if( obj[ mappingName ] && obj[ mappingName ].mapping ) {
          if( obj[ mappingName ].mapping.remove )
            obj[ mappingName ].mapping.remove( true ) // pass true to avoid setting property inside of remove method
        }

        prop.value = isTimeProp ? Gibber.Clock.time( val ) : val
        
        Gibber.Audio.dirty(obj);
      },
    });

    obj[key] = prop.value
  },
  
  // override for Gibber.Audio method
  polyInit : function(ugen) {
    ugen.mod = ugen.polyMod;
    ugen.removeMod = ugen.removePolyMod;
    
    for( var key in ugen.polyProperties ) {
      (function( _key ) {
        var value = ugen.polyProperties[ _key ],
            isTimeProp = Gibber.Clock.timeProperties.indexOf( _key ) > -1

        Object.defineProperty(ugen, _key, {
          get : function() { return value; },
          set : function( val ) { 
            for( var i = 0; i < ugen.children.length; i++ ) {
              ugen.children[ i ][ _key ] = isTimeProp ? Gibber.Clock.time( val ) : val;
            }
          },
        });
        
      })( key );
    }
  },
  
  // override for Gibber.Audio method to use master bus
  connect : function( bus, position ) {
    if( typeof bus === 'undefined' ) bus = Gibber.Master
    
    if( this.destinations.indexOf( bus ) === -1 ){
      bus.addConnection( this, 1, position )
      if( position !== 0 ) {
        this.destinations.push( bus )
      }
    }
    
    return this
  },

  log: function( msg ) { 
    //console.log( "LOG", typeof msg )
    if( typeof msg !== 'undefined' ) {
      if( typeof msg !== 'function') {
        console.log( msg )
      }else{
        console.log( 'Function' )
      }
    }
  },
  
  scriptCallbacks: [],
  
  run: function( script, pos, cm ) { // called by Gibber.Environment.Keymap.modes.javascript
		var _start = pos.start ? pos.start.line : pos.line,
				tree
    
	  try{
			tree = Gibber.Esprima.parse(script, { loc:true, range:true} )
		}catch(e) {
			console.error( "Parse error on line " + ( _start + e.lineNumber ) + " : " + e.message.split(':')[1] )
			return
		}
    
    // must wrap i with underscores to avoid confusion in the eval statement with commands that use proxy i
    for( var __i__ = 0; __i__ < tree.body.length; __i__++ ) {
      var obj = tree.body[ __i__ ],
					start = { line:_start + obj.loc.start.line - 1, ch: obj.loc.start.column },
					end   = { line:_start + obj.loc.end.line - 1, ch: obj.loc.end.column },
				  src   = cm.getRange( start, end ),
          result = null
			
			//console.log( start, end, src )
			try{
				result = eval( src )
        if( typeof result !== 'function' ) {
          log( result )
        }else{
          log( 'Function' )
        }
			}catch( e ) {
				console.error( "Error evaluating expression beginning on line " + (start.line + 1) + '\n' + e.message )
			}
      
      if( this.scriptCallbacks.length > 0 ) {
        for( var ___i___ = 0; ___i___ < this.scriptCallbacks.length; ___i___++ ) {
          this.scriptCallbacks[ ___i___ ]( obj, cm, pos, start, end, src, _start )
        }
      }
    }
  },
  
  processArguments: function(args, type) {    
    var obj
    
    if( args.length ) {
      if( typeof args[0] === 'string' && type !== 'Drums' && type !== 'XOX' ) {
        obj = Gibber.getPreset( args[0], type )
        
        if( typeof args[1] == 'object' ) {
          $.extend( obj, args[ 1 ] )
        }
        return obj
      }
      return Array.prototype.slice.call(args, 0)
    }
    
    return obj
  },
  
  processArguments2 : function(obj, args, type) {
    if( args.length ) {
      var firstArg = args[ 0 ]
    
      if( typeof firstArg === 'string' && type !== 'Drums' && type !== 'XOX' && type !== 'Shader' ) {
        preset = Gibber.getPreset( args[0], type )
      
        if( typeof args[1] === 'object' ) {
          $.extend( preset, args[ 1 ] )
        }
      
        $.extend( obj, preset )
        
        if( obj.presetInit ) obj.presetInit() 
      }else if( $.isPlainObject( firstArg ) && typeof firstArg.type === 'undefined' ) {
        $.extend( obj, firstArg )
      }else{
        var keys = Object.keys( obj.properties )
                
        if( obj.type === 'FX' ) {
          for( var i = 0; i < args.length; i++ ) { obj[ keys[ i + 1 ] ] = args[ i ] }
        }else{
          for( var i = 0; i < args.length; i++ ) { obj[ keys[ i ] ] = args[ i ] }
        }
        
      }
    }      
  },
    
  getPreset: function( presetName, ugenType ) {
    var obj = {}
    
    if( Gibber.Presets[ ugenType ] ) {
      if( Gibber.Presets[ ugenType ][ presetName ] ) {
        obj = Gibber.Presets[ ugenType ][ presetName ]
      }else{
        Gibber.log( ugenType + ' does not have a preset named ' + presetName + '.' )
      }
    }else{
      Gibber.log( ugenType + ' does not have a preset named ' + presetName + '.' )
    }
    
    return obj
  },
  
  stopAudio: function() {    
    Gibber.Audio.analysisUgens.length = 0
    Gibber.Audio.sequencers.length = 0
    
    for( var i = 0; i < Gibber.Master.inputs.length; i++ ) {
      Gibber.Master.inputs[ i ].value.disconnect()
    }
    
    Gibber.Master.inputs.length = 0
    
    Gibber.Clock.reset()
    
    Gibber.Master.fx.remove()
    
    Gibber.Master.amp = 1
    
    console.log( 'Audio stopped.')
  },
  
  clear : function() {
    this.stopAudio();
    
    if( Gibber.Graphics ) Gibber.Graphics.clear()

    Gibber.proxy( window )
		
    $.publish( '/gibber/clear', {} )
        
    console.log( 'Gibber has been cleared.' )
  },
  
  proxy: function( target ) {
		var letters = "abcdefghijklmnopqrstuvwxyz"
    
		for(var l = 0; l < letters.length; l++) {
			var lt = letters.charAt(l);
      if( typeof window[ lt ] !== 'undefined' ) { 
        delete window[ lt ] 
        delete window[ '___' + lt ]
      }

      (function() {
				var ltr = lt;
      
				Object.defineProperty( target, ltr, {
          configurable: true,
					get:function() { return target[ '___'+ltr] },
					set:function( newObj ) {
            if( newObj ) {
              if( target[ '___'+ltr ] ) { 
                if( typeof target[ '___'+ltr ].replaceWith === 'function' ) {
                  target[ '___'+ltr ].replaceWith( newObj )
                  console.log( target[ '___'+ltr ].name + ' was replaced with ' + newObj.name )
                }
              }
              target[ '___'+ltr ] = newObj
            }else{
						  if( target[ '___'+ltr ] ) {
						  	 var variable = target[ '___'+ltr ]
						  	 if( variable ) {
						  		 if( typeof variable.kill === 'function' /*&& target[ '___'+ltr ].destinations.length > 0 */) {
						  			 variable.kill();
						  		 }
						  	 }
						  }
            }
          }
        });
      })();     
    }
  },

  construct: function( constructor, args ) {
    function F() {
      return constructor.apply( this, args );
    }
    F.prototype = constructor.prototype;
    return new F();
  },
  
  createMappingObject : function(target, from) {
    var min = typeof target.min === 'function' ? target.min() : target.min,
        max = typeof target.max === 'function' ? target.max() : target.max,
        _min = typeof from.min === 'function' ? from.min() : from.min,
        _max = typeof from.max === 'function' ? from.max() : from.max
        
    if( typeof from.object === 'undefined' && from.Value) { // if using an interface object directly to map
      from = from.Value
    }
    
    if( typeof target.object[ target.Name ].mapping !== 'undefined') {
      target.object[ target.Name ].mapping.replace( from.object, from.name, from.Name )
      return
    }
    
    if( typeof from.targets !== 'undefined' ) {
      if( from.targets.indexOf( target ) === -1 ) from.targets.push( [target, target.Name] )
    }
    
    var fromTimescale = from.Name !== 'Out' ? from.timescale : 'audioOut' // check for audio Out, which is a faux property
    
    //console.log( target.timescale, fromTimescale )
    
    mapping = Gibber.mappings[ target.timescale ][ fromTimescale ]( target, from )
    
    target.object[ target.name ].toString = function() { return '> continuous mapping: ' + from.name + ' -> ' + target.name }
    
    Object.defineProperties( target.object[ target.Name ], {
      'min' : {
        configurable:true,
        get : function() { return min },
        set : function(v) { min = v;  target.object[ target.Name ].mapping.outputMin = min }
      },
      'max' : {
        configurable:true,
        get : function() { return max },
        set : function(v) { max = v; target.object[ target.Name ].mapping.outputMax = max }
      },
    })
    
    target.object[ target.Name ].mappingObjects = []
    
    Gibber.createProxyProperty( target.object[ target.Name ], 'min', 1, 0, {
      'min':min, 'max':max, output: target.output,
      timescale: target.timescale,
      dimensions:1
    })
    
    Gibber.createProxyProperty( target.object[ target.Name ], 'max', 1, 0, {
      'min':min, 'max':max, output: target.output,
      timescale: target.timescale,
      dimensions:1
    })
    
    Object.defineProperties( from.object[ from.Name ], {
      'min' : {
        configurable:true,
        get : function() { return _min },
        set : function(v) { _min = v; target.object[ target.Name ].mapping.inputMin = _min }
      },
      'max' : {
        configurable:true,
        get : function() { return _max },
        set : function(v) { _max = v; target.object[ target.Name ].mapping.inputMax = _max }
      },
    })
    
    target.object[ target.Name ].invert = function() {
      target.object[ target.Name ].mapping.invert()
    }
    
    if( typeof target.object.mappings === 'undefined' ) target.object.mappings = []
    
    target.object.mappings.push( mapping )
    
    Gibber.defineSequencedProperty( target.object[ target.Name ], 'invert' )
  },
  
  defineSequencedProperty : function( obj, key, priority ) {
    var fnc = obj[ key ], seq, seqNumber
    
    // for( var i = obj.seq.seqs.length - 1; i >= 0; i-- ) {
    //   var s = obj.seq.seqs[ i ]
    //   if( s.key === key ) {
    //     seq = s,
    //     seqNumber = i
    //     break;
    //   }
    // }
    
    if( !obj.seq ) {
      obj.seq = Gibber.Seqs.Seq({ doNotStart:true, scale:obj.scale, priority:priority })
    }
    
    fnc.seq = function( v,d ) {  

      var args = {
            key: key,
            values: $.isArray(v) || v !== null && typeof v !== 'function' && typeof v.length === 'number' ? v : [v],
            durations: $.isArray(d) ? d : typeof d !== 'undefined' ? [d] : null,
            target: obj,
            'priority': priority
          }
            
      if( typeof seq !== 'undefined' ) {
        seq.shouldStop = true
        obj.seq.seqs.splice( seqNumber, 1 )
      }
      
      obj.seq.add( args )
      
      seqNumber = obj.seq.seqs.length - 1
      seq = obj.seq.seqs[ seqNumber ]
      
      if( args.durations === null ) { obj.seq.autofire.push( seq ) }
      
      Object.defineProperties( fnc.seq, {
        values: {
          configurable:true,
          get: function() { return obj.seq.seqs[ seqNumber ].values },
          set: function(v) {
            if( !Array.isArray(v) ) {
              v = [ v ]
            }
            if( key === 'note' && obj.seq.scale ) {  
              v = makeNoteFunction( v, obj.seq )
            }
            obj.seq.seqs[ seqNumber ].values = v //.splice( 0, 10000, v )
            //Gibber.defineSequencedProperty( obj.seq.seqs[ seqNumber ].values, 'reverse' )
          }
        },
        durations: {
          configurable:true,
          get: function() { return obj.seq.seqs[ seqNumber ].durations },
          set: function(v) {
            if( !Array.isArray(v) ) {
              v = [ v ]
            }
            obj.seq.seqs[ seqNumber ].durations = v   //.splice( 0, 10000, v )
            //Gibber.defineSequencedProperty( obj.seq.seqs[ seqNumber ].durations, 'reverse' )  
          }
        },
      })
      
      //Gibber.defineSequencedProperty( obj.seq.seqs[ seqNumber ].values, 'reverse' )
      //Gibber.defineSequencedProperty( obj.seq.seqs[ seqNumber ].durations, 'reverse' )      
      
      if( !obj.seq.isRunning ) {
        obj.seq.offset = Gibber.Clock.time( obj.offset )
        obj.seq.start( true, priority )
      }
      return obj
    }
    
    fnc.seq.stop = function() { seq.shouldStop = true } 
    
    // TODO: property specific stop/start/shuffle etc. for polyseq
    fnc.seq.start = function() {
      seq.shouldStop = false
      obj.seq.timeline[0] = [ seq ]                
      obj.seq.nextTime = 0
      
      if( !obj.seq.isRunning ) { 
        obj.seq.start( false, priority )
      }
    }
  },
  
  defineRampedProperty : function( obj, _key ) {
    var fnc = obj[ _key ], key = _key.slice(1), cancel
    
    fnc.ramp = function( from, to, length ) {
      if( arguments.length < 2 ) {
        console.err( 'ramp requires at least two arguments: target and time.' )
        return
      }
      
      if( typeof length === 'undefined' ) { // if only to and length arguments
        length = to
        to = from
        from = obj[ key ]()
      }
      
      if( cancel ) cancel()
      
      if( typeof from !== 'object' ) {
        obj[ key ] = Line( from, to, length )
      }else{
        from.retrigger( to, Gibber.Clock.time( length ) )
      }
      
      cancel = future( function() {
        obj[ key ] = to
      }, length )
      
      return obj
    }
  },
  
  createProxyMethods : function( obj, methods ) {
    for( var i = 0; i < methods.length; i++ ) Gibber.defineSequencedProperty( obj, methods[ i ] ) 
  },
  
  createProxyProperty: function( obj, _key, shouldSeq, shouldRamp, dict, _useMappings, priority ) {
    var propertyName = _key,
        useMappings = _useMappings === false ? false : true,
        propertyDict = useMappings ? dict || obj.mappingProperties[ propertyName ] : null,
        __n = propertyName.charAt(0).toUpperCase() + propertyName.slice(1),
        mapping, fnc
            
    mapping = $.extend( {}, propertyDict, {
      Name  : __n,
      name  : propertyName,
      type  : 'mapping',
      value : obj[ propertyName ],
      object: obj,
      targets: [],
			oldSetter: obj.__lookupSetter__( propertyName ),
			oldGetter: obj.__lookupGetter__( propertyName ),
      oldMappingGetter: obj.__lookupGetter__( __n ),
      oldMappingSetter: obj.__lookupSetter__( __n ),          
    })
    
    if( ! obj.mappingObjects ) obj.mappingObjects = []
    // voodoo to make method act like property
    obj.mappingObjects.push( mapping )
    
    var __propertyName = useMappings ? '_' + propertyName : propertyName
    
    fnc = obj[ '_' + propertyName ] = ( function() {
      var _fnc = function(v) {
        if( typeof v !== 'undefined' ) {
          mapping.value = v
          
          if( mapping.oldSetter ) { mapping.oldSetter( mapping.value ) }
          return obj
        }
        return mapping.value
      }
      return _fnc
    })()    

    fnc.valueOf = function() { return mapping.value }
    mapping.toString = function() { return '> continuous mapping: ' + mapping.name  }
    
    if( useMappings ) {
      Object.defineProperty( obj, propertyName, {
        configurable: true,
        get: function() { return obj[ '_' + propertyName ] },
        set: function(v) { 
          if( typeof v === 'object' && v.type === 'mapping' ) {
            Gibber.createMappingObject( mapping, v )
          }else{
            if( typeof obj[ mapping.Name ].mapping !== 'undefined' ) { 
              //if( obj[ mapping.Name ].mapping.op ) obj[ mapping.Name ].mapping.op.remove()
              if( obj[ mapping.Name ].mapping.remove )
                obj[ mapping.Name ].mapping.remove( true )
            }

            obj[ '_' + propertyName ]( v ) 
          }
          return obj
        }
      })
    }else{
      ( function() { 
        var __fnc = fnc
        Object.defineProperty( obj, propertyName, {
          configurable: true,
          get: function() { return obj['_'+propertyName] },
          set: function(v) { 
            obj['_'+propertyName]( v )
            return obj
          }
        })
      })()
    }
    
    if( shouldSeq )
      Gibber.defineSequencedProperty( obj, __propertyName, priority )
    
    if( shouldRamp )
      Gibber.defineRampedProperty( obj, __propertyName )
    
    // capital letter mapping sugar
    if( useMappings ) {
      Object.defineProperty( obj, mapping.Name, {
        configurable: true,
        get : function()  {
          if( typeof mapping.oldMappingGetter === 'function' ) mapping.oldMappingGetter()
          return mapping 
        },
        set : function( v ) {
          obj[ mapping.Name ] = v
          if( typeof mapping.oldMappingSetter === 'function' ) mapping.oldMappingSetter( v )
        }
      })
    }
  },
  
  // obj, _key, shouldSeq, shouldRamp, dict, _useMappings, priority
  createProxyProperties : function( obj, mappingProperties, noSeq, noRamp ) {
    var shouldSeq = typeof noSeq === 'undefined' ? true : noSeq,
        shouldRamp = typeof noRamp === 'undefined' ? true : noRamp
    
    obj.gibber = true // keyword identifying gibber object, needed for notation parser
    
    if( !obj.seq && shouldSeq ) {
      obj.seq = Gibber.Seqs.Seq({ doNotStart:true, scale:obj.scale })      
    }
    
    obj.mappingProperties = mappingProperties
    obj.mappingObjects = []
    
    for( var key in mappingProperties ) {
      if( ! mappingProperties[ key ].doNotProxy ) {
        Gibber.createProxyProperty( obj, key, shouldSeq, shouldRamp )
      }
    }
  },  
  
  object: {
    class: null,
    text : null,
    init: function( classIdentifier ) {
      this.class = classIdentifier
      this.text = $( '.' + classIdentifier )
    },
  },
  
  ugen: {
    sequencers : [],
    mappings: [],
    fx: $.extend( [], {
      add: function() {
        var end = this.length === 0 ? this.ugen : this[ this.length - 1 ]
        
        end.disconnect()
        
        for( var i = 0; i < arguments.length; i++ ) {
          var fx = arguments[ i ]
          fx.input = end
          
          end = fx
          
          this.push( fx )
        }
        
        if( this.ugen !== Gibber.Master ) {
          end.connect()
        }else{
          end.connect( Gibber.Audio.out )
        }
                
        return this.ugen
      },
      
      remove: function() {
        if( arguments.length > 0 ) {
          for( var i = 0; i < arguments.length; i++ ) {
            var arg = arguments[ i ];
						
						if( typeof arg === 'string' ) { // if identified using the fx name
							for( var j = 0; j < this.length; j++ ) {
								if( this[ j ].name === arg ) {
									this.remove( j )
								}
							}
							continue;
						}
						
            if( typeof arg === 'number' ) { // if identified via position in fx chain
							var ugenToRemove = this[ arg ]
							ugenToRemove.disconnect()
              this.splice( arg, 1 )
							
              if( typeof this[ arg ] !== 'undefined') {
								
								// reset input for current position in chain
								var newConnectionNumber = arg - 1
								if( newConnectionNumber !== -1 ) {
									this[ arg ].input = this[ newConnectionNumber ]
								}else{
									this[ arg ].input = this.ugen
								}
								
								// reset input for next position in chain, or connect to Master bus
                if( typeof this[ arg + 1 ] !== 'undefined' ) { // if there is another fx ahead in chain...
                  this[ arg + 1 ].input = arg === 0 ? this.ugen : this[ arg ]
                }else{
                  if( this.ugen !== Gibber.Master ) {
                    this.ugen.connect( Gibber.Master )
                  }else{
                    this.ugen.connect( Gibber.Audio.out )
                  }
                }
              }else{
                if( this.length > 0 ) { // if there is an fx behind in chain
                  this[ arg - 1 ].connect( Gibber.Master )
                }else{
                  if( this.ugen !== Gibber.Master ) {
                    this.ugen.connect( Gibber.Master ) // no more fx
                  }else{
                    this.ugen.connect( Gibber.Audio.out )
                  }
                }
              }
            }
          }
        }else{ // remove all fx
          if( this.length > 0) {
            this[ this.length - 1 ].disconnect()
            if( this.ugen !== Gibber.Master ) {
              this.ugen.connect( Gibber.Master )
            }else{
              this.ugen.connect( Gibber.Audio.out )
            }
            this.ugen.codegen()
            this.length = 0
          }else{
            Gibber.log( this.ugen.name + ' does not have any fx to remove. ')
          }
        }
      },
    }),
      
    replaceWith: function( replacement ) {
      for( var i = 0; i < this.destinations.length; i++ ) {
        replacement.connect( this.destinations[i] )
      }
      
      for( var i = 0; i < this.sequencers.length; i++ ) {
        this.sequencers[ i ].target = replacement
        replacement.sequencers.push( this.sequencers[i] )
      }
      
      for( var i = 0; i < this.mappingObjects.length; i++ ) {
        var mapping = this.mappingObjects[ i ]

        if( mapping.targets.length > 0 ) {
          for( var j = 0; j < mapping.targets.length; j++ ) {
            var _mapping = mapping.targets[ j ]
            
            if( replacement.mappingProperties[ mapping.name ] ) {
              _mapping[ 0 ].mapping.replace( replacement, mapping.name, mapping.Name )
            }else{ // replacement object does not have property that was assigned to mapping
              _mapping[ 0 ].mapping.remove()
            }
          }
        }
      }
  
      this.kill()
    },

    kill: function() { 
      var end = this.fx.length !== 0 ? this.fx[ this.fx.length - 1 ] : this
      if( this.seq.isRunning ) this.seq.disconnect()
      end.disconnect()
      
      for( var i = 0; i < this.fx.length; i++ ) {
        var fx = this.fx[ i ]
        if( fx.seq.isRunning ) fx.seq.disconnect()
      }
      
      this.disconnect()
      
      for( var i = 0; i < this.mappings.length; i++ ) {
        this.mappings[ i ].remove() 
      }
      
      if( this.clearMarks ) // check required for modulators
        this.clearMarks()
      
      console.log( this.name + " has been terminated.")
    },

    play: function( notes, durations, repeat ) {
      if( this.note ) {
        this.note.seq( notes, durations )
      }else if( this.frequency ) {
        this.frequency.seq( notes, durations )
      }
      
      return this
    },

    // stop : function() {
    //   if( this.seq ) this.seq.stop()
    // },
    // start : function() {
    //   if( this.seq ) this.seq.start()
    // },
    
    fadeIn : function( _time, endLevel ) {
      if( isNaN( endLevel ) ) {
        endLevel = 1
      }

      var time = Gibber.Clock.time( _time ),
          decay = new Gibber.Audio.ExponentialDecay({ decayCoefficient:.05, length:time }),
          //ramp = Mul( Sub(1,decay), endLevel )
          line = new Gibber.Audio.Line( 0, endLevel, time )
          
      this.amp = line
      
      future( function() { this.amp = endLevel }.bind( this ), time)
      
      return this
    },
    
    fadeOut : function( _time ) {
      var time = Gibber.Clock.time( _time ),
          decay = new Gibber.Audio.ExponentialDecay({ decayCoefficient:.00005, length:time }),
          //ramp = Mul( decay, this.amp() )
          line = new Gibber.Audio.Line( this.amp(), 0, Gibber.Clock.time( time ) )
          
      this.amp = line
      
      future( function() { this.amp = 0 }.bind( this ), time )
      
      return this
    },
  }
}

Gibber.Audio =          _dereq_( 'gibberish-dsp' )
Gibber.Clock =          _dereq_( './clock' )( Gibber )
Gibber.Seqs =           _dereq_( './seq')( Gibber )
Gibber.Theory =         _dereq_( './audio/theory' )( Gibber )
Gibber.FX =             _dereq_( './audio/fx' )( Gibber )
Gibber.Oscillators =    _dereq_( './audio/oscillators' )( Gibber )
Gibber.Synths =         _dereq_( './audio/synths' )( Gibber )
Gibber.Busses =         _dereq_( './audio/bus' )( Gibber )
Gibber.Analysis =       _dereq_( './audio/analysis' )( Gibber )
Gibber.Envelopes =      _dereq_( './audio/envelopes' )( Gibber )
Gibber.Percussion =     _dereq_( './audio/drums' )( Gibber )
Gibber.Input =          _dereq_( './audio/audio_input' )( Gibber )
Gibber.Samplers =       _dereq_( './audio/sampler' )( Gibber )
Gibber.PostProcessing = _dereq_( './audio/postprocessing' )( Gibber )
Gibber.Utilities =      _dereq_( './utilities' )( Gibber )
Gibber.Arp =            _dereq_( './audio/arp' )( Gibber )

module.exports = Gibber

})()
},{"./audio/analysis":3,"./audio/arp":4,"./audio/audio_input":5,"./audio/bus":6,"./audio/drums":7,"./audio/envelopes":8,"./audio/fx":9,"./audio/oscillators":10,"./audio/postprocessing":11,"./audio/sampler":12,"./audio/synths":13,"./audio/theory":14,"./clock":15,"./dollar":16,"./seq":19,"./utilities":20,"gibberish-dsp":1}],18:[function(_dereq_,module,exports){
!function() {  
  var mappings = {
    outputCurves: {
      LINEAR:0,
      LOGARITHMIC:1
    },
    audio : {
      graphics: function( target, from ) {
				if( typeof from.object.track === 'undefined' ) from.object.track = {}
				
        var proxy = typeof from.object.track[ from.name ] !== 'undefined' ? from.object.track[ from.name ] : new Gibberish.Proxy2( from.object, from.name ),
            op    = new Gibberish.OnePole({ a0:.005, b1:.995 }),
            mapping
        
        from.object.track = proxy;

        mapping = target.object[ target.Name ].mapping = Map( proxy, target.min, target.max, from.min, from.max, target.output, from.wrap ) 
        
        op.input = mapping
        
        target.object[ target.name ] = op
        
        mapping.proxy = proxy
        mapping.op = op
        
        mapping.remove = function( doNotSet ) {
          if( !doNotSet ) {
            target.object[ target.name ] = target.object[ target.Name ].mapping.getValue()
          }
          
          delete target.object[ target.Name ].mapping
        }
        
        return mapping
      },
      interface: function( target, from ) {
        var proxy = typeof from.track !== 'undefined' ? from.track : new Gibberish.Proxy2( from.object, from.name ),
            op    = new Gibberish.OnePole({ a0:.005, b1:.995 }),
            range = target.max - target.min,
            percent = ( target.object[ target.name ] - target.min ) / range,
            widgetValue = from.min + ( ( from.max - from.min ) * percent ),
            mapping
                
        if( from.object.setValue ) from.object.setValue( widgetValue )
        
        from.track = proxy
        
        mapping = target.object[ target.Name ].mapping = Map( proxy, target.min, target.max, from.min, from.max, target.output, from.wrap ) 
        
        op.input = mapping
        target.object[ target.name ] = op
        
        mapping.proxy = proxy
        mapping.op = op

        mapping.remove = function( doNotSet ) {
          if( !doNotSet ) target.object[ target.name ] = mapping.getValue()
          
          //if( mapping.op ) mapping.op.remove()
          
          delete mapping
        }
        
        if( typeof from.object.label !== 'undefined' ) { 
          var labelString = ''
          for( var i = 0; i < from.targets.length; i++ ) {
            var __target = from.targets[ i ]
            labelString += __target[0].object.name + '.' + __target[1]
            if( i !== from.targets.length - 1 ) labelString += ' & '
          }
          from.object.label = labelString
        }
                
        mapping.replace = function( replacementObject, key, Key  ) {
          proxy.setInput( replacementObject )
          if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )
        }
        
        return mapping
      },
      audio: function( target, from ) {
        var proxy, mapping
        
        if( typeof from.object.track !== 'undefined' ) {
          proxy = from.object.track
          proxy.count++
        } else {
          proxy = new Gibberish.Proxy2( from.object, from.name )
          proxy.count = 1
        }
        from.object.track = proxy
        
        target.object[ target.name ] = Map( proxy, target.min, target.max, from.min, from.max )
        
        mapping = target.object[ target.Name ].mapping = target.object[ target.name ]() // must call getter function explicitly
        
        mapping.remove = function( doNotSet ) {
          if( !doNotSet ) {
            target.object[ target.name ] = mapping.getValue()
          }
          
          if( mapping.op ) mapping.op.remove()
          
          delete target.object[ target.Name ].mapping
        }
        
        mapping.replace = function( replacementObject, key, Key ) {
          var proxy = new Gibberish.Proxy2( replacementObject, key )
          mapping.input = proxy
          if( replacementObject[ Key ].targets && replacementObject[ Key ].targets.indexOf( target ) === -1 ) {
            replacementObject[ Key ].targets.push( [target, target.Name] )
          }
        }
        
        return mapping
      },
      audioOut : function( target, from ) {
        var mapping
        
        target.object[ target.name ] = Map( null, target.min, target.max, 0, 1, 0 )   
        mapping = target.object[ target.Name ].mapping = target.object[ target.name ]() // must call getter function explicitly
        
        if( typeof from.object.track !== 'undefined' ) {
          mapping.follow = from.object.track
          mapping.follow.count++
        } else {
          mapping.follow = new Gibberish.Follow({ input:from.object, useAbsoluteValue: true })
          mapping.follow.count = 1
        }
        from.object.track = mapping.follow
        
        mapping.input = target.object[ target.Name ].mapping.follow
        
        mapping.remove = function( doNotSet ) {
          if( !doNotSet ) {
            target.object[ target.name ] = target.object[ target.Name ].mapping.getValue()
          }
          
          if( mapping.bus )
            mapping.bus.disconnect()
          
          if( mapping.follow ) {
            mapping.follow.count--
            if( mapping.follow.count === 0) {
              delete from.object.track
              mapping.follow.remove()
            }
          }
          
          delete target.object[ target.Name ].mapping
        }
        
        mapping.replace = function( replacementObject, key, Key  ) {
          mapping.follow.input = replacementObject   
          if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )            
        }
      
        var env = mapping.follow.bufferSize
        Object.defineProperty( target.object[ target.Name ], 'env', {
          configurable:true,
          get: function() { return env },
          set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
        })
                
        return mapping
      }
    },
    graphics: {
      graphics: function( target, from ) {
        // rewrite getValue function of Map object to call Map callback and then return appropriate value
        var map = Map( from.object[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap ),
            old = map.getValue.bind( map ),
            mapping
        
        map.getValue = function() {
          //console.log( from.name, from, target.min, target.max, from.min, from.max )
          map.callback( from.object[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap )
          return old()
        }
        
        mapping = target.object[ target.Name ].mapping = map
        
        if( target.object.mod ) { // second case accomodates modding individual [0][1][2] properties fo vectors
          target.object.mod( target.name, mapping, '=' )
        }else{
          target.modObject.mod( target.modName, mapping, '=' )
        }
        
        mapping.remove = function() {
          if( target.object.mod ) {
            target.object.removeMod( target.name )
          }else{
            target.modObject.removeMod( target.modName )
          }
          target.object[ target.name ] = target.object[ target.Name ].mapping.getValue()
          
          delete target.object[ target.Name ].mapping
        }
        
        mapping.replace = function( replacementObject, key, Key  ) { mapping.input = replacementObject }
        
        return mapping
      },
      interface: function( target, from ) {
        // console.log( "FROM", from.name, target.min, target.max, from.min, from.max )
        var _map = Map( from.object[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap ),
            mapping
            
        if( typeof from.object.functions === 'undefined' ) {
          from.object.functions = {}
          from.object.onvaluechange = function() {
            for( var key in from.object.functions ) {
              from.object.functions[ key ]()
            }
          }
        }

        mapping = target.object[ target.Name ].mapping = _map

        target.mapping.from = from
        
        var fcn_name = target.name + ' <- ' + from.object.name + '.' + from.Name

        from.object.functions[ fcn_name ] = function() {
          var val = mapping.callback( from.object[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap )
          // target.object[ target.Name ].value = val
          // console.log( target.Name )
          target.object[ target.Name ].oldSetter.call( target.object[ target.Name ], val )
        }
        // from.object.onvaluechange = function() {          
        //   var val = map.callback( this[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap )
        //   target.object[ target.name ] = val
        // }
        mapping.replace = function() {
          // var old = from.functions[ target.Name ]
        } 
        
        mapping.remove  = function() {
          console.log( "mapping removed" )
          delete from.object.functions[ fcn_name ]
        } 
        
        if( from.object.setValue ) 
          from.object.setValue( target.object[ target.name ] )
        
        // if( typeof from.object.label !== 'undefined' ) {
        //   from.object.label = target.object.name + '.' + target.Name
        // }
        if( typeof from.object.label !== 'undefined' ) { 
          var labelString = ''
          for( var i = 0; i < from.targets.length; i++ ) {
            var __target = from.targets[ i ]
            labelString += __target[0].object.name + '.' + __target[1]
            if( i !== from.targets.length - 1 ) labelString += ' & '
          }
          from.object.label = labelString
        }
        
        return mapping
      },
      audio: function( target, from ) {
        var mapping
        
        mapping = target.object[ target.Name ].mapping = Map( null, target.min, target.max, from.min, from.max, target.output, from.wrap )
      
        mapping.follow = typeof from.object.track !== 'undefined' ? from.object.track : new Gibberish.Follow({ input:from.object.properties[ from.name ], useAbsoluteValue: false })
        from.object.track = target.object[ target.Name ].mapping.follow
        // assign input after Map ugen is created so that follow can be assigned to the mapping object
        mapping.input = mapping.follow
      
        mapping.bus = new Gibberish.Bus2({ amp:0 }).connect()

        mapping.connect( mapping.bus )
        
        mapping.replace = function( replacementObject, key, Key ) {
          mapping.follow.input = replacementObject            
          if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )
        }
        
        var env = mapping.follow.bufferSize
        Object.defineProperty( target.object[ target.Name ], 'env', {
          get: function() { return env },
          set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
        })
        
        if( target.object.mod ) { // second case accomodates modding individual [0][1][2] properties fo vectors
          //console.log( target.object, target.object.mod )
          target.object.mod( target.name, mapping, '=' )
        }else{
          target.modObject.mod( target.modName, mapping, '=' )
        }
        
        mapping.remove = function() {
          this.bus.disconnect()
          
          if( this.follow ) {
            this.follow.count--
            if( this.follow.count === 0) {
              delete from.object.track
              this.follow.remove()
            }
          }

          if( target.object.mod ) {
            target.object.removeMod( target.name )
          }else{
            target.modObject.removeMod( target.modName )
          }
          
          delete target.object[ target.Name ].mapping
        }
        
        return mapping
      },
      audioOut : function( target, from ) {
        console.log( target.Name, target.object )
        if( typeof target.object[ target.Name ].mapping === 'undefined') {
          console.log("MAKING A MAPPING")
          var mapping = target.object[ target.Name ].mapping = Map( null, target.min, target.max, 0, 1, 0 )   
          if( typeof from.object.track !== 'undefined' ) {
            mapping.follow = from.object.track
            mapping.follow.count++
          } else {
            mapping.follow = new Gibberish.Follow({ input:from.object })
            mapping.follow.count = 1
          }
          from.object.track = mapping.follow
          
          var env = mapping.follow.bufferSize
          Object.defineProperty( target.object[ target.Name ], 'env', {
            configurable: true,
            get: function() { return env },
            set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
          })
          
          mapping.input = mapping.follow
          mapping.bus = new Gibberish.Bus2({ amp:0 }).connect()
          mapping.connect( mapping.bus )
        
          mapping.replace = function( replacementObject, key, Key  ) {
            // _console.log( key, replacementObject )
            
            // what if new mapping isn't audio type?
            if ( replacementObject[ Key ].timescale === from.timescale ) {
              var idx = mapping.follow.input[ from.Name ].targets.indexOf( target )
              if( idx >= -1 ) {
                mapping.follow.input[ from.Name ].targets.splice( idx, 1 )
              }
            
              mapping.follow.input = replacementObject   
              if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )            
            }else{
              mapping.bus.disconnect()
              mapping.follow.remove()
              Gibber.createMappingObject( target, replacementObject )
            }
            
          }
        }else{
          console.log("REPLACING MAPPING")
          mapping.replace( from.object, from.name, from.Name )
          return mapping
        }
        
        if( target.object.mod ) { // second case accomodates modding individual [0][1][2] properties fo vectors
          //console.log( target.object, target.object.mod )
          target.object.mod( target.name, mapping, '=' )
        }else if (target.modObject) {
          target.modObject.mod( target.modName, mapping, '=' )
        }else{
          !function() {
            var _mapping = mapping
            target.object.update = function() { 
              target.object[ target.name ]( _mapping.getValue() )
            }
          }()
          //target.object.mod( target.name, mapping, '=' ) 
        }
        
        //target.object[ target.Name ].mapping = mapping
        
        mapping.remove = function() {
          this.bus.disconnect()
          
          if( this.follow ) {
            this.follow.count--
            if( this.follow.count === 0) {
              delete from.object.track
              this.follow.remove()
            }
          }

          if( target.object.mod ) {
            target.object.removeMod( target.name )
          }else if( target.modObject ) {
            target.modObject.removeMod( target.modName )
          }else{
            console.log( 'removing update ')
            //target.object.update = function() {}
          }
          
          delete target.object[ target.Name ].mapping
        }
        return mapping
      }
    },
    notation: {
      graphics: function( target, from ) {
        // rewrite getValue function of Map object to call Map callback and then return appropriate value

        var map = Map( from.object[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap ),
            old = map.getValue.bind( map ),
            mapping
        
        map.getValue = function() {
          map.callback( from.object[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap )
          return old()
        }
        
        mapping = target.object[ target.Name ].mapping = map
        
        if( target.object.mod ) { // second case accomodates modding individual [0][1][2] properties fo vectors
          target.object.mod( target.name, mapping, '=' )
        }else{
          target.modObject.mod( target.modName, mapping, '=' )
        }
        
        mapping.remove = function() {
          if( target.object.mod ) {
            target.object.removeMod( target.name )
          }else{
            target.modObject.removeMod( target.modName )
          }
          target.object[ target.name ] = target.object[ target.Name ].mapping.getValue()
          
          delete target.object[ target.Name ].mapping
        }
        
        mapping.replace = function( replacementObject, key, Key  ) { mapping.input = replacementObject }
        
        return mapping
      },
      interface: function( target, from ) {
        // console.log( "FROM", from.name, target.min, target.max, from.min, from.max )
        var _map = Map( from.object[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap ),
            mapping
            
        if( typeof from.object.functions === 'undefined' ) {
          from.object.functions = {}
          from.object.onvaluechange = function() {
            for( var key in from.object.functions ) {
              from.object.functions[ key ]()
            }
          }
        }

        mapping = target.object[ target.Name ].mapping = _map

        target.mapping.from = from
        
        var fcn_name = target.name + ' <- ' + from.object.name + '.' + from.Name

        from.object.functions[ fcn_name ] = function() {
          var val = mapping.callback( from.object[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap )
          // target.object[ target.Name ].value = val
          // console.log( target.Name )
          target.object[ target.Name ].oldSetter.call( target.object[ target.Name ], val )
        }
        // from.object.onvaluechange = function() {          
        //   var val = map.callback( this[ from.name ], target.min, target.max, from.min, from.max, target.output, from.wrap )
        //   target.object[ target.name ] = val
        // }
        mapping.replace = function() {
          // var old = from.functions[ target.Name ]
        } 
        
        mapping.remove  = function() {
          console.log( "mapping removed" )
          delete from.object.functions[ fcn_name ]
        } 
        
        if( from.object.setValue ) 
          from.object.setValue( target.object[ target.name ] )
        
        // if( typeof from.object.label !== 'undefined' ) {
        //   from.object.label = target.object.name + '.' + target.Name
        // }
        if( typeof from.object.label !== 'undefined' ) { 
          var labelString = ''
          for( var i = 0; i < from.targets.length; i++ ) {
            var __target = from.targets[ i ]
            labelString += __target[0].object.name + '.' + __target[1]
            if( i !== from.targets.length - 1 ) labelString += ' & '
          }
          from.object.label = labelString
        }
        
        return mapping
      },
      audio: function( target, from ) {
        var mapping
        
        mapping = target.object[ target.Name ].mapping = Map( null, target.min, target.max, from.min, from.max, target.output, from.wrap )
  
        if( typeof from.object.track !== 'undefined' && from.object.track.input === from.object.properties[ from.name ] ) {
          mapping.follow = from.object.track
          mapping.follow.count++
        }else{
          mapping.follow = new Gibberish.Follow({ input:from.object.properties[ from.name ], useAbsoluteValue: false })
          mapping.follow.count = 1
        }
        
        from.object.track = target.object[ target.Name ].mapping.follow
        
        // assign input after Map ugen is created so that follow can be assigned to the mapping object
        mapping.input = mapping.follow
      
        mapping.bus = new Gibberish.Bus2({ amp:0 }).connect()

        mapping.connect( mapping.bus )
        
        mapping.replace = function( replacementObject, key, Key ) {
          mapping.follow.input = replacementObject            
          if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )
        }
        
        var env = mapping.follow.bufferSize
        Object.defineProperty( target.object[ target.Name ], 'env', {
          get: function() { return env },
          set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
        })
        
        mapping.update = function() {   
          target.object[ target.name ]( mapping.getValue() )
        }
        mapping.text = target.object

        // let Notation object handle scheduling updates
        Gibber.Environment.Notation.add( mapping )
        
        mapping.remove = function() {
          this.bus.disconnect()
          
          if( this.follow ) {
            this.follow.count--
            if( this.follow.count === 0) {
              delete from.object.track
              this.follow.remove()
            }
          }
          
          Gibber.Environment.Notation.remove( mapping )
          
          delete target.object[ target.Name ].mapping
        }
        
        return mapping
      },
      audioOut : function( target, from ) {
        if( typeof target.object[ target.Name ].mapping === 'undefined') {
          var mapping = target.object[ target.Name ].mapping = Map( null, target.min, target.max, 0, 1, 0 )
          
          console.log( "MAPPING", from )
          
          if( typeof from.object.track !== 'undefined' && from.object.track.input === from.object.properties[ from.name ] ) {
            mapping.follow = from.object.track
            mapping.follow.count++
          }else{
            mapping.follow = new Gibberish.Follow({ input:from.object, useAbsoluteValue: true })
            mapping.follow.count = 1
          }
          
          from.object.track = mapping.follow
          
          var env = mapping.follow.bufferSize
          Object.defineProperty( target.object[ target.Name ], 'env', {
            configurable:true,
            get: function() { return env },
            set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
          })
          
          mapping.input = mapping.follow
          mapping.bus = new Gibberish.Bus2({ amp:0 }).connect()
          mapping.connect( mapping.bus )
        
          mapping.replace = function( replacementObject, key, Key  ) {
            // _console.log( key, replacementObject )
            
            // what if new mapping isn't audio type?
            if ( replacementObject[ Key ].timescale === from.timescale ) {
              var idx = mapping.follow.input[ from.Name ].targets.indexOf( target )
              if( idx >= -1 ) {
                mapping.follow.input[ from.Name ].targets.splice( idx, 1 )
              }
            
              mapping.follow.input = replacementObject   
              if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )            
            }else{
              mapping.bus.disconnect()
              mapping.follow.remove()
              Gibber.createMappingObject( target, replacementObject )
            }
            
          }
        }else{
          mapping.replace( from.object, from.name, from.Name )
          return mapping
        }
        
        mapping.update = function() {   
          target.object[ target.name ]( mapping.getValue() )
        }
        mapping.text = target.object

        // let Notation object handle scheduling updates
        Gibber.Environment.Notation.add( mapping )
        
        mapping.remove = function() {
          this.bus.disconnect()
          
          if( this.follow ) {
            this.follow.count--
            if( this.follow.count === 0) {
              delete from.object.track
              this.follow.remove()
            }
          }
          
          Gibber.Environment.Notation.remove( mapping )
          
          delete target.object[ target.Name ].mapping
        }
        return mapping
      }
    },
  }
  
  module.exports = mappings
}()
},{}],19:[function(_dereq_,module,exports){
!function() {
  
  //"use strict"
  
  var Gibberish = _dereq_( 'gibberish-dsp' ),
      Gibber,
      $ = _dereq_( './dollar' ),
      doNotSequence = [ 'durations', 'target', 'scale', 'offset', 'doNotStart', 'priority' ]

  var makeNoteFunction = function( notes, obj ) {
    var _note = $.extend( [], notes ),
        count = 0

    return [function() {
      var idx, freq
    
      if( typeof _note.pick === 'function' ) {
        idx =  _note[ _note.pick() ] 
      }else if( typeof _note[ count ] === 'function') {
        idx = _note[ count ]()
      }else{
        idx = _note[ count++ ]
      }
      
      if( typeof obj.scale.notes[ idx ] === 'number' ) {
        freq = obj.scale.notes[ idx ]
      }else{
        try{
          freq = obj.scale.notes[ idx ].fq()
        }catch(e) {
          console.error( "The frequency could not be obtained from the current scale. Did you specify an invalid mode or root note?")
          obj.stop()
        }
      }          
      //freq = typeof obj.scale.notes[ idx ] === 'number' ? obj.scale.notes[ idx ] : obj.scale.notes[ idx ].fq()			
      if( count >= _note.length ) count = 0
			
      return freq
    }]
  }
  
  var makeChordFunction = function( notes, obj ) {
    var _note = $.extend( [], notes ),
        count = 0

    return [function() {
      var idx, freq
    
      if( typeof _note.pick === 'function' ) {
        idx =  _note[ _note.pick() ] 
      }else if( typeof _note[ count ] === 'function') {
        idx = _note[ count ]()
      }else{
        idx = _note[ count++ ]
      }
      
      if( typeof obj.scale.notes[ idx ] === 'number' ) {
        freq = obj.scale.notes[ idx ]
      }else{
        try{
          freq = obj.scale.notes[ idx ].fq()
        }catch(e) {
          console.error( "The frequency could not be obtained from the current scale. Did you specify an invalid mode or root note?")
          obj.stop()
        }
      }          
      //freq = typeof obj.scale.notes[ idx ] === 'number' ? obj.scale.notes[ idx ] : obj.scale.notes[ idx ].fq()			
      if( count >= _note.length ) count = 0
			
      return freq
    }]
  }
  
  var Seq = function() {
    var obj = {}, seq, hasScale, keyList = []
    
    if( typeof arguments[0]  === 'object' ) {
      var arg = arguments[0],
          durationsType = typeof arg.durations,
          targetsType = typeof arg.target ,
          priority = arg.priority,
          hasScale
      
      obj.target = arg.target
      if( typeof arg.scale === 'object' ) obj.scale = arg.scale
      if( typeof arg.offset === 'number' ) obj.offset = Gibber.Clock.time( arg.offset )
      
      if( durationsType === 'array') {
        obj.durations = arg.durations
      }else if( durationsType !== 'undefined') {
        obj.durations = [ arg.durations ]
      }else{
        
      }
      
      obj.keysAndValues = {}
      obj.seqs = []
      obj.autofire = []
      
      for( var key in arg ) {
        if( doNotSequence.indexOf( key ) === -1 ) {
          var valueType = $.type( arg[ key ] )
          
          var _seq = {
            key: key,
            target: obj.target,
            durations:obj.durations
          }
          
          if( valueType === 'array' || typeof arg.length === 'number' ) {
            _seq.values = arg[ key ]
          }else if( valueType !== 'undefined' ) {
            _seq.values = [ arg[ key ] ]
          }
                    
          obj.seqs.push( _seq )
          keyList.push( key )
        }
      }
      
      if( 'scale' in obj ) {
        var noteIndex = keyList.indexOf( 'note' ),
            chordIndex = keyList.indexOf( 'chord' )
            
            //  var makeNoteFunction = function( notes, obj ) {

        if( noteIndex > -1 ) {
          obj.seqs[ noteIndex ].values = makeNoteFunction( obj.seqs[ noteIndex ].values, obj )
        }
        
        if( chordIndex > -1 ) {
          var _chord = $.extend( [], obj.seqs[ chordIndex ] ),
              count = 0
              
          obj.seqs[ chordIndex ] = [ function() {
            var idxs, chord = []
          
            if( typeof _chord.pick === 'function' ) {
              idxs =  _chord[ _chord.pick() ] 
            }else if( typeof _chord[ count ] === 'function') {
              idxs = _chord[ count ]()
            }else{
              idxs = _chord[ count++ ]
            }
            
            chord = obj.scale.chord( idxs )
          
            if ( count >= _chord.length) count = 0
          
            return chord
          }]
        }
      }  
    }else if( typeof arguments[0] === 'function' ){
      obj.seqs = [{
        key:'functions',
        values: [ arguments[ 0 ] ],
        durations: Gibber.Clock.time( arguments[ 1 ] )
      }]
      
      keyList.push('functions')
    }
      
    seq = new Gibberish.PolySeq( obj )
    seq.timeModifier = Gibber.Clock.time.bind( Gibber.Clock )
		seq.name = 'Seq'
    seq.save = {}
    
    seq.oldShuffle = seq.shuffle
    delete seq.shuffle
    
    seq.rate = Gibber.Clock
    var oldRate  = seq.__lookupSetter__( 'rate' )
    
    var _rate = seq.rate 
    Object.defineProperty( seq, 'rate', {
      get : function() { return _rate },
      set : function(v) {
        _rate = Mul( Gibber.Clock, v )
        oldRate.call( seq, _rate )
      }
    })

    var nextTime = seq.nextTime,
        oldNextTime = seq.__lookupSetter__('nextTime')
    Object.defineProperty( seq, 'nextTime', {
      get: function() { return nextTime },
      set: function(v) { nextTime = Gibber.Clock.time( v ); oldNextTime( nextTime ) }
    })
    
    var offset = seq.offset
    Object.defineProperty( seq, 'offset', {
      get: function() { return offset },
      set: function(v) { offset = v; seq.nextTime += offset }
    })
    seq.nextTime += seq.offset
    
    for( var i = 0; i < keyList.length; i++ ) {
      (function(_seq) {
        var key = keyList[ i ],
            _i  = i

        Object.defineProperty( _seq, key, {
          get: function() { return _seq.seqs[ _i ].values },
          set: function(v) {
            if( key === 'note' && _seq.scale ) {
              v = makeNoteFunction( v, _seq )
            }
            _seq.seqs[ _i ].values = v  
          }
        })
      })(seq)
    }
    
    var _durations = null
    Object.defineProperty( seq, 'durations', {
      get: function() { return _durations },
      set: function(v) {
        _durations = v
        for( var i = 0; i < seq.seqs.length; i++ ) {
          var _seq = seq.seqs[i]
          _seq.durations = _durations
        }
      }
    })
    
    if( arguments[0] && ! arguments[0].doNotStart ) {
      seq.start( true )
    }
    
    seq.toString = function() { return '> Seq' }
    seq.gibber = true
    
    return seq
  }
  
  $.extend( Gibberish.PolySeq.prototype, {
    constructor: Seq,
    replaceWith: function( replacement ) { this.kill() },
    kill: function() { 
      if( this.target && this.target.sequencers )
        this.target.sequencers.splice( this.target.sequencers.indexOf( this ), 1 )
      
      this.stop().disconnect()
    },
    applyScale : function() {
      for( var i = 0; i < this.seqs.length; i++ ) {
        var s = this.seqs[ i ]
        if( s.key === 'note' || s.key === 'frequency' ) {
          s.values = makeNoteFunction( s.values, this )
        }
      }
    },
    once : function() {
      this.repeat( 1 )
      return this
    },
    reset : function() {
      if( Object.keys( this.save ).length !== 0 ) {
        for( var key in this.save ) {
          var val = this.save[ key ]
          for( var i = 0; i < this.seqs.length; i++ ) {
            if( this.seqs[ i ].key === key ) {
              if( Array.isArray( val ) ) {
                this.seqs[ i ].values = this.save[ key ].slice(0)
              }else{
                this.seqs[ i ].values = this.save[ key ]
              }
              break;
            }
          }
        }
      }
    },
    shuffle : function() { // original Gibberish.PolySeq.shuffle is deleted in constructor after being saved
      if( Object.keys( this.save ).length === 0 ) {
        for( var i = 0; i < this.seqs.length; i++ ) {
          var val = this.seqs[ i ].values
          if( Array.isArray( val ) ) {
            this.save[ this.seqs[ i ].key ] = val.slice(0)
          }else{
            this.save[ this.seqs[ i ].key ] = val
          }
        }
      }
      
      var args = Array.prototype.slice.call( arguments, 0 )
        
      this.oldShuffle.apply( this, args )
    },
  })
  
  var ScaleSeq = function() {
    var args = arguments[0],
        scale
    
    args.root = args.root || 'c4'
    args.mode = args.mode || 'aeolian'
    
    console.log( args )
    scale = Gibber.Theory.Scale( args.root, args.mode )
    
    delete args.root; delete args.mode
    
    args.scale = scale
    
    return Seq( args )
  }
  
  var Seqs = { 'Seq': Seq, 'ScaleSeq':ScaleSeq }

  module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return Seqs }
  
}()
},{"./dollar":16,"gibberish-dsp":1}],20:[function(_dereq_,module,exports){
!function() {
"use strict"

var soloGroup = [],
    isSoloing = false,
    Gibber,
    $ = _dereq_( './dollar' ),
    Synths = { Presets: {} },
    Gibberish = _dereq_( 'gibberish-dsp' ),
    Clock = _dereq_('./clock')( Gibber ),

    Utilities = {
      seq : function() {
        var arg = arguments[0],
            type = typeof arg,
            list = [],
            output = null
    
        if( type === 'object' ) {
          if( Array.isArray( arg ) ) type = 'array'
        }
    
        // switch( type ) {
        //   case 'function':
        //     output = arg
        //     break;
        //   case 'array':
        //     for( var i = 0; i < arg.length; i++ ) {
        //       var elem = arg[ i ]
        //       if( typeof )
        //     }
        //     break;
        //   default: 
        //     output = function() { return arg }
        //     break;
        // }
    
        return output
      },
      random :  function() {
        var dict = {},
            lastChosen = null;
    
        for(var i = 0; i < arguments.length; i+=2) {
          dict[ "" + arguments[i] ] = { repeat: arguments[i+1], count: 0 };
        }

        this.pick = function() {
          var value = 0, index, lastValue;
          if(this[lastChosen]) lastValue = this[lastChosen]

          if(lastChosen !== null && dict[ lastValue ].count++ <= dict[ lastValue ].repeat) {
            index = lastChosen;
            if( dict[ lastValue ].count >= dict[ lastValue ].repeat) {
              dict[ lastValue ].count = 0;
              lastChosen = null;
            };
          }else{
            index = Utilities.rndi(0, this.length - 1);
            value = this[index];
            if( typeof dict[ ""+value ] !== 'undefined' ) {
              dict[ ""+value ].count = 1;
              lastChosen = index;
            }else{
              lastChosen = null;
            }
          }
      
        	return index; // return index, not value as required by secondary notation stuff
        };
    
        return this;
      },
  
      random2 : function() {
        var dict = {},
            lastChosen = null,
            that = this;
    
        for(var i = 0; i < arguments.length; i+=2) {
          dict[ "" + arguments[i] ] = { repeat: arguments[i+1], count: 0 };
        }

        this.pick = function() {
          var value = 0, index, lastValue;
          if(that[lastChosen]) lastValue = that[lastChosen]

          if(lastChosen !== null && dict[ lastValue ].count++ <= dict[ lastValue ].repeat) {
            index = lastChosen;
            if( dict[ lastValue ].count >= dict[ lastValue ].repeat) {
              dict[ lastValue ].count = 0;
              lastChosen = null;
            };
          }else{
            index = Utilities.rndi(0, that.length - 1);
            value = that[index];
            if( typeof dict[ ""+value ] !== 'undefined' ) {
              dict[ ""+value ].count = 1;
              lastChosen = index;
            }else{
              lastChosen = null;
            }
          }
      
        	return that[ index ]; // return index, not value as required by secondary notation stuff
        }
    
        return this.pick
      },
  
      choose: function( length ) {
        var output = null
    
        if( isNaN( length ) ) length = 1
    
        if( length !== 1 ) {
          var arr = []
    
          for( var i = 0; i < length; i++ ) {
            arr[ i ] = this[ Utilities.rndi( 0, this.length - 1 ) ]
          }
      
          output = arr
        }else{
          output = this[ Utilities.rndi( 0, this.length - 1 ) ]
        }
    
      	return output;
      },

      future : function(func, time) { 
        var __seq = new Gibberish.Sequencer({
          values:[
            function(){},
            function() {
              func();
              __seq.stop();
              __seq.disconnect();
            }
          ],
          durations:[ Gibber.Clock.time( time ) ]
        }).start()
    
        return function(){ __seq.stop(); __seq.disconnect(); }
      },
  
      shuffle : function( arr ) {
      	for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
      },
  
      solo : function( ugen ) {
        var args = Array.prototype.slice.call( arguments, 0 );
        if( ugen ) {
          if( isSoloing ) { Utilities.solo(); } // quick toggle on / off
      
          for( var j = 0; j < args.length; j++ ) { // check if user soloed ugen, but fx is actually feeding Master bus
            var arg = args[ j ]
            if( arg.fx.length > 0 ) { 
              args[j] = arg.fx[ arg.fx.length - 1 ] // get last fx in chain
            }
          }
      
          for(var i = 0; i < Master.inputs.length; i++) {
            //console.log( i, Master.inputs[i] )
            var idx = args.indexOf( Master.inputs[i].value ),
                _ugen = Master.inputs[i].value,
                name = _ugen.name
            
            if( idx === -1 ) {
              if( name !== 'polyseq' &&  name !== 'Seq' ) { // TODO: please, please, don't route seqs into master bus...
                Master.inputs[i].value = Mul( Master.inputs[i].value, 0 )
                soloGroup.push( Master.inputs[i] );
              }
            }
          }
          isSoloing = true;
        }else{
          for( var i = 0; i < soloGroup.length; i++ ) {
            soloGroup[i].value = soloGroup[i].value[0]
          }
          soloGroup.length = 0
          isSoloing = false;
        } 
      },
      fill : function( length, fnc ) {
        if( isNaN( length ) ) length = 16
        if( typeof fnc !== 'function' ) { fnc = Rndf() }
    
        fnc = fnc.bind( this )
    
        for( var i = 0; i < length; i++ ) {
          this[ i ] = fnc()
        }
    
        return this
      },
      merge : function() {
        var output = []
      	for( var i = 0; i < this.length; i++ ) {
          var arg = this[ i ]
          if( Array.isArray( arg ) ) {
            for( var j = 0; j < arg.length; j++ ) {
      				output.push( arg[ j ] )
            }
          }else{
            output.push( arg )
          }
        }
  
        return output
      },
      weight : function() {
        var weights = Array.prototype.slice.call( arguments, 0 )
        this.pick = function() {
          var returnValue = this[0],
              total = 0,
              _rnd = Utilities.rndf();
  
          for(var i = 0; i < weights.length; i++) {
            total += weights[i];
            if( _rnd < total ) { 
              returnValue = i;
              break;
            }
          }
          return returnValue;
        }
    
      	return this
      },
      gibberArray: function( arr ) {
        
      },
      init: function() {
        // window.solo = Utilities.solo
        // window.future = Utilities.future // TODO: fix global reference
        Array.prototype.random = Array.prototype.rnd = Utilities.random
        Array.prototype.weight = Utilities.weight
        Array.prototype.fill = Utilities.fill
        Array.prototype.choose = Utilities.choose
        // Array.prototype.Rnd = Utilities.random2
        Array.prototype.merge = Utilities.merge
      }  
    }

  module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return Utilities }

}()

},{"./clock":15,"./dollar":16,"gibberish-dsp":1}]},{},[17])
(17)
});