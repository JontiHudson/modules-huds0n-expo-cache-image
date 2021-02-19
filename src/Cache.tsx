import { ImageURISource } from 'react-native';

import * as FileSystem from 'expo-file-system';
//@ts-ignore
import CryptoJS from 'react-native-crypto-js';

import Error from '@huds0n/error';

const FS_DIR = `${FileSystem.cacheDirectory}@huds0n-cache-image/`;
const FS_DIR_TEMP = `${FileSystem.cacheDirectory}@huds0n-cache-image-temp/`;

class ImageCache {
  private _cache: { [uri: string]: string };
  private _tempId: number;
  private _buildingDirs: Promise<any>;
  private _fsDir: string;
  private _fsDirTemp: string;

  constructor(fsDir: string, fsDirTemp: string) {
    this._cache = {};
    this._fsDir = fsDir;
    this._fsDirTemp = fsDirTemp;
    this._tempId = 0;

    this._buildingDirs = Promise.all([
      FileSystem.makeDirectoryAsync(fsDir),
      FileSystem.makeDirectoryAsync(fsDirTemp),
    ]).catch(() => {
      // Catches error of trying to make dir if already exists
    });

    this.clear = this.clear.bind(this);
    this.load = this.load.bind(this);
  }

  // PUBLIC INSTANCE METHODS

  public async clear() {
    this._cache = {};
    this._tempId = 0;

    const rebuildDir = async (dir: string) => {
      try {
        await FileSystem.deleteAsync(dir, { idempotent: true });
      } catch (error) {
        // Catches error of trying to delete folder that doesn't exist
      }
      await FileSystem.makeDirectoryAsync(dir);
    };

    // Waits until any current dir build is complete
    await this._buildingDirs;

    this._buildingDirs = Promise.all([
      rebuildDir(this._fsDir),
      rebuildDir(this._fsDirTemp),
    ]);

    await this._buildingDirs;
  }

  public async load(source: ImageURISource | null) {
    try {
      return await this._loadSource(source);
    } catch (e) {
      const error = Error.transform(e, {
        name: 'Huds0n Error',
        code: 'CACHE_IMAGE_UNKNOWN_ERROR',
        message: 'Cache failed',
        info: { source },
        severity: 'MEDIUM',
      });
      error.handle();
      return error;
    }
  }

  // PRIVATE STATIC METHODS

  private static async _moveFromTemp(temp: string, path: string) {
    await FileSystem.moveAsync({ from: temp, to: path });
  }

  private static async _downloadToTemp(uri: string, temp: string) {
    const outcome = await FileSystem.downloadAsync(uri, temp).catch(() => {});

    if (!outcome || outcome.status !== 200) {
      throw new Error({
        name: 'Huds0n Error',
        code: 'CACHE_IMAGE_DOWNLOAD_ERROR',
        message: 'Unable to download image',
        info: { downloadError: outcome },
        severity: 'LOW',
      });
    }
  }

  private static _getFilenameExtension(uri: string) {
    const filename = uri.substring(
      uri.lastIndexOf('/'),
      uri.indexOf('?') === -1 ? uri.length : uri.indexOf('?'),
    );
    return filename.indexOf('.') === -1
      ? '.jpg'
      : filename.substring(filename.lastIndexOf('.'));
  }

  private static sourceToUri(source: ImageURISource | null) {
    try {
      return source?.uri || null;
    } catch {
      // Ignore
    }

    throw new Error({
      code: 'CACHE_IMAGE_INCORRECT_SOURCE_TYPE',
      message: 'Image source must be format: null | { uri?: string }',
      severity: 'LOW',
    });
  }

  private static async _storedPathExists(path: string) {
    const { exists } = await FileSystem.getInfoAsync(path);
    return exists;
  }

  private static uriToSource(uri: string): ImageURISource {
    return { uri };
  }

  // PRIVATE INSTANCE METHODS

  private async _loadSource(source: ImageURISource | null) {
    const uri = ImageCache.sourceToUri(source);

    return uri ? ImageCache.uriToSource(await this._getCachedUri(uri)) : null;
  }

  private _getCachedUri(uri: string) {
    return this._getUriFromCache(uri) || this._pullCachedUri(uri);
  }

  private _getUriFromCache(uri: string): string | undefined {
    return this._cache[uri];
  }

  private async _pullCachedUri(uri: string) {
    const { path, temp } = this._getPaths(uri);

    await this._buildingDirs;

    if (!(await ImageCache._storedPathExists(path))) {
      // handles use of internal images, e.g. camera roll

      if (uri.startsWith('file')) {
        await FileSystem.copyAsync({ from: uri, to: path });
      } else {
        await ImageCache._downloadToTemp(uri, temp);
        await ImageCache._moveFromTemp(temp, path);
      }
    }

    this._addPathToCache(uri, path);
    return path;
  }

  private _getPaths(uri: string) {
    const ext = ImageCache._getFilenameExtension(uri);

    const path = `${this._fsDir}${CryptoJS.MD5(uri).toString()}${ext}`;
    const temp = `${this._fsDirTemp}${CryptoJS.MD5(uri).toString()}-${
      this._tempId
    }${ext}`;
    this._tempId++;

    return { path, temp };
  }

  private _addPathToCache(uri: string, path: string) {
    this._cache[uri] = path;
  }
}

export default new ImageCache(FS_DIR, FS_DIR_TEMP);
