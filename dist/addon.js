"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addonFn = void 0;
const stremio_addon_sdk_1 = require("stremio-addon-sdk");
const extractor_1 = require("./extractor");
const pstream_1 = require("./pstream");
const manifest = {
    id: "xyz.theditor.stremsrc",
    version: "0.2.0",
    catalogs: [],
    resources: [
        {
            name: "stream",
            types: ["movie", "series"],
            idPrefixes: ["tt"],
        },
    ],
    types: ["movie", "series"],
    name: "stremsrc",
    description: "A VidSRC + PStream extractor for stremio",
};
const builder = new stremio_addon_sdk_1.addonBuilder(manifest);
const addonFn = (_a) => __awaiter(void 0, [_a], void 0, function* ({ type, id }) {
    var _b, _c;
    try {
        // Get streams from both extractors concurrently
        const [vidsrcStreams, pStreamStreams] = yield Promise.allSettled([
            (0, extractor_1.getStreamContent)(id, type),
            (0, pstream_1.getStreamContent)(id, type),
        ]);
        const allStreams = [];
        console.log("VidSrc result:", vidsrcStreams.status, vidsrcStreams.status === "rejected" ? vidsrcStreams.reason : (_b = vidsrcStreams.value) === null || _b === void 0 ? void 0 : _b.length);
        console.log("PStream result:", pStreamStreams.status, pStreamStreams.status === "rejected" ? pStreamStreams.reason : (_c = pStreamStreams.value) === null || _c === void 0 ? void 0 : _c.length);
        if (vidsrcStreams.status === "fulfilled" && vidsrcStreams.value) {
            allStreams.push(...vidsrcStreams.value);
        }
        if (pStreamStreams.status === "fulfilled" && pStreamStreams.value) {
            allStreams.push(...pStreamStreams.value);
        }
        return {
            streams: allStreams,
        };
    }
    catch (error) {
        console.error("Stream extraction failed:", error);
        return { streams: [] };
    }
});
exports.addonFn = addonFn;
builder.defineStreamHandler(exports.addonFn);
exports.default = builder.getInterface();
