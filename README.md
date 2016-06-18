# loopback-component-model-diagram [![NPM version][npm-image]][npm-url]
> Generate a diagram of your loopback models

It generates a [nomnoml] code and provides a simple page to display it.

## Requirements

The `loopback-component-model-diagram` requires loopback version >= 2.

## Installation

```sh
$ npm install --save loopback-component-model-diagram
```

## Options

You can set some options in the `component-config.json` file.

`mountPath`: **String**
> Default: /modeldiagram
>
> Set the path where to mount the model diagram component.

`directives`: **Object**
> Sets the default directives to the generated source code. See [directives][nomnoml-directives] of the [nomnoml] package.



[npm-image]: https://badge.fury.io/js/loopback-component-model-diagram.svg
[npm-url]: https://npmjs.org/package/loopback-component-model-diagram
[nomnoml]: https://github.com/skanaar/nomnoml
[nomnoml-directives]: https://github.com/skanaar/nomnoml/#directives
