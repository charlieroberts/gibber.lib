gibber.lib
==========

This library provides the graphics and audio capabilities of Gibber without the code editing environment. It uses CommonJS + Browserify.

I haven't done a lot of the housekeeping yet, but if you want to build from source:

1. ```cd``` into the scripts directory
2. If you don't have browserify installed, ```npm install -g browserify```
3. ```npm install --save zepto-browserify```
4. ```browserify main.js -o ../build/gibber.lib.js```

I'll get a Grunt script going soon for all this. The build outputs a single file, gibber.lib.js (also included in the repo). Here's an example
HTML file that plays a simple drum beat, bass line, and random melody.

```html
<html>

<head>
  <script src='build/gibber.lib.js'></script>
</head>

<body>
  <canvas id='gibbercanvas'></canvas>
</body>

<script>
Gibber.init()

Gibber.scale.root.seq( ['c4','eb4'], 2)

a = Mono('bass').note.seq( [0,7], 1/8 )

b = EDrums('xoxo')
b.snare.snappy = 1

c = Mono('easyfx')
  .note.seq( Rndi(0,12), [1/4,1/8,1/2,1,2].rnd( 1/8,4 ) )
</script>

</html>
```

Right now only audio works, but I'll be adding interaction and graphics soon. Also note that ```Drums``` do not work
because I haven't figured out resource management yet and ```Drums``` uses audio samples. However, ```EDrums``` (which
uses synthesis) works fine. 

I'd eventually like to have three separate builds: one for audio, one for graphics, and one for both.