import { ImageURISource } from 'react-native';

import Huds0nError from '@huds0n/error';

class ImageCacheWebClass {
  constructor() {
    this.clear = this.clear.bind(this);
    this.load = this.load.bind(this);
  }

  public async clear() {}

  public async load(source: ImageURISource | null) {
    try {
      return source;
    } catch (error) {
      throw Huds0nError.transform(error, {
        name: 'Huds0n Error',
        code: 'CACHE_IMAGE_UNKNOWN_ERROR',
        message: 'Cache failed',
        info: { source },
        severity: 'MEDIUM',
      });
    }
  }
}

export const ImageCacheWeb = new ImageCacheWebClass();
