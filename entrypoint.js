import { Buffer } from "buffer";
import "react-native-get-random-values";
import 'fast-text-encoding';
import 'react-native-get-random-values';

import { Buffer } from "buffer";
import '@ethersproject/shims';

// Set up global Buffer
global.Buffer = Buffer;

Buffer.prototype.subarray = function subarray(begin, end) {
  const result = Uint8Array.prototype.subarray.apply(this, [begin, end]);
  Object.setPrototypeOf(result, Buffer.prototype);
  return result;
};

// Set up TextEncoder
global.TextEncoder = require("text-encoding").TextEncoder;

global.assert = require("assert");

import "expo-router/entry";
