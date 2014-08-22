var browserify = require( 'browserify' ),
    gulp = require( 'gulp' ),
    source = require( 'vinyl-source-stream' ),
    buffer = require( 'vinyl-buffer' ),
    uglify = require( 'gulp-uglify' );
    
gulp.task( 'default', function(){
  var out = browserify({
    entries: [ './scripts/main.js' ]
  })
  
  out.bundle()
    .pipe( source('gibber.lib.js') )
    .pipe( buffer() )
    .pipe( uglify() )
    .pipe( gulp.dest('./build/') );
   
  return out
});