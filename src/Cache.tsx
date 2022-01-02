import { Platform } from 'react-native';

export default Platform.OS === 'web'
  ? require('./CacheWeb').ImageCacheWeb
  : require('./CacheNative').ImageCacheNative;
