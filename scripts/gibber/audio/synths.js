!function() {
  "use strict"
  
  var Synths = { Presets: {} },
      Gibberish = require( 'gibberish-dsp' ),
      Gibber,
      $ = require( '../dollar' ),
      Clock = require('../clock')(),
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
        
        $.extend( true, obj, Gibber.Audio.ugenTemplate )
        
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
