var browserify = require( 'gulp-browserify' ),
    gulp = require( 'gulp' ),
    buffer = require( 'vinyl-buffer' ),
    uglify = require( 'gulp-uglify' ),
    rename = require( 'gulp-rename' ),
    insert = require( 'gulp-insert' );

gulp.task( 'client', function(){
  var out = gulp.src( './scripts/gibber/gibber.lib.js')
    .pipe( browserify({ standalone:'Gibber', bare:true }) )
    // .pipe( rename('gibber.lib.js') )
    .pipe( gulp.dest('./build/') )
    .pipe( buffer() )
    .pipe( uglify() )
    .pipe( rename('gibber.lib.min.js') )
    .pipe( gulp.dest('./build/') )
    
    return out
});

gulp.task( 'p5', ['client'], function() {
  console.log("P5")
  var out = gulp.src( './build/gibber.lib.js'  )
    .pipe( gulp.dest('/www/p5.gibber.js/node_modules/gibber.lib/build/') )
    .pipe( buffer() )
    .pipe( uglify() )
    .pipe( rename('gibber.lib.min.js') )
    .pipe( gulp.dest('/www/p5.gibber.js/node_modules/gibber.lib/build/') )
    return out
})

gulp.task( 'default', ['client'] )