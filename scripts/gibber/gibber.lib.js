!function() {

var Gibber = require( 'gibber.core.lib' )
Gibber.Audio = require( 'gibber.audio.lib' )( Gibber )
Gibber.Graphics = require( 'gibber.graphics.lib' )( Gibber )
Gibber.Interface = require( 'gibber.interface.lib' )( Gibber )
Gibber.Communication = require( 'gibber.communication.lib' )( Gibber )

module.exports = Gibber

}()