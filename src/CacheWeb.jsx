"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageCacheWeb = void 0;
const tslib_1 = require("tslib");
const error_1 = (0, tslib_1.__importDefault)(require("@huds0n/error"));
class ImageCacheWebClass {
    constructor() {
        this.clear = this.clear.bind(this);
        this.load = this.load.bind(this);
    }
    clear() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () { });
    }
    load(source) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            try {
                return source;
            }
            catch (error) {
                throw error_1.default.transform(error, {
                    name: 'Huds0n Error',
                    code: 'CACHE_IMAGE_UNKNOWN_ERROR',
                    message: 'Cache failed',
                    info: { source },
                    severity: 'MEDIUM',
                });
            }
        });
    }
}
exports.ImageCacheWeb = new ImageCacheWebClass();
