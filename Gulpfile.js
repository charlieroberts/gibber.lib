var browserify = require( 'gulp-browserify' ),
    gulp = require( 'gulp' ),
    source = require( 'vinyl-source-stream' ),
    buffer = require( 'vinyl-buffer' ),
    uglify = require( 'gulp-uglify' ),
    rename = require( 'gulp-rename' ),
    insert = require( 'gulp-insert' );

// gulp.task( 'node', function(){
//   var out = browserify({
//     entries: [ './scripts/gibber/gibber.js' ]
//   })
// 
//   out.bundle()
//     .pipe( source('gibber.lib.js') )
//     .pipe( buffer() )
//     .pipe( uglify() )
//     .pipe( gulp.dest('./build/') )
// 
//   return out
// });

gulp.task( 'client', function(){
    return gulp.src( './scripts/gibber/gibber.js' , {read:false} )
    .pipe( browserify({
      standalone:'Gibber'
    }) )
    // .pipe( buffer() )
    .pipe( uglify() )
    .pipe( rename('gibber.lib.js') )
    .pipe( gulp.dest('./build/') )
});

gulp.task( 'default', ['client'] )