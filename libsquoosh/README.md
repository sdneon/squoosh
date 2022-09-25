# libSquoosh

libSquoosh is an _experimental_ way to run all the codecs you know from the [Squoosh] web app directly inside your own JavaScript program. libSquoosh uses a worker pool to parallelize processing images. This way you can apply the same codec to many images at once.

libSquoosh is currently not the fastest image compression tool in town and doesn’t aim to be. It is, however, fast enough to compress many images sufficiently quick at once.

## Essential Mods for Node.JS 18 compatibility and Encoding to AVIF
@squoosh/lib node module runs fine in Node.JS 16, but fails in Node.JS 18, owing to `fetch` issues loading the WASM modules. Hence, my mod is simply to document the workaround to **make it work in Node.JS 18** =) Plus a minor correction in sample codes for the 'Writing encoded images to the file system' example.

1. Simply edit the downloaded `@squoosh/lib/build/index.js` & `avif_node_enc_mt-143090b9.js` to insert `const fetch=0;` right after the `'use strict';` in the 1st line, so as to disable the use of native fetch API. Like this:
```js
'use strict';const fetch=0;Object.defineProperty //...rest of long, minified line of index.js omitted for brevity
```
2. In addition, another patch couple of patches are needed for encoding to AVIF.
   a. For simplicity, I've uploaded the entire `@squoosh\lib` node module (including WASM's and dependencies) (as downloaded and installed by npm) with my mods in `dist` folder.
   b. Patch 1: `avif_node_enc_mt.worker-be931951.js` needs to check for null `parentPort` before using it, as it is only available in worker threads. Unminified patch illustrated below:
```js
var Module = {};
if (typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string") {
    var nodeWorkerThreads = require$$0__default["default"];
    var parentPort = nodeWorkerThreads.parentPort;
    if (parentPort) //<-- add this check
    {
        parentPort.on("message", function(data) {
            onmessage({
                data: data
            })
        });
    }
    var nodeFS = require$$1__default["default"];
```
   c. Patch 2: Node.JS' `lib\internal\modules\cjs\loader.js` `_resolveFilename` method needs a patch to detect and fix bad `request` paths in the form of `c:\c:\...` to `c:\...`, to avoid inexplicable AVIF module load failure. 
   
   Unfortunately, this requires a rebuild of node.exe. I'll likely release this patch in my [Node.JS+ mod](https://github.com/sdneon/node) for 18.9.1+.
   
   Notice the (commented out) error trace below. Was trying to find the offending code making the bad request, but failed to find it. The trace just showed a root ESM load promise, with no useful clues whatsoever. 
```js
Module._resolveFilename = function(request, parent, isMain, options) {
  //v-- add this patch
  if ( (typeof request === 'string') && (request.length >= 6)
    && (request[1] === ':')
    //&& (request.substring(3).startsWith(request.substring(0,3)))
    && (request[0] === request[3]) && (request[1] === request[4])
  )
  { //fix bad request like 'c:\c:\...'
    request = request.substring(3);
    //console.log((new Error('trace')).stack); //<-- try to find source of error but failed
  }
  if (...
```

## Installation

libSquoosh can be installed to your local project with the following command:

```
$ npm install @squoosh/lib
```

You can start using the libSquoosh by adding these lines to the top of your JS program:

```js
import { ImagePool } from '@squoosh/lib';
import { cpus } from 'os';
const imagePool = new ImagePool(cpus().length);
```

This will create an image pool with an underlying processing pipeline that you can use to ingest and encode images. The ImagePool constructor takes one argument that defines how many parallel operations it is allowed to run at any given time.

:warning: Important! Make sure to only create 1 `ImagePool` when performing parallel image processing. If you create multiple pools, the `ImagePool` can run out of memory and crash. By reusing a single `ImagePool`, you can ensure that the backing worker queue and processing pipeline releases memory prior to processing the next image.

## Ingesting images

You can ingest a new image like so:

```js
import fs from 'fs/promises';
const file = await fs.readFile('./path/to/image.png');
const image = imagePool.ingestImage(file);
```

The `ingestImage` function can accept any [`ArrayBuffer`][arraybuffer] whether that is from `readFile()` or `fetch()`.

The returned `image` object is a representation of the original image, that you can now preprocess, encode, and extract information about.

## Preprocessing and encoding images

When an image has been ingested, you can start preprocessing it and encoding it to other formats. This example will resize the image and then encode it to a `.jpg` and `.jxl` image:

```js
const preprocessOptions = {
  //When both width and height are specified, the image resized to specified size.
  resize: {
    width: 100,
    height: 50,
  },
  /*
  //When either width or height is specified, the image resized to specified size keeping aspect ratio.
  resize: {
    width: 100,
  }
  */
};
await image.preprocess(preprocessOptions);

const encodeOptions = {
  mozjpeg: {}, //an empty object means 'use default settings'
  avif: {
      cqLevel: 10
  },
  jxl: {
    quality: 90,
  }
};
const result = await image.encode(encodeOptions);
```

The default values for each option can be found in the [`codecs.ts`][codecs.ts] file under `defaultEncoderOptions`. Every unspecified value will use the default value specified there. _Better documentation is needed here._

The AVIF options seem to be in [avif_enc.cpp](../codecs/avif/enc/avif_enc.cpp).

You can run your own code inbetween the different steps, if, for example, you want to change how much the image should be resized based on its original height. (See [Extracting image information](#extracting-image-information) to learn how to get the image dimensions).

## Closing the ImagePool

When you have encoded everything you need, it is recommended to close the processing pipeline in the ImagePool. This will not delete the images you have already encoded, but it will prevent you from ingesting and encoding new images.

Close the ImagePool pipeline with this line:

```js
await imagePool.close();
```

## Writing encoded images to the file system

When you have encoded an image, you normally want to write it to a file.

This example takes an image that has been encoded as a `jpg` and writes it to a file:

```js
const rawEncodedImage = image.encodedWith.mozjpeg;
rawEncodedImage.then((img) => {
    fs.writeFile('./public/image-out.jpg', img.binary);
});
```

This example iterates through all encoded versions of the image and writes them to a specific path:

```js
const newImagePath = '/path/to/image.'; //extension is added automatically

for (const encodedImage of Object.values(image.encodedWith)) {
    encodedImage.then((img) => {
        fs.writeFile(newImagePath + img.extension, img.binary);
    });
}
```

## Extracting image information

Information about a decoded image is available at `Image.decoded`. It looks something like this:

```js
console.log(await image.decoded);
// Returns:
{
 bitmap: {
    data: Uint8ClampedArray(47736584) [
      225, 228, 237, 255, 225, 228, 237, 255, 225, 228, 237, 255,
      225, 228, 237, 255, 225, 228, 237, 255, 225, 228, 237, 255,
      225, 228, 237, 255,
      ... //the entire raw image
    ],
    width: 4606,  //pixels
    height: 2591  //pixels
  },
  size: 2467795  //bytes
}
```

Information about an encoded image can be found at `Image.encodedWith[encoderName]`. It looks something like this:

```js
console.log(image.encodedWith.jxl);
// Returns:
{
  optionsUsed: {
    quality: 75,
    baseline: false,
    arithmetic: false,
    progressive: true,
    ... //all the possible options for this encoder
  },
  binary: Uint8Array(1266975) [
      1,   0,   0,   1,   0,  1,  0,  0, 255, 219,  0, 132,
    113, 119, 156, 156, 209,  1,  8,  8,   8,   8,  9,   8,
      9,  10,  10,   9,
    ... //the entire raw encoded image
  ],
  extension: 'jxl',
  size: 1266975  //bytes
}
```

## Auto optimizer

libSquoosh has an _experimental_ auto optimizer that compresses an image as much as possible, trying to hit a specific [Butteraugli] target value. The higher the Butteraugli target value, the more artifacts can be introduced.

You can make use of the auto optimizer by using “auto” as the config object.

```js
const encodeOptions: {
  mozjpeg: 'auto',
}
```

[squoosh]: https://squoosh.app
[codecs.ts]: https://github.com/GoogleChromeLabs/squoosh/blob/dev/libsquoosh/src/codecs.ts
[butteraugli]: https://github.com/google/butteraugli
[arraybuffer]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
