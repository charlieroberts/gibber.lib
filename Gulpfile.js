var browserify = require( 'gulp-browserify' ),
    gulp = require( 'gulp' ),
    source = require( 'vinyl-source-stream' ),
    buffer = require( 'vinyl-buffer' ),
    uglify = require( 'gulp-uglify' ),
    rename = require( 'gulp-rename' ),
    insert = require( 'gulp-insert' );

gulp.task( 'client', function(){
  var out = gulp.src( './scripts/gibber/gibber.js' , {read:false} )
    .pipe( browserify({ standalone:'Gibber' }) )
    .pipe( rename('gibber.lib.js') )
    .pipe( gulp.dest('./build/') )
    .pipe( buffer() )
    .pipe( uglify() )
    .pipe( rename('gibber.lib.min.js') )
    .pipe( gulp.dest('./build/') )
    
    return out
});

gulp.task( 'default', ['client'] )