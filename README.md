gibber.lib
==========

This library provides the graphics and audio capabilities of Gibber without the code editing environment.

## Installation (for development)

You can simply download the repo and skip straight to usage if you don't need to modify the library. If you want to modify gibber.lib and use a `<script>` tag, here's how to build it:

1. If you don't have it, install npm (the node.js package manager) from http://npmjs.org
2. Inside the top level of the repo, run `npm install` in the terminal.
3. Run `gulp`.

The build outputs a single file, gibber.lib.js (also included in the repo). This file is minified to 188 KB in size.

## Usage
Here's an example HTML file that plays a simple drum beat, bass line, and random melody. It's included in the repo uses the pre-built library.

```html
<html>

<head>
  <script src='build/gibber.lib.js'></script>
</head>

<body></body>

<script>
Gibber.init() // REQUIRED!

Gibber.scale.root.seq( ['c4','eb4'], 2)

a = Mono('bass').note.seq( [0,7], 1/8 )

b = EDrums('xoxo')
b.snare.snappy = 1

c = Mono('easyfx')
  .note.seq( Rndi(0,12), [1/4,1/8,1/2,1,2].rnd( 1/8,4 ) )
</script>

</html>
```

If you want to use browserify / commonjs, just use the following to start things off:

```js
Gibber = require( './scripts/gibber/gibber.js' )
Gibber.init()
``` 

## Notes
Right now only audio works, but I'll be adding interaction and graphics soon. Also note that `Drums` do not work because I haven't figured out resource management yet and `Drums` uses audio samples. However, `EDrums` (which uses synthesis) works fine. 

I'd eventually like to have three separate builds: one for audio, one for graphics, and one for both.