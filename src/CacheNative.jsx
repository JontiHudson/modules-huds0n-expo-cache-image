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
    _cache;
    _tempId;
    _buildingDirs;
    _fsDir;
    _fsDirTemp;
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
    async clear() {
        this._cache = {};
        this._tempId = 0;
        const rebuildDir = async (dir) => {
            try {
                await FileSystem.deleteAsync(dir, { idempotent: true });
            }
            catch { }
            await FileSystem.makeDirectoryAsync(dir);
        };
        await this._buildingDirs;
        this._buildingDirs = Promise.all([
            rebuildDir(this._fsDir),
            rebuildDir(this._fsDirTemp),
        ]);
        await this._buildingDirs;
    }
    async load(source) {
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
    }
    static async _moveFromTemp(temp, path) {
        await FileSystem.moveAsync({ from: temp, to: path });
    }
    static async _downloadToTemp(uri, temp) {
        const outcome = await FileSystem.downloadAsync(uri, temp).catch(() => { });
        if (!outcome || outcome.status !== 200) {
            throw new error_1.default({
                name: 'Huds0n Error',
                code: 'CACHE_IMAGE_DOWNLOAD_ERROR',
                message: 'Unable to download image',
                info: { downloadError: outcome },
                severity: 'LOW',
            });
        }
    }
    static _getFilenameExtension(uri) {
        const filename = uri.substring(uri.lastIndexOf('/'), uri.indexOf('?') === -1 ? uri.length : uri.indexOf('?'));
        return filename.indexOf('.') === -1
            ? '.jpg'
            : filename.substring(filename.lastIndexOf('.'));
    }
    static sourceToUri(source) {
        return source?.uri || null;
    }
    static async _storedPathExists(path) {
        const { exists } = await FileSystem.getInfoAsync(path);
        return exists;
    }
    static uriToSource(uri) {
        return { uri };
    }
    async _loadSource(source) {
        const uri = ImageCacheNativeClass.sourceToUri(source);
        return uri
            ? ImageCacheNativeClass.uriToSource(await this._getCachedUri(uri))
            : null;
    }
    _getCachedUri(uri) {
        return this._getUriFromCache(uri) || this._pullCachedUri(uri);
    }
    _getUriFromCache(uri) {
        return this._cache[uri];
    }
    async _pullCachedUri(uri) {
        const { path, temp } = this._getPaths(uri);
        await this._buildingDirs;
        if (!(await ImageCacheNativeClass._storedPathExists(path))) {
            if (uri.startsWith('file')) {
                await FileSystem.copyAsync({ from: uri, to: path });
            }
            else {
                await ImageCacheNativeClass._downloadToTemp(uri, temp);
                await ImageCacheNativeClass._moveFromTemp(temp, path);
            }
        }
        this._addPathToCache(uri, path);
        return path;
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
