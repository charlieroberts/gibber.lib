var browserify = require( 'browserify' ),
    gulp = require( 'gulp' ),
    source = require( 'vinyl-source-stream' ),
    buffer = require( 'vinyl-buffer' ),
    uglify = require( 'gulp-uglify' ),
    insert = require( 'gulp-insert' );

gulp.task( 'node', function(){
  var out = browserify({
    entries: [ './scripts/gibber/gibber.js' ]
  })

  out.bundle()
    .pipe( source('gibber.lib.js') )
    .pipe( buffer() )
    .pipe( uglify() )
    .pipe( gulp.dest('./build/') )

  return out
});

gulp.task( 'client', function(){
  var out = browserify({
    entries: [ './scripts/client.js' ]
  })

  out.bundle()
    .pipe( source( 'gibber.client.lib.js' ) )
    .pipe( buffer() )
    .pipe( uglify() )
    .pipe( gulp.dest('./build/') )

  return out
});

gulp.task( 'default', ['node', 'client'] )