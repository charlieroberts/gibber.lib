gibber.lib
==========

This library provides the graphics and audio capabilities of Gibber without the code editing environment.

## Building (for development)

You can simply download the repo and skip straight to the usage section if you don't need to modify the library. If you want to modify gibber.lib, here's how to build it:

1. If you don't have it, install npm (the node.js package manager) from http://npmjs.org
2. Inside the top level of the repo, run `npm install` in the terminal.
3. Run `gulp`. This is a build module that is installed in step 2.

The build outputs two files that come pre-built with the repo. `gibber.lib.js` is for use with node or client CommonJS (browserify). `gibber.client.lib.js` can be included in any standard HTML file via a script tag.

## Usage
There are two library files that come with Gibber; they are almost identical, however, `gibber.client.lib.js` has a couple of lines of code added to it that make it easy to use in the browser. The other file, `gibber.lib.js` runs in node or with browserify. Just use `gibber.client.lib.js` if you're working in a HTML page and are unsure of which to use.

Here's an example HTML file that plays a simple drum beat, bass line, and random melody.

```html
<html>

<head>
  <script src='build/gibber.client.lib.js'></script>
</head>

<body></body>

<script>
Gibber.init() // REQUIRED!

// change root of global scale every other measure
Gibber.scale.root.seq( ['c4','eb4'], 2)

// create bass synth and sequence ocatve bass line
a = Mono('bass').note.seq( [0,7], 1/8 )

// simple kick / snare drum pattern
b = EDrums('xoxo')
b.snare.snappy = 1

// create lead synth and sequence with random notes/durations
c = Mono('easyfx')
  .note.seq( Rndi(0,12), [1/4,1/8,1/2,1,2].rnd( 1/8,4 ) )
</script>

</html>
```

If you want to use CommonJS (node or browserify), just use the following to start things off *assuming you have the module installed):

```js
Gibber = require( 'gibber.lib' )
Gibber.init()
``` 

## Notes
Right now only audio works, but I'll be adding interaction and graphics soon. Also note that `Drums` do not work because I haven't figured out resource management yet and `Drums` uses audio samples. However, `EDrums` (which uses synthesis) works fine. 

I'd eventually like to have three separate builds: one for audio, one for graphics, and one for both.