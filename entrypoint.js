// Import essential polyfills
import "react-native-get-random-values";
import 'fast-text-encoding';
import 'react-native-get-random-values';

import { Buffer } from "buffer";
import '@ethersproject/shims';

global.Buffer = Buffer;

// Then import the expo router
import "@getpara/react-native-wallet/shim";
import "expo-router/entry";
