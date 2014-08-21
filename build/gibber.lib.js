(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
!function() {

// "use strict";

var Gibberish = {
  memo              : {},
  codeblock         : [],
  analysisCodeblock : [],
  analysisUgens     : [],
  dirtied           : [],
  id                : 0,
  isDirty           : false,  // whether or not callback needs to codegen'd
  out               : null,   // main output bus
  debug             : false,
  callback          : '',
  audioFiles        : {},
  sequencers        : [],
  callbackArgs      : ['input'], // names of function arguments for main audio callback
  callbackObjects   : [],        // ugen function callbacks used in main audio callback
  analysisCallbackArgs    : [],
  analysisCallbackObjects : [],
  
/**###Gibberish.createCallback : method
Perform codegen on all dirty ugens and re-create the audio callback. This method is called automatically in the default Gibberish sample loop whenever Gibberish.isDirty is true.
**/
  createCallback : function() {
    this.memo = {};
    
    this.codeblock.length = 0;
    
    this.callbackArgs.length = 0;
    this.callbackObjects.length = 0;
    this.analysisCallbackArgs.length = 0;
    
    /* generate code for dirty ugens */
    /*for(var i = 0; i < this.dirtied.length; i++) {
      this.dirtied[i].codegen();
    }*/
    this.dirtied.length = 0;
    
    this.codestring = ''
    
    this.args = ['input']
    
    this.memo = {};
    
    this.out.codegen()
    
    var codeblockStore = this.codeblock.slice(0)
    
    // we must push these here because the callback arguments are at the start of the string, 
    // but we have to wait to codegen the analysis ugens until after their targets have been codegen'd
    if(this.analysisUgens.length > 0) { 
      this.analysisCodeblock.length = 0;
      for(var i = 0; i < this.analysisUgens.length; i++) {
        this.analysisCallbackArgs.push( this.analysisUgens[i].analysisSymbol )
      }
    }
    
    this.args = this.args.concat( this.callbackArgs )
    
    this.args = this.args.concat( this.analysisCallbackArgs )

    /* concatenate code for all ugens */
    //this.memo = {};
    
    var code = ''
    for( var i = 0; i < codeblockStore.length; i++ ) {
      this.codestring += codeblockStore[i]
    }
    
    //this.codestring += codeblockStore.join('\t') //this.codeblock.join("\t");
    this.codestring += "\n\t";
    
    /* analysis codeblock */
    if(this.analysisUgens.length > 0) {
      this.analysisCodeblock.length = 0;
      for(var i = 0; i < this.analysisUgens.length; i++) {
        this.codeblock.length = 0;
        this.analysisUgens[i].analysisCodegen();
        /*
        if(this.codestring !== 'undefined' ) {
          this.codestring += this.codeblock.join("");
          this.codestring += "\n\t";
          this.analysisCodeblock.push ( this.analysisUgens[i].analysisCodegen() );
        }
        */
      }
      this.codestring += this.analysisCodeblock.join('\n\t');
      this.codestring += '\n\t';
    }
    this.codestring += 'return ' + this.out.variable +';\n';
    
    this.callbackString = this.codestring;
    if( this.debug ) console.log( this.callbackString );
    
    return [this.args, this.codestring];
  },

/**###Gibberish.audioProcess : method
The default audio callback used in Webkit browsers. This callback starts running as soon as Gibberish.init() is called.  
  
param **Audio Event** : Object. The HTML5 audio event object.
**/ 
  audioProcess : function(e){
		var bufferL = e.outputBuffer.getChannelData(0),
		    bufferR = e.outputBuffer.getChannelData(1),	
		    input = e.inputBuffer.getChannelData(0),
        me = Gibberish,
        callback = me.callback,
        sequencers = me.sequencers,
        out = Gibberish.out.callback,
        objs = me.callbackObjects.slice(0),
        callbackArgs, callbackBody, _callback, val

        objs.unshift(0)
        
		for(var i = 0, _bl = e.outputBuffer.length; i < _bl; i++){
      
      for(var j = 0; j < sequencers.length; j++) { sequencers[j].tick(); }
      
      if(me.isDirty) {
        _callback = me.createCallback();
        
        try{
          callback = me.callback = new Function( _callback[0], _callback[1] )
        }catch( e ) {
          console.error( "ERROR WITH CALLBACK : \n\n", _callback )
        }
        
        me.isDirty = false;
        objs = me.callbackObjects.slice(0)
        objs.unshift(0)
      }
      
      //console.log( "CB", callback )
      objs[0] = input[i]
      val = callback.apply( null, objs );
      
			bufferL[i] = val[0];
			bufferR[i] = val[1];      
		}
  },
/**###Gibberish.audioProcessFirefox : method
The default audio callback used in Firefox. This callback starts running as soon as Gibberish.init() is called.  
  
param **Sound Data** : Object. The buffer of audio data to be filled
**/   
  audioProcessFirefox : function(soundData) { // callback for firefox
    var me = Gibberish,
        callback = me.callback,
        sequencers = me.sequencers,
        objs = me.callbackObjects.slice(0),
        _callback
        
    objs.unshift(0)
    for (var i=0, size=soundData.length; i<size; i+=2) {
      
      for(var j = 0; j < sequencers.length; j++) { sequencers[j].tick(); }
      
      if(me.isDirty) {
        _callback = me.createCallback();
        
        try {
          callback = me.callback = new Function( _callback[0], _callback[1] )
        }catch( e ) {
          console.error( 'ERROR WITH CALLBACK : \n\n', callback )
        }
        me.isDirty = false;
        objs = me.callbackObjects.slice(0)
        objs.unshift(0)       
      }      
      
			var val = callback.apply(null, objs);
      
			soundData[i] = val[0];
      soundData[i+1] = val[1];
    }
  },
/**###Gibberish.clear : method
Remove all objects from Gibberish graph and perform codegen... kills all running sound and CPU usage.
**/   
  clear : function() {
    this.out.inputs.length = 0;
    this.analysisUgens.length = 0;
    this.sequencers.length = 0;
    
    this.callbackArgs.length = 2
    this.callbackObjects.length = 1
    
    Gibberish.dirty(this.out);
  },

/**###Gibberish.dirty : method
Tell Gibberish a ugen needs to be codegen'd and mark the entire callback as needing regeneration  
  
param **Ugen** : Object. The ugen that is 'dirtied'... that has a property value changed.
**/     
	dirty : function(ugen) {
    if(typeof ugen !== 'undefined') {
      var found = false;
      for(var i = 0; i < this.dirtied.length; i++) {
        if(this.dirtied[i].variable === ugen.variable) found = true;
      }
    
      if(!found) {
        this.isDirty = true;
        this.dirtied.push(ugen);
      }
    }else{
      this.isDirty = true;
    }
	},

/**###Gibberish.generateSymbol : method
Generate a unique symbol for a given ugen using its name and a unique id number.  
  
param **name** : String. The name of the ugen; for example, reverb, delay etc.
**/       
	generateSymbol : function(name) {
		return name + "_" + this.id++; 
	},
  
  // as taken from here: https://wiki.mozilla.org/Audio_Data_API#Standardization_Note
  // only the number of channels is changed in the audio.mozSetup() call
  
/**###Gibberish.AudioDataDestination : method
Used to generate callback for Firefox.  
  
param **sampleRate** : String. The sampleRate for the audio callback to run at. NOT THE BUFFER SIZE.  
param **readFn** : Function. The audio callback to use.
**/ 
  AudioDataDestination : function(sampleRate, readFn) { // for Firefox Audio Data API
    // Initialize the audio output.
    var audio = new Audio();
    audio.mozSetup(2, sampleRate);

    var currentWritePosition = 0;
    var prebufferSize = sampleRate / 2; // buffer 500ms
    var tail = null, tailPosition;

    // The function called with regular interval to populate 
    // the audio output buffer.
    setInterval(function() {
      var written;
      // Check if some data was not written in previous attempts.
      if(tail) {
        written = audio.mozWriteAudio(tail.subarray(tailPosition));
        currentWritePosition += written;
        tailPosition += written;
        if(tailPosition < tail.length) {
          // Not all the data was written, saving the tail...
          return; // ... and exit the function.
        }
        tail = null;
      }

      // Check if we need add some data to the audio output.
      var currentPosition = audio.mozCurrentSampleOffset();
      var available = currentPosition + prebufferSize - currentWritePosition;
      if(available > 0) {
        // Request some sound data from the callback function.
        var soundData = new Float32Array(available);
        readFn(soundData);

        // Writting the data.
        written = audio.mozWriteAudio(soundData);
        currentPosition = audio.mozCurrentSampleOffset();
        if(written < soundData.length) {
          // Not all the data was written, saving the tail.
          tail = soundData;
          tailPosition = written;
        }
        currentWritePosition += written;
      }
    }, 100);
  },
/**###Gibberish.AudioDataDestination : method
Create a callback and start it running. Note that in iOS audio callbacks can only be created in response to user events. Thus, in iOS this method assigns an event handler to the HTML body that creates the callback as soon as the body is touched; at that point the event handler is removed. 
**/   
  init : function() {
    Gibberish.out = new Gibberish.Bus2();
    Gibberish.out.codegen(); // make sure bus is first upvalue so that clearing works correctly
    Gibberish.dirty(Gibberish.out);
    
    var bufferSize = typeof arguments[0] === 'undefined' ? 1024 : arguments[0], audioContext
    
    if( typeof webkitAudioContext !== 'undefined' ) {
      audioContext = webkitAudioContext
    }else if ( typeof AudioContext !== 'undefined' ) {
      audioContext = AudioContext
    }

    // we will potentially delay start of audio until touch of screen for iOS devices
    start = function() {
      
      if( typeof audioContext !== 'undefined' ) {
        document.getElementsByTagName('body')[0].removeEventListener('touchstart', start);
        Gibberish.context = new audioContext();
        Gibberish.node = Gibberish.context.createScriptProcessor(bufferSize, 2, 2, Gibberish.context.sampleRate);	
        Gibberish.node.onaudioprocess = Gibberish.audioProcess;
        Gibberish.node.connect(Gibberish.context.destination);
    
        if('ontouchstart' in document.documentElement){ // required to start audio under iOS 6
          var mySource = Gibberish.context.createBufferSource();
          mySource.connect(Gibberish.context.destination);
          mySource.noteOn(0);
        }
      }else if( navigator.userAgent.indexOf( 'Firefox' ) === -1 ){
        Gibberish.AudioDataDestination(44100, Gibberish.audioProcessFirefox);
        Gibberish.context = { sampleRate: 44100 } // needed hack to determine samplerate in ugens
      }else{
        alert('Your browser does not support javascript audio synthesis. Please download a modern web browser that is not Internet Explorer.')
      }
      if( Gibberish.onstart ) Gibberish.onstart()
    }
    
    if('ontouchstart' in document.documentElement) {
      document.getElementsByTagName('body')[0].addEventListener('touchstart', start);
    }else{
      start();
    }
    
    return this;
  },
  
/**###Gibberish.makePanner : method
Create and return an object that can be used to pan a stereo source.
**/ 
  //   makePanner : function() {
  //   var sin = Math.sin;
  //   var cos = Math.cos;
  //   var sqrtTwoOverTwo = Math.sqrt(2) / 2;
  //     
  //   var f = function(val, pan, array) {
  //       var isObject = typeof val === 'object';
  //       var l = isObject ? val[0] : val;
  //       var r = isObject ? val[1] : val;
  //           
  //       array[0] = l * (sqrtTwoOverTwo * (cos(pan) - sin(pan)) );
  //       array[1] = r * (sqrtTwoOverTwo * (cos(pan) + sin(pan)) );
  //           
  //     return array;
  //   };
  //         
  //   return f;
  // },
  
makePanner : function() {
  // thanks to grrrwaaa for this
  // create pan curve arrays (once-only): 
	var panTableL = [], panTableR = [];
	var sqrtTwoOverTwo = Math.sqrt(2) / 2;

	for( var i = 0; i < 1024; i++ ) { 
		var pan = -1 + ( i / 1024 ) * 2;
		panTableL[i] = (sqrtTwoOverTwo * (Math.cos(pan) - Math.sin(pan)) );
		panTableR[i] = (sqrtTwoOverTwo * (Math.cos(pan) + Math.sin(pan)) );
	}

  return function(val, pan, output) {
    var isObject = typeof val === 'object',
        l = isObject ? val[0] : val,
        r = isObject ? val[1] : val,
        _index, index, frac, index2, val1, val2;
      
    _index  = ((pan + 1) * 1023) / 2
    index   = _index | 0
    frac    = _index - index;
    index   = index & 1023;
    index2  = index === 1023 ? 0 : index + 1;
    
    val1    = panTableL[index];
    val2    = panTableL[index2];
    output[0] = ( val1 + ( frac * (val2 - val1) ) ) * l;
    
    val1    = panTableR[index];
    val2    = panTableR[index2];
    output[1] = ( val1 + ( frac * (val2 - val1) ) ) * r;
    
    return output;
	}
},
  // IMPORTANT: REMEMBER THIS IS OVERRIDDEN IN GIBBER
  defineUgenProperty : function(key, initValue, obj) {
    var prop = obj.properties[key] = {
      value:  initValue,
      binops: [],
      parent : obj,
      name : key,
    };

    Object.defineProperty(obj, key, {
      configurable: true,
      get: function() { return prop.value },
      set: function(val) { 
        prop.value = val;
        Gibberish.dirty(obj);
      },
    });
  },
/**###Gibberish.polyInit : method
For ugens with polyphony, add metaprogramming that passes on property changes to the 'children' of the polyphonic object. Polyphonic ugens in Gibberish are just single instances that are routed into a shared bus, along with a few special methods for voice allocation etc.  
  
param **Ugen** : Object. The polyphonic ugen
**/ 
  polyInit : function(ugen) {
    ugen.mod = ugen.polyMod;
    ugen.removeMod = ugen.removePolyMod;
    
    ugen.voicesClear = function() {
      if( ugen.children.length > 0 ) {
        for( var i = 0; i < ugen.children.length; i++ ) {
          ugen.children[ i ].disconnect()
        }
        ugen.children.length = 0
        ugen.voiceCount = 0
      }
    }
    
    for(var key in ugen.polyProperties) {
      (function(_key) {
        var value = ugen.polyProperties[_key];
        
        Object.defineProperty(ugen, _key, {
          configurable: true,
          get : function() { return value; },
          set : function(val) { 
            value = val;
            for(var i = 0; i < ugen.children.length; i++) {
              ugen.children[i][_key] = value;
            }
          },
        });
        
      })(key);
    }
    
    var maxVoices = ugen.maxVoices
    Object.defineProperty( ugen, 'maxVoices', {
      get: function() { return maxVoices },
      set: function(v) { maxVoices = v; this.voicesClear(); this.initVoices() }
    })
  },
  
/**###Gibberish.interpolate : method
Similiar to makePanner, this method returns a function that can be used to linearly interpolate between to values. The resulting function takes an array and a floating point position index and returns a value.
**/   
	interpolate : function(arr, phase){
		var	index	  = phase | 0, // round down
        index2  = index + 1 > arr.length - 1 ? 0 : index + 1;
				frac	  = phase - index;
    				
    return arr[index] + frac * (arr[index2] - arr[index]);
	},
  
  pushUnique : function(item, array) {
		var obj = item;
		var shouldAdd = true;
    
		for(var j = 0; j < array.length; j++) {
			if(obj === array[j]) {
				shouldAdd = false;
				break;
			}
		}
    
		if(shouldAdd) {
			array.push(obj);
		}
  },
  
  export : function(key, obj) {
    for(var _key in Gibberish[key]) {
      //console.log("exporting", _key, "from", key);
      obj[_key] = Gibberish[key][_key];
    }
  },

/**###Gibberish.ugen : method
Creates a prototype object that is used by all ugens.
**/    
  ugen : function() {
    Gibberish.extend(this, {
  
/**#Ugen - Miscellaneous
The prototype object that all ugens inherit from
**/
/**###Ugen.processProperties : method
Used to assign and process arguments passed to the constructor functions of ugens.  
  
param **argumentList** : Array. A list of arguments (may be a single dictionary) passed to a ugen constructor.
**/     

      processProperties : function(args){
        if(typeof arguments[0][0] === 'object' && typeof arguments[0][0].type === 'undefined' && !Array.isArray(arguments[0][0]) && arguments[0][0].name !== 'op') {
          var dict = arguments[0][0];
          for(var key in dict) {
            if(typeof dict[key] !== 'undefined') {
              if(typeof this.properties[key] === 'object' && typeof this.properties[key].binops !== 'undefined') {
                this.properties[key].value = dict[key];
              }else{
                this[key] = dict[key];
              } 
            }
          }
        }else{
          var i = 0;
          for(var key in this.properties) {
            if(typeof this.properties[key] === 'object' && typeof this.properties[key].binops !== 'undefined') {
              if(typeof arguments[0][i] !== 'undefined'){
                this.properties[key].value = arguments[0][i++];
              }
            }else{
              if(typeof arguments[0][i] !== 'undefined') {
                this.properties[key] = arguments[0][i++];
              }
            }
          }
        }
        return this;
      },
      
      valueOf: function() {
        this.codegen()
        //console.log( "VALUEOF", this.variable )
        return this.variable
      },
/**###Ugen.codegen : method
Generates output code (as a string) used inside audio callback
**/   
      codegen : function() {
        var s = '', 
            v = null,
            initialized = false;
        
        if(Gibberish.memo[this.symbol]) {
          //console.log("MEMO" + this.symbol);
          return Gibberish.memo[this.symbol];
        }else{
          // we generate the symbol and use it to create our codeblock, but only if the ugen doesn't already have a variable assigned. 
          // since the memo is cleared every time the callback is created, we need to check to see if this exists. 
          v = this.variable ? this.variable : Gibberish.generateSymbol('v');
          Gibberish.memo[this.symbol] = v;
          this.variable = v;
        }

        s += 'var ' + v + " = " + this.symbol + "(";

        for(var key in this.properties) {
          var property = this.properties[key];
          var value = '';
          //if(this.name === "single_sample_delay") { console.log( "SSD PROP" + key ); }
          if( Array.isArray( property.value ) ) {
            if(property.value.length === 0) value = 0;  // primarily for busses
            
            for(var i = 0; i < property.value.length; i++) {
              var member = property.value[i];
              if( typeof member === 'object' ) {
            		value += member !== null ? member.valueOf() : 'null';
              }else{
                if(typeof property.value === 'function') {
                  value += property.value();
                }else{
                  value += property.value;
                }
              }
              value += i < property.value.length - 1 ? ', ' : '';
            }
            
          }else if( typeof property.value === 'object' ) {
            if( property.value !== null) {
              value = property.value.codegen ? property.value.valueOf() : property.value
            }
          }else if( property.name !== 'undefined'){
            if(typeof property.value === 'function') {
              value = property.value();
            }else{
              value = property.value;
            }
          }
          

          if(property.binops.length != 0) {
            for( var k = 0; k < property.binops.length; k++) {
              s += '(' // all leading parenthesis...
            }
            for(var j = 0; j < property.binops.length; j++) {
              var op = property.binops[j],
                  val;
                  
              if( typeof op.ugen === 'number') {
                  val = op.ugen;
              }else{
                  val = op.ugen !== null ? op.ugen.valueOf() : 'null';
              }
              
              if(op.binop === "=") {
                s = s.replace(value, "");
                s += val;
              }else if(op.binop === "++"){
                s += ' + Math.abs(' + val + ')';
              }else{
                if( j === 0) s+= value
                s += " " + op.binop + " " + val + ")";
              }
              
            }
          }else{
            s += value
          }

          s += ", ";
        }
        
        if(s.charAt(s.length - 1) === " ")
          s = s.slice(0, -2); // remove trailing spaces
      
        s += ");\n";
        
        this.codeblock = s;
        
        if( Gibberish.codeblock.indexOf( this.codeblock ) === -1 ) Gibberish.codeblock.push( this.codeblock )
        if( Gibberish.callbackArgs.indexOf( this.symbol ) === -1 && this.name !== 'op') { Gibberish.callbackArgs.push( this.symbol ) }
        if( Gibberish.callbackObjects.indexOf( this.callback ) === -1 && this.name !== 'op' ) { Gibberish.callbackObjects.push( this.callback ) }
        
        this.dirty = false;        
        
        return v;
      },

/**###Ugen.defineUgenProperty : method
Creates getters and setters for ugen properties that automatically dirty the ugen whenever the property value is changed.  
  
param **key** : String. The name of a property to add getter / setters for.  
param **value** : Any. The initival value to set the property to
**/       
      
/**###Ugen.init : method
Initialize ugen by calling defineUgenProperty for every key in the ugen's properties dictionary, generating a unique id for the ugen and various other small tasks.
**/             
      init : function() {
        if(!this.initalized) {
          this.symbol = Gibberish.generateSymbol(this.name);
          this.codeblock = null;
          this.variable = null;
        }
        
        if(typeof this.properties === 'undefined') {
          this.properties = {};
        }
        
        if(!this.initialized) {
          this.destinations = [];
          for(var key in this.properties) {
            Gibberish.defineUgenProperty(key, this.properties[key], this);
          }
        }
        
        if(arguments.length > 0 && typeof arguments[0][0] === 'object' && arguments[0][0].type === 'undefined') {
          var options = arguments[0][0];
          for(var key in options) {
            this[key] = options[key];
          }
        }
                        
        this.initialized = true;
        
        return this;
      },
/**###Ugen.mod : method
Modulate a property of a ugen on a per-sample basis.  
  
param **key** : String. The name of the property to modulate  
param **value** : Any. The object or number value to modulate the property with  
param **op** : String. Default "+". The operation to perform. Can be +,-,*,/,= or ++. ++ adds and returns the absolute value.
**/            
      mod : function(name, value, op) {
        var property = this.properties[ name ];
        var mod = { ugen:value, binop:op };
       	property.binops.push( mod );
        
        Gibberish.dirty( this );
      },
/**###Ugen.removeMod : method
Remove a modulation from a ugen.  
  
param **key** : String. The name of the property to remove the modulation from  
param **arg** : Number or Object. Optional. This determines which modulation to remove if more than one are assigned to the property. If this argument is undefined, all modulations are removed. If the argument is a number, the number represents a modulation in the order that they were applied (an array index). If the argument is an object, it removes a modulation that
is using a matching object as the modulator.
**/                  
      removeMod : function(name, arg) {
        if(typeof arg === 'undefined' ) {
          this.properties[name].binops.length = 0;
        }else if(typeof arg === 'number') {
          this.properties[name].binops.splice(arg, 1);
        }else if(typeof arg === 'object') {
          for(var i = 0, j = this.properties[name].binops.length; i < j; i++) {
            if(this.properties[name].binops[i].ugen === arg) {
              this.properties[name].binops.splice(i, 1);
            }
          }
        };
        
        Gibberish.dirty( this );
      },

/**###Ugen.polyMod : method
Applies a modulation to all children of a polyphonic ugen  
  
param **key** : String. The name of the property to modulate  
param **value** : Any. The object or number value to modulate the property with  
param **op** : String. Default "+". The operation to perform. Can be +,-,*,/,= or ++. ++ adds and returns the absolute value.
**/       
  		polyMod : function(name, modulator, type) {
  			for(var i = 0; i < this.children.length; i++) {
  				this.children[i].mod(name, modulator, type);
  			}
  			Gibberish.dirty(this);
  		},

/**###Ugen.removePolyMod : method
Removes a modulation from all children of a polyphonic ugen. The arguments  
  
param **arg** : Number or Object. Optional. This determines which modulation to remove if more than one are assigned to the property. If this argument is undefined, all modulations are removed. If the argument is a number, the number represents a modulation in the order that they were applied (an array index). If the argument is an object, it removes a modulation that
is using a matching object as the modulator.
**/       
  		removePolyMod : function() {
  			var args = Array.prototype.slice.call(arguments, 0);
        
  			if(arguments[0] !== "amp" && arguments[0] !== "pan") {
  				for(var i = 0; i < this.children.length; i++) {
  					this.children[i].removeMod.apply(this.children[i], args);
  				}
  			}else{
  				this.removeMod.apply(this, args);
  			}
        
  			Gibberish.dirty(this);
  		},
      
      smooth : function(property, amount) {
        var op = new Gibberish.OnePole();
        this.mod(property, op, "=");
      },
/**###Ugen.connect : method
Connect the output of a ugen to a bus.  
  
param **bus** : Bus ugen. Optional. The bus to connect the ugen to. If no argument is passed the ugen is connect to Gibberish.out. Gibberish.out is automatically created when Gibberish.init() is called and can be thought of as the master stereo output for Gibberish.
**/      
      connect : function(bus, position) {
        if(typeof bus === 'undefined') bus = Gibberish.out;
        
        if(this.destinations.indexOf(bus) === -1 ){
          bus.addConnection( this, 1, position );
          this.destinations.push( bus );
        }
        return this;
      },
/**###Ugen.send : method
Send an arbitrary amount of output to a bus  
  
param **bus** : Bus ugen. The bus to send the ugen to.  
param **amount** : Float. The amount of signal to send to the bus. 
**/      
      send : function(bus, amount) {
        if(this.destinations.indexOf(bus) === -1 ){
          bus.addConnection( this, amount );
          this.destinations.push( bus );
        }else{
          bus.adjustSendAmount(this, amount);
        }
        return this;
      },
/**###Ugen.disconnect : method
Disconnect a ugen from a bus (or all busses). This stops all audio and signal processing for the ugen.  
  
param **bus** : Bus ugen. Optional. The bus to disconnect the ugen from. If this argument is undefined the ugen will be disconnected from all busses.
**/      
      disconnect : function(bus, tempDisconnect ) { // tempDisconnect is used to do a short disconnect and reconnect
        var idx
        
        if( !tempDisconnect ) {
          /*if( this.children ) {
            for(var i = 0; i < this.children.length; i++) {
              this.children[i].disconnect( this )
            }
          }else if( typeof this.input === 'object' ) {
            this.input.disconnect( null, tempDisconnect )
          }*/
          
          /*var idx = Gibberish.callbackArgs.indexOf( this.symbol )
          Gibberish.callbackArgs.splice(idx, 1)
        
          idx = Gibberish.callbackObjects.indexOf( this.callback )        
          Gibberish.callbackObjects.splice(idx, 1)*/
        }
        
        if( !bus ) {
          for(var i = 0; i < this.destinations.length; i++) {
            this.destinations[i].removeConnection( this );
          }
          this.destinations = [];
        }else{
          idx = this.destinations.indexOf(bus);
          if(idx > -1) {
            this.destinations.splice(idx, 1);
          }
          bus.removeConnection( this );
        }
        
        Gibberish.dirty( this )
        return this;
      },
    });
  },
};


Array2 = function() { 
  this.length = 0;
};

Array2.prototype = [];
	
Array2.prototype.remove = function(arg, searchDeep) { // searchDeep when true removes -all- matches, when false returns first one found.
	searchDeep = typeof searchDeep === 'undefined' ? true : searchDeep;
	if(typeof arg === "undefined") { // clear all
		for(var i = 0; i < this.length; i++) {
			delete this[i];
		}
		this.length = 0;
	}else if(typeof arg === "number") {
		this.splice(arg,1);
	}else if(typeof arg === "string"){ // find named member and remove
		var removeMe = [];
		for(var i = 0; i < this.length; i++) {
			var member = this[i];
			if(member.type === arg || member.name === arg) {
				if(!searchDeep) {
					this.splice(i,1);
					return;
				}else{
					removeMe.push(i);
				}
			}
		}
		for(var i = 0; i < removeMe.length; i++) {
			this.splice( removeMe[i], 1);
		}
	}else if(typeof arg === "object") {
		var idx = this.indexOf(arg);
		while(idx > -1) {
			this.splice(idx,1);
			idx = this.indexOf(arg);
		}
	}
	if(this.parent) Gibberish.dirty(this.parent);
};
	
Array2.prototype.get = function(arg) {
	if(typeof arg === "number") {
		return this[arg];
	}else if(typeof arg === "string"){ // find named member and remove
		for(var i = 0; i < this.length; i++) {
			var member = this[i];

			if(member.name === arg) {
				return member;
			}
		}
	}else if(typeof arg === "object") {
		var idx = this.indexOf(arg);
		if(idx > -1) {
			return this[idx];
		}
	}
	return null;
};
	

Array2.prototype.replace = function(oldObj, newObj) {
	newObj.parent = this;
  newObj.input = oldObj.input;
  
	if(typeof oldObj != "number") {
		var idx = this.indexOf(oldObj);
		if(idx > -1) {
			this.splice(idx, 1, newObj);
		}
	}else{
		this.splice(oldObj, 1, newObj);
	}
	if(this.parent) Gibberish.dirty(this.parent);
};

Array2.prototype.insert = function(v, pos) {
	v.parent = this;
  this.input = this.parent;
  
	if(Array.isArray(v)) {
		for(var i = 0; i < v.length; i++) {
			this.splice(pos + i, 0, v[i]);
		}
	}else{
		this.splice(pos,0,v);
	}
	if(this.parent) Gibberish.dirty(this.parent);
};

Array2.prototype.add = function() {
	for(var i = 0; i < arguments.length; i++) {
		arguments[i].parent = this;
    arguments[i].input = this.parent;
		//console.log(this.parent, this.parent.channels);
		//if(typeof this.parent.channels === "number") {
			//console.log("CHANGING CHANNELS");
			//arguments[i].channels = this.parent.channels;
    //}
		this.push(arguments[i]);
	}
	//console.log("ADDING ::: this.parent = ", this.parent)
	if(this.parent) {  
    console.log("DIRTYING");
  	Gibberish.dirty(this.parent);
  }
		
};
	
var rnd = Math.random;
Gibberish.rndf = function(min, max, number, canRepeat) {
  canRepeat = typeof canRepeat === "undefined" ? true : canRepeat;
	if(typeof number === "undefined" && typeof min != "object") {
		if(arguments.length == 1) {
			max = arguments[0]; min = 0;
		}else if(arguments.length == 2) {
			min = arguments[0];
			max = arguments[1];
		}else{
			min = 0;
			max = 1;
		}

		var diff = max - min,
		    r = Math.random(),
		    rr = diff * r
	
		return min + rr;
	}else{
		var output = [];
		var tmp = [];
		if(typeof number === "undefined") {
			number = max || min.length;
		}
		
		for(var i = 0; i < number; i++) {
			var num;
			if(typeof arguments[0] === "object") {
				num = arguments[0][rndi(0, arguments[0].length - 1)];
			}else{
				if(canRepeat) {
					num = Gibberish.rndf(min, max);
				}else{
          num = Gibberish.rndf(min, max);
          while(tmp.indexOf(num) > -1) {
            num = Gibberish.rndf(min, max);
          }
					tmp.push(num);
				}
			}
			output.push(num);
		}
		return output;
	}
};
  
Gibberish.Rndf = function() {
  var _min, _max, quantity, random = Math.random, canRepeat;
    
  if(arguments.length === 0) {
    _min = 0; _max = 1;
  }else if(arguments.length === 1) {
    _max = arguments[0]; _min = 0;
  }else if(arguments.length === 2) {
    _min = arguments[0]; _max = arguments[1];
  }else if(arguments.length === 3) {
    _min = arguments[0]; _max = arguments[1]; quantity = arguments[2];
  }else{
    _min = arguments[0]; _max = arguments[1]; quantity = arguments[2]; canRepeat = arguments[3];
  }    
  
  return function() {
    var value, min, max, range;
    
    min = typeof _min === 'function' ? _min() : _min
    max = typeof _max === 'function' ? _max() : _max
      
    if( typeof quantity === 'undefined') {
      value = Gibberish.rndf( min, max )
    }else{
      value = Gibberish.rndf( min, max, quantity, canRepeat )
    }
    
    return value;
  }
};

Gibberish.rndi = function( min, max, number, canRepeat ) {
  var range;
    
  if(arguments.length === 0) {
    min = 0; max = 1;
  }else if(arguments.length === 1) {
    max = arguments[0]; min = 0;
  }else if( arguments.length === 2 ){
    min = arguments[0]; max = arguments[1];
  }else{
    min = arguments[0]; max = arguments[1]; number = arguments[2]; canRepeat = arguments[3];
  }    
  
  range = max - min
  if( range < number ) canRepeat = true
  
  if( typeof number === 'undefined' ) {
    range = max - min
    return Math.round( min + Math.random() * range );
  }else{
		var output = [];
		var tmp = [];
		
		for(var i = 0; i < number; i++) {
			var num;
			if(canRepeat) {
				num = Gibberish.rndi(min, max);
			}else{
				num = Gibberish.rndi(min, max);
				while(tmp.indexOf(num) > -1) {
					num = Gibberish.rndi(min, max);
				}
				tmp.push(num);
			}
			output.push(num);
		}
		return output;
  }
};

Gibberish.Rndi = function() {
  var _min, _max, quantity, random = Math.random, round = Math.round, canRepeat, range;
    
  if(arguments.length === 0) {
    _min = 0; _max = 1;
  }else if(arguments.length === 1) {
    _max = arguments[0]; _min = 0;
  }else if(arguments.length === 2) {
    _min = arguments[0]; _max = arguments[1];
  }else if(arguments.length === 3) {
    _min = arguments[0]; _max = arguments[1]; quantity = arguments[2];
  }else{
    _min = arguments[0]; _max = arguments[1]; quantity = arguments[2]; canRepeat = arguments[3];
  }  
  
  range = _max - _min
  if( typeof quantity === 'number' && range < quantity ) canRepeat = true
  
  return function() {
    var value, min, max, range;
    
    min = typeof _min === 'function' ? _min() : _min
    max = typeof _max === 'function' ? _max() : _max
    
    if( typeof quantity === 'undefined') {
      value = Gibberish.rndi( min, max )
    }else{
      value = Gibberish.rndi( min, max, quantity, canRepeat )
    }
    
    return value;
  }
};

Gibberish.extend = function(destination, source) {
    for (var property in source) {
			var keys = property.split(".");
			if(source[property] instanceof Array && source[property].length < 100) { // don't copy large array buffers
		    destination[property] = source[property].slice(0);
				if(property === "fx") {
					destination[property].parent = source[property].parent;
				}
      }else if (typeof source[property] === "object" && source[property] !== null && !(source[property] instanceof Float32Array) ) {
          destination[property] = destination[property] || {};
          arguments.callee(destination[property], source[property]);
      } else {
          destination[property] = source[property];
      }
    }
    return destination;
};
	
Function.prototype.clone=function(){
    return eval('['+this.toString()+']')[0];
};

String.prototype.format = function(i, safe, arg) {
    function format() {
        var str = this,
            len = arguments.length + 1;

        for (i = 0; i < len; arg = arguments[i++]) {
            safe = arg; //typeof arg === 'object' ? JSON.stringify(arg) : arg;
            str = str.replace(RegExp('\\{' + (i - 1) + '\\}', 'g'), safe);
        }
        return str;
    }

    format.native = String.prototype.format;

    return format;
}();

Gibberish.future = function(func, time) { 
  var seq = new Gibberish.Sequencer({
    values:[
      function(){},
      function() {
        func();
        seq.stop();
        seq.disconnect();
      }
    ],
    durations:[ time ]
  }).start()
  
  seq.cancel = function() {
    seq.stop();
    seq.disconnect();
  }
  
  return seq
}
Gibberish.Proxy = function() {
  var value = 0;
      
	Gibberish.extend(this, {
  	name: 'proxy',
    type: 'effect',
    
    properties : {},
    
    callback : function() {
      return value;
    },
  }).init();
  
  this.input = arguments[0];
  
  value = this.input.parent[ this.input.name ];
  delete this.input.parent[ this.input.name ];
    
  this.input.parent.properties[ this.input.name ].value = this;
  
  Object.defineProperty( this.input.parent, this.input.name, {
    get : function(){ return value; },
    set : function(_value) { value = _value; }
  });
  Gibberish.dirty(this.input.parent);
};
Gibberish.Proxy.prototype = new Gibberish.ugen();

Gibberish.Proxy2 = function() {
  var input = arguments[0],
      name = arguments[1],
      phase = 0
      
	Gibberish.extend( this, {
  	name: 'proxy2',
    type: 'effect',
    
    properties : { },
    
    callback : function() {
      var v = input[ name ]
      // if( phase++ % 44100 === 0 ) console.log( v, input, name)
      return Array.isArray( v ) ? ( v[0] + v[1] + v[2] ) / 3 : v
    },
  }).init();
  
  this.getInput = function() { return input }
  this.setInput = function( v ) { input = v }
  this.getName = function() { return name }
  this.setName = function( v ) { name = v }
};
Gibberish.Proxy2.prototype = new Gibberish.ugen();

Gibberish.Proxy3 = function() {
  var input = arguments[0],
      name = arguments[1],
      phase = 0
      
	Gibberish.extend( this, {
  	name: 'proxy3',
    type: 'effect',
    
    properties : { },
    
    callback : function() {
      var v = input[ name ]
      //if( phase++ % 44100 === 0 ) console.log( v, input, name)
      return v || 0
    },
  })
  
  this.init();
  
  this.codegen = function() {
    // if(Gibberish.memo[this.symbol]) {
    //   return Gibberish.memo[this.symbol];
    // }
    
    console.log(" CALLED ")
    if( ! this.variable ) this.variable = Gibberish.generateSymbol('v');
    Gibberish.callbackArgs.push( this.symbol )
    Gibberish.callbackObjects.push( this.callback )

    this.codeblock = "var " + this.variable + " = " + this.symbol + "(" + input.properties[ name ].codegen() + ");\n"
  }
  
};
Gibberish.Proxy3.prototype = new Gibberish.ugen();
Gibberish.oscillator = function() {
  this.type = 'oscillator';
  
  this.oscillatorInit = function() {
    this.fx = new Array2; 
    this.fx.parent = this;
    
    return this;
  }
};
Gibberish.oscillator.prototype = new Gibberish.ugen();
Gibberish._oscillator = new Gibberish.oscillator();

/**#Gibberish.Table - Oscillator
An wavetable oscillator.

## Example Usage##
`// fill the wavetable with random samples
Gibberish.init();  
a = new Gibberish.Table();  
var t = []  
for( var i = 0; i < 1024; i++ ) { t[ i ] = Gibberish.rndf(-1,1) }  
a.setTable( t )  
a.connect()  
`
- - - -
**/
/**###Gibberish.Table.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Table.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/

Gibberish.Wavetable = function() {
  var phase = 0,
      table = null,
      tableFreq = Gibberish.context.sampleRate / 1024,
      signHistory = 0,
      flip = 0;
  
  this.properties = {
    frequency : 440,
    amp : .25,
    sync: 0
  };
  
/**###Gibberish.Wavetable.setTable : method  
Assign an array representing one cycle of a waveform to use.  

param **table** Float32Array. Assign an array to be used as the wavetable.
**/     
  this.getTable = function() { return table; }
  this.setTable = function(_table) { table = _table; tableFreq = Gibberish.context.sampleRate / table.length }
  
  this.getTableFreq = function() { return tableFreq }
  this.setTableFreq = function( v ) { tableFreq = v;  }  
  
  this.getPhase = function()  { return phase }
  this.setPhase = function(v) { phase = v }

/**###Gibberish.Wavetable.callback : method  
Returns a single sample of output.  

param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
**/   
  this.callback = function(frequency, amp, sync) { 
    var index, frac, index2, val1, val2, sign;
            
    phase += frequency / tableFreq;
    while(phase >= 1024) phase -= 1024;  
    
    index   = phase | 0;
    frac    = phase - index;
    index   = index & 1023;
    index2  = index === 1023 ? 0 : index + 1;
    val1    = table[index];
    val2    = table[index2];
    
    // sign = typeof sync == 'number' ? sync ? sync < 0 ? -1 : 1 : isNaN(sync) ? NaN : 0 : NaN;
    // if( sign !== signHistory && sign !== 0) {
    //   flip++
    //   
    //   if( flip === 2 ){
    //     phase = 0
    //     flip = 0
    //   }
    //   //console.log( "FLIP", sign, signHistory, count, sync )
    // }
    if( sign !== 0 ) signHistory = sign
    
    return ( val1 + ( frac * (val2 - val1) ) ) * amp;
  }
}
Gibberish.Wavetable.prototype = Gibberish._oscillator;

Gibberish.Table = function( table ) {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'table';
  
  var pi_2 = Math.PI * 2
  
  if( typeof table === 'undefined' ) { 
    table = new Float32Array(1024);
    for(var i = 1024; i--;) { table[i] = Math.sin( (i / 1024) * pi_2); }
  }
  
  this.setTable( table );

  this.init();
  this.oscillatorInit();
  //this.processProperties( arguments );
}

Gibberish.asmSine = function (stdlib, foreign, heap) {
    "use asm";

    var sin = stdlib.Math.sin;
    var phase = 0.0;
    var out = new stdlib.Float32Array(heap);
    var floor = stdlib.Math.floor;
    var tableFreq = 0.0;
    
    function init() {
      var i = 1024;
      var j = 1024.0;
      var test = 0.0;
      for (;  i = (i - 1) | 0; ) {
        j = j - 1.0;
        out[i >> 2] = +(sin( +(j / 1024.0) * 6.2848));
      }  
      tableFreq = 44100.0 / 1024.0;
    }
    
    function gen(freq, amp, sr) {
      freq = +freq;
      amp = +amp;
      sr = +sr;
      
      var index = 0.0,
          index1 = 0,
          index2 = 0,
          frac = 0.0,
          val1 = 0.0,
          val2 = 0.0;
      
      phase = +(phase + freq / tableFreq);
      if(phase >= 1024.0) phase = +(phase - 1024.0);
          
      index = +floor(phase);
      frac = phase - index;
      
      index1 = (~~index);
      if((index1 | 0) == (1024 | 0)) {
        index2 = 0
      } else { 
        index2 = (index1 + 1) | 0;
      }
      
      val1 = +out[ index1 >> 2 ];
      val2 = +out[ index2 >> 2 ];
          
      return +((val1 + (frac * (val2 - val1))) * amp);
    }
    
    function get(idx) {
      idx = idx|0;
      return +out[idx >> 2];
    }

    return {
      init:init,
      gen: gen,
      get: get,
    }
};

/*
    phase += frequency / tableFreq;
    while(phase >= 1024) phase -= 1024;  
    
    index   = phase | 0;
    frac    = phase - index;
    index   = index & 1023;
    index2  = index === 1023 ? 0 : index + 1;
    val1    = table[index];
    val2    = table[index2];
        
    return ( val1 + ( frac * (val2 - val1) ) ) * amp;
*/





/*function gen (freq, amp, sr) {
    freq = +freq;
    amp  = +amp;
    sr = +sr;
    
    phase = +(phase + +(+(freq / sr) * 3.14159 * 2.0));
    
    return +(+sin(phase) * amp);
}*/
//var pi_2 = (3.14159 * 2.0);


Gibberish.asmSine2 = function () {    
    this.properties = { frequency:440.0, amp:.5, sr: Gibberish.context.sampleRate }
    this.name = 'sine'
    var buf = new ArrayBuffer(4096);
    var asm = Gibberish.asmSine(window, null, buf);
    asm.init();
    
    this.getTable = function() { return buf; }
    this.get = asm.get;
    this.callback = asm.gen;
    this.init();
    this.oscillatorInit();
    this.processProperties( arguments );
    
    return  this;
}
Gibberish.asmSine2.prototype = Gibberish._oscillator;
/**#Gibberish.Sine - Oscillator
A sinewave calculated on a per-sample basis.

## Example Usage##
`// make a sine wave  
Gibberish.init();  
a = new Gibberish.Sine().connect();`
- - - -
**/
/**###Gibberish.Sine.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Sine.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/

Gibberish.Sine = function() {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'sine';
  
  var pi_2 = Math.PI * 2, 
      table = new Float32Array(1024);
      
  for(var i = 1024; i--;) { table[i] = Math.sin( (i / 1024) * pi_2); }
  
  this.setTable( table );

  this.init( arguments );
  this.oscillatorInit();
  this.processProperties( arguments );
};

/**#Gibberish.Sine2 - Oscillator
A sinewave calculated on a per-sample basis that can be panned.

## Example Usage##
`// make a sine wave  
Gibberish.init();  
a = new Gibberish.Sine2(880, .5, -.25).connect();`
- - - -
**/
/**###Gibberish.Sine2.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Sine2.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.Sine2.pan : property  
Number. -1..1. The position of the sinewave in the stereo spectrum
**/
Gibberish.Sine2 = function() {
  this.__proto__ = new Gibberish.Sine();
  this.name = "sine2";
    
  var sine = this.__proto__.callback,
      panner = Gibberish.makePanner(),
      output = [0,0];

/**###Gibberish.Sine2.callback : method  
Returns a stereo sample of output as an array.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
param **pan** Number. The position in the stereo spectrum of the signal.
**/  
  this.callback = function(frequency, amp, pan) {
    var out = sine(frequency, amp);
    output = panner(out, pan, output);
    return output;
  }

  this.init();
  this.oscillatorInit();
  Gibberish.defineUgenProperty('pan', 0, this);
  this.processProperties(arguments);  
};

Gibberish.Square = function() {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'square';
  
  var pi_2 = Math.PI * 2, 
      table = new Float32Array(1024);
      
  for(var i = 1024; i--;) { 
    table[i] = i / 1024 > .5 ? 1 : -1;
  }
  
  this.setTable( table );

  this.init( arguments );
  this.oscillatorInit();
  this.processProperties( arguments );
};

/**#Gibberish.Saw - Oscillator
A non-bandlimited saw wave calculated on a per-sample basis.

## Example Usage##
`// make a saw wave  
Gibberish.init();  
a = new Gibberish.Saw(330, .4).connect();`
- - - -
**/
/**###Gibberish.Saw.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Saw.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
Gibberish.Saw = function() {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'saw';
  
  var table = new Float32Array(1024);
      
  for(var i = 1024; i--;) { table[i] = (((i / 1024) / 2 + 0.25) % 0.5 - 0.25) * 4; }
  
  this.setTable( table );

  this.init( arguments );
  this.oscillatorInit();
  this.processProperties( arguments );
};

/**#Gibberish.Saw2 - Oscillator
A stereo, non-bandlimited saw wave calculated on a per-sample basis.

## Example Usage##
`// make a saw wave  
Gibberish.init();  
a = new Gibberish.Saw2(330, .4).connect();`
- - - -
**/
/**###Gibberish.Saw.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Saw.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
Gibberish.Saw2 = function() {
  this.__proto__ = new Gibberish.Saw();
  this.name = "saw2";
  
  var saw = this.__proto__.callback,
      panner = Gibberish.makePanner(),
      output = [0,0];

/**###Gibberish.Saw2.callback : method  
Returns a stereo sample of output as an array.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
param **pan** Number. The position in the stereo spectrum of the signal.
**/    
  this.callback = function(frequency, amp, pan) {
    var out = saw(frequency, amp);
    output = panner(out, pan, output);
    return output;
  };

  this.init();
  Gibberish.defineUgenProperty('pan', 0, this);
  
};

/**#Gibberish.Triangle - Oscillator
A triangle calculated on a per-sample basis.

## Example Usage##
`// make a triangle wave  
Gibberish.init();  
a = new Gibberish.Triangle({frequency:570, amp:.35}).connect();`
- - - -
**/
/**###Gibberish.Triangle.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Triangle.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/

Gibberish.Triangle = function() {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'triangle';
  
  var table = new Float32Array(1024),
      abs = Math.abs;
      
  for(var i = 1024; i--;) { table[i] = 1 - 4 * abs(( (i / 1024) + 0.25) % 1 - 0.5); }
  
  this.setTable( table );

  this.init( arguments );
  this.oscillatorInit();
  this.processProperties( arguments );
};

/**#Gibberish.Triangle2 - Oscillator
A triangle calculated on a per-sample basis that can be panned.

## Example Usage##
`Gibberish.init();  
a = new Gibberish.Triangle2(880, .5, -.25).connect();`
- - - -
**/
/**###Gibberish.Triangle2.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Triangle2.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.Triangle2.pan : property  
Number. -1..1. The position of the triangle wave in the stereo spectrum
**/
 
Gibberish.Triangle2 = function() {
  this.__proto__ = new Gibberish.Triangle();
  this.name = "triangle2";
    
  var triangle = this.__proto__.callback,
      panner = Gibberish.makePanner(),
      output = [0,0];

/**###Gibberish.Triangle2.callback : method  
Returns a stereo sample of output as an array.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
param **pan** Number. The position in the stereo spectrum of the signal.
**/    
  this.callback = function(frequency, amp, pan) {
    var out = triangle(frequency, amp);
    return panner(out, pan, output);
  };

  this.init();
  this.oscillatorInit();
  Gibberish.defineUgenProperty('pan', 0, this);
  this.processProperties(arguments);
};

/**#Gibberish.Saw3 - Oscillator
A bandlimited saw wave created using FM feedback, see http://scp.web.elte.hu/papers/synthesis1.pdf.  
  
## Example Usage##
`// make a saw wave  
Gibberish.init();  
a = new Gibberish.Saw3(330, .4).connect();`
- - - -
**/
/**###Gibberish.Saw3.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Saw3.amp : property  
Number. A linear value specifying relative ampltiude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/

Gibberish.Saw3 = function() {
  var osc = 0,
      phase = 0,
      a0 = 2.5,
      a1 = -1.5,
      history = 0,
      sin = Math.sin,
      scale = 11;
      pi_2 = Math.PI * 2,
      flip = 0,
      signHistory = 0,
      ignore = false,
      sr = Gibberish.context.sampleRate;
      
  Gibberish.extend(this, {
    name: 'saw',
    properties : {
      frequency: 440,
      amp: .15,
      sync:0,
      sr: Gibberish.context.sampleRate,
    },
/**###Gibberish.Saw3.callback : method  
Returns a single sample of output.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
**/    
    callback : function(frequency, amp, sync) {
      var w = frequency / sr,
          n = .5 - w,
          scaling = scale * n * n * n * n,
          DC = .376 - w * .752,
          norm = 1 - 2 * w,
          out = 0,
          sign;
          
      phase += w;
      phase -= phase > 1 ? 2 : 0;
      
      osc = (osc + sin(pi_2 * (phase + osc * scaling))) * .5;
      out = a0 * osc + a1 * history;
      history = osc;
      out += DC;
      out *= norm;

      // sign = typeof sync == 'number' ? sync ? sync < 0 ? -1 : 1 : isNaN(sync) ? NaN : 0 : NaN;
      // if( sign !== signHistory && sign !== 0) {
      //   flip++
      //   
      //   if( flip === 2 ){
      //     phase = 0
      //     flip = 0
      //   }
      //   //console.log( "FLIP", sign, signHistory, count, sync )
      // }
      // if( sign !== 0 ) signHistory = sign
      
      return out;
    }
  });
  
  /*
    .1 : 1 1
    0  : 0 1   // ignored
  -.1  : -1 1  // flip
  -.2  : -1 -1 
  */
  
  Object.defineProperty(this, 'scale', {
    get : function() { return scale; },
    set : function(val) { scale = val; }
  });
  
  this.init();
  this.oscillatorInit();
  this.processProperties(arguments);
}
Gibberish.Saw3.prototype = Gibberish._oscillator;

/**#Gibberish.PWM - Oscillator
A bandlimited pulsewidth modulation wave created using FM feedback, see http://scp.web.elte.hu/papers/synthesis1.pdf.
  
## Example Usage##
`// make a pwm wave  
Gibberish.init();  
a = new Gibberish.PWM(330, .4, .9).connect();`
- - - -
**/
/**###Gibberish.PWM.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.PWM.amp : property  
Number. A linear value specifying relative ampltiude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.PWM.pulsewidth : property  
Number. 0..1. The width of the waveform's duty cycle.
**/
Gibberish.PWM = function() {
  var osc = 0,
      osc2= 0,
      _osc= 0,
      _osc2=0,
      phase = 0,
      a0 = 2.5,
      a1 = -1.5,
      history = 0,
      sin = Math.sin,
      scale = 11;
      pi_2 = Math.PI * 2,
      test = 0,
      sr = Gibberish.context.sampleRate;

  Gibberish.extend(this, {
    name: 'pwm',
    properties : {
      frequency: 440,
      amp: .15,
      pulsewidth: .05,
      sr: Gibberish.context.sampleRate,
    },
/**###Gibberish.PWM.callback : method  
Returns a single sample of output.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
param **pulsewidth** Number. The duty cycle of the waveform
**/    
    callback : function(frequency, amp, pulsewidth) {
      var w = frequency / sr,
          n = .5 - w,
          scaling = scale * n * n * n * n,
          DC = .376 - w * .752,
          norm = 1 - 2 * w,
          out = 0;
          
      phase += w;
      phase -= phase > 1 ? 2 : 0;
      
      osc = (osc  + sin( pi_2 * (phase + osc  * scaling ) ) ) * .5;
      osc2 =(osc2 + sin( pi_2 * (phase + osc2 * scaling + pulsewidth) ) ) * .5;
      out = osc2 - osc;
      
      out = a0 * out + a1 * (_osc - _osc2);
      _osc = osc;
      _osc2 = osc2;

      return out * norm * amp;
    },
  });
  
  Object.defineProperty(this, 'scale', {
    get : function() { return scale; },
    set : function(val) { scale = val; }
  });
  
  this.init();
  this.oscillatorInit();
  this.processProperties(arguments);  
};
Gibberish.PWM.prototype = Gibberish._oscillator;

/**#Gibberish.Noise - Oscillator
A white noise oscillator

## Example Usage##
`// make some noise
Gibberish.init();  
a = new Gibberish.Noise(.4).connect();`
- - - -
**/
/**###Gibberish.Noise.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
Gibberish.Noise = function() {
  var rnd = Math.random;
  
  Gibberish.extend(this, {
    name:'noise',
    properties: {
      amp:1,
    },
    
    callback : function(amp){ 
      return (rnd() * 2 - 1) * amp;
    },
  });
  
  this.init();
  this.oscillatorInit();
  this.processProperties(arguments);  
};
Gibberish.Noise.prototype = Gibberish._oscillator;
// this file is dependent on oscillators.js

/**#Gibberish.KarplusStrong - Physical Model
A plucked-string model.  
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.KarplusStrong({ damping:.6 }).connect();  
a.note(440);
`
- - - -
**/
/**###Gibberish.KarplusStrong.blend : property  
Number. 0..1. The likelihood that the sign of any given sample will be flipped. A value of 1 means there is no chance, a value of 0 means each samples sign will be flipped. This introduces noise into the model which can be used for various effects.
**/
/**###Gibberish.KarplusStrong.damping : property  
Number. 0..1. Higher amounts of damping shorten the decay of the sound generated by each note.
**/
/**###Gibberish.KarplusStrong.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.KarplusStrong.channels : property  
Number. Default 2. If two channels, the signal may be panned.
**/
/**###Gibberish.KarplusStrong.pan : property  
Number. Default 0. The position in the stereo spectrum for the sound, from -1..1.
**/
Gibberish.KarplusStrong = function() {
  var phase   = 0,
      buffer  = [0],
      last    = 0,
      rnd     = Math.random,
      panner  = Gibberish.makePanner(),
      sr      = Gibberish.context.sampleRate,
      out     = [0,0];
      
  Gibberish.extend(this, {
    name:"karplus_strong",
    frequency : 0,
    properties: { blend:1, damping:0, amp:1, channels:2, pan:0  },
  
    note : function(frequency) {
      var _size = Math.floor(sr / frequency);
      buffer.length = 0;
    
      for(var i = 0; i < _size; i++) {
        buffer[i] = rnd() * 2 - 1; // white noise
      }
      
      this.frequency = frequency;
    },

    callback : function(blend, damping, amp, channels, pan) { 
      var val = buffer.shift();
      var rndValue = (rnd() > blend) ? -1 : 1;
				
  	  damping = damping > 0 ? damping : 0;
				
      var value = rndValue * (val + last) * (.5 - damping / 100);

      last = value;

      buffer.push(value);
				
      value *= amp;
      return channels === 1 ? value : panner(value, pan, out);
    },
  })
  .init()
  .oscillatorInit()
  .processProperties(arguments);
};
Gibberish.KarplusStrong.prototype = Gibberish._oscillator;

Gibberish.PolyKarplusStrong = function() {
  this.__proto__ = new Gibberish.Bus2();
  
  Gibberish.extend(this, {
    name:     "poly_karplus_strong",
    maxVoices:    5,
    voiceCount:   0,
    _frequency: 0,
    
    polyProperties : {
  		blend:			1,
      damping:    0,
    },

    note : function(_frequency, amp) {
      var synth = this.children[this.voiceCount++];
      if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
      synth.note(_frequency, amp);
      this._frequency = _frequency;
    },
    initVoices: function() {
      for(var i = 0; i < this.maxVoices; i++) {
        var props = {
          blend:   this.blend,
          damping: this.damping,
          channels: 2,
          amp:      1,
        };
        var synth = new Gibberish.KarplusStrong(props).connect(this);

        this.children.push(synth);
      }
    }
  });
  
  this.amp = 1 / this.maxVoices;
  this.children = [];
  
  if(typeof arguments[0] === 'object') {
    this.maxVoices = arguments[0].maxVoices ? arguments[0].maxVoices : this.maxVoices
  }
  
  Gibberish.polyInit(this);
  this.initVoices()
  
  this.processProperties(arguments);
  
  this.initialized = false
  Gibberish._synth.oscillatorInit.call(this);
  Gibberish.dirty( this )
};
/**#Gibberish.Bus - Miscellaneous
Create a mono routing bus. A bus callback routes all it's inputs and scales them by the amplitude of the bus.  
  
For a stereo routing bus, see [Bus2](javascript:displayDocs('Gibberish.Bus2'\))

##Example Usage##    
`a = new Gibberish.Bus();  
b = new Gibberish.Sine(440).connect(a);  
c = new Gibberish.Sine(880).connect(a);  
a.amp = .1;  
a.connect();`
  
## Constructor     
**param** *properties*: Object. A dictionary of property values (see below) to set for the bus on initialization.
**/
/**###Gibberish.Bus.amp : property  
Array. Read-only. Relative volume for the sum of all ugens connected to the bus.
**/
Gibberish.bus = function(){
  this.type = 'bus';
  
  this.inputCodegen = function() {
    //console.log( this, this.value, this.value.valueOf() )
    var val = this.value.valueOf();
    var str;
    
    /*if( this.value.name === 'Drums' ) {
      str = '[ ' + val + '[0] * ' + this.amp + ', ' + val + '[1] * ' + this.amp + ']'  // works!
    }else{
      str = this.amp === 1 ? val : val + ' * ' + this.amp;
    }*/
      
    str = val + ', ' + this.amp 
    this.codeblock = str;
    return str;
  };

  this.addConnection = function() {
    var position = arguments[2]
    var arg = { 
      value:	      arguments[0], 
      amp:		      arguments[1], 
      codegen:      this.inputCodegen,
      valueOf:      function() { return this.codegen() }
    };
    
    if( typeof position !== 'undefined' ) {
      this.inputs.splice( position,0,arg );
    }else{
      this.inputs.push( arg );
    }

    Gibberish.dirty( this );
  };
  
  this.removeConnection = function(ugen) {
    for(var i = 0; i < this.inputs.length; i++) {
      if(this.inputs[i].value === ugen) {
        this.inputs.splice(i,1);
        Gibberish.dirty(this);
        break;
      }
    }
  };
  
  this.adjustSendAmount = function(ugen, amp) {
    for(var i = 0; i < this.inputs.length; i++) {
      if(this.inputs[i].value === ugen) {
        this.inputs[i].amp = amp;
        Gibberish.dirty(this);
        break;
      }
    }
  };
  
  this.callback = function() {
    var amp = arguments[arguments.length - 2]; // use arguments to accommodate arbitray number of inputs without using array
    var pan = arguments[arguments.length - 1];
    
    output[0] = output[1] = 0;
    
    for(var i = 0; i < arguments.length - 2; i+=2) {
      var isObject = typeof arguments[i] === 'object',
          _amp = arguments[i + 1]
          
      output[0] += isObject ? arguments[i][0] * _amp :arguments[i] * _amp;
      output[1] += isObject ? arguments[i][1] * _amp: arguments[i] * _amp;
    }
    
    output[0] *= amp;
    output[1] *= amp;
    
    return panner(output, pan, output);
  };
};

Gibberish.bus.prototype = new Gibberish.ugen();
Gibberish._bus = new Gibberish.bus();

Gibberish.Bus = function() {
  Gibberish.extend(this, {
    name : 'bus',
        
    properties : {
      inputs :  [],
      amp :     1,
    },

    callback : function() {
      var out = 0;
      var length = arguments.length - 1;
      var amp = arguments[length]; // use arguments to accommodate arbitray number of inputs without using array
      
      for(var i = 0; i < length; i++) {
        out += arguments[i];
      }
      out *= amp;
      
      return out;
    },
  });

  this.init();
  this.processProperties(arguments);
  
  return this;
};
Gibberish.Bus.prototype = Gibberish._bus;

/**#Gibberish.Bus2 - Miscellaneous
Create a stereo outing bus. A bus callback routes all it's inputs and scales them by the amplitude of the bus.

##Example Usage##    
`a = new Gibberish.Bus2();  
b = new Gibberish.Sine(440).connect(a);  
c = new Gibberish.Sine(880).connect(a);  
  
d = new Gibberish.Sequencer({ target:a, key:'pan', values:[-.75,.75], durations:[ 22050 ] }).start();
a.connect();`
  
## Constructor     
**param** *properties*: Object. A dictionary of property values (see below) to set for the bus on initialization.
**/
/**###Gibberish.Bus.amp : property  
Array. Read-only. Relative volume for the sum of all ugens connected to the bus.
**/
Gibberish.Bus2 = function() {
  this.name = 'bus2';
  this.type = 'bus';
  
  this.properties = {
    inputs :  [],
    amp :     1,
    pan :     0,
  };
  
  var output = [0,0],
      panner = Gibberish.makePanner(),
      phase = 0;
  
  this.callback = function() {
    // use arguments to accommodate arbitray number of inputs without using array    
    var args = arguments,
        length = args.length,
        amp = args[length - 2], 
        pan = args[length - 1]
    
    output[0] = output[1] = 0;
    
    //if(phase++ % 44100 === 0) console.log(args)
    for(var i = 0, l = length - 2; i < l; i+= 2) {
      var isObject = typeof args[i] === 'object',
          _amp = args[i + 1]
          
      output[0] += isObject ? args[i][0] * _amp || 0 : args[i] * _amp || 0;
      output[1] += isObject ? args[i][1] * _amp || 0 : args[i] * _amp || 0;
    }
    
    output[0] *= amp;
    output[1] *= amp;
    
    return panner(output, pan, output);
  };
  
  this.show = function() { console.log(output, args) }
  this.getOutput = function() { return output }
  this.getArgs = function() { return args }
  
  //this.initialized = false;
  this.init( arguments );
  this.processProperties( arguments );
};
Gibberish.Bus2.prototype = Gibberish._bus;
Gibberish.envelope = function() {
    this.type = 'envelope';
};
Gibberish.envelope.prototype = new Gibberish.ugen();
Gibberish._envelope = new Gibberish.envelope();

Gibberish.ExponentialDecay = function(){
	var pow = Math.pow,
      value = 0,
      phase = 0;
      
  Gibberish.extend(this, {
  	name:"ExponentialDecay",
  	properties: { decay:.5, length:11050 },

  	callback: function( decay, length ) {
  		value = pow( decay, phase );
  		phase += 1 / length;

  		return value;
  	},
    
    trigger : function() {
      phase = typeof arguments[0] === 'number' ? arguments[0] : 0;
    },
  })
  .init()
};
Gibberish.ExponentialDecay.prototype = Gibberish._envelope;

Gibberish.Line = function(start, end, time, loops) {
	var that = { 
		name:		'line',

    properties : {
  		start:	start || 0,
  		end:		isNaN(end) ? 1 : end,
  		time:		time || Gibberish.context.sampleRate,
  		loops:	loops || false,
    },
    
    retrigger: function( end, time ) {
      phase = 0;
      this.start = out
      this.end = end
      this.time = time
      
      incr = (end - out) / time
    }
	};

	var phase = 0,
	    incr = (end - start) / time,
      out
  
	this.callback = function(start, end, time, loops) {
		out = phase < time ? start + ( phase++ * incr) : end;
				
		phase = (out >= end && loops) ? 0 : phase;
		
		return out;
	};
  
  Gibberish.extend(this, that);
  this.init();

  return this;
};
Gibberish.Line.prototype = Gibberish._envelope;

Gibberish.AD = function(_attack, _decay) {
  var phase = 0,
      state = 0;
      
  Gibberish.extend( this,{
    name : "AD",
  	properties : {
      attack :	_attack || 10000,
  	  decay  :	_decay  || 10000,
    },

  	run : function() {
  		state = 0;
      phase = 0;
  		return this;			
    },
  	callback : function(attack,decay) {
  		attack = attack < 0 ? 22050 : attack;
  		decay  = decay  < 0 ? 22050 : decay;				
  		if(state === 0){
  			var incr = 1 / attack;
  			phase += incr;
  			if(phase >=1) {
  				state++;
  			}
  		}else if(state === 1){
  			var incr = 1 / decay;
  			phase -= incr;
  			if(phase <= 0) {
  				phase = 0;
  				state++;;
  			}			
  		}
  		return phase;
    },
    getState : function() { return state; },
  })
  .init()
  .processProperties(arguments);
};
Gibberish.AD.prototype = Gibberish._envelope;

Gibberish.ADSR = function(attack, decay, sustain, release, attackLevel, sustainLevel, requireReleaseTrigger) {
	var that = { 
    name:   "adsr",
		type:		"envelope",
    'requireReleaseTrigger' : typeof requireReleaseTrigger !== 'undefined' ? requireReleaseTrigger : false,
    
    properties: {
  		attack:		isNaN(attack) ? 10000 : attack,
  		decay:		isNaN(decay) ? 10000 : decay,
  		sustain: 	isNaN(sustain) ? 22050 : sustain,
  		release:	isNaN(release) ? 10000 : release,
  		attackLevel:  attackLevel || 1,
  		sustainLevel: sustainLevel || .5,
      releaseTrigger: 0,
    },

		run: function() {
			this.setPhase(0);
			this.setState(0);
		},
    stop : function() {
      this.releaseTrigger = 1
    }
	};
	Gibberish.extend(this, that);
	
	var phase = 0,
	    state = 0,
      rt  = 0,
      obj = this;
      
  this.callback = function(attack,decay,sustain,release,attackLevel,sustainLevel,releaseTrigger) {
		var val = 0;
    rt = rt === 1 ? 1 : releaseTrigger;
		if(state === 0){
			val = phase / attack * attackLevel;
			if(++phase / attack === 1) {
				state++;
				phase = decay;
			}
		}else if(state === 1) {
			val = phase / decay * (attackLevel - sustainLevel) + sustainLevel;
			if(--phase <= 0) {
				if(sustain !== null){
					state += 1;
					phase = sustain;
				}else{
					state += 2;
					phase = release;
				}
			}
		}else if(state === 2) {
			val = sustainLevel;
      if( obj.requireReleaseTrigger && rt ){
        state++;
        phase = release;
        obj.releaseTrigger = 0;
        rt = 0;
      }else if(phase-- === 0 && !obj.requireReleaseTrigger) {
				state++;
				phase = release;
			}
		}else if(state === 3) {
      phase--;
			val = (phase / release) * sustainLevel;
			if(phase <= 0) {
        state++;
      }
		}
		return val;
	};
  this.call = function() {
    return this.callback( this.attack, this.decay, this.sustain, this.release, this.attackLevel, this.sustainLevel, this.releaseTrigger )
  };
	this.setPhase = function(newPhase) { phase = newPhase; };
	this.setState = function(newState) { state = newState; phase = 0; };
	this.getState = function() { return state; };		
	
  this.init();
  
	return this;
};
Gibberish.ADSR.prototype = Gibberish._envelope;

Gibberish.ADR = function(attack, decay, release, attackLevel, releaseLevel) {
	var that = { 
    name:   "adr",
		type:		"envelope",
    
    properties: {
  		attack:		isNaN(attack) ? 11025 : attack,
  		decay:		isNaN(decay) ? 11025 : decay,
  		release:	isNaN(release) ? 22050 : release,
  		attackLevel:  attackLevel || 1,
  		releaseLevel: releaseLevel || .2,
    },

		run: function() {
			this.setPhase(0);
			this.setState(0);
		},
	};
	Gibberish.extend(this, that);
	
	var phase = 0;
	var state = 0;
  
	this.callback = function(attack,decay,release,attackLevel,releaseLevel) {
		var val = 0;
		if(state === 0){
			val = phase / attack * attackLevel;
			if(++phase / attack === 1) {
				state++;
				phase = decay;
			}
		}else if(state === 1) {
			val = (phase / decay) * (attackLevel - releaseLevel) + releaseLevel;
			if(--phase <= 0) {
					state += 1;
					phase = release;
			}
		}else if(state === 2){
      phase--;
      
			val = (phase / release) * releaseLevel;
			if(phase <= 0) {
        state++;
      }
		}
		return val;
	};
	this.setPhase = function(newPhase) { phase = newPhase; };
	this.setState = function(newState) { state = newState; phase = 0; };
	this.getState = function() { return state; };		
	
  this.init();
  
	return this;
};
Gibberish.ADR.prototype = Gibberish._envelope;
/*
Analysis ugens have two callbacks, one to perform the analysis and one to output the results.
This allows the analysis to occur at the end of the callback while the outback can occur at
the beginning, in effect using a single sample delay.

Because of the two callbacks, there are also two codegen methods. The default codegens used by
the analysis prototype object should be fine for most applications.
*/

Gibberish.analysis = function() {
  this.type = 'analysis';
  
  this.codegen = function() {
    if(Gibberish.memo[this.symbol]) {
      return Gibberish.memo[this.symbol];
    }else{
      var v = this.variable ? this.variable : Gibberish.generateSymbol('v');
      Gibberish.memo[this.symbol] = v;
      this.variable = v;
      Gibberish.callbackArgs.push( this.symbol )
      Gibberish.callbackObjects.push( this.callback )
    }
        
    this.codeblock = "var " + this.variable + " = " + this.symbol + "();\n";
    
    if( Gibberish.codeblock.indexOf( this.codeblock ) === -1 ) Gibberish.codeblock.push( this.codeblock )
    return this.variable;
  }
  
  this.analysisCodegen = function() {
    // TODO: can this be memoized somehow?
    //if(Gibberish.memo[this.analysisSymbol]) {
    //  return Gibberish.memo[this.analysisSymbol];
    //}else{
    // Gibberish.memo[this.symbol] = v;
    // console.log( this.input )
    
    var input = 0;
    if(this.input.codegen){
      input = this.input.codegen()
      //console.log( "PROPERTY UGEN", input)
      if(input.indexOf('op') > -1) console.log("ANALYSIS BUG")
    }else if( this.input.value ){
      input = typeof this.input.value.codegen !== 'undefined' ? this.input.value.codegen() : this.input.value
    }else{
      input = 'null'
    }
    
    var s = this.analysisSymbol + "(" + input + ",";
    for(var key in this.properties) {
      if(key !== 'input') {
        s += this[key] + ",";
      }
    }
    s = s.slice(0, -1); // remove trailing comma
    s += ");";
  
    this.analysisCodeblock = s;
    
    if( Gibberish.analysisCodeblock.indexOf( this.analysisCodeblock ) === -1 ) Gibberish.analysisCodeblock.push( this.analysisCodeblock )
    
    if( Gibberish.callbackObjects.indexOf( this.analysisCallback) === -1 ) Gibberish.callbackObjects.push( this.analysisCallback )
    
    //console.log( this.analysisCallback )
        
    return s;
  };
  
  this.remove = function() {
    Gibberish.analysisUgens.splice( Gibberish.analysisUgens.indexOf( this ), 1 )
  }
  
  this.analysisInit = function() {
    this.analysisSymbol = Gibberish.generateSymbol(this.name);
    Gibberish.analysisUgens.push( this );
    Gibberish.dirty(); // dirty in case analysis is not connected to graph, 
  };
  
};
Gibberish.analysis.prototype = new Gibberish.ugen();
Gibberish._analysis = new Gibberish.analysis();

Gibberish.Follow = function() {
  this.name = 'follow';
    
  this.properties = {
    input : 0,
    bufferSize : 4410,
    mult : 1,
    useAbsoluteValue:true // for amplitude following, false for other values
  };
    
  var abs = Math.abs,
      history = [0],
      sum = 0,
      index = 0,
      value = 0,
      phase = 0;
      
  this.analysisCallback = function(input, bufferSize, mult, useAbsoluteValue ) {
    if( typeof input === 'object' ) input = input[0] + input[1]
    
  	sum += useAbsoluteValue ? abs(input) : input;
  	sum -= history[index];
    
  	history[index] = useAbsoluteValue ? abs(input) : input;
    
  	index = (index + 1) % bufferSize;
			
    // if history[index] isn't defined set it to 0 
    // TODO: does this really need to happen here? I guess there were clicks on initialization...
    history[index] = history[index] ? history[index] : 0;
  	value = (sum / bufferSize) * mult;
  };
    
  this.callback = this.getValue = function() { return value; };
    
  this.init();
  this.analysisInit();
  this.processProperties( arguments );
  
  var oldBufferSize = this.__lookupSetter__( 'bufferSize' ),
      bs = this.bufferSize
      
  Object.defineProperty( this, 'bufferSize', {
    get: function() { return bs },
    set: function(v) { bs = v; sum = 0; history = [0]; index = 0; }
  })
};
Gibberish.Follow.prototype = Gibberish._analysis;

Gibberish.SingleSampleDelay = function() {
  this.name = 'single_sample_delay';
  
  this.properties = {
    input : arguments[0] || 0,
    amp   : arguments[1] || 1,
  };
  
  var value = 0,
      phase = 0;
  
  this.analysisCallback = function(input, amp) {
    /*if(typeof input === 'object') {
      value = typeof input === 'object' ? [input[0] * amp, input[1] * amp ] : input * amp;
    }else{
      value = input * amp;
    }*/
    value = input
    //if(phase++ % 44100 === 0) console.log(value, input, amp)
  };
  
  this.callback = function() {
    //if(phase % 44100 === 0) console.log(value)
    
    return value;
  };
  
  this.getValue = function() { return value }
  this.init();
  this.analysisInit();
  this.processProperties( arguments );
  
};
Gibberish.SingleSampleDelay.prototype = Gibberish._analysis;

Gibberish.Record = function(_input, _size, oncomplete) {
  var buffer      = new Float32Array(_size),
      phase       = 0,
      isRecording = false,
      self        = this;

  Gibberish.extend(this, {
    name: 'record',
    'oncomplete' :  oncomplete,
    
    properties: {
      input:   0,
      size:    _size || 0,
    },
    
    analysisCallback : function(input, length) {
      if(isRecording) {
        buffer[phase++] = typeof input === 'object' ? input[0] + input[1] : input;
        
        if(phase >= length) {
          isRecording = false;
          self.remove();
        }
      }
    },
    
    record : function() {
      phase = 0;
      isRecording = true;
      return this;
    },
    
    getBuffer : function() { return buffer; },
    getPhase : function() { return phase; },
    
    remove : function() {
      if(typeof this.oncomplete !== 'undefined') this.oncomplete();
      
      for(var i = 0; i < Gibberish.analysisUgens.length; i++) {
        var ugen = Gibberish.analysisUgens[i];
        if(ugen === this) {
          if( Gibberish.callbackArgs.indexOf( this.analysisSymbol) > -1 ) {
            Gibberish.callbackArgs.splice( Gibberish.callbackArgs.indexOf( this.analysisSymbol), 1 )
          }
          if( Gibberish.callbackObjects.indexOf( this.analysisCallback ) > -1 ) {
            Gibberish.callbackObjects.splice( Gibberish.callbackObjects.indexOf( this.analysisCallback ), 1 )
          }
          Gibberish.analysisUgens.splice(i, 1);
          return;
        }
      }
    },
  });
  // cannot be assigned within extend call
  this.properties.input = _input;

  this.init();
  this.analysisInit();
  
  Gibberish.dirty(); // ugen is not attached to anything else
};
Gibberish.Record.prototype = Gibberish._analysis;
Gibberish.effect = function() {
    this.type = 'effect';
};
Gibberish.effect.prototype = new Gibberish.ugen();
Gibberish._effect = new Gibberish.effect();

/**#Gibberish.Distortion - FX
A simple waveshaping distortion that adaptively scales its gain based on the amount of distortion applied.
  
## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Distortion({ input:a, amount:30 }).connect();  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Distortion.amount : property  
Number. The amount of distortion to apply. This number cannot be set lower than 2.
**/
Gibberish.Distortion = function() {
  var abs = Math.abs, 
      log = Math.log, 
      ln2 = Math.LN2;
  
  Gibberish.extend(this, {
    name : 'distortion',
    
    properties : {
      input  : 0,
      amount : 50,
    },
    
    callback : function(input, amount) {
      var x;
      amount = amount > 2 ? amount : 2;
      if(typeof input === 'number') {
    		x = input * amount;
    		input = (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide
      }else{
        x = input[0] * amount;
        input[0] = (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide
        x = input[1] * amount;
        input[1] = (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide      
      }
  		return input;
    },
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Distortion.prototype = Gibberish._effect;

/**#Gibberish.Delay - FX
A simple echo effect.
  
## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Delay({ input:a, time:22050, feedback:.35 }).connect();  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Delay.time : property  
Number. The delay time as measured in samples
**/
/**###Gibberish.Delay.feedback : property  
Number. The amount of feedback that the delay puts into its buffers.
**/
Gibberish.Delay = function() {
  var buffers = [],
      phase = 0;
  
  buffers.push( new Float32Array(Gibberish.context.sampleRate * 2) );
  buffers.push( new Float32Array(Gibberish.context.sampleRate * 2) );
  
  Gibberish.extend(this, {
  	name:"delay",
  	properties:{ input:0, time: 22050, feedback: .5, wet:1, dry:1 },
				
  	callback : function(sample, time, feedback, wet, dry) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		var _phase = phase++ % 88200;
      
  		var delayPos = (_phase + (time | 0)) % 88200;
      if(channels === 1) {
  			buffers[0][delayPos] =  ( sample + buffers[0][_phase] ) * feedback;
        sample = (sample * dry) + (buffers[0][_phase] * wet);
      }else{
  			buffers[0][delayPos] =  (sample[0] + buffers[0][_phase]) * feedback;
        sample[0] = (sample[0] * dry) + (buffers[0][_phase] * wet);
  			buffers[1][delayPos] =  (sample[1] + buffers[1][_phase]) * feedback;
        sample[1] = (sample[1] * dry) + (buffers[1][_phase] * wet);
      }
      
  		return sample;
  	},
  });
  
  var time = Math.round( this.properties.time );
  Object.defineProperty(this, 'time', {
    configurable: true,
    get: function() { return time; },
    set: function(v) { time = Math.round(v); Gibberish.dirty( this ) }
  });
  
  this.init();
  this.processProperties(arguments);
  
};
Gibberish.Delay.prototype = Gibberish._effect;

/**#Gibberish.Decimator - FX
A bit-crusher / sample rate reducer. Adapted from code / comments at http://musicdsp.org/showArchiveComment.php?ArchiveID=124

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Decimator({ input:a, bitDepth:4.2, sampleRate:.33 }).connect();  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Decimator.bitDepth : property  
Float. 0..16. The number of bits the signal is truncated to. May be a floating point number.
**/
/**###Gibberish.Decimator.sampleRate : property  
Number. 0..1. The sample rate to use where 0 is 0 Hz and 1 is nyquist.
**/
Gibberish.Decimator = function() {
  var counter = 0,
      hold = [],
      pow = Math.pow,
      floor = Math.floor;
      
  Gibberish.extend(this, {
  	name:"decimator",
  	properties:{ input:0, bitDepth: 16, sampleRate: 1 },
				
  	callback : function(sample, depth, rate) {
  		counter += rate;
      var channels = typeof sample === 'number' ? 1 : 2;
      
      if(channels === 1) {
  			if(counter >= 1) {
  				var bitMult = pow( depth, 2.0 );
  				hold[0]  = floor( sample * bitMult ) / bitMult;
  				counter -= 1;
  			}
  			sample = hold[0];
      }else{
  			if(counter >= 1) {
  				var bitMult = pow( depth, 2.0 );
  				hold[0]  = floor( sample[0] * bitMult ) / bitMult;
  				hold[1]  = floor( sample[1] * bitMult ) / bitMult;          
  				counter -= 1;
  			}
  			sample = hold;
      }
					
  		return sample;
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Decimator.prototype = Gibberish._effect;

/**#Gibberish.RingModulation - FX
The name says it all. This ugen also has a mix property to control the ratio of wet to dry output.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.RingModulation({ input:a, frequency:1000, amp:.4, mix:1 }).connect();  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.RingModulation.frequency : property  
Float. The frequency of the ring modulation modulator wave.
**/
/**###Gibberish.RingModulation.amp : property  
Float. The amplitude of the ring modulation modulator wave.
**/
/**###Gibberish.RingModulation.mix : property  
Float. 0..1. The wet/dry output ratio. A value of 1 means a completely wet signal, a value of 0 means completely dry.
**/
Gibberish.RingModulation = function() {
  var sin = new Gibberish.Sine().callback,
      output = [0,0];
      
  Gibberish.extend( this, { 
  	name : "ringmod",
  
	  properties : { input:0, frequency:440, amp:.5, mix:.5 },

    callback : function(sample, frequency, amp, mix) {
      var channels = typeof sample === 'number' ? 1 : 2;
      var output1 = channels === 1 ? sample : sample[0];
      
      var mod = sin(frequency, amp);
      
      output1 = output1 * (1-mix) + (output1 * mod) * mix;
      
      if(channels === 2) {
        var output2 = sample[1];
        output2 = output2 * (1-mix) + (output2 * mod) * mix;

        output[0] = output1;
        output[1] = output2;
        return output;
      }
      
		  return output1; // return mono
  	},
  })
  .init()
  .processProperties(arguments); 
};
Gibberish.RingModulation.prototype = Gibberish._effect;


/**#Gibberish.DCBlock - FX
A one-pole filter for removing bias.

## Example Usage##
` `  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.DCBlock.input : property  
Float. The input ugen to remove bias from.
**/

Gibberish.DCBlock = function() {
  var x1 = 0, y1 = 0

	Gibberish.extend(this, {
  	name: 'dcblock',
    type: 'effect',
    
    properties : {
      input : 0, 
    },
    
    reset : function() {
      x1 = 0;
      y1 = 0;
    },
    
    callback : function(input) {
      var y = input - x1 + y1 * .9997
      x1 = input
      y1 = y
    
      return y;
    }
  })
  .init()
  .processProperties(arguments);
};
Gibberish.DCBlock.prototype = Gibberish._effect;

/**#Gibberish.Tremolo - FX
A basic amplitude modulation effect.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.Tremolo({input:a, frequency:4, amp:1});   
a.note(880);   
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Tremolo.input : property  
Float. The input to apply the tremolo effect to
**/
/**###Gibberish.Tremolo.frequency : property  
Float. The speed of the tremolo effect, measured in Hz
**/
/**###Gibberish.Tremolo.amp : property  
Float. The magnitude of the tremolo effect.
**/

Gibberish.Tremolo = function() {
  var modulationCallback = new Gibberish.Sine().callback
  
	Gibberish.extend(this, {
  	name: 'tremolo',
    type: 'effect',
    
    properties : {
      input : 0,
      frequency:2.5,
      amp:.5,
    },
  
    callback : function( input, frequency, amp ) {
      var channels = typeof input === 'number' ? 1 : 2,
          modAmount = modulationCallback( frequency, amp )
      
      if(channels === 1) {
        input *= modAmount
      }else{
        input[0] *= modAmount
        input[1] *= modAmount
      }
      
      return input;
    }
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Tremolo.prototype = Gibberish._effect;

/**#Gibberish.OnePole - FX
A one-pole filter for smoothing property values. This is particularly useful when the properties are being controlled interactively. You use the smooth method to apply the filter.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.OnePole({input:a.properties.frequency, a0:.0001, b1:.9999});  
b.smooth('frequency', a);  
a.note(880);  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.OnePole.input : property  
Float. The property to smooth. You should always refer to this property through the properties dictionary of the ugen. In general it is much easier to use the smooth method of the OnePole than to set this property manually.
**/
/**###Gibberish.OnePole.a0 : property  
Float. The value the input is multiplied by.
**/
/**###Gibberish.OnePole.b1 : property  
Float. The value this pole of the filter is multiplied by.
**/
Gibberish.OnePole = function() {
  var history = 0,
      phase = 0;
      
	Gibberish.extend(this, {
  	name: 'onepole',
    type: 'effect',
    
    properties : {
      input : 0,
      a0 : .15,           
      b1 : .85, 
    },
    
    callback : function(input, a0, b1) {
      var out = input * a0 + history * b1;
      history = out;
    
      return out;
    },

/**###Gibberish.OnePole.smooth : method  
Use this to apply the filter to a property of an object.

param **propertyName** String. The name of the property to smooth.  
param **object** Object. The object containing the property to be smoothed
**/    
    smooth : function(property, obj) {
      this.input = obj[ property ]
      history = this.input
      obj[ property ] = this
      
      this.obj = obj
      this.property = property
      
      this.oldSetter = obj.__lookupSetter__( property )
      this.oldGetter = obj.__lookupGetter__( property )
      
      var op = this
      Object.defineProperty( obj, property, {
        get : function() { return op.input },
        set : function(v) { 
          op.input = v
        }
      })
    },

/**###Gibberish.OnePole.remove : method  
Remove OnePole from assigned ugen property. This will effectively remove the filter from the graph and return the normal target ugen property behavior.
**/      
    remove : function() {
      Object.defineProperty( this.obj, this.property, {
        get: this.oldGetter,
        set: this.oldSetter
      })
      
      this.obj[ this.property ] = this.input
    }
  })
  .init()
  .processProperties(arguments);
};
Gibberish.OnePole.prototype = Gibberish._effect;

/**#Gibberish.Filter24 - FX
A four pole ladder filter. Adapted from Arif Ove Karlsne's 24dB ladder approximation: http://musicdsp.org/showArchiveComment.php?ArchiveID=141.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Filter24({input:a, cutoff:.2, resonance:4}).connect();  
a.note(1760);   
a.note(440);  
a.isLowPass = false;  
a.note(220);  
a.note(1760);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Filter24.input : property  
Object. The ugen that should feed the filter.
**/
/**###Gibberish.Filter24.cutoff : property  
Number. 0..1. The cutoff frequency for the synth's filter.
**/
/**###Gibberish.Filter24.resonance : property  
Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.
**/
/**###Gibberish.Filter24.isLowPass : property  
Boolean. Default true. Whether to use a low-pass or high-pass filter.
**/
Gibberish.Filter24 = function() {
  var poles  = [0,0,0,0],
      poles2 = [0,0,0,0],
      output = [0,0],
      phase  = 0,
      _cutoff = isNaN(arguments[0]) ? .1 : arguments[0],
      _resonance = isNaN(arguments[1]) ? 3 : arguments[1]
      _isLowPass = typeof arguments[2] !== 'undefined' ? arguments[2] : true;
      
  Gibberish.extend( this, { 
  	name : "filter24",
  
	  properties : { input:0, cutoff:_cutoff, resonance:_resonance, isLowPass:_isLowPass },

    callback : function(sample, cutoff, resonance, isLowPass) {
      var channels = typeof sample === 'number' ? 1 : 2;
      var output1 = channels === 1 ? sample : sample[0];
      
			var rezz = poles[3] * resonance; 
			rezz = rezz > 1 ? 1 : rezz;
						
			cutoff = cutoff < 0 ? 0 : cutoff;
			cutoff = cutoff > 1 ? 1 : cutoff;
						
			output1 -= rezz;

			poles[0] = poles[0] + ((-poles[0] + output1) * cutoff);
			poles[1] = poles[1] + ((-poles[1] + poles[0])  * cutoff);
			poles[2] = poles[2] + ((-poles[2] + poles[1])  * cutoff);
			poles[3] = poles[3] + ((-poles[3] + poles[2])  * cutoff);

			output1 = isLowPass ? poles[3] : output1 - poles[3];
      
      if(channels === 2) {
        var output2 = sample[1];

  			rezz = poles2[3] * resonance; 
  			rezz = rezz > 1 ? 1 : rezz;

  			output2 -= rezz;

  			poles2[0] = poles2[0] + ((-poles2[0] + output2) * cutoff);
  			poles2[1] = poles2[1] + ((-poles2[1] + poles2[0])  * cutoff);
  			poles2[2] = poles2[2] + ((-poles2[2] + poles2[1])  * cutoff);
  			poles2[3] = poles2[3] + ((-poles2[3] + poles2[2])  * cutoff);

  			output2 = isLowPass ? poles2[3] : output2 - poles2[3];
        output[0] = output1;
        output[1] = output2;
        
        return output;
      }
      
		  return output1; // return mono
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Filter24.prototype = Gibberish._effect;

/**#Gibberish.SVF - FX
A two-pole state variable filter. This filter calculates coefficients on a per-sample basis, so that you can easily modulate cutoff and Q. Can switch between low-pass, high-pass, band and notch modes.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.SVF({input:a, cutoff:200, Q:4, mode:0});  
a.note(1760);   
a.note(440);  
a.mode = 2;
a.note(220);  
a.note(1760);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.SVF.input : property  
Object. The ugen that should feed the filter.
**/
/**###Gibberish.SVF.cutoff : property  
Number. 0..22050. The cutoff frequency for the synth's filter. Note that unlike the Filter24, this is measured in Hz.
**/
/**###Gibberish.SVF.resonance : property  
Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.
**/
/**###Gibberish.SVF.mode : property  
Number. 0..3. 0 = lowpass, 1 = highpass, 2 = bandpass, 3 = notch.
**/
Gibberish.SVF = function() {
	var d1 = [0,0], d2 = [0,0], pi= Math.PI, out = [0,0];
  
  Gibberish.extend( this, {
  	name:"SVF",
  	properties : { input:0, cutoff:440, Q:2, mode:0, sr: Gibberish.context.sampleRate },
				
  	callback: function(sample, frequency, Q, mode, sr) {
      var channels = typeof sample === 'number' ? 1 : 2;
      var output1 = channels === 1 ? sample : sample[0];
      
  		var f1 = 2 * pi * frequency / sr;
  		Q = 1 / Q;
					
			var l = d2[0] + f1 * d1[0];
			var h = output1 - l - Q * d1[0];
			var b = f1 * h + d1[0];
			var n = h + l;
						
			d1[0] = b;
			d2[0] = l;
      
			if(mode === 0) 
				output1 = l;
			else if(mode === 1)
				output1 = h;
			else if(mode === 2)
				output1 = b;
			else
				output1 = n;
        
      if(channels === 2) {
        var output2 = sample[1];
  			var l = d2[1] + f1 * d1[1];
  			var h = output2 - l - Q * d1[1];
  			var b = f1 * h + d1[1];
  			var n = h + l;
						
  			d1[1] = b;
  			d2[1] = l;
      
  			if(mode === 0) 
  				output2 = l;
  			else if(mode === 1)
  				output2 = h;
  			else if(mode === 2)
  				output2 = b;
  			else
  				output2 = n;
          
        out[0] = output1; out[1] = output2;
      }else{
        out = output1;
      }

  		return out;
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.SVF.prototype = Gibberish._effect;

/**#Gibberish.Biquad - FX
A two-pole biquad filter. Currently, you must manually call calculateCoefficients every time mode, cutoff or Q changes; thus this filter isn't good for samplerate modulation.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Biquad({input:a, cutoff:200, Q:4, mode:"LP"}).connect();  
a.note(1760);   
a.note(440);  
a.mode = "HP";
a.note(220);  
a.note(1760);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Biquad.input : property  
Object. The ugen that should feed the filter.
**/
/**###Gibberish.Biquad.cutoff : property  
Number. 0..22050. The cutoff frequency for the synth's filter. Note that unlike the Filter24, this is measured in Hz.
**/
/**###Gibberish.Biquad.Q : property  
Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.
**/
/**###Gibberish.Biquad.mode : property  
Number. 0..3. "LP" = lowpass, "HP" = highpass, "BP" = bandpass
**/
Gibberish.Biquad = function() {
  var _x1 = [0,0],
      _x2 = [0,0],
      _y1 = [0,0],
      _y2 = [0,0],
      x1 = x2 = y1 = y2 = 0,
      out = [0,0],
	    b0 = 0.001639,
	    b1 = 0.003278,
	    b2 = 0.001639,
	    a1 = -1.955777,
	    a2 = 0.960601,
      _mode = "LP",
    	_cutoff = 2000,
      _Q = .5,
      sr = Gibberish.context.sampleRate,
      _phase = 0;
      
	Gibberish.extend(this, {
		name: "biquad",

	  properties: {
      input: null,
	  },

	  calculateCoefficients: function() {
      switch (_mode) {
	      case "LP":
           var w0 = 2 * Math.PI * _cutoff / sr,
               sinw0 = Math.sin(w0),
               cosw0 = Math.cos(w0),
               alpha = sinw0 / (2 * _Q);
           b0 = (1 - cosw0) / 2,
           b1 = 1 - cosw0,
           b2 = b0,
           a0 = 1 + alpha,
           a1 = -2 * cosw0,
           a2 = 1 - alpha;
           break;
	       case "HP":
           var w0 = 2 * Math.PI * _cutoff / sr,
               sinw0 = Math.sin(w0),
               cosw0 = Math.cos(w0),
               alpha = sinw0 / (2 * _Q);
           b0 = (1 + cosw0) / 2,
           b1 = -(1 + cosw0),
           b2 = b0,
           a0 = 1 + alpha,
           a1 = -2 * cosw0,
           a2 = 1 - alpha;
           break;
	       case "BP":
           var w0 = 2 * Math.PI * _cutoff / sr,
               sinw0 = Math.sin(w0),
               cosw0 = Math.cos(w0),
               toSinh = Math.log(2) / 2 * _Q * w0 / sinw0,
               alpha = sinw0 * (Math.exp(toSinh) - Math.exp(-toSinh)) / 2;
           b0 = alpha,
           b1 = 0,
           b2 = -alpha,
           a0 = 1 + alpha,
           a1 = -2 * cosw0,
           a2 = 1 - alpha;
           break;
	       default:
           return;
       }

       b0 = b0 / a0;
       b1 = b1 / a0;
       b2 = b2 / a0;
       a1 = a1 / a0;
       a2 = a2 / a0;
       
    },

    callback: function( x ) {
      var channels = typeof x === 'number' ? 1 : 2,
          outL = 0,
          outR = 0,
          inL = channels === 1 ? x : x[0];
      
      //outL = b0 * inL + b1 * x1[0] + b2 * x2[0] - a1 * y1[0] - a2 * y2[0];
      outL = b0 * inL + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      
      // x2[0] = x1[0];
      // x1[0] = x[0];
      // y2[0] = y1[0];
      // y1[0] = outL;
      
      x2 = x1;
      x1 = x;
      y2 = y1;
      y1 = outL;
            
      if(channels === 2) {
        inR = x[1];
        outR = b0 * inR + b1 * x1[1] + b2 * x2[1] - a1 * y1[1] - a2 * y2[1];
        x2[1] = x1[1];
        x1[1] = x[1];
        y2[1] = y1[1];
        y1[1] = outR;
        
        out[0] = outL;
        out[1] = outR;
      }
      return channels === 1 ? outL : out;
    },
	})
  .init();

  Object.defineProperties(this, {
    mode : {
      get: function() { return _mode; },
      set: function(v) { _mode = v; this.calculateCoefficients(); }
    },
    cutoff : {
      get: function() { return _cutoff; },
      set: function(v) { _cutoff = v; this.calculateCoefficients(); }
    },
    Q : {
      get: function() { return _Q; },
      set: function(v) { _Q = v; this.calculateCoefficients(); }
    },
  })
  
  this.processProperties(arguments);
  
  this.calculateCoefficients();
};
Gibberish.Biquad.prototype = Gibberish._effect;

/**#Gibberish.Flanger - FX
Classic flanging effect with feedback.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Flanger({input:a, rate:.5, amount:125, feedback:.5}).connect();  
a.note(440);  
a.feedback = 0;  
a.note(440);  
a.rate = 4;
a.note(440);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Flanger.input : property  
Object. The ugen that should feed the flagner.
**/
/**###Gibberish.Flanger.rate : property  
Number. The speed at which the delay line tap position is modulated.
**/
/**###Gibberish.Flanger.amount : property  
Number. The amount of time, in samples, that the delay line tap position varies by.
**/
/**###Gibberish.Flanger.feedback : property  
Number. The amount of output that should be fed back into the delay line
**/
/**###Gibberish.Flanger.offset : property  
Number. The base offset of the delay line tap from the current time. Large values (> 500) lead to chorusing effects.
**/

Gibberish.Flanger = function() {
	var buffers =	        [ new Float32Array(88200), new Float32Array(88200) ],
	    bufferLength =    88200,
	    delayModulation =	new Gibberish.Sine().callback,
	    interpolate =		  Gibberish.interpolate,
	    readIndex =			  -100,
	    writeIndex = 		  0,
	    phase =				    0;
      
	Gibberish.extend(this, {
    name:"flanger",
    properties:{ input:0, rate:.25, feedback:0, amount:125, offset:125 },
    
    callback : function(sample, delayModulationRate, feedback, delayModulationAmount, offset) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		var delayIndex = readIndex + delayModulation( delayModulationRate, delayModulationAmount * .95 );

  		if(delayIndex > bufferLength) {
  			delayIndex -= bufferLength;
  		}else if(delayIndex < 0) {
  			delayIndex += bufferLength;
  		}
					
			var delayedSample = interpolate(buffers[0], delayIndex);
			buffers[0][writeIndex] = channels === 1 ? sample + (delayedSample * feedback): sample[0] + (delayedSample * feedback);
				
      if(channels === 2) {
        sample[0] += delayedSample;
        
  			delayedSample = interpolate(buffers[1], delayIndex);
  			buffers[1][writeIndex] = sample[1] + (delayedSample * feedback);
        
        sample[1] += delayedSample;
      }else{
        sample += delayedSample;
      }
			
  		if(++writeIndex >= bufferLength) writeIndex = 0;
  		if(++readIndex  >= bufferLength) readIndex  = 0;

  		return sample;
  	},	
  })
  .init()
  .processProperties(arguments);

	readIndex = this.offset * -1;
};
Gibberish.Flanger.prototype = Gibberish._effect;

/**#Gibberish.Vibrato - FX
Delay line vibrato effect.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Vibrato({input:a, rate:4, amount:125 }).connect();  
a.note(440);  
a.rate = .5;
a.note(440);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Vibrato.input : property  
Object. The ugen that should feed the vibrato.
**/
/**###Gibberish.Vibrato.rate : property  
Number. The speed at which the delay line tap position is modulated.
**/
/**###Gibberish.Vibrato.amount : property  
Number. The size of the delay line modulation; effectively the amount of vibrato to produce, 
**/
/**###Gibberish.Vibrato.offset : property  
Number. The base offset of the delay line tap from the current time.
**/
Gibberish.Vibrato = function() {
	var buffers =	        [ new Float32Array(88200), new Float32Array(88200) ],
	    bufferLength =    88200,
	    delayModulation =	new Gibberish.Sine().callback,
	    interpolate =		  Gibberish.interpolate,
	    readIndex =			  -100,
	    writeIndex = 		  0,
	    phase =				    0;
      
	Gibberish.extend(this, {
    name:"vibrato",
  	properties:{ input:0, rate:5, amount:.5, offset:125 },
    
  	callback : function(sample, delayModulationRate, delayModulationAmount, offset) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		var delayIndex = readIndex + delayModulation( delayModulationRate, delayModulationAmount * offset - 1 );

  		if(delayIndex > bufferLength) {
  			delayIndex -= bufferLength;
  		}else if(delayIndex < 0) {
  			delayIndex += bufferLength;
  		}
					
			var delayedSample = interpolate(buffers[0], delayIndex);
			buffers[0][writeIndex] = channels === 1 ? sample : sample[0];
				
      if(channels === 2) {
        sample[0] = delayedSample;
        
  			delayedSample = interpolate(buffers[1], delayIndex);
  			buffers[1][writeIndex] = sample[1];
        
        sample[1] = delayedSample;
      }else{
        sample = delayedSample;
      }
			
  		if(++writeIndex >= bufferLength) writeIndex = 0;
  		if(++readIndex  >= bufferLength) readIndex  = 0;

  		return sample;
  	},	
  })
  .init()
  .processProperties(arguments);

	readIndex = this.offset * -1;
};
Gibberish.Vibrato.prototype = Gibberish._effect;

/**#Gibberish.BufferShuffler - FX
A buffer shuffling / stuttering effect with reversing and pitch-shifting

## Example Usage##
`a = new Gibberish.Synth({ attack:88200, decay:88200 });  
b = new Gibberish.BufferShuffler({input:a, chance:.25, amount:125, rate:44100, pitchMin:-4, pitchMax:4 }).connect();  
a.note(440);
`  
##Constructor##
**param** *properties* : Object. A dictionary of property keys and values to assign to the Gibberish.BufferShuffler object
- - - - 
**/
/**###Gibberish.BufferShuffler.chance : property
Float. Range 0..1. Default .25. The likelihood that incoming audio will be shuffled.
**/
/**###Gibberish.BufferShuffler.rate : property
Integer, in samples. Default 11025. How often Gibberish.BufferShuffler will randomly decide whether or not to shuffle.
**/
/**###Gibberish.BufferShuffler.length : property
Integer, in samples. Default 22050. The length of time to play stuttered audio when stuttering occurs.
**/
/**###Gibberish.BufferShuffler.reverseChance : property
Float. Range 0..1. Default .5. The likelihood that stuttered audio will be reversed
**/
/**###Gibberish.BufferShuffler.pitchChance : property
Float. Range 0..1. Default .5. The likelihood that stuttered audio will be repitched.
**/
/**###Gibberish.BufferShuffler.pitchMin : property
Float. Range 0..1. Default .25. The lowest playback speed used to repitch the audio
**/
/**###Gibberish.BufferShuffler.pitchMax : property
Float. Range 0..1. Default 2. The highest playback speed used to repitch the audio.
**/
/**###Gibberish.BufferShuffler.wet : property
Float. Range 0..1. Default 1. When shuffling, the amplitude of the wet signal
**/
/**###Gibberish.BufferShuffler.dry : property
Float. Range 0..1. Default 0. When shuffling, the amplitude of the dry signal
**/

Gibberish.BufferShuffler = function() {
	var buffers = [ new Float32Array(88200), new Float32Array(88200) ],
    	bufferLength = 88200,  
  		readIndex = 0,
  		writeIndex = 0,
  		randomizeCheckIndex = 0,
  		shuffleTimeKeeper = 0,
  		isShuffling = 0,
  		random = Math.random,
  		fadeIndex = 0,
  		fadeAmount = 1,
  		isFadingWetIn = false,
  		isFadingDryIn = false,
  		reversed = false,
  		interpolate = Gibberish.interpolate,
  		pitchShifting = false,
  		speed = 1,
  		isBufferFull = false,
      rndf = Gibberish.rndf,
      _output = [0,0];
	
	Gibberish.extend(this, {
    name:"buffer_shuffler",
	
  	properties: { input:0, chance:.25, rate:11025, length:22050, reverseChange:.5, pitchChance:.5, pitchMin:.25, pitchMax:2, wet:1, dry:0 },

  	callback : function(sample, chance, rate, length, reverseChance, pitchChance, pitchMin, pitchMax, wet, dry) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		if(!isShuffling) {
        buffers[0][writeIndex] = channels === 1 ? sample : sample[0];
        buffers[1][writeIndex] = channels === 1 ? sample : sample[1]; // won't be used but with one handle but probably cheaper than an if statement?
                
  			writeIndex++
  			writeIndex %= bufferLength;

  			isBufferFull = writeIndex === 0 ? 1 : isBufferFull; // don't output buffered audio until a buffer is full... otherwise you just get a gap
						
  			randomizeCheckIndex++;

  			if(randomizeCheckIndex % rate == 0 && random() < chance) {
  				reversed = random() < reverseChance;
  				isShuffling = true;
  				if(!reversed) {
  					readIndex = writeIndex - length;
  					if(readIndex < 0) readIndex = bufferLength + readIndex;
  				}
  				pitchShifting = random() < pitchChance;
  				if(pitchShifting) {
  					speed = rndf(pitchMin, pitchMax);
  				}
  				fadeAmount = 1;
  				isFadingWetIn = true;
  				isFadingDryIn = false;
  			}
  		}else if(++shuffleTimeKeeper % (length - 400) === 0) {
  			isFadingWetIn = false;
  			isFadingDryIn = true;
  			fadeAmount = 1;
  			shuffleTimeKeeper = 0;
  		}
					
  		readIndex += reversed ? speed * -1 : speed;
  		if(readIndex < 0) {
  			readIndex += bufferLength;
  		}else if( readIndex >= bufferLength ) {
  			readIndex -= bufferLength;
  		}	
  		var outSampleL = interpolate(buffers[0], readIndex);
			
      var outL, outR, shuffle, outSampleR;			
			if(isFadingWetIn) {						
				fadeAmount -= .0025;
        
        shuffle = (outSampleL * (1 - fadeAmount));
				outL = channels === 1 ? shuffle + (sample * fadeAmount) : shuffle + (sample[0] * fadeAmount);
        
        if(channels === 2) {
          outSampleR = interpolate(buffers[1], readIndex);
          shuffle = (outSampleR * (1 - fadeAmount));
          outR = channels === 1 ? outL : shuffle + (sample[1] * fadeAmount);
        }

				if(fadeAmount <= .0025) isFadingWetIn = false;
			}else if(isFadingDryIn) {						
				fadeAmount -= .0025;
        
        shuffle = outSampleL * fadeAmount;
				outL = channels === 1 ? shuffle + (sample * fadeAmount) : shuffle + (sample[0] * (1 - fadeAmount));
        
        if(channels === 2) {
          outSampleR = interpolate(buffers[1], readIndex);
          shuffle = outSampleR * fadeAmount;
          outR = shuffle + (sample[1] * (1 - fadeAmount));
        }
        
				if(fadeAmount <= .0025) { 
					isFadingDryIn = false;
					isShuffling = false;
					reversed = false;
					speed = 1;
					pitchShifting = 0;
				}
			}else{
        if(channels === 1) {
          outL = isShuffling && isBufferFull ? (outSampleL * wet) + sample * dry : sample;
        }else{
          outSampleR = interpolate(buffers[1], readIndex);
          outL = isShuffling && isBufferFull ? (outSampleL * wet) + sample[0] * dry : sample[0];
          outR = isShuffling && isBufferFull ? (outSampleR * wet) + sample[1] * dry : sample[1];          
        }
			}
      _output = [outL, outR];
  		return channels === 1 ? outL : _output;
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.BufferShuffler.prototype = Gibberish._effect;

Gibberish.AllPass = function(time, feedback) {
	var index  = -1,
    	buffer =	new Float32Array(time || 500),
      bufferLength = buffer.length;
  
  Gibberish.extend(this, {
		name:		"allpass",
    properties: {
      input   : 0,
    },
    callback : function(sample) {
  		index = ++index % bufferLength;
  		var bufferSample = buffer[index];
  		var out = -1 * sample + bufferSample;

  		buffer[index] = sample + (bufferSample * .5);
  		return out;
  	},
	});
  
};
/*
adapted from audioLib.js, in turn adapted from Freeverb source code
this is actually a lowpass-feedback-comb filter (https://ccrma.stanford.edu/~jos/pasp/Lowpass_Feedback_Comb_Filter.html)
*/
Gibberish.Comb = function(time) {
	var buffer = new Float32Array(time || 1200),
    	bufferLength = buffer.length,
    	index = 0,
    	store = 0;
      
	Gibberish.extend(this, {
		name:		"comb",
    properties : {
      input : 0,
      feedback : .84,
      damping: .2,
  		//time:		time || 1200,
    },
    
    /*
		self.sample	= self.buffer[self.index];
		self.store	= self.sample * self.invDamping + self.store * self.damping;
		self.buffer[self.index++] = s + self.store * self.feedback;
    */
    
  	callback: function(sample, feedback, damping) {
  		var currentPos = ++index % bufferLength;
			var out = buffer[currentPos];
						
			store = (out * (1 - damping)) + (store * damping);
						
			buffer[currentPos] = sample + (store * feedback);

  		return out;
  	},
	});
  
};

/**#Gibberish.Reverb - FX
based off audiolib.js reverb and freeverb
 
## Example Usage##
`a = new Gibberish.Synth({ attack:88200, decay:88200 });  
b = new Gibberish.Reverb({input:a, roomSize:.5, wet:1, dry;.25}).connect();
a.note(440);
`  
##Constructor
**param** *properties* : Object. A dictionary of property keys and values to assign to the Gibberish.BufferShuffler object
**/
/**###Gibberish.Reverb.roomSize : property
Float. 0..1. The size of the room being emulated.
**/	
/**###Gibberish.Reverb.damping : property
Float. Attenuation of high frequencies that occurs.
**/	
/**###Gibberish.Reverb.wet : property
Float. Default = .75. The amount of processed signal that is output.  
**/	
/**###Gibberish.Reverb.dry : property
Float. Default = .5. The amount of dry signal that is output
**/	

Gibberish.Reverb = function() {
  var tuning =	{
		    combCount: 		    8,
		    combTuning: 	    [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617],
                          
		    allPassCount: 	  4,
		    allPassTuning: 	  [556, 441, 341, 225],
		    allPassFeedback:  0.5,
                          
		    fixedGain: 		    0.015,
		    scaleDamping: 	  0.4,
                          
		    scaleRoom: 		    0.28,
		    offsetRoom: 	    0.7,
                          
		    stereoSpread: 	  23
		},
    feedback = .84,
    combs = [],
    apfs  = [],
    output   = [0,0],
    phase  = 0;
    
	Gibberish.extend(this, {
		name:		"reverb",
    
		roomSize:	.5,
    
    properties: {
      input:    0,
  		wet:		  .5,
  		dry:		  .55,
      roomSize: .84,
      damping:  .5,
    },
    
    callback : function(sample, wet, dry, roomSize, damping) {
      var channels = typeof sample === 'object' ? 2 : 1;
      
			var input = channels === 1 ? sample : sample[0] + sample[1]; // converted to fake stereo

			var _out = input * .015;
      var out = _out;
						
			for(var i = 0; i < 8; i++) {
				var filt = combs[i](_out, roomSize * .98, (damping * .4)); // .98 is scaleRoom + offsetRoom, .4 is scaleDamping
				out += filt;				
			}
							
			for(var i = 0; i < 4; i++) {
				out = apfs[i](out);	
			}
      
      output[0] = output[1] = (input * dry) + (out * wet);

  		return output;
  	},
	})  
  .init()
  .processProperties(arguments);
      
  this.setFeedback = function(v) { feedback = v }
  
	for(var i = 0; i < 8; i++){
		combs.push( new Gibberish.Comb( tuning.combTuning[i] ).callback );
	}
  
	for(var i = 0; i < 4; i++){
		apfs.push( new Gibberish.AllPass(tuning.allPassTuning[i], tuning.allPassFeedback ).callback );
	}

};
Gibberish.Reverb.prototype = Gibberish._effect;

/**#Gibberish.Granulator - FX
A granulator that operates on a buffer of samples. You can get the samples from a [Sampler](javascript:displayDocs('Gibberish.Sampler'\))
object.

## Example Usage ##
`a = new Gibberish.Sampler('resources/trumpet.wav');  
// wait until sample is loaded to create granulator  
a.onload = function() {  
  b = new Gibberish.Granulator({  
    buffer:a.getBuffer(),  
    grainSize:1000,  
    speedMin: -2,  
    speedMax: 2,  
  });  
  b.mod('position', new Gibberish.Sine(.1, .45), '+');  
  b.connect();  
};`
## Constructor
**param** *propertiesList*: Object. At a minimum you should define the input to granulate. See the example.
**/
/**###Gibberish.Granulator.speed : property
Float. The playback rate, in samples, of each grain
**/
/**###Gibberish.Granulator.speedMin : property
Float. When set, the playback rate will vary on a per grain basis from (grain.speed + grain.speedMin) -> (grain.speed + grain.speedMax). This value should almost always be negative.
**/
/**###Gibberish.Granulator.speedMax : property
Float. When set, the playback rate will vary on a per grain basis from (grain.speed + grain.speedMin) -> (grain.speed + grain.speedMax).
**/
/**###Gibberish.Granulator.grainSize : property
Integer. The length, in samples, of each grain
**/
/**###Gibberish.Granulator.position : property
Float. The center position of the grain cloud. 0 represents the start of the buffer, 1 represents the end.
**/
/**###Gibberish.Granulator.positionMin : property
Float. The left boundary on the time axis of the grain cloud.
**/
/**###Gibberish.Granulator.positionMax : property
Float. The right boundary on the time axis of the grain cloud.
**/
/**###Gibberish.Granulator.buffer : property
Object. The input buffer to granulate.
**/
/**###Gibberish.Granulator.numberOfGrains : property
Float. The number of grains in the cloud. Can currently only be set on initialization.
**/

Gibberish.Granulator = function(properties) {
	var grains      = [];
	    buffer      = null,
	    interpolate = Gibberish.interpolate,
      panner      = Gibberish.makePanner(),
      bufferLength= 0,
	    debug       = 0,
	    write       = 0,
      self        = this,
      out         = [0,0],
      _out        = [0,0],
      rndf        = Gibberish.rndf,
      numberOfGrains = properties.numberOfGrains || 20;
      
	Gibberish.extend(this, { 
		name:		        "granulator",
		bufferLength:   88200,
		reverse:	      true,
		spread:		      .5,
    
    properties : {
      speed: 		    1,
      speedMin:     -0,
      speedMax: 	  .0,
      grainSize: 	  1000,
      position:	    .5,
      positionMin:  0,
      positionMax:  0,
      amp:		      .2,
      fade:		      .1,
      pan:		      0,
      shouldWrite:  false,
    },
    
    setBuffer : function(b) { buffer = b; bufferLength = b.length },
    
    callback : function(speed, speedMin, speedMax, grainSize, positionMin, positionMax, position, amp, fade, pan, shouldWrite) {
    		for(var i = 0; i < numberOfGrains; i++) {
    			var grain = grains[i];
					
    			if(grain._speed > 0) {
    				if(grain.pos > grain.end) {
    					grain.pos = (position + rndf(positionMin, positionMax)) * buffer.length;
    					grain.start = grain.pos;
    					grain.end = grain.start + grainSize;
    					grain._speed = speed + rndf(speedMin, speedMax);
    					grain._speed = grain._speed < .1 ? .1 : grain._speed;
    					grain._speed = grain._speed < .1 && grain._speed > 0 ? .1 : grain._speed;							
    					grain._speed = grain._speed > -.1 && grain._speed < 0 ? -.1 : grain._speed;							
    					grain.fadeAmount = grain._speed * (fade * grainSize);
    					grain.pan = rndf(self.spread * -1, self.spread);
    				}
						
    				var _pos = grain.pos;
    				while(_pos > buffer.length) _pos -= buffer.length;
    				while(_pos < 0) _pos += buffer.length;
						
    				var _val = interpolate(buffer, _pos);
					
    				_val *= grain.pos < grain.fadeAmount + grain.start ? (grain.pos - grain.start) / grain.fadeAmount : 1;
    				_val *= grain.pos > (grain.end - grain.fadeAmount) ? (grain.end - grain.pos)   / grain.fadeAmount : 1;
						
    			}else {
    				if(grain.pos < grain.end) {
    					grain.pos = (position + rndf(positionMin, positionMax)) * buffer.length;
    					grain.start = grain.pos;
    					grain.end = grain.start - grainSize;
    					grain._speed = speed + rndf(speedMin, speedMax);
    					grain._speed = grain._speed < .1 && grain._speed > 0 ? .1 : grain._speed;							
    					grain._speed = grain._speed > -.1 && grain._speed < 0 ? -.1 : grain._speed;	
    					grain.fadeAmount = grain._speed * (fade * grainSize);							
    				}
						
    				var _pos = grain.pos;
    				while(_pos > buffer.length) _pos -= buffer.length;
    				while(_pos < 0) _pos += buffer.length;
					
    				var _val = interpolate(buffer, _pos);
					
    				_val *= grain.pos > grain.start - grain.fadeAmount ? (grain.start - grain.pos) / grain.fadeAmount : 1;
    				_val *= grain.pos < (grain.end + grain.fadeAmount) ? (grain.end - grain.pos) / grain.fadeAmount : 1;
    			}
					
    			_out = panner(_val * amp, grain.pan, _out);
          out[0] += _out[0];
          out[1] += _out[1];
    			
          grain.pos += grain._speed;
    		}
				
    		return panner(out, pan, out);
    	},
	})
  .init()
  .processProperties(arguments);
  
	for(var i = 0; i < numberOfGrains; i++) {
		grains[i] = {
			pos : self.position + Gibberish.rndf(self.positionMin, self.positionMax),
			_speed : self.speed + Gibberish.rndf(self.speedMin, self.speedMax),
		}
		grains[i].start = grains[i].pos;
		grains[i].end = grains[i].pos + self.grainSize;
		grains[i].fadeAmount = grains[i]._speed * (self.fade * self.grainSize);
		grains[i].pan = Gibberish.rndf(self.spread * -1, self.spread);
	}
			
	/*if(typeof properties.input !== "undefined") { 
			this.shouldWrite = true;
      
			this.sampler = new Gibberish.Sampler();
			this.sampler.connect();
			this.sampler.record(properties.buffer, this.bufferLength);
      
			buffer = this.sampler.buffer;
	}else*/ if(typeof properties.buffer !== 'undefined') {
	  buffer = properties.buffer;
    bufferLength = buffer.length;
	}

};
Gibberish.Granulator.prototype = Gibberish._effect;
Gibberish.synth = function() {
  this.type = 'oscillator';
    
  this.oscillatorInit = function() {
    this.fx = new Array2; 
    this.fx.parent = this;
  };
};
Gibberish.synth.prototype = new Gibberish.ugen();
Gibberish._synth = new Gibberish.synth();

/**#Gibberish.Synth - Synth
Oscillator + attack / decay envelope.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
a.note(880);  
a.waveform = "Triangle";  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Synth.frequency : property  
Number. The frequency for the carrier oscillator. This is normally set using the note method but can also be modulated.
**/
/**###Gibberish.Synth.pulsewidth : property  
Number. The duty cycle for PWM synthesis
**/
/**###Gibberish.Synth.attack : property  
Number. The length of the attack portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.Synth.decay : property  
Number. The length of the decay portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.Synth.glide : property  
Number. The synth has a one-pole filter attached to the carrier frequency. Set glide to a value between .999 and 1 to get pitch sweep between notes.
**/
/**###Gibberish.Synth.amp : property  
Number. The relative amplitude level of the synth.
**/
/**###Gibberish.Synth.channels : property  
Number. Default 2. Mono or Stereo synthesis.
**/
/**###Gibberish.Synth.pan : property  
Number. Default 0. If the synth has two channels, this determines its position in the stereo spectrum.
**/
/**###Gibberish.Synth.waveform : property  
String. The type of waveform to use. Options include 'Sine', 'Triangle', 'PWM', 'Saw' etc.
**/
		
Gibberish.Synth = function(properties) {
	this.name =	"synth";

	this.properties = {
	  frequency:0,
    pulsewidth:.5,
	  attack:		22050,
	  decay:		22050,
    sustain:  22050,
    release:  22050,
    attackLevel: 1,
    sustainLevel: .5,
    releaseTrigger: 0,
    glide:    .15,
    amp:		  .25,
    channels: 2,
	  pan:		  0,
    sr:       Gibberish.context.sampleRate,
  };
/**###Gibberish.Synth.note : method  
Generate an enveloped note at the provided frequency  
  
param **frequency** Number. The frequency for the oscillator.  
param **amp** Number. Optional. The volume to use.  
**/    
	this.note = function(frequency, amp) {
    if( amp !== 0 ) {
  		if(typeof this.frequency === 'number' ){
        if( useADSR && frequency === lastFrequency ) {
          this.releaseTrigger = 1;
          return;
        }
        
        this.frequency = lastFrequency = frequency;
        this.releaseTrigger = 0;
      }else{
        if( typeof this.frequency === 'function' ) {
          if( typeof this.frequency()[0] === 'undefined' ) {
            this.frequency = _frequency
          }else{
            this.frequency()[0] = _frequency
          }
        }else{
          this.frequency[0] = _frequency;
        }
        this.releaseTrigger = 0;
        Gibberish.dirty(this);
      }
					
  		if( typeof amp !== 'undefined') this.amp = amp;
	  
      _envelope.run();
    }else{
      this.releaseTrigger = 1;
    }
	};
  
  properties = properties || {}
  
	var useADSR     = typeof properties.useADSR === 'undefined' ? false : properties.useADSR,
      _envelope   = useADSR ? new Gibberish.ADSR() : new Gibberish.AD(),
      envstate    = _envelope.getState,
      envelope    = _envelope.callback,
      _osc        = new Gibberish.PWM(),
	    osc         = _osc.callback,
      lag         = new Gibberish.OnePole().callback,
    	panner      = Gibberish.makePanner(),
      obj         = this,
      lastFrequency = 0,
      phase = 0,
    	out         = [0,0];
      
  _envelope.requireReleaseTrigger = properties.requireReleaseTrigger || false;
      
  this.callback = function(frequency, pulsewidth, attack, decay, sustain,release,attackLevel,sustainLevel,releaseTrigger, glide, amp, channels, pan, sr) {
    glide = glide >= 1 ? .99999 : glide;
    frequency = lag(frequency, 1-glide, glide);
    
    var env, val
    if( useADSR ) {
      env = envelope( attack, decay, sustain, release, attackLevel, sustainLevel, releaseTrigger );
      if( releaseTrigger ) {
        obj.releaseTrigger = 0
      }

      if( envstate() < 4 ) {
  			val = osc( frequency, 1, pulsewidth, sr ) * env * amp;
    
  			return channels === 1 ? val : panner(val, pan, out);
      }else{
  		  val = out[0] = out[1] = 0;
        return channels === 1 ? val : out
      }
    }else{
  		if(envstate() < 2) {
        env = envelope(attack, decay);
  			val = osc( frequency, 1, pulsewidth, sr ) * env * amp;
      
  			return channels === 1 ? val : panner(val, pan, out);
      }else{
  		  val = out[0] = out[1] = 0;
        return channels === 1 ? val : out
      }
    }
	};
  
  this.getEnv = function() { return _envelope; }
  this.getOsc = function() { return _osc; };
  this.setOsc = function(val) { _osc = val; osc = _osc.callback };
  
  var waveform = "PWM";
  Object.defineProperty(this, 'waveform', {
    get : function() { return waveform; },
    set : function(val) { this.setOsc( new Gibberish[val]() ); }
  });
  
  this.init();
  this.oscillatorInit();
	this.processProperties(arguments);
};
Gibberish.Synth.prototype = Gibberish._synth;

/**#Gibberish.PolySynth - Synth
A polyphonic version of [Synth](javascript:displayDocs('Gibberish.Synth'\)). There are two additional properties for the polyphonic version of the synth. The polyphonic version consists of multiple Synths being fed into a single [Bus](javascript:displayDocs('Gibberish.Bus'\)) object.
  
## Example Usage ##
`Gibberish.init();  
a = new Gibberish.PolySytn({ attack:88200, decay:88200, maxVoices:10 }).connect();  
a.note(880);  
a.note(1320); 
a.note(1760);  
`  
## Constructor   
One important property to pass to the constructor is the maxVoices property, which defaults to 5. This controls how many voices are allocated to the synth and cannot be changed after initialization.  
  
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.PolySynth.children : property  
Array. Read-only. An array holding all of the child FMSynth objects.
**/
/**###Gibberish.PolySynth.maxVoices : property  
Number. The number of voices of polyphony the synth has. May only be set in initialization properties passed to constrcutor.
**/
Gibberish.PolySynth = function() {
  this.__proto__ = new Gibberish.Bus2();
  
  Gibberish.extend(this, {
    name:     "polysynth",
    maxVoices:    5,
    voiceCount:   0,
    frequencies:  [],
    _frequency: 0,
    
    polyProperties : {
      frequency: 0,
  		glide:			0,
      attack: 22050,
      decay:  22050,
      pulsewidth:.5,
      waveform:"PWM",
    },

/**###Gibberish.PolySynth.note : method  
Generate an enveloped note at the provided frequency using a simple voice allocation system where if all children are active, the one active the longest cancels its current note and begins playing a new one.    
  
param **frequency** Number. The frequency for the oscillator. 
param **amp** Number. Optional. The volume to use.  
**/  
    note : function(_frequency, amp) {
      var lastNoteIndex = this.frequencies.indexOf( _frequency ),
          idx = lastNoteIndex > -1 ? lastNoteIndex : this.voiceCount++,
          synth = this.children[ idx ];
      
      synth.note( _frequency, amp);
            
      if( lastNoteIndex === -1) {
        this.frequencies[ idx ] = _frequency;
        this._frequency = _frequency
        if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
      }else{
        delete this.frequencies[ idx ]
      }
    },
    
    initVoices: function() {
      for(var i = 0; i < this.maxVoices; i++) {
        var props = {
          waveform: this.waveform,
          attack:   this.attack,
          decay:    this.decay,
          pulsewidth: this.pulsewidth,
          channels: 2,
          amp:      1,
          useADSR : this.useADSR || false,
          requireReleaseTrigger: this.requireReleaseTrigger || false,
        },
        synth = new Gibberish.Synth( props ).connect( this );

        this.children.push(synth);
      }
    },
  });
  
  this.amp = 1 / this.maxVoices;
    
  this.children = [];
  
  if(typeof arguments[0] === 'object') {
    this.maxVoices = arguments[0].maxVoices ? arguments[0].maxVoices : this.maxVoices
    this.useADSR = typeof arguments[0].useADSR !== 'undefined' ? arguments[ 0 ].useADSR : false
    this.requireReleaseTrigger = typeof arguments[0].requireReleaseTrigger !== 'undefined' ? arguments[ 0 ].requireReleaseTrigger : false    
  }
  
  Gibberish.polyInit(this);
  this.initVoices()
  
  this.processProperties(arguments);
  
  Gibberish._synth.oscillatorInit.call(this);
};

/**#Gibberish.Synth2 - Synth
Oscillator + attack / decay envelope + 24db ladder filter. Basically the same as the [Synth](javascript:displayDocs('Gibberish.Synth'\)) object but with the addition of the filter. Note that the envelope controls both the amplitude of the oscillator and the cutoff frequency of the filter.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Synth2({ attack:44, decay:44100, cutoff:.2, resonance:4 }).connect();  
a.note(880);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Synth2.frequency : property  
Number. The frequency for the carrier oscillator. This is normally set using the note method but can also be modulated.
**/
/**###Gibberish.Synth2.pulsewidth : property  
Number. The duty cycle for PWM synthesis
**/
/**###Gibberish.Synth2.attack : property  
Number. The length of the attack portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.Synth2.decay : property  
Number. The length of the decay portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.Synth2.cutoff : property  
Number. 0..1. The cutoff frequency for the synth's filter.
**/
/**###Gibberish.Synth2.resonance : property  
Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.
**/
/**###Gibberish.Synth2.useLowPassFilter : property  
Boolean. Default true. Whether to use a high-pass or low-pass filter.
**/
/**###Gibberish.Synth2.glide : property  
Number. The synth has a one-pole filter attached to the carrier frequency. Set glide to a value between .999 and 1 to get pitch sweep between notes.
**/
/**###Gibberish.Synth2.amp : property  
Number. The relative amplitude level of the synth.
**/
/**###Gibberish.Synth2.channels : property  
Number. Default 2. Mono or Stereo synthesis.
**/
/**###Gibberish.Synth2.pan : property  
Number. Default 0. If the synth has two channels, this determines its position in the stereo spectrum.
**/
/**###Gibberish.Synth2.waveform : property  
String. The type of waveform to use. Options include 'Sine', 'Triangle', 'PWM', 'Saw' etc.
**/
Gibberish.Synth2 = function(properties) {
	this.name =	"synth2";

	this.properties = {
	  frequency:0,
    pulsewidth:.5,
	  attack:		22050,
	  decay:		22050,
    sustain:  22050,
    release:  22050,
    attackLevel: 1,
    sustainLevel: .5,
    releaseTrigger: 0,
    cutoff:   .25,
    resonance:3.5,
    useLowPassFilter:true,
    glide:    .15,
    amp:		  .25,
    channels: 1,
	  pan:		  0,
    sr:       Gibberish.context.sampleRate,
  };
/**###Gibberish.Synth2.note : method  
Generate an enveloped note at the provided frequency  
  
param **frequency** Number. The frequency for the oscillator.  
param **amp** Number. Optional. The volume to use.  
**/

/*
if( amp !== 0 ) {
	if(typeof this.frequency === 'number' ){
    this.frequency = _frequency;
  }else{
    if( typeof this.frequency === 'function' ) { // needed for Gibber TODO: remove?
      if( typeof this.frequency()[0] === 'undefined' ) {
        this.frequency = _frequency
      }else{
        this.frequency()[0] = _frequency
      }
    }else{
      this.frequency[0] = _frequency;
    }
    Gibberish.dirty(this);
  }
*/  
	this.note = function(frequency, amp) {
    if( amp !== 0 ) {
  		if(typeof this.frequency === 'number' ){
        if( useADSR && frequency === lastFrequency ) {
          this.releaseTrigger = 1;
          return;
        }
        
        this.frequency = lastFrequency = frequency;
        this.releaseTrigger = 0;
      }else{
        if( typeof this.frequency === 'function' ) {
          if( typeof this.frequency()[0] === 'undefined' ) {
            this.frequency = _frequency
          }else{
            this.frequency()[0] = _frequency
          }
        }else{
          this.frequency[0] = _frequency;
        }
        this.releaseTrigger = 0;
        Gibberish.dirty(this);
      }
					
  		if( typeof amp !== 'undefined') this.amp = amp;
	  
      _envelope.run();
    }else{
      this.releaseTrigger = 1;
    }
	};
  
  properties = properties || {}
  
	var useADSR     = typeof properties.useADSR === 'undefined' ? false : properties.useADSR,
      _envelope   = useADSR ? new Gibberish.ADSR() : new Gibberish.AD(),
      envstate    = _envelope.getState,
      envelope    = _envelope.callback,
      _osc        = new Gibberish.PWM(),
	    osc         = _osc.callback,      
      _filter     = new Gibberish.Filter24(),
      filter      = _filter.callback,
      lag         = new Gibberish.OnePole().callback,
    	panner      = Gibberish.makePanner(),
      lastFrequency = 0,
      obj         = this,
    	out         = [0,0];
      
  _envelope.requireReleaseTrigger = properties.requireReleaseTrigger || false;
        
  this.callback = function(frequency, pulsewidth, attack, decay, sustain, release, attackLevel, sustainLevel, releaseTrigger, cutoff, resonance, isLowPass, glide, amp, channels, pan, sr) {
    glide = glide >= 1 ? .99999 : glide;
    frequency = lag(frequency, 1-glide, glide);
    
    var env, val
    if( useADSR ) {
      env = envelope( attack, decay, sustain, release, attackLevel, sustainLevel, releaseTrigger );
      if( releaseTrigger ) {
        obj.releaseTrigger = 0
      }

      if( envstate() < 4 ) {
  			val = filter ( osc( frequency, .15, pulsewidth, sr ), cutoff * env, resonance, isLowPass ) * env * amp;
    
  			return channels === 1 ? val : panner(val, pan, out);
      }else{
  		  val = out[0] = out[1] = 0;
        return channels === 1 ? val : out
      }
    }else{
      if( envstate() < 2) {
			  env = envelope(attack, decay);
			  val = filter ( osc( frequency, .15, pulsewidth, sr ), cutoff * env, resonance, isLowPass ) * env * amp;
      
    		return channels === 1 ? val : panner(val, pan, out);
      }else{
    	  val = out[0] = out[1] = 0;
        return channels === 1 ? val : out;
      }
    }
	};
  this.getUseADSR = function() { return useADSR; }
  this.getEnv = function() { return _envelope; };
  this.getOsc = function() { return _osc; };
  this.setOsc = function(val) { _osc = val; osc = _osc.callback };
  
  var waveform = "PWM";
  Object.defineProperty(this, 'waveform', {
    get : function() { return waveform; },
    set : function(val) { this.setOsc( new Gibberish[val]() ); }
  });
  
  this.init();
  this.oscillatorInit();
	this.processProperties(arguments);
};
Gibberish.Synth2.prototype = Gibberish._synth;

/**#Gibberish.PolySynth2 - Synth
A polyphonic version of [Synth2](javascript:displayDocs('Gibberish.Synth2'\)). There are two additional properties for the polyphonic version of the synth. The polyphonic version consists of multiple Synths being fed into a single [Bus](javascript:displayDocs('Gibberish.Bus'\)) object.
  
## Example Usage ##
`Gibberish.init();  
a = new Gibberish.PolySynth2({ attack:88200, decay:88200, maxVoices:10 }).connect();  
a.note(880);  
a.note(1320); 
a.note(1760);  
`  
## Constructor   
One important property to pass to the constructor is the maxVoices property, which defaults to 5. This controls how many voices are allocated to the synth and cannot be changed after initialization.  
  
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.PolySynth2.children : property  
Array. Read-only. An array holding all of the child FMSynth objects.
**/
/**###Gibberish.PolySynth2.maxVoices : property  
Number. The number of voices of polyphony the synth has. May only be set in initialization properties passed to constrcutor.
**/

Gibberish.PolySynth2 = function() {
  this.__proto__ = new Gibberish.Bus2();
  
  Gibberish.extend(this, {
    name:     "polysynth2",
    maxVoices:    5,
    voiceCount:   0,
    frequencies:  [],
    _frequency: 0,
    
    polyProperties : {
      frequency: 0,
      glide:			0,
      attack: 22050,
      decay:  22050,
      pulsewidth:.5,
      resonance: 3.5,
      cutoff:.25,
      useLowPassFilter:true,
      waveform:"PWM",
    },

/**###Gibberish.PolySynth2.note : method  
Generate an enveloped note at the provided frequency using a simple voice allocation system where if all children are active, the one active the longest cancels its current note and begins playing a new one.    
  
param **frequency** Number. The frequency for the oscillator. 
param **amp** Number. Optional. The volume to use.  
**/  
    note : function(_frequency, amp) {
      var lastNoteIndex = this.frequencies.indexOf( _frequency ),
          idx = lastNoteIndex > -1 ? lastNoteIndex : this.voiceCount++,
          synth = this.children[ idx ];
      
      synth.note(_frequency, amp);
            
      if( lastNoteIndex === -1) {
        this.frequencies[ idx ] = _frequency;
        this._frequency = _frequency
        if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
      }else{
        delete this.frequencies[ idx ]
      }
    },
    
    initVoices: function() {
      this.dirty = true;
      for(var i = 0; i < this.maxVoices; i++) {
        var props = {
          attack:   this.attack,
          decay:    this.decay,
          pulsewidth: this.pulsewidth,
          channels: 2,
          amp:      1,
          useADSR:  this.useADSR || false,
          requireReleaseTrigger: this.requireReleaseTrigger || false,
        },
        synth = new Gibberish.Synth2( props ).connect( this );

        this.children.push(synth);
      }
    },
  });
  
  this.amp = 1 / this.maxVoices;
    
  this.children = [];
  
  if(typeof arguments[0] === 'object') {
    this.maxVoices = arguments[0].maxVoices ? arguments[0].maxVoices : this.maxVoices
    this.useADSR = typeof arguments[0].useADSR !== 'undefined' ? arguments[ 0 ].useADSR : false
    this.requireReleaseTrigger = typeof arguments[0].requireReleaseTrigger !== 'undefined' ? arguments[ 0 ].requireReleaseTrigger : false
  }
  
  Gibberish.polyInit(this);
  
  this.initVoices()

  this.processProperties(arguments);
  Gibberish._synth.oscillatorInit.call(this);
};

/**#Gibberish.FMSynth - Synth
Classic 2-op FM synthesis with an attached attack / decay envelope.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.FMSynth({ cmRatio:5, index:3 }).connect();
a.note(880);`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.FMSynth.frequency : property  
Number. The frequency for the carrier oscillator. This is normally set using the note method but can also be modulated.
**/
/**###Gibberish.FMSynth.cmRatio : property  
Number. The carrier-to-modulation ratio. A cmRatio of 2 means that the carrier frequency will be twice the frequency of the modulator.
**/
/**###Gibberish.FMSynth.attack : property  
Number. The length of the attack portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.FMSynth.decay : property  
Number. The length of the decay portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.FMSynth.glide : property  
Number. The synth has a one-pole filter attached to the carrier frequency. Set glide to a value between .999 and 1 to get pitch sweep between notes.
**/
/**###Gibberish.FMSynth.amp : property  
Number. The relative amplitude level of the synth.
**/
/**###Gibberish.FMSynth.channels : property  
Number. Default 2. Mono or Stereo synthesis.
**/
/**###Gibberish.FMSynth.pan : property  
Number. Default 0. If the synth has two channels, this determines its position in the stereo spectrum.
**/
Gibberish.FMSynth = function(properties) {
	this.name =	"fmSynth";

	this.properties = {
	  frequency:0,
	  cmRatio:	2,
	  index:		5,			
	  attack:		22050,
	  decay:		22050,
    sustain:  22050,
    release:  22050,
    attackLevel: 1,
    sustainLevel: .5,
    releaseTrigger: 0,
    glide:    .15,
    amp:		  .25,
    channels: 2,
	  pan:		  0,
  };
/**###Gibberish.FMSynth.note : method  
Generate an enveloped note at the provided frequency  
  
param **frequency** Number. The frequency for the carrier oscillator. The modulator frequency will be calculated automatically from this value in conjunction with the synth's carrier to modulation ratio  
param **amp** Number. Optional. The volume to use.  
**/

	this.note = function(frequency, amp) {
    if( amp !== 0 ) {
  		if(typeof this.frequency === 'number' ){
        if( useADSR && frequency === lastFrequency ) {
          this.releaseTrigger = 1;
          return;
        }
        
        this.frequency = lastFrequency = frequency;
        this.releaseTrigger = 0;
      }else{
        if( typeof this.frequency === 'function' ) {
          if( typeof this.frequency()[0] === 'undefined' ) {
            this.frequency = _frequency
          }else{
            this.frequency()[0] = _frequency
          }
        }else{
          this.frequency[0] = _frequency;
        }
        this.releaseTrigger = 0;
        Gibberish.dirty(this);
      }
					
  		if( typeof amp !== 'undefined') this.amp = amp;
	  
      _envelope.run();
    }else{
      this.releaseTrigger = 1;
    }
	};
  
  properties = properties || {}
  
	var useADSR     = typeof properties.useADSR === 'undefined' ? false : properties.useADSR,
      _envelope   = useADSR ? new Gibberish.ADSR() : new Gibberish.AD(),
      envstate    = _envelope.getState,
      envelope    = _envelope.callback,
	    carrier     = new Gibberish.Sine().callback,
	    modulator   = new Gibberish.Sine().callback,
      lag         = new Gibberish.OnePole().callback,
    	panner      = Gibberish.makePanner(),
    	out         = [0,0],
      obj         = this,
      lastFrequency = 0,
      phase = 0,
      check = false;

  _envelope.requireReleaseTrigger = properties.requireReleaseTrigger || false;

  this.callback = function(frequency, cmRatio, index, attack, decay, sustain, release, attackLevel, sustainLevel, releaseTrigger, glide, amp, channels, pan) {
    var env, val, mod
        
    if(glide >= 1) glide = .9999;
    frequency = lag(frequency, 1-glide, glide);
    
    if( useADSR ) {
      env = envelope( attack, decay, sustain, release, attackLevel, sustainLevel, releaseTrigger );
      if( releaseTrigger ) {
        obj.releaseTrigger = 0
      }

      if( envstate() < 4 ) {
        mod = modulator(frequency * cmRatio, frequency * index) * env;
  			val = carrier( frequency + mod, 1 ) * env * amp;
    
  			return channels === 1 ? val : panner(val, pan, out);
      }else{
  		  val = out[0] = out[1] = 0;
        return channels === 1 ? val : out
      }
    }else{
      if( envstate() < 2 ) {
  			env = envelope(attack, decay);
  			mod = modulator(frequency * cmRatio, frequency * index) * env;
  			val = carrier( frequency + mod, 1 ) * env * amp;

        //if( phase++ % 44105 === 0 ) console.log( panner(val, pan, out) channels )
  			return channels === 1 ? val : panner(val, pan, out);
      }else{
  		  val = out[0] = out[1] = 0;
        return channels === 1 ? val : out;
      }
    }
	};
  
  this.init();
  this.oscillatorInit();
	this.processProperties(arguments);
};
Gibberish.FMSynth.prototype = Gibberish._synth;
/**#Gibberish.PolyFM - Synth
A polyphonic version of [FMSynth](javascript:displayDocs('Gibberish.FMSynth'\)). There are two additional properties for the polyphonic version of the synth. The polyphonic version consists of multiple FMSynths being fed into a single [Bus](javascript:displayDocs('Gibberish.Bus'\)) object.
  
## Example Usage ##
`Gibberish.init();  
a = new Gibberish.PolyFM({ cmRatio:5, index:3, attack:88200, decay:88200 }).connect();  
a.note(880);  
a.note(1320);  
`  
## Constructor   
One important property to pass to the constructor is the maxVoices property, which defaults to 5. This controls how many voices are allocated to the synth and cannot be changed after initialization.  
  
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.PolyFM.children : property  
Array. Read-only. An array holding all of the child FMSynth objects.
**/
/**###Gibberish.PolyFM.maxVoices : property  
Number. The number of voices of polyphony the synth has. May only be set in initialization properties passed to constrcutor.
**/


Gibberish.PolyFM = function() {
  this.__proto__ = new Gibberish.Bus2();
  
	Gibberish.extend(this, {
    name:     "polyfm",
		maxVoices:		5,
		voiceCount:		0,
    children: [],
    frequencies: [],
    _frequency: 0,
    
    polyProperties : {
      glide:		 0,
      attack: 22050,
      decay:  22050,
      index:  5,
      cmRatio:2,
    },
/**###Gibberish.PolyFM.note : method  
Generate an enveloped note at the provided frequency using a simple voice allocation system where if all children are active, the one active the longest cancels its current note and begins playing a new one.    
  
param **frequency** Number. The frequency for the carrier oscillator. The modulator frequency will be calculated automatically from this value in conjunction with the synth's  
param **amp** Number. Optional. The volume to use.  
**/
    note : function(_frequency, amp) {
      var lastNoteIndex = this.frequencies.indexOf( _frequency ),
          idx = lastNoteIndex > -1 ? lastNoteIndex : this.voiceCount++,
          synth = this.children[ idx ];
      
      synth.note(_frequency, amp);
      
      if( lastNoteIndex === -1) {
        this.frequencies[ idx ] = _frequency;
        this._frequency = _frequency
        if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
      }else{
        delete this.frequencies[ idx ]
      }
    },
    
    initVoices : function() {
    	for(var i = 0; i < this.maxVoices; i++) {
    		var props = {
    			attack: 	this.attack,
    			decay:		this.decay,
    			cmRatio:	this.cmRatio,
    			index:		this.index,
          channels: 2,
          useADSR : this.useADSR || false,      
          requireReleaseTrigger: this.requireReleaseTrigger || false,
    			amp: 		  1,
    		};

    		var synth = new Gibberish.FMSynth(props);
    		synth.connect(this);

    		this.children.push(synth);
    	}
    },
	}); 
     
  this.amp = 1 / this.maxVoices;
    
  this.children = [];
  
  if(typeof arguments[0] === 'object') {
    this.maxVoices = arguments[0].maxVoices ? arguments[0].maxVoices : this.maxVoices
    this.useADSR = typeof arguments[0].useADSR !== 'undefined' ? arguments[ 0 ].useADSR : false    
    this.requireReleaseTrigger = typeof arguments[0].requireReleaseTrigger !== 'undefined' ? arguments[ 0 ].requireReleaseTrigger : false    
  }
  
  Gibberish.polyInit(this);
  this.initVoices()
  
	this.processProperties(arguments);
  Gibberish._synth.oscillatorInit.call(this);
};
// this file is dependent on oscillators.js

/**#Gibberish.Sampler - Oscillator
Sample recording and playback.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Sampler({ file:'resources/snare.wav' }).connect();  
// wait until sample has downloaded  
a.note(2);  
a.note(1);  
a.note(-.5);  
b = new Gibberish.Sampler().connect();  
b.record(a, 88200); // record two seconds of a playing  
a.note(8);  
// wait a bit    
b.note(1);`
`
## Constructor
###syntax 1  
**param** *filepath*: String. A path to the audiofile to be opened by the sampler.  
###syntax 2    
**param** *properties*: Object. A dictionary of property values (see below) to set for the sampler on initialization.
- - - -
**/
/**###Gibberish.Sampler.pitch : property  
Number. The speed that the sample is played back at. A pitch of 1 means the sample plays forward at speed it was recorded at, a pitch of -4 means the sample plays backwards at 4 times the speed it was recorded at.
**/
/**###Gibberish.Sampler.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.Sampler.playOnLoad : property  
Number. If this value is set to be non-zero, the sampler will trigger a note at the provided pitch as soon as the sample is downloaded. 
**/
/**###Gibberish.Sampler.isRecording : property  
Boolean. Tells the sample to record into it's buffer. This is handled automatically by the object; there is no need to manually set this property.
**/
/**###Gibberish.Sampler.isPlaying : property  
Number. 0..1. Tells the sample to record into it's buffer. This is handled automatically by the object; there is no need to manually set this property.
**/
/**###Gibberish.Sampler.input : property  
Object. The object the sampler is tapping into and recording.
**/
/**###Gibberish.Sampler.length : property  
Number. The length of the Sampler's buffer.
**/
/**###Gibberish.Sampler.start : property  
Number. When the Sampler's note method is called, sample playback begins at this sample.
**/
/**###Gibberish.Sampler.end : property  
Number. When the Sampler's note method is called, sample playback ends at this sample.
**/
/**###Gibberish.Sampler.loops : property  
Boolean. When true, sample playback loops continuously between the start and end property values.
**/
/**###Gibberish.Sampler.pan : property  
Number. -1..1. Position of the Sampler in the stereo spectrum.
**/

Gibberish.Sampler = function() {
	var phase = 1,
	    interpolate = Gibberish.interpolate,
	    write = 0,
	    panner = Gibberish.makePanner(),
	    debug = 0 ,
	    shouldLoop = 0,
	    out = [0,0],
      buffer = null,
      bufferLength = 1,
      self = this;
      
	Gibberish.extend(this, {
		name: 			"sampler",
    
		file: 			null,
		isLoaded: 	false,
    playOnLoad :  0,
    buffers: {},
    properties : {
    	pitch:			  1,
  		amp:			    1,
  		isRecording: 	false,
  		isPlaying : 	true,
  		input:	 		  0,
  		length : 		  0,
      start :       0,
      end :         1,
      loops :       0,
      pan :         0,
    },
    
/**###Gibberish.Sampler.onload : method  
This is an event handler that is called when a sampler has finished loading an audio file.
Use this to trigger a set of events upon downloading the sample. 
  
param **buffer** Object. The decoded sampler buffers from the audio file
**/ 
		_onload : 		function(decoded) {
			buffer = decoded.channels[0]; 
			bufferLength = decoded.length;
					
			self.end = bufferLength;
      self.length = phase = bufferLength;
      self.isPlaying = true;
					
			//console.log("LOADED ", self.file, bufferLength);
			Gibberish.audioFiles[self.file] = buffer;
			self.buffers[ self.file ] = buffer;
      
      if(self.onload) self.onload();
      
      if(self.playOnLoad !== 0) self.note(self.playOnLoad);
      
			self.isLoaded = true;
		},
    
    switchBuffer: function( bufferID ) { // accepts either number or string
      if( typeof bufferID === 'string' ) {
        if( typeof self.buffers[ bufferID ] !== 'undefined' ) {
          buffer = self.buffers[ bufferID ]
          bufferLength = self.end = self.length = buffer.length
        }
      }else if( typeof bufferID === 'number' ){
        var keys = Object.keys( self.buffers )
        if( keys.length === 0 ) return 
        //console.log( "KEY", keys, keys[ bufferID ], bufferID )
        buffer = self.buffers[ keys[ bufferID ] ]
        bufferLength = self.end = self.length = buffer.length
      }
    },
    
    floatTo16BitPCM : function(output, offset, input){
      //console.log(output.length, offset, input.length )
      for (var i = 0; i < input.length - 1; i++, offset+=2){
        var s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    },
    encodeWAV : function(){
      //console.log("BUFFER LENGTH" + _buffer.length);
      var _buffer = this.getBuffer(),
          wavBuffer = new ArrayBuffer(44 + _buffer.length * 2),
          view = new DataView(wavBuffer),
          sampleRate = Gibberish.context.sampleRate;
      
      function writeString(view, offset, string){
        for (var i = 0; i < string.length; i++){
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      }

      /* RIFF identifier */
      writeString(view, 0, 'RIFF');
      /* file length */
      view.setUint32(4, 32 + _buffer.length * 2, true);
      /* RIFF type */
      writeString(view, 8, 'WAVE');
      /* format chunk identifier */
      writeString(view, 12, 'fmt ');
      /* format chunk length */
      view.setUint32(16, 16, true);
      /* sample format (raw) */
      view.setUint16(20, 1, true);
      /* channel count */
      view.setUint16(22, 1, true);
      /* sample rate */
      view.setUint32(24, sampleRate, true);
      /* byte rate (sample rate * block align) */
      view.setUint32(28, sampleRate * 4, true);
      /* block align (channel count * bytes per sample) */
      view.setUint16(32, 2, true);
      /* bits per sample */
      view.setUint16(34, 16, true);
      /* data chunk identifier */
      writeString(view, 36, 'data');
      /* data chunk length */
      view.setUint32(40, _buffer.length * 2, true);

      this.floatTo16BitPCM(view, 44, _buffer);

      return view;
    },
/**###Gibberish.Sampler.download : method  
Download the sampler buffer as a .wav file. In conjunction with the record method, this enables the Sampler
to record and downlaod Gibberish sessions.
**/  
    download : function() {
      var blob = this.encodeWAV();
      var audioBlob = new Blob( [ blob ] );

      var url =  window.webkitURL.createObjectURL( audioBlob );
      var link = window.document.createElement('a');
      link.href = url;
      link.download = 'output.wav';
      
      var click = document.createEvent("Event");
      click.initEvent("click", true, true);
      
      link.dispatchEvent(click);
    },

/**###Gibberish.Sampler.note : method  
Trigger playback of the samplers buffer
  
param **pitch** Number. The speed the sample is played back at.  
param **amp** Number. Optional. The volume to use.
**/    
		note: function(pitch, amp) {
      
      switch( typeof pitch ) {
        case 'number' :
          this.pitch = pitch
          break;
        case 'function' :
          this.pitch = pitch()
          break;
        case 'object' :
          if( Array.isArray(pitch) ) {
            this.pitch = pitch[ 0 ]
          }
          break;
      }
      // if(typeof this.pitch === 'number' || typeof this.pitch === 'function' ){
      //   this.pitch = pitch;
      // }else if(typeof this.pitch === 'object'){
      //   this.pitch[0] = pitch;
      //   Gibberish.dirty(this);
      // }
      
			if(typeof amp === 'number') this.amp = amp;
					
			if(this.function !== null) {
				this.isPlaying = true;	// needed to allow playback after recording
        
        var __pitch;// = typeof this.pitch === 'number' || typeof this.pitch === 'function' ? this.pitch : this.pitch[0];  // account for modulations
        
        switch( typeof this.pitch ) {
          case 'number' :
            __pitch = this.pitch
            break;
          case 'function' :
            __pitch = this.pitch()
            break;
          case 'object' :
            __pitch = Array.isArray( this.pitch ) ? this.pitch[ 0 ] : this.pitch
            if( typeof __pitch === 'function' ) __pitch = __pitch()
            break;
        }

        if( __pitch > 0 || typeof __pitch === 'object' ) {
          phase = this.start;
				}else{
          phase = this.end;
				}
        
        //this.pitch = __pitch;
			}
		},
/**###Gibberish.Sampler.record : method  
Record the output of a Gibberish ugen for a given amount of time
  
param **ugen** Object. The Gibberish ugen to be recorded.
param **recordLength** Number (in samples). How long to record for.
**/     
    // record : function(input, recordLength) {
    //       this.isRecording = true;
    //       
    //       var self = this;
    //       
    //       this.recorder = new Gibberish.Record(input, recordLength, function() {
    //         self.setBuffer( this.getBuffer() );
    //         self.end = bufferLength = self.getBuffer().length;
    //         self.setPhase( self.end )
    //         self.isRecording = false;
    //       })
    //       .record();
    //       
    //       return this;
    // },

/**###Gibberish.Sampler.getBuffer : method  
Returns a pointer to the Sampler's internal buffer.  
**/
    getBuffer : function() { return buffer; },
    setBuffer : function(b) { buffer = b },
    getPhase : function() { return phase },
    setPhase : function(p) { phase = p },
    getNumberOfBuffers: function() { return Object.keys( self.buffers ).length - 1 },
    
/**###Gibberish.Sampler.callback : method  
Return a single sample. It's a pretty lengthy method signature, they are all properties that have already been listed:  

_pitch, amp, isRecording, isPlaying, input, length, start, end, loops, pan
**/    
  	callback :function(_pitch, amp, isRecording, isPlaying, input, length, start, end, loops, pan) {
  		var val = 0;
  		phase += _pitch;				

  		if(phase < end && phase > 0) {
  			if(_pitch > 0) {
					val = buffer !== null && isPlaying ? interpolate(buffer, phase) : 0;
  			}else{
  				if(phase > start) {
  					val = buffer !== null && isPlaying ? interpolate(buffer, phase) : 0;
  				}else{
  					phase = loops ? end : phase;
  				}
  			}
  			return panner(val * amp, pan, out);
  		}
  		phase = loops && _pitch > 0 ? start : phase;
  		phase = loops && _pitch < 0 ? end : phase;
				
  		out[0] = out[1] = val;
  		return out;
  	},
	})
  .init()
  .oscillatorInit()
  .processProperties(arguments);

	if(typeof arguments[0] !== "undefined") {
		if(typeof arguments[0] === "string") {
			this.file = arguments[0];
      this.pitch = 0;
			//this.isPlaying = true;
		}else if(typeof arguments[0] === "object") {
			if(arguments[0].file) {
				this.file = arguments[0].file;
				//this.isPlaying = true;
			}
		}
	}
  
  //console.log(this);
  		
	/*var _end = 1;
	Object.defineProperty(that, "end", {
		get : function() { return _end; },
		set : function(val) {
			if(val > 1) val = 1;
			_end = val * that.bufferLength - 1;
			Gibberish.dirty(that);
		}
	});
	var _start = 0;
	Object.defineProperty(that, "start", {
		get : function() { return _start; },
		set : function(val) {
			if(val < 0) val = 0;
			_start = val * that.bufferLength - 1;
			Gibberish.dirty(that);
		}
	});
	var _loops = 0;
	Object.defineProperty(that, "loops", {
		get : function() { return _loops; },
		set : function(val) {
			_loops = val;
			that.function.setLoops(_loops);
		}
	});
  */
  
	if(typeof Gibberish.audioFiles[this.file] !== "undefined") {
		buffer =  Gibberish.audioFiles[this.file];
		this.end = this.bufferLength = buffer.length;
		this.buffers[ this.file ] = buffer;
    
    phase = this.bufferLength;
    Gibberish.dirty(this);
    
    if(this.onload) this.onload();
	}else if(this.file !== null){
    var xhr = new XMLHttpRequest(), initSound
        
    xhr.open( 'GET', this.file, true )
    xhr.responseType = 'arraybuffer'
    xhr.onload = function( e ) { initSound( this.response ) }
    xhr.send()
    
    function initSound( arrayBuffer ) {
      Gibberish.context.decodeAudioData(arrayBuffer, function(_buffer) {
        buffer = _buffer.getChannelData(0)
  			self.length = phase = self.end = bufferLength = buffer.length
        self.isPlaying = true;
  			self.buffers[ self.file ] = buffer;

  			//console.log("LOADED", self.file, bufferLength);
  			Gibberish.audioFiles[self.file] = buffer;
			
        if(self.onload) self.onload();
      
        if(self.playOnLoad !== 0) self.note( self.playOnLoad );
      
  			self.isLoaded = true;
      }, function(e) {
        console.log('Error decoding file', e);
      }); 
    }
	}else if(typeof this.buffer !== 'undefined' ) {
		this.isLoaded = true;
					
		buffer = this.buffer;
    this.end = this.bufferLength = buffer.length || 88200;
		    
		phase = this.bufferLength;
		if(arguments[0] && arguments[0].loops) {
			this.loops = 1;
		}
    Gibberish.dirty(this);
    
    if(this.onload) this.onload();
	}
};
Gibberish.Sampler.prototype = Gibberish._oscillator;
Gibberish.Sampler.prototype.record = function(input, recordLength) {
  this.isRecording = true;
  
  var self = this;
  
  this.recorder = new Gibberish.Record(input, recordLength, function() {
    self.setBuffer( this.getBuffer() );
    self.end = bufferLength = self.getBuffer().length;
    self.setPhase( self.end )
    self.isRecording = false;
  })
  .record();
  
  return this;
};
/**#Gibberish.MonoSynth - Synth
A three oscillator monosynth for bass and lead lines. You can set the octave and tuning offsets for oscillators 2 & 3. There is a 24db filter and an envelope controlling
both the amplitude and filter cutoff.
## Example Usage##
`  
t = new Gibberish.Mono({  
	cutoff:0,  
	filterMult:.5,  
	attack:_8,  
	decay:_8,  
	octave2:-1,  
	octave3:-1,  
	detune2:.01,  
	glide:_12,  
}).connect();  
t.note("C3");  `
## Constructors
  param **arguments** : Object. A dictionary of property values to set upon initialization. See the properties section and the example usage section for details.
**/
/**###Gibberish.MonoSynth.waveform : property
String. The primary oscillator to be used. Can currently be 'Sine', 'Square', 'Noise', 'Triangle' or 'Saw'. 
**/
/**###Gibberish.MonoSynth.attack : property
Integer. The length, in samples, of the attack of the amplitude envelope.
**/
/**###Gibberish.MonoSynth.decay : property
Integer. The length, in samples, of the decay of the amplitude envelope.
**/
/**###Gibberish.MonoSynth.amp : property
Float. The peak amplitude of the synth, usually between 0..1
**/
/**###Gibberish.MonoSynth.cutoff : property
Float. The frequency cutoff for the synth's filter. Range is 0..1.
**/
/**###Gibberish.MonoSynth.filterMult : property
Float. As the envelope on the synth progress, the filter cutoff will also change by this amount * the envelope amount.
**/
/**###Gibberish.MonoSynth.resonance : property
Float. The emphasis placed on the filters cutoff frequency. 0..50, however, GOING OVER 5 IS DANGEROUS TO YOUR EARS (ok, maybe 6 is all right...)
**/
/**###Gibberish.MonoSynth.octave2 : property
Integer. The octave difference between oscillator 1 and oscillator 2. Can be positive (higher osc2) or negative (lower osc 2) or 0 (same octave).
**/
/**###Gibberish.MonoSynth.detune2 : property
Float. The amount, from -1..1, the oscillator 2 is detuned. A value of -.5 means osc2 is half an octave lower than osc1. A value of .01 means osc2 is .01 octaves higher than osc1.
**/
/**###Gibberish.MonoSynth.octave3 : property
Integer. The octave difference between oscillator 1 and oscillator 3. Can be positive (higher osc3) or negative (lower osc 3) or 0 (same octave).
**/
/**###Gibberish.MonoSynth.detune3 : property
Float. The amount, from -1..1, the oscillator 3 is detuned. A value of -.5 means osc3 is half an octave lower than osc1. A value of .01 means osc3 is .01 octaves higher than osc1.
**/
/**###Gibberish.MonoSynth.glide : property
Integer. The length in time, in samples, to slide in pitch from one note to the next.
**/
Gibberish.MonoSynth = function() {  
	Gibberish.extend(this, { 
    name:       'monosynth',
    
    properties: {
  		attack:			10000,
  		decay:			10000,
  		cutoff:			.2,
  		resonance:	2.5,
  		amp1:			  1,
  		amp2:			  1,
  		amp3:			  1,
  		filterMult:	.3,
  		isLowPass:	true,
      pulsewidth: .5,
  		amp:		    .6,
  		detune2:		.01,
  		detune3:		-.01,
  		octave2:		1,
  		octave3:		-1,
      glide:      0,
  		pan:			  0,
  		frequency:	0,
      channels:   2,
    },
    
		waveform:		"Saw3",
/**###Gibberish.MonoSynth.note : method
param **note or frequency** : String or Integer. You can pass a note name, such as "A#4", or a frequency value, such as 440.
param **amp** : Optional. Float. The volume of the note, usually between 0..1. The main amp property of the Synth will also affect note amplitude.
**/				
		note : function(_frequency, amp) {
      if(typeof amp !== 'undefined' && amp !== 0) this.amp = amp;
      
      if( amp !== 0 ) {
    		if(typeof this.frequency === 'number' ){
          this.frequency = _frequency;
        }else{
          if( typeof this.frequency === 'function' ) { // needed for Gibber TODO: remove?
            if( typeof this.frequency()[0] === 'undefined' ) {
              this.frequency = _frequency
            }else{
              this.frequency()[0] = _frequency
            }
          }else{
            this.frequency[0] = _frequency;
          }
          Gibberish.dirty(this);
        }
        
  			if(envstate() > 0 ) _envelope.run();
      }
		},
  	_note : function(frequency, amp) {
  		if(typeof this.frequency !== 'object'){
        if( useADSR && frequency === lastFrequency && amp === 0) {
          this.releaseTrigger = 1;
          return;
        }
        if( amp !== 0 ) {
          this.frequency = lastFrequency = frequency;
        }
        this.releaseTrigger = 0;
      }else{
        if( amp !== 0 ) {
          this.frequency[0] = lastFrequency = frequency;
        }
        this.releaseTrigger = 0;
        Gibberish.dirty(this);
      }
					
  		if(typeof amp !== 'undefined' && amp !== 0) this.amp = amp;
	  
      if( amp !== 0 ) { _envelope.run(); }
  	},
	});
  
	var waveform = this.waveform;
	Object.defineProperty(this, "waveform", {
		get: function() { return waveform; },
		set: function(value) {
			if(waveform !== value) {
				waveform = value;
						
				osc1 = new Gibberish[value]().callback;
				osc2 = new Gibberish[value]().callback;
				osc3 = new Gibberish[value]().callback;
			}
		},
	});
  
	var _envelope = new Gibberish.AD(this.attack, this.decay),
      envstate  = _envelope.getState,
      envelope  = _envelope.callback,
      filter    = new Gibberish.Filter24().callback,
    	osc1      = new Gibberish[this.waveform](this.frequency,  this.amp1).callback,
    	osc2      = new Gibberish[this.waveform](this.frequency2, this.amp2).callback,
    	osc3      = new Gibberish[this.waveform](this.frequency3, this.amp3).callback,
      lag       = new Gibberish.OnePole().callback,      
    	panner    = Gibberish.makePanner(),
    	out       = [0,0];
    
  this.callback = function(attack, decay, cutoff, resonance, amp1, amp2, amp3, filterMult, isLowPass, pulsewidth, masterAmp, detune2, detune3, octave2, octave3, glide, pan, frequency, channels) {
		if(envstate() < 2) {
      if(glide >= 1) glide = .9999;
      frequency = lag(frequency, 1-glide, glide);
      
			var frequency2 = frequency;
			if(octave2 > 0) {
				for(var i = 0; i < octave2; i++) {
					frequency2 *= 2;
				}
			}else if(octave2 < 0) {
				for(var i = 0; i > octave2; i--) {
					frequency2 /= 2;
				}
			}
					
			var frequency3 = frequency;
			if(octave3 > 0) {
				for(var i = 0; i < octave3; i++) {
					frequency3 *= 2;
				}
			}else if(octave3 < 0) {
				for(var i = 0; i > octave3; i--) {
					frequency3 /= 2;
				}
			}
				
			frequency2 += detune2 > 0 ? ((frequency * 2) - frequency) * detune2 : (frequency - (frequency / 2)) * detune2;
			frequency3 += detune3 > 0 ? ((frequency * 2) - frequency) * detune3 : (frequency - (frequency / 2)) * detune3;
							
			var oscValue = osc1(frequency, amp1, pulsewidth) + osc2(frequency2, amp2, pulsewidth) + osc3(frequency3, amp3, pulsewidth);
			var envResult = envelope(attack, decay);
			var val = filter( oscValue, cutoff + filterMult * envResult, resonance, isLowPass, 1) * envResult;
			val *= masterAmp;
			out[0] = out[1] = val;
			return channels === 1 ? out : panner(val, pan, out);
		}else{
			out[0] = out[1] = 0;
			return out;
		}
	}; 
  
  this.init();
  this.oscillatorInit();     
	this.processProperties(arguments);
};
Gibberish.MonoSynth.prototype = Gibberish._synth; 
/**#Gibberish.Binops - Miscellaneous
These objects create binary operations - mathematical operations taking two arguments - and create signal processing functions using them. They are primarily used for
modulation purposes. You can export the constructors for easier use similar to the [Time](javascript:displayDocs('Gibberish.Time'\)) constructors.

Add, Sub, Mul and Div can actually take as many arguments as you wish. For example, Add(1,2,3,4) will return an object that outputs 10. You can stack multiple oscillators this way as well.

##Example Usage   
`// This example creates a tremolo effect via amplitude modulation  
Gibberish.Binops.export(); // now all constructors are also part of the window object  
mod = new Gibberish.Sine(4, .25);  
sin = new Gibberish.Sine( 440, add( .5, mod ) ).connect();  
`
**/

Gibberish.Binops = {
/**###Gibberish.Binops.export : method  
Use this to export the constructor methods of Gibberish.Binops so that you can tersely refer to them.

param **target** object, default window. The object to export the Gibberish.Binops constructors into.
**/  
  export: function(target) {
    Gibberish.export("Binops", target || window);
  },
  
  operator : function () {
    var me = new Gibberish.ugen(),
        op = arguments[0],
        args = Array.prototype.slice.call(arguments, 1);
    
    me.name = 'op';
    me.properties = {};
    for(var i = 0; i < args.length; i++) { 
      me.properties[i] = args[i]; 
    }
    me.init.apply( me, args );
    
    me.codegen = function() {
      var keys, out = "( ";
      
      //if(typeof Gibberish.memo[this.symbol] !== 'undefined') { return Gibberish.memo[this.symbol]; }
      
      keys = Object.keys(this.properties);

      for(var i = 0; i < keys.length; i++) {
        var isObject = typeof this[i] === 'object';
        
        var shouldPush = false;
        if(isObject) {
          //if(!Gibberish.memo[ this[i].symbol ]) {
          //  shouldPush = true;
            out += this[i].codegen();
            //}else{
          //  out += Gibberish.memo[ this[i].symbol ];
          //}
        }else{
          out += this[i];
        }
        
        if(i < keys.length - 1) { out += " " + op + " "; }
        
        //if( isObject && shouldPush ) Gibberish.codeblock.push(this[i].codeblock); 
      }
      
      out += " )";
      
      this.codeblock = out;
      //Gibberish.memo[this.symbol] = out;
      
      return out;
    };
    
    me.valueOf = function() { return me.codegen() }
        
    //me.processProperties.apply( me, args );

    return me;
  },
  
/**###Gibberish.Binops.Add : method  
Create an object that sums all arguments at audio rate. The arguments may be unit generators, numbers, or any mix of the two.
**/
  Add : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('+');
    
    return Gibberish.Binops.operator.apply(null, args);
  },

/**###Gibberish.Binops.Sub : method  
Create an object that starts with the first argument and subtracts all subsequent arguments at audio rate. The arguments may be unit generators, numbers, or any mix of the two.
**/
  Sub : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('-');
    
    return Gibberish.Binops.operator.apply(null, args);
  },

/**###Gibberish.Binops.Mul : method  
Create an object that calculates the product of all arguments at audio rate. The arguments may be unit generators, numbers, or any mix of the two.
**/
  Mul : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('*');
    
    return Gibberish.Binops.operator.apply(null, args);
  },

/**###Gibberish.Binops.Div : method  
Create an object that takes the first argument and divides it by all subsequent arguments at audio rate. The arguments may be unit generators, numbers, or any mix of the two.
**/
  Div : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('/');
    
    return Gibberish.Binops.operator.apply(null, args);
  },

/**###Gibberish.Binops.Mod : method  
Create an object that takes the divides the first argument by the second and returns the remainder at audio rate. The arguments may be unit generators, numbers, or any mix of the two.
**/  
  Mod : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('%');
    
    return Gibberish.Binops.operator.apply(null, args);

  },

/**###Gibberish.Binops.Abs : method  
Create an object that returns the absolute value of the (single) argument. The argument may be a unit generator or number.
**/  
  Abs : function() {
    var args = Array.prototype.slice.call(arguments, 0),
    me = {
      name : 'abs',
      properties : {},
      callback : Math.abs.bind( me ),
    };
    me.__proto__ = new Gibberish.ugen();
    me.properties[0] = args[0];
    me.init();

    return me;
  },
/**###Gibberish.Binops.Sqrt : method  
Create an object that returns the square root of the (single) argument. The argument may be a unit generator or number.
**/    
  Sqrt : function() {
    var args = Array.prototype.slice.call(arguments, 0),
    me = {
      name : 'sqrt',
      properties : {},
      callback : Math.sqrt.bind(me),
    };
    me.__proto__ = new Gibberish.ugen();    
    me.properties[i] = arguments[0];
    me.init();

    return me;
  },

/**###Gibberish.Binops.Pow : method  
Create an object that returns the first argument raised to the power of the second argument. The arguments may be a unit generators or numbers.
**/      
  Pow : function() {
    var args = Array.prototype.slice.call(arguments, 0),
    me = {
      name : 'pow',
      properties : {},
      callback : Math.pow.bind(me),
    };
    me.__proto__ = new Gibberish.ugen();
  
    for(var i = 0; i < args.length; i++) { me.properties[i] = args[i]; }
    me.init();
    
    console.log( me.callback )
    return me;
  },
  
  Clamp : function() {
    var args = Array.prototype.slice.call(arguments, 0),
    me = {
      name : 'clamp',
      properties : { input:0, min:0, max:1 },
      callback : function( input, min, max ) {
        if( input < min ) {
          input = min
        }else if( input > max ) {
          input = max
        }
        return input
      },
    };
    me.__proto__ = new Gibberish.ugen();

    me.init();
    me.processProperties( args );

    return me;
  },
  
  Merge : function() {
    var args = Array.prototype.slice.call(arguments, 0),
    me = {
      name : 'merge',
      properties : {},
      callback : function(a) {
        return a[0] + a[1];
      },
    };
    me.__proto__ = new Gibberish.ugen();
  
    for(var i = 0; i < args.length; i++) {
      me.properties[i] = args[i];
    }
    me.init();

    return me;
  },
            
  Map : function( prop, _outputMin, _outputMax, _inputMin, _inputMax, _curve, _wrap) {
    var pow = Math.pow,
    LINEAR = 0,
    LOGARITHMIC = 1,
    base = 0,
    phase = 0,
    _value = 0,
    me = {
      name : 'map',
      properties : { input:prop, outputMin:_outputMin, outputMax:_outputMax, inputMin:_inputMin, inputMax:_inputMax, curve:_curve || LINEAR, wrap: _wrap || false },
      callback : function( v, v1Min, v1Max, v2Min, v2Max, curve, wrap ) {
        var range1 = v1Max-v1Min,
            range2 = v2Max - v2Min,
            percent = (v - v2Min) / range2,
            val 
        
        if( percent > 1 ) {
          percent = wrap ? percent % 1 : 1
        }else if( percent < 0 ) {
          percent = wrap ? 1 + (percent % 1) : 0
        }
        
        val = curve === 0 ? v1Min + ( percent * range1 ) : v1Min + pow( percent, 1.5 ) * range1
        
        _value = val
        // if(phase++ % 22050 === 0 ) console.log( _value, percent, v )
        return val
      },
      // map_22(v_28, 0, 255, -1, 1, 0, false);
      getValue: function() { return _value },
      invert: function() {
        var tmp = me.outputMin
        me.outputMin = me.outputMax
        me.outputMax = tmp
      }
    }
  
    me.__proto__ = new Gibberish.ugen()
  
    me.init()

    return me
  },
};
/**#Gibberish.Time - Miscellaneous
This object is used to simplify timing in Gibberish. It contains an export function to place its methods in another object (like window)
so that you can code more tersely. The methods of the Time object translate ms, seconds and beats into samples. The default bpm is 120.

##Example Usage   
`Gibberish.Time.export(); // now all methods are also part of the window object
a = new Gibberish.Sine(440).connect();  
b = new Gibberish.Sequencer({ target:a, key:'frequency', durations:[ seconds(1), ms(500), beats( .5 ) ], values:[220,440,880] }).start()  
`
**/

/**###Gibberish.Time.bpm : property  
Number. Default 120. The beats per minute setting used whenever a call to the beats method is made.
**/

/**###Gibberish.Time.export : method  
Use this to export the methods of Gibberish.Time so that you can tersely refer to them.

param **target** object, default window. The object to export the Gibberish.Time methods into.
**/  

/**###Gibberish.Time.ms : method  
Convert the parameter from milliseconds to samples.

param **ms** number. The number of milliseconds to convert.
**/  

/**###Gibberish.Time.seconds : method  
Convert the parameter from seconds to samples.

param **seconds** number. The number of seconds to convert.
**/  

/**###Gibberish.Time.beats : method  
Return a function that converts the parameter from beats to samples. This method uses the bpm property of the Gibberish.Time object to determine the duration of a sample.
You can use the function returned by this method in a Sequencer; if Gibberish.Time.bpm is changed before the function is executed the function will use the updated value.

param **seconds** number. The number of seconds to convert.
**/  

Gibberish.Time = {
  bpm: 120,
  
  export: function(target) {
    Gibberish.export("Time", target || window);
  },
  
  ms : function(val) {
    return val * Gibberish.context.sampleRate / 1000;
  },
  
  seconds : function(val) {
    return val * Gibberish.context.sampleRate;
  },
  
  beats : function(val) {
    return function() { 
      var samplesPerBeat = Gibberish.context.sampleRate / ( Gibberish.Time.bpm / 60 ) ;
      return samplesPerBeat * val ;
    }
  },
};
/**#Gibberish.Sequencer - Miscellaneous
A sample-accurate sequencer that can sequence changes to properties, method calls or anonymous function calls.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.Sequencer({ target:a, key:'note', durations:[11025, 22050], values:[440, 880] }).start()
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the sequencer on initialization.
- - - -
**/
/**###Gibberish.Sequencer.target : property  
Object. An object for the sequencer to control. May be null if you are sequencing anonymous functions.
**/
/**###Gibberish.Sequencer.key : property  
String. The name of the method or property you would like to sequnce on the Sequencer's target object.
**/
/**###Gibberish.Sequencer.durations : property  
Array. The number of samples between each advancement of the Sequencer. Once the Sequencer arrives at the end of this list, it loops back to the beginning
**/
/**###Gibberish.Sequencer.keysAndValues : property  
Object. A dictionary holding a set of values to be sequenced. The keys of the dictionary determine which methods and properties to sequence on the Sequencer's target object and
each key has an array of values representing the sequence for that key.
  
`Gibberish.init();  
a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.Sequencer({ target:a, durations:[11025, 22050], keysAndValues:{ 'note':[440,880], 'amp':[.2,.4] } }).start()
`
**/

Gibberish.Sequencer2 = function() {
  var that = this,
      phase = 0;
  
  Gibberish.extend(this, {
    target        : null,
    key           : null,
    values        : null,
    valuesIndex   : 0,
    durations     : null,
    durationsIndex: 0,
    nextTime      : 0,
    playOnce      : false,
    repeatCount   : 0,
    repeatTarget  : null,
    isConnected   : true,
    keysAndValues : null,
    counts        : {},
    properties    : { rate: 1, isRunning:false, nextTime:0 },
    offset        : 0,
    name          : 'seq',
    
    callback : function(rate, isRunning, nextTime) {
      if(isRunning) {
        if(phase >= nextTime) {
          if(that.values !== null) {
            if(that.target) {
              var val = that.values[ that.valuesIndex++ ];
              
              if(typeof val === 'function') { val = val(); }
              
              if(typeof that.target[that.key] === 'function') {
                that.target[that.key]( val );
              }else{
                that.target[that.key] = val;
              }
            }else{
              if(typeof that.values[ that.valuesIndex ] === 'function') {
                that.values[ that.valuesIndex++ ]();
              }
            }
            if(that.valuesIndex >= that.values.length) that.valuesIndex = 0;
          }else if(that.keysAndValues !== null) {
            for(var key in that.keysAndValues) {
              var index = that.counts[key]++;
              var val = that.keysAndValues[key][index];
              
              if(typeof val === 'function') { val = val(); }
              
              if(typeof that.target[key] === 'function') {
                that.target[key]( val );
              }else{
                that.target[key] = val;
              }
              if(that.counts[key] >= that.keysAndValues[key].length) {
                that.counts[key] = 0;
              }
              if( that.chose ) that.chose( key, index )
            }
          }else if(typeof that.target[that.key] === 'function') {
            that.target[that.key]();
          }
          
          phase -= nextTime;
        
          if(Array.isArray(that.durations)) {
            var next = that.durations[ that.durationsIndex++ ];
            that.nextTime = typeof next === 'function' ? next() : next;
            if( that.chose ) that.chose( 'durations', that.durationsIndex - 1 )
            if( that.durationsIndex >= that.durations.length) {
              that.durationsIndex = 0;
            }
          }else{
            var next = that.durations;
            that.nextTime = typeof next === 'function' ? next() : next;
          }
          
          if(that.repeatTarget) {
            that.repeatCount++;
            if(that.repeatCount === that.repeatTarget) {
              that.isRunning = false;
              that.repeatCount = 0;
            }
          }
          
          return 0;
        }
      
        phase += rate; //that.rate;
      }
      return 0;
    },
    
/**###Gibberish.Sequencer.start : method  
Start the sequencer running.

param **shouldKeepOffset** boolean, default false. If true, the phase of the sequencer will not be reset when calling the start method.
**/     
    start : function(shouldKeepOffset) {
      if(!shouldKeepOffset) {
        phase = 0;
      }
      
      this.isRunning = true;
      return this;
    },

/**###Gibberish.Sequencer.stop : method  
Stop the sequencer.
**/     
    stop: function() {
      this.isRunning = false;
      return this;
    },
    
/**###Gibberish.Sequencer.repeat : method  
Play the sequencer a certain number of times and then stop it.

param **timesToRepeat** number. The number of times to repeat the sequence.
**/        
    repeat : function(times) {
      this.repeatTarget = times;
      return this;
    },
    
    shuffle : function() {
      for( key in this.keysAndValues ) {
        this.shuffleArray( this.keysAndValues[ key ] )
      }
    },
    
    shuffleArray : function( arr ) {
  		for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    },
/**###Gibberish.Sequencer.disconnect : method  
Each sequencer object has a tick method that is called once per sample. Use the disconnect method to stop the tick method from being called.
**/     
    /*disconnect : function() {
      var idx = Gibberish.sequencers.indexOf( this );
      Gibberish.sequencers.splice( idx, 1 );
      this.isConnected = false;
    },*/
/**###Gibberish.Sequencer.connect : method  
Each sequencer object has a tick method that is called once per sample. Use the connect method to start calling the tick method. Note that the connect
method is called automatically when the sequencer is first created; you should only need to call it again if you call the disconnect method at some point.
**/    
    /*connect : function() {
      if( Gibberish.sequencers.indexOf( this ) === -1 ) {
        Gibberish.sequencers.push( this );
      }
      Gibberish.dirty( this )
    },*/
  });
  
  this.init( arguments );
  this.processProperties( arguments );
  
  for(var key in this.keysAndValues) {
    this.counts[key] = 0;
  }
  
  this.oscillatorInit();
  
  phase += this.offset
  
  this.connect();
};
Gibberish.Sequencer2.prototype = Gibberish._oscillator
/**#Gibberish.Sequencer - Miscellaneous
A sample-accurate sequencer that can sequence changes to properties, method calls or anonymous function calls.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.Sequencer({ target:a, key:'note', durations:[11025, 22050], values:[440, 880] }).start()
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the sequencer on initialization.
- - - -
**/
/**###Gibberish.Sequencer.target : property  
Object. An object for the sequencer to control. May be null if you are sequencing anonymous functions.
**/
/**###Gibberish.Sequencer.key : property  
String. The name of the method or property you would like to sequnce on the Sequencer's target object.
**/
/**###Gibberish.Sequencer.durations : property  
Array. The number of samples between each advancement of the Sequencer. Once the Sequencer arrives at the end of this list, it loops back to the beginning
**/
/**###Gibberish.Sequencer.keysAndValues : property  
Object. A dictionary holding a set of values to be sequenced. The keys of the dictionary determine which methods and properties to sequence on the Sequencer's target object and
each key has an array of values representing the sequence for that key.
  
`Gibberish.init();  
a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.Sequencer({ target:a, durations:[11025, 22050], keysAndValues:{ 'note':[440,880], 'amp':[.2,.4] } }).start()
`
**/

Gibberish.Sequencer = function() {  
  Gibberish.extend(this, {
    target        : null,
    key           : null,
    values        : null,
    valuesIndex   : 0,
    durations     : null,
    durationsIndex: 0,
    nextTime      : 0,
    phase         : 0,
    isRunning     : false,
    playOnce      : false,
    repeatCount   : 0,
    repeatTarget  : null,
    isConnected   : true,
    keysAndValues : null,
    counts        : {},
    offset        : 0,
    name          : 'seq',
    
    tick : function() {
      if(this.isRunning) {
        if(this.phase >= this.nextTime) {
          if(this.values !== null) {
            if(this.target) {
              var val = this.values[ this.valuesIndex++ ];
              
              if(typeof val === 'function') { 
                try {
                  val = val(); 
                }catch(e) {
                  console.error('ERROR: Can\'t execute function triggered by Sequencer:\n' + val.toString() )
                  this.values.splice( this.valuesIndex - 1, 1)
                  this.valuesIndex--;
                }
              }
              
              if(typeof this.target[this.key] === 'function') {
                this.target[this.key]( val );
              }else{
                this.target[this.key] = val;
              }
            }else{
              if(typeof this.values[ this.valuesIndex ] === 'function') {
                try {
                  this.values[ this.valuesIndex++ ]();
                }catch(e) {
                  console.error('ERROR: Can\'t execute function triggered by Sequencer:\n' + this.values[ this.valuesIndex - 1 ].toString() )
                  this.values.splice( this.valuesIndex - 1, 1)
                  this.valuesIndex--;
                }
              }
            }
            if(this.valuesIndex >= this.values.length) this.valuesIndex = 0;
          }else if(this.keysAndValues !== null) {
            for(var key in this.keysAndValues) {
              var index = typeof this.keysAndValues[ key ].pick === 'function' ? this.keysAndValues[ key ].pick() : this.counts[key]++;
              var val = this.keysAndValues[key][index];
              
              if(typeof val === 'function') { 
                try {
                  val = val(); 
                }catch(e) {
                  console.error('ERROR: Can\'t execute function triggered by Sequencer:\n' + val.toString() )
                  this.keysAndValues[key].splice( index, 1)
                  if( typeof this.keysAndValues[ key ].pick !== 'function' ) {
                    this.counts[key]--;
                  }
                }
              }
              
              if(typeof this.target[key] === 'function') {
                this.target[key]( val );
              }else{
                this.target[key] = val;
              }
              if(this.counts[key] >= this.keysAndValues[key].length) {
                this.counts[key] = 0;
              }
            }
          }else if(typeof this.target[this.key] === 'function') {
            this.target[this.key]();
          }
          
          this.phase -= this.nextTime;
        
          if(Array.isArray(this.durations)) {
            var next = typeof this.durations.pick === 'function' ? this.durations[ this.durations.pick() ] : this.durations[ this.durationsIndex++ ];
            this.nextTime = typeof next === 'function' ? next() : next;
            if( this.durationsIndex >= this.durations.length) {
              this.durationsIndex = 0;
            }
          }else{
            var next = this.durations;
            this.nextTime = typeof next === 'function' ? next() : next;
          }
          
          if(this.repeatTarget) {
            this.repeatCount++;
            if(this.repeatCount === this.repeatTarget) {
              this.isRunning = false;
              this.repeatCount = 0;
            }
          }
          
          return;
        }
      
        this.phase++
      }
    },

/**###Gibberish.Sequencer.start : method  
Start the sequencer running.

param **shouldKeepOffset** boolean, default false. If true, the phase of the sequencer will not be reset when calling the start method.
**/     
    start : function(shouldKeepOffset) {
      if(!shouldKeepOffset) {
        this.phase = this.offset;
      }
      
      this.isRunning = true;
      return this;
    },

/**###Gibberish.Sequencer.stop : method  
Stop the sequencer.
**/     
    stop: function() {
      this.isRunning = false;
      return this;
    },
    
/**###Gibberish.Sequencer.repeat : method  
Play the sequencer a certain number of times and then stop it.

param **timesToRepeat** number. The number of times to repeat the sequence.
**/        
    repeat : function(times) {
      this.repeatTarget = times;
      return this;
    },
    
    shuffle : function() {
      for( key in this.keysAndValues ) {
        this.shuffleArray( this.keysAndValues[ key ] )
      }
    },
    
    shuffleArray : function( arr ) {
  		for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    },

/**###Gibberish.Sequencer.disconnect : method  
Each sequencer object has a tick method that is called once per sample. Use the disconnect method to stop the tick method from being called.
**/     
    disconnect : function() {
      var idx = Gibberish.sequencers.indexOf( this );
      Gibberish.sequencers.splice( idx, 1 );
      this.isConnected = false;
    },
/**###Gibberish.Sequencer.connect : method  
Each sequencer object has a tick method that is called once per sample. Use the connect method to start calling the tick method. Note that the connect
method is called automatically when the sequencer is first created; you should only need to call it again if you call the disconnect method at some point.
**/    
    connect : function() {
      if( Gibberish.sequencers.indexOf( this ) === -1 ) {
        Gibberish.sequencers.push( this );
      }
      
      this.isConnected = true
      
      return this
    },
  });
  
  for(var key in arguments[0]) {
    this[key] = arguments[0][key];
  }
  
  for(var key in this.keysAndValues) {
    this.counts[key] = 0;
  }
  
  this.connect();
  
  this.phase += this.offset
  
  //this.init( arguments );
  //this.oscillatorInit();
  //this.processProperties( arguments );
};
Gibberish.Sequencer.prototype = Gibberish._oscillator
// TODO: must fix scale seq

/*
c = new Gibberish.Synth({ pan:-1 }).connect();
b = new Gibberish.Synth({ pan:1 }).connect(); 
a = new Gibberish.PolySeq({ 
  seqs:[
    { key:'note', target:b, values:[440,880], durations:22050 },
    { key:'note', target:c, values:[220,1320], durations:[11025, 22050, 5512.5] },
  ] 
}).start()
*/
Gibberish.PolySeq = function() {
  var that = this,
      phase = 0,
      sort = function(a,b) { if( a < b ) return -1; if( a > b ) return 1; return 0; } ;
  
  Gibberish.extend(this, {
    seqs          : [],
    timeline      : {},
    playOnce      : false,
    repeatCount   : 0,
    repeatTarget  : null,
    isConnected   : false,
    properties    : { rate: 1, isRunning:false, nextTime:0 },
    offset        : 0,
    autofire      : [],
    name          : 'polyseq',
    getPhase      : function() { return phase },
    add           : function( seq ) {
      seq.valuesIndex = seq.durationsIndex = 0
      that.seqs.push( seq )
      
      //console.log("PRIORITY", seq.priority )
      
      if( seq.durations === null ) {
        that.autofire.push( seq )
      }
      
      if( typeof that.timeline[ phase ] !== 'undefined' ) {
        if( seq.priority ) {
          that.timeline[ phase ].unshift( seq )
        }else{
          that.timeline[ phase ].push( seq )
        }
      }else{
        that.timeline[ phase ] = [ seq ]
      }
      
      // for Gibber... TODO: remove from Gibberish
      if( that.scale && (seq.key === 'frequency' || seq.key === 'note') ) {
        if( that.applyScale ) {
          that.applyScale()
        }
      }
      
      that.nextTime = phase
      seq.shouldStop = false
    },
    
    callback : function(rate, isRunning, nextTime) {
      var newNextTime;
      
      if(isRunning) {
        if(phase >= nextTime) {
          var seqs = that.timeline[ nextTime ],
              phaseDiff = phase - nextTime
              
          if( typeof seqs === 'undefined') return
          
          if( that.autofire.length ) seqs = seqs.concat( that.autofire )
          
          for( var j = 0; j < seqs.length; j++ ) {
            var seq = seqs[ j ]
            if( seq.shouldStop ) continue;

            var idx = seq.values.pick ? seq.values.pick() : seq.valuesIndex++ % seq.values.length,
                val = seq.values[ idx ];
    
            if(typeof val === 'function') { val = val(); } // will also call anonymous function
    
            if( seq.target ) {
              if(typeof seq.target[ seq.key ] === 'function') {
                seq.target[ seq.key ]( val );
              }else{
                seq.target[ seq.key ] = val;
              }
            }
            
            if( that.chose ) that.chose( seq.key, idx )
            
            if( seq.durations !== null ) { 
              if( Array.isArray( seq.durations ) ) {
                var idx = seq.durations.pick ? seq.durations.pick() : seq.durationsIndex++,
                    next = seq.durations[ idx ]

                newNextTime = typeof next === 'function' ? next() : next;
                if( seq.durationsIndex >= seq.durations.length ) {
                  seq.durationsIndex = 0;
                }
                if( that.chose ) that.chose( 'durations', idx )
              }else{
                var next = seq.durations;
                newNextTime = typeof next === 'function' ? next() : next;
              }
          
              var t;
            
              if( typeof Gibber !== 'undefined' ) {
                t = Gibber.Clock.time( newNextTime ) + phase // TODO: remove Gibber link... how?
              }else{
                t = newNextTime + phase
              }
            
              t -= phaseDiff
              newNextTime -= phaseDiff
            
              if( typeof that.timeline[ t ] === 'undefined' ) {
                that.timeline[ t ] = [ seq ]
              }else{
                if( seq.priority ) {
                  that.timeline[ t ].unshift( seq )
                }else{
                  that.timeline[ t ].push( seq )
                }
              }
            }
          }
          
          delete that.timeline[ nextTime ]
          
          var times = Object.keys( that.timeline ),
              timesLength = times.length;
          
          if( timesLength > 1 ) {
            for( var i = 0; i < timesLength; i++ ) {
              times[ i ] = parseFloat( times[i] )
            }
          
            times = times.sort( sort )
            that.nextTime = times[0]
          }else{
            that.nextTime = parseFloat( times[0] )
          }
          
          // if(that.repeatTarget) {
          //   that.repeatCount++;
          //   if(that.repeatCount === that.repeatTarget) {
          //     that.isRunning = false;
          //     that.repeatCount = 0;
          //   }
          // }  
        }
        
        // TODO: If you set the phase to 0, it will be lower than nextTime for many many samples in a row, causing it to quickly skip
        // through lots of key / value pairs.
        
        phase += rate;
      }
      return 0;
    },
  
    start : function(shouldKeepOffset, priority) {
      if(!shouldKeepOffset || ! this.offset ) {
        phase = 0;
        this.nextTime = 0;
        
        this.timeline = { 0:[] }
        for( var i = 0; i < this.seqs.length; i++ ) {
          var _seq = this.seqs[ i ]
    
          _seq.valuesIndex = _seq.durationsIndex = _seq.shouldStop = 0
    
          this.timeline[ 0 ].push( _seq )
        }
      }else{
        phase = 0;
        this.nextTime = this.offset;
        
        var ___key = ''+this.offset
        
        this.timeline = {}
        this.timeline[ ___key ] = []

        for( var i = 0; i < this.seqs.length; i++ ) {
          var _seq = this.seqs[ i ]
    
          _seq.valuesIndex = _seq.durationsIndex = _seq.shouldStop = 0
    
          this.timeline[ ___key ].push( _seq )
        }
      }
      
      if( !this.isConnected ) {
        this.connect( Gibberish.Master, priority )
        this.isConnected = true
      }
      
      this.isRunning = true;
      return this;
    },
    
    stop: function() {
      this.isRunning = false;
      
      if( this.isConnected ) {
        this.disconnect()
        this.isConnected = false
      }
      return this;
    },
       
    repeat : function(times) {
      this.repeatTarget = times;
      return this;
    },
    
    shuffle : function( seqName ) {
      if( typeof seqName !== 'undefined' ) {
        for( var i = 0; i < this.seqs.length; i++ ) {
          if( this.seqs[i].key === seqName ) {
            this.shuffleArray( this.seqs[i].values )
          }
        }
      }else{
        for( var i = 0; i < this.seqs.length; i++ ) {
          this.shuffleArray( this.seqs[i].values )
        }
      }
    },
    
    shuffleArray : function( arr ) {
  		for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    },

  });
  
  this.init( arguments );
  this.processProperties( arguments );
  
  this.oscillatorInit();
};
Gibberish.PolySeq.prototype = Gibberish._oscillator
var _hasInput = false; // wait until requested to ask for permissions so annoying popup doesn't appear automatically

function createInput() {
  console.log("connecting audio input...");
  
  navigator.webkitGetUserMedia(
		{audio:true}, 
		function (stream) {
      console.log( 'audio input connected' )
	    Gibberish.mediaStreamSource = Gibberish.context.createMediaStreamSource( stream );
	    Gibberish.mediaStreamSource.connect( Gibberish.node );
			_hasInput = true;
		},
    function() { 
      console.log( 'error opening audio input')
    }
	)
}
/**#Gibberish.Input - Oscillator
Accept input from computer's line-in or microphone input. Use headphones and beware feedback! Reading the audio input is currently only supported by Google Chrome.

## Example Usage##
`
Gibberish.init();  
a = new Gibberish.Input()  
b = new Gibberish.Delay( a ).connect()  
- - - -
**/
/**###Gibberish.Input.amp : property  
Number. A gain multiplier for the input
**/

Gibberish.Input = function() {
  var out = [], phase = 0;
  
	if(!_hasInput) { 
		createInput(); 
	}
  
  this.type = this.name = 'input'
  
  this.fx = new Array2() 
  this.fx.parent = this
  
  this.properties = {
    input : 'input',
    amp : .5,  
    channels : 1,
  }
  
  this.callback = function(input, amp, channels) {
    if(channels === 1) {
      out = input * amp;
    }else {
      out[0] = input[0] * amp;
      out[1] = input[1] * amp;      
    }
    return out;
  }
  
  this.init( arguments )
  this.processProperties( arguments )
};
Gibberish.Input.prototype = new Gibberish.ugen();
Gibberish.Kick = function() {
  var trigger = false,
    	bpf = new Gibberish.SVF().callback,
    	lpf = new Gibberish.SVF().callback,
      _decay = .2,
      _tone = .8;
      
  Gibberish.extend(this, {
  	name:		"kick",
    properties:	{ pitch:50, __decay:20, __tone: 1000, amp:2, sr: Gibberish.context.sampleRate },
	
  	callback: function(pitch, decay, tone, amp, sr) {					
  		var out = trigger ? 60 : 0;
			
  		out = bpf( out, pitch, decay, 2, sr );
  		out = lpf( out, tone, .5, 0, sr );
		
  		out *= amp;
		
  		trigger = false;
		
  		return out;
  	},

  	note : function(p, d, t, amp) {
  		if(typeof p === 'number') this.pitch = p;
  		if(typeof d === 'number') this.decay = d;
  		if(typeof t === 'number') this.tone = t;
  		if(typeof amp === 'number') this.amp = amp;
		
      trigger = true;
  	},
  })
  .init()
  .oscillatorInit();
  
  Object.defineProperties(this, {
    decay :{
      get: function() { return _decay; },
      set: function(val) { _decay = val > 1 ? 1 : val; this.__decay = _decay * 100; }
    },
    tone :{
      get: function() { return _tone; },
      set: function(val) { _tone = val > 1 ? 1 : val; this.__tone = 220 + val * 1400;  }
    },
  });
  
  this.processProperties(arguments);
};
Gibberish.Kick.prototype = Gibberish._oscillator;

// congas are bridged t-oscillators like kick without the low-pass filter
Gibberish.Conga = function() {
  var trigger = false,
    	bpf = new Gibberish.SVF().callback,
      _decay = .5;
      
  Gibberish.extend(this, {
  	name:		"conga",
    properties:	{ pitch:190, /*__decay:50,*/ amp:2, sr:Gibberish.context.sampleRate },
	
  	callback: function(pitch, /*decay,*/ amp, sr) {					
  		var out = trigger ? 60 : 0;
			
  		out = bpf( out, pitch, 50, 2, sr );
		
  		out *= amp;
		
  		trigger = false;
		
  		return out;
  	},

  	note : function(p, amp) {
  		if(typeof p === 'number') this.pitch = p;
  		if(typeof amp === 'number') this.amp = amp;
		
      trigger = true;
  	},
  })
  .init()
  .oscillatorInit();

  // Object.defineProperties(this, {
  //   decay :{
  //     get: function() { return _decay; },
  //     set: function(val) { _decay = val > 1 ? 1 : val; this.__decay = _decay * 100; }
  //   }
  // });
  // 
  this.processProperties(arguments);
}
Gibberish.Conga.prototype = Gibberish._oscillator;

// clave are also bridged t-oscillators like kick without the low-pass filter
Gibberish.Clave = function() {
  var trigger = false,
    	_bpf = new Gibberish.SVF(),
      bpf = _bpf.callback,
      _decay = .5;
      
  Gibberish.extend(this, {
  	name:		"clave",
    properties:	{ pitch:2500, /*__decay:50,*/ amp:1, sr:Gibberish.context.sampleRate },
	
  	callback: function(pitch, /*decay,*/ amp, sr) {					
  		var out = trigger ? 2 : 0;
			
  		out = bpf( out, pitch, 5, 2, sr );
		
  		out *= amp;
		
  		trigger = false;
		
  		return out;
  	},

  	note : function(p, amp) {
  		if(typeof p === 'number') this.pitch = p;
  		if(typeof amp === 'number') this.amp = amp;
		
      trigger = true;
  	},
  })
  .init()
  .oscillatorInit();
  
  this.bpf = _bpf;
  // Object.defineProperties(this, {
  //   decay :{
  //     get: function() { return _decay; },
  //     set: function(val) { _decay = val > 1 ? 1 : val; this.__decay = _decay * 100; }
  //   }
  // });
  // 
  this.processProperties(arguments);
}
Gibberish.Clave.prototype = Gibberish._oscillator;

// tom is tbridge with lpf'd noise
Gibberish.Tom = function() {
  var trigger = false,
    	bpf = new Gibberish.SVF().callback,
    	lpf = new Gibberish.SVF().callback,
      _eg = new Gibberish.ExponentialDecay(),
      eg  = _eg.callback,
      rnd = Math.random,
      _decay = .2,
      _tone = .8;
      
  Gibberish.extend(this, {
  	name:		"tom",
    properties:	{ pitch:80, amp:.5, sr:Gibberish.context.sampleRate },
	
  	callback: function(pitch, amp, sr) {					
  		var out = trigger ? 60 : 0,
          noise;
			
  		out = bpf( out, pitch, 30, 2, sr );
      
      noise = rnd() * 16 - 8
		  noise = noise > 0 ? noise : 0;
      
      noise *= eg(.05, 11025);
      
  		noise = lpf( noise, 120, .5, 0, sr );
      
      out += noise;
  		out *= amp;
		
  		trigger = false;
		
  		return out;
  	},

  	note : function(p, amp) {
  		if(typeof p === 'number') this.pitch = p;
  		if(typeof amp === 'number') this.amp = amp;
		  
      _eg.trigger();
      trigger = true;
  	},
  })
  .init()
  .oscillatorInit();
  
  _eg.trigger(1)
  
  this.processProperties(arguments);
}
Gibberish.Tom.prototype = Gibberish._oscillator;

// http://www.soundonsound.com/sos/Sep02/articles/synthsecrets09.asp
Gibberish.Cowbell = function() {
  var _s1 = new Gibberish.Square(),
      _s2 = new Gibberish.Square(),
      s1 = _s1.callback,
      s2 = _s2.callback,                              

      _bpf = new Gibberish.SVF({ mode:2 }),
      bpf   = _bpf.callback,

      _eg   = new Gibberish.ExponentialDecay( .0025, 10500 ),
      eg    = _eg.callback;
  
  Gibberish.extend(this, {
  	name: "cowbell",
  	properties : { amp: 1, pitch: 560, bpfFreq:1000, bpfRez:3, decay:22050, decayCoeff:.0001, sr:Gibberish.context.sampleRate },
	
  	callback : function(amp, pitch, bpfFreq, bpfRez, decay, decayCoeff, sr) {
  		var val;
      
  		val =  s1( pitch, 1, 1, 0 );
  		val += s2( 845, 1, 1, 0 );
		
      val  = bpf(  val, bpfFreq, bpfRez, 2, sr );
      		
      val *= eg(decayCoeff, decay);
  
  		val *= amp;
		  
  		return val;
  	},
	
  	note : function(_decay, _decay2) {
      _eg.trigger()
  		if(_decay)
  			this.decay = _decay;
  	}
  })
  .init()
  .oscillatorInit()
  .processProperties(arguments);
  
  this.bpf = _bpf;
  this.eg = _eg;
  
  _eg.trigger(1);
};
Gibberish.Cowbell.prototype = Gibberish._oscillator;

Gibberish.Snare = function() {
  var bpf1      = new Gibberish.SVF().callback,
      bpf2      = new Gibberish.SVF().callback,
      noiseHPF  = new Gibberish.SVF().callback,
      _eg       = new Gibberish.ExponentialDecay( .0025, 11025 ),
      eg        = _eg.callback,            
      rnd       = Math.random,
      phase  = 11025,      
      out    = 0,
      envOut = 0;
      
  Gibberish.extend(this, {
  	name: "snare",
  	properties: { cutoff:1000, decay:11025, tune:0, snappy:.5, amp:1, sr:Gibberish.context.sampleRate },

  	callback: function(cutoff, decay, tune, snappy, amp, sr) {
  		var p1, p2, noise = 0, env = 0, out = 0;

  		env = eg(.0025, decay);
		
  		if(env > .005) {	
  			out = ( rnd() * 2 - 1 ) * env ;
  			out = noiseHPF( out, cutoff + tune * 1000, .5, 1, sr );
  			out *= snappy;
        
        // rectify as per instructions found here: http://ericarcher.net/devices/tr808-clone/
        out = out > 0 ? out : 0;
        
  			envOut = env;
			
  			p1 = bpf1( envOut, 180 * (tune + 1), 15, 2, sr );
  			p2 = bpf2( envOut, 330 * (tune + 1), 15, 2, sr );
		
  			out += p1; 
  			out += p2 * .8;
  			out *= amp;
  		}

  		return out;
  	},

  	note : function(t, amp, s, c) {
      if(typeof t === 'number')   this.tune = t;					      
  		if(typeof c === 'number')   this.cutoff = c;					
  		if(typeof s === 'number')   this.snappy = s; 
  		if(typeof amp === 'number') this.amp = amp;
		
  		_eg.trigger()
  	},
  })
  .init()
  .oscillatorInit()
  .processProperties(arguments);
  
  _eg.trigger(1);
}
Gibberish.Snare.prototype = Gibberish._oscillator;

Gibberish.Hat = function() {
  var _s1 = new Gibberish.Square(),
      _s2 = new Gibberish.Square(),
      _s3 = new Gibberish.Square(),
      _s4 = new Gibberish.Square(),
      _s5 = new Gibberish.Square(),
      _s6 = new Gibberish.Square(),
      s1 = _s1.callback,
      s2 = _s2.callback,
      s3 = _s3.callback,
      s4 = _s4.callback,
      s5 = _s5.callback,
      s6 = _s6.callback,                              
      //_bpf = new Gibberish.Biquad({ mode:'BP' }),
      _bpf = new Gibberish.SVF({ mode:2 }),
      bpf   = _bpf.callback,
      _hpf  = new Gibberish.Filter24(),
      hpf   = _hpf.callback,
      _eg   = new Gibberish.ExponentialDecay( .0025, 10500 ),
      eg    = _eg.callback,
      _eg2   = new Gibberish.ExponentialDecay( .1, 7500 ),
      eg2    = _eg2.callback;        
  
  Gibberish.extend(this, {
  	name: "hat",
  	properties : { amp: 1, pitch: 325, bpfFreq:7000, bpfRez:2, hpfFreq:.975, hpfRez:0, decay:3500, decay2:3000, sr:Gibberish.context.sampleRate },
	
  	callback : function(amp, pitch, bpfFreq, bpfRez, hpfFreq, hpfRez, decay, decay2, sr) {
  		var val;
      
  		val =  s1( pitch, 1, .5, 0 );
  		val += s2( pitch * 1.4471, .75, 1, 0 );
  		val += s3( pitch * 1.6170, 1, 1, 0 );
  		val += s4( pitch * 1.9265, 1, 1, 0 );
  		val += s5( pitch * 2.5028, 1, 1, 0 );
  		val += s6( pitch * 2.6637, .75, 1, 0 );
		
      val  = bpf(  val, bpfFreq, bpfRez, 2, sr );
      		
  		val  *= eg(.001, decay);
      
      // rectify as per instructions found here: http://ericarcher.net/devices/tr808-clone/
      // val = val > 0 ? val : 0;
        		
  		//sample, cutoff, resonance, isLowPass, channels
  		val 	= hpf(val, hpfFreq, hpfRez, 0, 1 );
  
  		val *= amp;
		  
  		return val;
  	},
	
  	note : function(_decay, _decay2) {
  		_eg.trigger()
  		_eg2.trigger()
  		if(_decay)
  			this.decay = _decay;
  		if(_decay2)
  			this.decay2 = _decay2;
		
  	}
  })
  .init()
  .oscillatorInit()
  .processProperties(arguments);
  
  this.bpf = _bpf;
  this.hpf = _hpf;
  
  _eg.trigger(1);
  _eg2.trigger(1);
};
Gibberish.Hat.prototype = Gibberish._oscillator;

module.exports = Gibberish

}()
},{}],2:[function(require,module,exports){
(function(){function t(t,e){return t=r[t],e=r[e],t.distance>e.distance?e.distance+12-t.distance:e.distance-t.distance}function e(t,e,i){for(;i>0;i--)t+=e;return t}function i(t,e){if("string"!=typeof t)return null;this.name=t,this.duration=e||4,this.accidental={value:0,sign:""};var i=t.match(/^([abcdefgh])(x|#|bb|b?)(-?\d*)/i);if(i&&t===i[0]&&0!==i[3].length)this.name=i[1].toLowerCase(),this.octave=parseFloat(i[3]),0!==i[2].length&&(this.accidental.sign=i[2].toLowerCase(),this.accidental.value=y[i[2]]);else{t=t.replace(/\u2032/g,"'").replace(/\u0375/g,",");var n=t.match(/^(,*)([abcdefgh])(x|#|bb|b?)([,\']*)$/i);if(!n||5!==n.length||t!==n[0])throw Error("Invalid note format");if(""===n[1]&&""===n[4])this.octave=n[2]===n[2].toLowerCase()?3:2;else if(""!==n[1]&&""===n[4]){if(n[2]===n[2].toLowerCase())throw Error("Invalid note format. Format must respect the Helmholtz notation.");this.octave=2-n[1].length}else{if(""!==n[1]||""===n[4])throw Error("Invalid note format");if(n[4].match(/^'+$/)){if(n[2]===n[2].toUpperCase())throw Error("Invalid note format. Format must respect the Helmholtz notation");this.octave=3+n[4].length}else{if(!n[4].match(/^,+$/))throw Error("Invalid characters after note name.");if(n[2]===n[2].toLowerCase())throw Error("Invalid note format. Format must respect the Helmholtz notation");this.octave=2-n[4].length}}this.name=n[2].toLowerCase(),0!==n[3].length&&(this.accidental.sign=n[3].toLowerCase(),this.accidental.value=y[n[3]])}}function n(t,e){if(!(t instanceof i))return null;e=e||"",this.name=t.name.toUpperCase()+t.accidental.sign+e,this.root=t,this.notes=[t],this.quality="major",this.type="major";var n,r,o,s,h,m=[],u=!1,c="quality",d=!1,p=!1,v=null;for(s=0,h=e.length;h>s;s++){for(n=e[s];" "===n||"("===n||")"===n;)n=e[++s];if(!n)break;if(r=n.charCodeAt(0),o=h>=s+3?e.substr(s,3):"","quality"===c)"M"===n||("maj"===o||916===r?(this.type="major",m.push("M7"),u=!0,(e[s+3]&&"7"===e[s+3]||916===r&&"7"===e[s+1])&&s++):"m"===n||"-"===n||"min"===o?this.quality=this.type="minor":111===r||176===r||"dim"===o?(this.quality="minor",this.type="diminished"):"+"===n||"aug"===o?(this.quality="major",this.type="augmented"):216===r||248===r?(this.quality="minor",this.type="diminished",m.push("m7"),u=!0):"sus"===o?(this.quality="sus",this.type=e[s+3]&&"2"===e[s+3]?"sus2":"sus4"):"5"===n?(this.quality="power",this.type="power"):s-=1),o in l&&(s+=2),c="";else if("#"===n)d=!0;else if("b"===n)p=!0;else if("5"===n)d?(v="A5","major"===this.quality&&(this.type="augmented")):p&&(v="d5","minor"===this.quality&&(this.type="diminished")),p=d=!1;else if("6"===n)m.push("M6"),p=d=!1;else if("7"===n)"diminished"===this.type?m.push("d7"):m.push("m7"),u=!0,p=d=!1;else if("9"===n)u||m.push("m7"),p?m.push("m9"):d?m.push("A9"):m.push("M9"),p=d=!1;else{if("1"!==n)throw Error("Unexpected character: '"+n+"' in chord name");n=e[++s],"1"===n?p?m.push("d11"):d?m.push("A11"):m.push("P11"):"3"===n&&(p?m.push("m13"):d?m.push("A13"):m.push("M13")),p=d=!1}}for(var y=0,g=f[this.type].length;g>y;y++)"5"===f[this.type][y][1]&&v?this.notes.push(a.interval(this.root,v)):this.notes.push(a.interval(this.root,f[this.type][y]));for(y=0,g=m.length;g>y;y++)this.notes.push(a.interval(this.root,m[y]))}var a={},r={c:{name:"c",distance:0,index:0},d:{name:"d",distance:2,index:1},e:{name:"e",distance:4,index:2},f:{name:"f",distance:5,index:3},g:{name:"g",distance:7,index:4},a:{name:"a",distance:9,index:5},b:{name:"b",distance:11,index:6},h:{name:"h",distance:11,index:6}},o=["c","d","e","f","g","a","b"],s={.25:"longa",.5:"breve",1:"whole",2:"half",4:"quarter",8:"eighth",16:"sixteenth",32:"thirty-second",64:"sixty-fourth",128:"hundred-twenty-eighth"},h=[{name:"unison",quality:"perfect",size:0},{name:"second",quality:"minor",size:1},{name:"third",quality:"minor",size:3},{name:"fourth",quality:"perfect",size:5},{name:"fifth",quality:"perfect",size:7},{name:"sixth",quality:"minor",size:8},{name:"seventh",quality:"minor",size:10},{name:"octave",quality:"perfect",size:12},{name:"ninth",quality:"minor",size:13},{name:"tenth",quality:"minor",size:15},{name:"eleventh",quality:"perfect",size:17},{name:"twelfth",quality:"perfect",size:19},{name:"thirteenth",quality:"minor",size:20},{name:"fourteenth",quality:"minor",size:22},{name:"fifteenth",quality:"perfect",size:24}],m={unison:0,second:1,third:2,fourth:3,fifth:4,sixth:5,seventh:6,octave:7,ninth:8,tenth:9,eleventh:10,twelfth:11,thirteenth:12,fourteenth:13,fifteenth:14},l={P:"perfect",M:"major",m:"minor",A:"augmented",d:"diminished",perf:"perfect",maj:"major",min:"minor",aug:"augmented",dim:"diminished"},u={perfect:"P",major:"M",minor:"m",augmented:"A",diminished:"d"},c={P:"P",M:"m",m:"M",A:"d",d:"A"},d={perfect:["diminished","perfect","augmented"],minor:["diminished","minor","major","augmented"]},f={major:["M3","P5"],minor:["m3","P5"],augmented:["M3","A5"],diminished:["m3","d5"],sus2:["M2","P5"],sus4:["P4","P5"],power:["P5"]},p={major:"M",minor:"m",augmented:"aug",diminished:"dim",power:"5"},v={"-2":"bb","-1":"b",0:"",1:"#",2:"x"},y={bb:-2,b:-1,"#":1,x:2};i.prototype={key:function(t){return t?7*(this.octave-1)+3+Math.ceil(r[this.name].distance/2):12*(this.octave-1)+4+r[this.name].distance+this.accidental.value},fq:function(t){return t=t||440,t*Math.pow(2,(this.key()-49)/12)},scale:function(t,e){return a.scale.list(this,t,e)},interval:function(t,e){return a.interval(this,t,e)},chord:function(t){return t=t||"major",t in p&&(t=p[t]),new n(this,t)},helmholtz:function(){var t,i=3>this.octave?this.name.toUpperCase():this.name.toLowerCase();return 2>=this.octave?(t=e("",",",2-this.octave),t+i+this.accidental.sign):(t=e("","'",this.octave-3),i+this.accidental.sign+t)},scientific:function(){return this.name.toUpperCase()+this.accidental.sign+("number"==typeof this.octave?this.octave:"")},enharmonics:function(){var t=[],e=this.key(),i=this.interval("m2","up"),n=this.interval("m2","down"),a=i.key()-i.accidental.value,r=n.key()-n.accidental.value,o=e-a;return 3>o&&o>-3&&(i.accidental={value:o,sign:v[o]},t.push(i)),o=e-r,3>o&&o>-3&&(n.accidental={value:o,sign:v[o]},t.push(n)),t},valueName:function(){return s[this.duration]},toString:function(t){return t="boolean"==typeof t?t:"number"==typeof this.octave?!1:!0,this.name.toLowerCase()+this.accidental.sign+(t?"":this.octave)}},n.prototype.dominant=function(t){return t=t||"",new n(this.root.interval("P5"),t)},n.prototype.subdominant=function(t){return t=t||"",new n(this.root.interval("P4"),t)},n.prototype.parallel=function(t){if(t=t||"","triad"!==this.chordType()||"diminished"===this.quality||"augmented"===this.quality)throw Error("Only major/minor triads have parallel chords");return"major"===this.quality?new n(this.root.interval("m3","down"),"m"):new n(this.root.interval("m3","up"))},n.prototype.chordType=function(){var t,e,i;if(2===this.notes.length)return"dyad";if(3===this.notes.length){e={unison:!1,third:!1,fifth:!1};for(var n=0,r=this.notes.length;r>n;n++)t=this.root.interval(this.notes[n]),i=h[parseFloat(a.interval.invert(t.simple)[1])-1],t.name in e?e[t.name]=!0:i.name in e&&(e[i.name]=!0);return e.unison&&e.third&&e.fifth?"triad":"trichord"}if(4===this.notes.length){e={unison:!1,third:!1,fifth:!1,seventh:!1};for(var n=0,r=this.notes.length;r>n;n++)t=this.root.interval(this.notes[n]),i=h[parseFloat(a.interval.invert(t.simple)[1])-1],t.name in e?e[t.name]=!0:i.name in e&&(e[i.name]=!0);if(e.unison&&e.third&&e.fifth&&e.seventh)return"tetrad"}return"unknown"},n.prototype.toString=function(){return this.name},a.note=function(t,e){return new i(t,e)},a.note.fromKey=function(t){var e=440*Math.pow(2,(t-49)/12);return a.frequency.note(e).note},a.chord=function(t){var e;if(e=t.match(/^([abcdefgh])(x|#|bb|b?)/i),e&&e[0])return new n(new i(e[0].toLowerCase()),t.substr(e[0].length));throw Error("Invalid Chord. Couldn't find note name")},a.frequency={note:function(t,e){e=e||440;var n,a,s,h,m,l,u;return n=Math.round(49+12*((Math.log(t)-Math.log(e))/Math.log(2))),u=e*Math.pow(2,(n-49)/12),l=1200*(Math.log(t/u)/Math.log(2)),a=Math.floor((n-4)/12),s=n-12*a-4,h=r[o[Math.round(s/2)]],m=h.name,s>h.distance?m+="#":h.distance>s&&(m+="b"),{note:new i(m+(a+1)),cents:l}}},a.interval=function(t,e,n){if("string"==typeof e){"down"===n&&(e=a.interval.invert(e));var r=l[e[0]],o=parseFloat(e.substr(1));if(!r||isNaN(o)||1>o)throw Error("Invalid string-interval format");return a.interval.from(t,{quality:r,interval:h[o-1].name},n)}if(e instanceof i&&t instanceof i)return a.interval.between(t,e);throw Error("Invalid parameters")},a.interval.from=function(e,n,a){n.direction=a||n.direction||"up";var s,l,u,c,f,p;if(f=m[n.interval],p=h[f],f>7&&(f-=7),f=r[e.name].index+f,f>o.length-1&&(f-=o.length),s=o[f],-1===d[p.quality].indexOf(n.quality)||-1===d[p.quality].indexOf(p.quality))throw Error("Invalid interval quality");return l=d[p.quality].indexOf(n.quality)-d[p.quality].indexOf(p.quality),u=p.size+l-t(e.name,s),e.octave&&(c=Math.floor((e.key()-e.accidental.value+t(e.name,s)-4)/12)+1+Math.floor(m[n.interval]/7)),u+=e.accidental.value,u>=11&&(u-=12),u>-3&&3>u&&(s+=v[u]),"down"===a&&c--,new i(s+(c||""))},a.interval.between=function(t,e){var i,n,a,o,s,m,l=t.key(),c=e.key();if(i=c-l,i>24||-25>i)throw Error("Too big interval. Highest interval is a augmented fifteenth (25 semitones)");return 0>i&&(o=t,t=e,e=o),a=r[e.name].index-r[t.name].index+7*(e.octave-t.octave),n=h[a],m=d[n.quality][Math.abs(i)-n.size+1],s=u[m]+(""+Number(a+1)),{name:n.name,quality:m,direction:i>0?"up":"down",simple:s}},a.interval.invert=function(t){if(2!==t.length&&3!==t.length)return!1;var e=c[t[0]],i=2===t.length?parseFloat(t[1]):parseFloat(t.substr(1));return i>8&&(i-=7),8!==i&&1!==i&&(i=9-i),e+(""+i)},a.scale={list:function(t,e,n){var r,o,s=[],h=[];if(!(t instanceof i))return!1;if("string"==typeof e&&(e=a.scale.scales[e],!e))return!1;for(s.push(t),n&&h.push(t.name+(t.accidental.sign||"")),r=0,o=e.length;o>r;r++)s.push(a.interval(t,e[r])),n&&h.push(s[r+1].name+(s[r+1].accidental.sign||""));return n?h:s},scales:{major:["M2","M3","P4","P5","M6","M7"],ionian:["M2","M3","P4","P5","M6","M7"],dorian:["M2","m3","P4","P5","M6","m7"],phrygian:["m2","m3","P4","P5","m6","m7"],lydian:["M2","M3","A4","P5","M6","M7"],mixolydian:["M2","M3","P4","P5","M6","m7"],minor:["M2","m3","P4","P5","m6","m7"],aeolian:["M2","m3","P4","P5","m6","m7"],locrian:["m2","m3","P4","d5","m6","m7"],majorpentatonic:["M2","M3","P5","M6"],minorpentatonic:["m3","P4","P5","m7"],chromatic:["m2","M2","m3","M3","P4","A4","P5","m6","M6","m7","M7"],harmonicchromatic:["m2","M2","m3","M3","P4","A4","P5","m6","M6","m7","M7"]}},module.exports=a})();
},{}],3:[function(require,module,exports){
!function() {
  "use strict"
  
  var fft,
      mappingProperties = { 
        value:{ min: 0, max: 255, output: LOGARITHMIC, wrap:false, timescale: 'graphics' } 
      },
      Gibberish = require('../../external/gibberish.2.0.min'),
      curves = require('../mappings').outputCurves,
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

  module.exports = Analysis
}()
},{"../../external/gibberish.2.0.min":1,"../mappings":17}],4:[function(require,module,exports){
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
  
var theory = require('../../external/teoria.min'),
    Seq    = require('../seq'),
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

module.exports = Arp

}()
},{"../../external/teoria.min":2,"../seq":18}],5:[function(require,module,exports){
!function() { 
  "use strict"
  
  var Input = {},
      Gibberish = require('../../external/gibberish.2.0.min'),
      curves = require('../mappings').outputCurves,
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
  
  module.exports = Input
}()



},{"../../external/gibberish.2.0.min":1,"../mappings":17}],6:[function(require,module,exports){
!function() {
  "use strict"
  
  var $ = require('zepto-browserify').Zepto,
      Gibberish = require('../../external/gibberish.2.0.min'),
      curves = require('../mappings').outputCurves,
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
  
  module.exports = Busses
}()
},{"../../external/gibberish.2.0.min":1,"../mappings":17,"zepto-browserify":21}],7:[function(require,module,exports){
(function() {
  "use strict"
  
  var Percussion = { Presets:{} }, 
      Gibberish = require('../../external/gibberish.2.0.min'),
      Clock = require('../clock'),
      curves = require('../mappings').outputCurves,
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
          
          console.log(seqs)
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

          kf = future( function() {
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

          sf = future( function() {
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

          hf = future( function() {
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

          hf = future( function() {
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
  
  //Gibber.presets.Drums = {}

  module.exports = Percussion
})()

},{"../../external/gibberish.2.0.min":1,"../clock":15,"../mappings":17}],8:[function(require,module,exports){
!function() {
  "use strict"
  
  var Envelopes = {},
      Gibberish = require('../../external/gibberish.2.0.min'),
      Clock = require('../clock'),
      curves = require('../mappings').outputCurves,
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
  
  module.exports = Envelopes
}()

},{"../../external/gibberish.2.0.min":1,"../clock":15,"../mappings":17}],9:[function(require,module,exports){
!function() {
  "use strict"
  
  var FX = { Presets: {} },
      Gibberish = require('../../external/gibberish.2.0.min'),
      curves = require('../mappings').outputCurves,
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
  
  module.exports = FX
}()

},{"../../external/gibberish.2.0.min":1,"../mappings":17}],10:[function(require,module,exports){
!function() {
  "use strict"
  
  var Oscillators = { Presets: {} },
      Gibberish = require('../../external/gibberish.2.0.min'),
      curves = require('../mappings').outputCurves,
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
  
  module.exports = Oscillators
  
}()



},{"../../external/gibberish.2.0.min":1,"../mappings":17}],11:[function(require,module,exports){
!function() {
  "use strict";
  
  var PostProcessing,
      Gibberish = require('../../external/gibberish.2.0.min'),  
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
  
  module.exports = PostProcessing
}()
},{"../../external/gibberish.2.0.min":1}],12:[function(require,module,exports){
!function() { 
  "use strict"
  
  var Samplers = { Presets:{} },
      Gibberish = require('../../external/gibberish.2.0.min'),
      Clock = require('../clock'),
      curves = require('../mappings').outputCurves,
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
  
  module.exports = Samplers
  
}()
},{"../../external/gibberish.2.0.min":1,"../clock":15,"../mappings":17}],13:[function(require,module,exports){
!function() {
  "use strict"
  
  var Synths = { Presets: {} },
      Gibberish = require('../../external/gibberish.2.0.min'),
      Clock = require('../clock'),
      curves = require('../mappings').outputCurves,
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
    rhodes: { waveform:'Sine', maxVoices:4, presetInit: function() { this.fx.add( Tremolo(2, .2) ) }, attack:44, decay:1 },
    calvin: { waveform:'PWM',  maxVoices:4, amp:.075, presetInit: function() { this.fx.add( Delay(1/6,.5), Vibrato() ) }, attack:44, decay:1/4 }    
  }
  
  Synths.Presets.Synth2 = {
    pad2: { waveform:'Saw', maxVoices:4, attack:1.5, decay:1/2, cutoff:.3, filterMult:.35, resonance:4.5, amp:1.25 },
    pad4: { waveform:'Saw', maxVoices:4, attack:2, decay:2, cutoff:.3, filterMult:.35, resonance:4.5, amp:1.25 },     
  }
  
  Synths.Presets.Mono = {
  	short : { attack: 44, decay: 1/16,},
  
  	lead : {
  		presetInit : function() { this.fx.add( Delay(1/4, .35), Reverb() ) },
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
        this.lfo = Sine( .234375 )._
        
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
  		attack:Clock.maxMeasures,
  		decay:2,
  		octave2:0,
  		octave3:0,
  		cutoff:.3,
      glide:.9995,
  	},
    
  	easyfx : {
  		attack:Clock.maxMeasures,
  		decay:2,
      presetInit: function() {
        this.fx.add( Delay(1/6, .3) )
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
      presetInit: function() { this.fx.add( Gain(.1), Delay(1/6,.35) ) }
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
        this.bus = Bus().fx.add( Delay(1/8,.75), LPF({ resonance:4 }) )
        this.bus.fx[1].cutoff = Add(.25, Sine(.1,.2)._ )
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
  
  module.exports = Synths
}()

},{"../../external/gibberish.2.0.min":1,"../clock":15,"../mappings":17}],14:[function(require,module,exports){
!function() {
  "use strict"

var teoria = require('../../external/teoria.min'),
    $ = require('zepto-browserify').Zepto

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

module.exports = Theory
//window.Scale = Gibber.Theory.Scale

}()
},{"../../external/teoria.min":2,"zepto-browserify":21}],15:[function(require,module,exports){
(function() {
  
"use strict"
var times = [],
    $ = require('zepto-browserify').Zepto,
    curves = require('./mappings').outputCurves,
    LINEAR = curves.LINEAR,
    LOGARITHMIC = curves.LOGARITHMIC, 
    Gibberish = require('../external/gibberish.2.0.min')

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
    
    Clock.phase += Gibber.Clock.beats( 1 )
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
    
    this.seq = new Gibberish.PolySeq({
      seqs : [{
        target:this,
        values: [ this.processBeat ],
        durations:[ 1/4 ],
      }],
      rate: this,
    }).connect().start()
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

module.exports = Clock

})()



},{"../external/gibberish.2.0.min":1,"./mappings":17,"zepto-browserify":21}],16:[function(require,module,exports){
(function() {
//"use strict" // can't use strict because eval is used to evaluate user code in the run method
var $ = require('zepto-browserify').Zepto,
    Gibberish = require('../external/gibberish.2.0.min')

var Gibber = {
  Presets: {},
  Audio:          require('../external/gibberish.2.0.min'),
  Clock:          require('./clock'),
  Seq:            require('./seq').Seq,
  ScaleSeq:       require('./seq').ScaleSeq,
  Theory:         require('./audio/theory'),
  FX:             require('./audio/fx'),
  Oscillators:    require('./audio/oscillators'),
  Synths:         require('./audio/synths'),
  Busses:         require('./audio/bus'),
  Analysis:       require('./audio/analysis'),
  Envelopes:      require('./audio/envelopes'),
  Percussion:     require('./audio/drums'),
  Input :         require('./audio/audio_input'),
  Samplers:       require('./audio/sampler'),
  PostProcessing: require('./audio/postprocessing'),
  Utilities:      require( './utilities'),
  Arp:            require( './audio/arp'),
  scale : null,
  minNoteFrequency:50,
  started:false,
  
  init: function( _options ) {                        
      // 'external/esprima' // does this need to be imported for the lib? hmmm...
      var options = {
        globalize: true,
        canvas: null,
      }
      
      if( typeof _options === 'object' ) {
        $.extend( options, _options )
      }
      
      Gibber.Utilities.init()
      
      if( options.globalize ) {
        $.extend( window, Gibber.Busses )       
        $.extend( window, Gibber.Oscillators )
        $.extend( window, Gibber.Synths )
        $.extend( Gibber.Presets, Gibber.Synths.Presets )      
        $.extend( window, Gibber.Percussion )
        $.extend( Gibber.Presets, Gibber.Percussion.Presets )      
        $.extend( window, Gibber.Envelopes )
        $.extend( window, Gibber.FX )
        $.extend( Gibber.Presets, Gibber.FX.Presets )      
        $.extend( window, Gibber.Samplers )
        $.extend( window, Gibber.PostProcessing )      
        $.extend( window, Gibber.Theory )
        
      
  			window.Clock = Gibber.Clock
        window.Seq = Gibber.Seq
        window.Arp = Gibber.Arp // move Arp to sequencers?
        window.ScaleSeq = Gibber.ScaleSeq
      
        window.Rndi = Gibberish.Rndi
        window.Rndf = Gibberish.Rndf      
        window.rndi = Gibberish.rndi
        window.rndf = Gibberish.rndf
			
  			window.module = Gibber.import
        Gibber.Audio.Time.export()
        window.sec = window.seconds
        Gibber.Audio.Binops.export()
      }
            
      !function( _$ ) {
        var o = _$( {} );

        _$.subscribe = function() { o.on.apply( o, arguments ) }
        _$.unsubscribe = function() { o.off.apply( o, arguments ) }
        _$.publish = function() { o.trigger.apply( o, arguments ) }

      }( $ )
      
      window.$ = $
      
      Gibber.Audio.init()
      
      if( !Gibberish.context ) { Gibberish.context = { sampleRate:44100 } }
      
      // post-processing depends on having context instantiated
      Gibberish.onstart = function() {
        Gibber.AudioPostProcessing.init()
        Gibber.interfaceIsReady()
      }
      
			//Gibber.Esprima = window.esprima
      Gibber.Master = Gibber.Busses.Bus().connect( Gibberish.out )
      
      if( options.globalize ) {
        window.Master = Gibber.Master
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
      Gibber.Clock.start( true )
        //if( !window.isInstrument ) {
        //  Gibber.Clock.addMetronome( Gibber.Environment.Metronome )
        //}
      Gibber.scale = Gibber.Theory.Scale( 'c4','Minor' )
      //})
  },
  interfaceIsReady : function() {
    if( !Gibber.started ) {
      if( typeof Gibberish.context.currentTime !== 'undefined' ) {
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
  // override for gibberish method
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
        
        Gibberish.dirty(obj);
      },
    });

    obj[key] = prop.value
  },
  
  // override for gibberish method
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
  
  // override for gibberish method to use master bus
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
    Gibberish.analysisUgens.length = 0
    Gibberish.sequencers.length = 0
    
    for( var i = 0; i < Gibber.Master.inputs.length; i++ ) {
      Gibber.Master.inputs[ i ].value.disconnect()
    }
    
    Gibber.Master.inputs.length = 0
    
    Gibber.Clock.reset()
    
    Master.fx.remove()
    
    Master.amp = 1
    
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
      obj.seq = Gibber.Seq({ doNotStart:true, scale:obj.scale, priority:priority })
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
      obj.seq = Gibber.Seq({ doNotStart:true, scale:obj.scale })      
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
        
        if( this.ugen !== Master ) {
          end.connect()
        }else{
          end.connect( Gibberish.out )
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
                  if( this.ugen !== Master ) {
                    this.ugen.connect( Gibber.Master )
                  }else{
                    this.ugen.connect( Gibberish.out )
                  }
                }
              }else{
                if( this.length > 0 ) { // if there is an fx behind in chain
                  this[ arg - 1 ].connect( Gibber.Master )
                }else{
                  if( this.ugen !== Master ) {
                    this.ugen.connect( Gibber.Master ) // no more fx
                  }else{
                    this.ugen.connect( Gibberish.out )
                  }
                }
              }
            }
          }
        }else{ // remove all fx
          if( this.length > 0) {
            this[ this.length - 1 ].disconnect()
            if( this.ugen !== Master ) {
              this.ugen.connect( Gibber.Master )
            }else{
              this.ugen.connect( Gibberish.out )
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
          decay = new Gibberish.ExponentialDecay({ decayCoefficient:.05, length:time }),
          //ramp = Mul( Sub(1,decay), endLevel )
          line = new Gibberish.Line( 0, endLevel, time )
          
      this.amp = line
      
      future( function() { this.amp = endLevel }.bind( this ), time)
      
      return this
    },
    
    fadeOut : function( _time ) {
      var time = Gibber.Clock.time( _time ),
          decay = new Gibberish.ExponentialDecay({ decayCoefficient:.00005, length:time }),
          //ramp = Mul( decay, this.amp() )
          line = new Gibberish.Line( this.amp(), 0, Gibber.Clock.time( time ) )
          
      this.amp = line
      
      future( function() { this.amp = 0 }.bind( this ), time )
      
      return this
    },
  }
}

module.exports = Gibber

})()
},{"../external/gibberish.2.0.min":1,"./audio/analysis":3,"./audio/arp":4,"./audio/audio_input":5,"./audio/bus":6,"./audio/drums":7,"./audio/envelopes":8,"./audio/fx":9,"./audio/oscillators":10,"./audio/postprocessing":11,"./audio/sampler":12,"./audio/synths":13,"./audio/theory":14,"./clock":15,"./seq":18,"./utilities":19,"zepto-browserify":21}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
!function() {
  
  //"use strict"
  
  var Gibberish = require('../external/gibberish.2.0.min'),
      $ = require('zepto-browserify').Zepto
  
  var doNotSequence = [ 'durations', 'target', 'scale', 'offset', 'doNotStart', 'priority' ]

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
    
    if( $.type( arguments[0] ) === 'object' ) {
      var arg = arguments[0],
          durationsType = $.type( arg.durations ),
          targetsType = $.type( arg.target ),
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
  
  module.exports.Seq = Seq
  module.exports.ScaleSeq = ScaleSeq  
  
}()

},{"../external/gibberish.2.0.min":1,"zepto-browserify":21}],19:[function(require,module,exports){
!function() {
"use strict"

var soloGroup = [],
    isSoloing = false,
    Synths = { Presets: {} },
    Gibberish = require('../external/gibberish.2.0.min'),
    Clock = require('./clock'),

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
            index = rndi(0, this.length - 1);
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
            index = rndi(0, that.length - 1);
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
            arr[ i ] = this[ rndi( 0, this.length - 1 ) ]
          }
      
          output = arr
        }else{
          output = this[ rndi( 0, this.length - 1 ) ]
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
          durations:[ Clock.time( time ) ]
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
              _rnd = rndf();
  
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
      init: function() {
        window.solo = Utilities.solo
        window.future = Utilities.future // TODO: fix global reference
        Array.prototype.random = Array.prototype.rnd = Utilities.random
        Array.prototype.weight = Utilities.weight
        Array.prototype.fill = Utilities.fill
        Array.prototype.choose = Utilities.choose
        Array.prototype.Rnd = Utilities.random2
        Array.prototype.merge = Utilities.merge
      }  
    }

module.exports = Utilities

}()

},{"../external/gibberish.2.0.min":1,"./clock":15}],20:[function(require,module,exports){
window.Gibber = window.G = require('./gibber/gibber.js')
},{"./gibber/gibber.js":16}],21:[function(require,module,exports){
/* Zepto v1.1.3 - zepto event ajax form ie - zeptojs.com/license */


var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = function(parent, node) {
    return parent !== node && parent.contains(node)
  }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className,
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    var num
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          !/^0/.test(value) && !isNaN(num = Number(value)) ? num :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return arguments.length === 0 ?
        (this.length > 0 ? this[0].innerHTML : null) :
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        })
    },
    text: function(text){
      return arguments.length === 0 ?
        (this.length > 0 ? this[0].textContent : null) :
        this.each(function(){ this.textContent = (text === undefined) ? '' : ''+text })
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && value === undefined) ?
        (this.length == 0 || this[0].nodeType !== 1 ? undefined :
          (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && setAttribute(this, name) })
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (value === undefined) ?
        (this[0] && this[0][name]) :
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        })
    },
    data: function(name, value){
      var data = this.attr('data-' + name.replace(capitalRE, '-$1').toLowerCase(), value)
      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return arguments.length === 0 ?
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        ) :
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (this.length==0) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var element = this[0], computedStyle = getComputedStyle(element, '')
        if(!element) return
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(isArray(property) ? property: [property], function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          traverseNode(parent.insertBefore(node, target), function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

exports.$ = exports.Zepto = Zepto;

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      return $.proxy(fn[context], fn)
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (isFunction(data) || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // items in the collection might not be DOM elements
      if('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return callback ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else this.each(function(){
        try { this[name]() }
        catch(e) {}
      })
      return this
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred()
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)
    if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (dataType == 'jsonp' || hasPlaceholder) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var result = [], el
    $([].slice.call(this.get(0).elements)).each(function(){
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function($){
  // __proto__ doesn't exist on IE<11, so redefine
  // the Z function to use object extension instead
  if (!('__proto__' in {})) {
    $.extend($.zepto, {
      Z: function(dom, selector){
        dom = dom || []
        $.extend(dom, $.fn)
        dom.selector = selector || ''
        dom.__Z = true
        return dom
      },
      // this is a kludge but works
      isZ: function(object){
        return $.type(object) === 'array' && '__Z' in object
      }
    })
  }

  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle;
    window.getComputedStyle = function(element){
      try {
        return nativeGetComputedStyle(element)
      } catch(e) {
        return null
      }
    }
  }
})(Zepto)
},{}]},{},[20]);
