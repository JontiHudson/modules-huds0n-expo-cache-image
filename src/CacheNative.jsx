"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageCacheNative = void 0;
const tslib_1 = require("tslib");
const FileSystem = (0, tslib_1.__importStar)(require("expo-file-system"));
const react_native_crypto_js_1 = (0, tslib_1.__importDefault)(require("react-native-crypto-js"));
const error_1 = (0, tslib_1.__importDefault)(require("@huds0n/error"));
const FS_DIR = `${FileSystem.cacheDirectory}@huds0n-cache-image/`;
const FS_DIR_TEMP = `${FileSystem.cacheDirectory}@huds0n-cache-image-temp/`;
class ImageCacheNativeClass {
    constructor(fsDir, fsDirTemp) {
        this._cache = {};
        this._fsDir = fsDir;
        this._fsDirTemp = fsDirTemp;
        this._tempId = 0;
        this._buildingDirs = Promise.all([
            FileSystem.makeDirectoryAsync(fsDir),
            FileSystem.makeDirectoryAsync(fsDirTemp),
        ]).catch(() => {
        });
        this.clear = this.clear.bind(this);
        this.load = this.load.bind(this);
    }
    clear() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this._cache = {};
            this._tempId = 0;
            const rebuildDir = (dir) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                try {
                    yield FileSystem.deleteAsync(dir, { idempotent: true });
                }
                catch (_a) { }
                yield FileSystem.makeDirectoryAsync(dir);
            });
            yield this._buildingDirs;
            this._buildingDirs = Promise.all([
                rebuildDir(this._fsDir),
                rebuildDir(this._fsDirTemp),
            ]);
            yield this._buildingDirs;
        });
    }
    load(source) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            try {
                return this._loadSource(source);
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
    static _moveFromTemp(temp, path) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield FileSystem.moveAsync({ from: temp, to: path });
        });
    }
    static _downloadToTemp(uri, temp) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const outcome = yield FileSystem.downloadAsync(uri, temp).catch(() => { });
            if (!outcome || outcome.status !== 200) {
                throw new error_1.default({
                    name: 'Huds0n Error',
                    code: 'CACHE_IMAGE_DOWNLOAD_ERROR',
                    message: 'Unable to download image',
                    info: { downloadError: outcome },
                    severity: 'LOW',
                });
            }
        });
    }
    static _getFilenameExtension(uri) {
        const filename = uri.substring(uri.lastIndexOf('/'), uri.indexOf('?') === -1 ? uri.length : uri.indexOf('?'));
        return filename.indexOf('.') === -1
            ? '.jpg'
            : filename.substring(filename.lastIndexOf('.'));
    }
    static sourceToUri(source) {
        return (source === null || source === void 0 ? void 0 : source.uri) || null;
    }
    static _storedPathExists(path) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { exists } = yield FileSystem.getInfoAsync(path);
            return exists;
        });
    }
    static uriToSource(uri) {
        return { uri };
    }
    _loadSource(source) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const uri = ImageCacheNativeClass.sourceToUri(source);
            return uri
                ? ImageCacheNativeClass.uriToSource(yield this._getCachedUri(uri))
                : null;
        });
    }
    _getCachedUri(uri) {
        return this._getUriFromCache(uri) || this._pullCachedUri(uri);
    }
    _getUriFromCache(uri) {
        return this._cache[uri];
    }
    _pullCachedUri(uri) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { path, temp } = this._getPaths(uri);
            yield this._buildingDirs;
            if (!(yield ImageCacheNativeClass._storedPathExists(path))) {
                if (uri.startsWith('file')) {
                    yield FileSystem.copyAsync({ from: uri, to: path });
                }
                else {
                    yield ImageCacheNativeClass._downloadToTemp(uri, temp);
                    yield ImageCacheNativeClass._moveFromTemp(temp, path);
                }
            }
            this._addPathToCache(uri, path);
            return path;
        });
    }
    _getPaths(uri) {
        const ext = ImageCacheNativeClass._getFilenameExtension(uri);
        const path = `${this._fsDir}${react_native_crypto_js_1.default.MD5(uri).toString()}${ext}`;
        const temp = `${this._fsDirTemp}${react_native_crypto_js_1.default.MD5(uri).toString()}-${this._tempId}${ext}`;
        this._tempId++;
        return { path, temp };
    }
    _addPathToCache(uri, path) {
        this._cache[uri] = path;
    }
}
exports.ImageCacheNative = new ImageCacheNativeClass(FS_DIR, FS_DIR_TEMP);
