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