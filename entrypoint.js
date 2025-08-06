// Import essential polyfills
import { Buffer } from "buffer";
import "react-native-get-random-values";

global.TextEncoder = require('text-encoding').TextEncoder
global.Buffer = Buffer;

// Then import the expo router
import "expo-router/entry";
