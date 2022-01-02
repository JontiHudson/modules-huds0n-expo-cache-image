import React from 'react';

import Cache from './Cache';
import CacheImageComponent from './Component';

import * as Types from './types';

export namespace CacheImage {
  export type Props = Types.Props;
}

export class CacheImage extends React.Component<Types.Props> {
  static clear = Cache.clear;
  static load = Cache.load;

  render() {
    return <CacheImageComponent {...this.props} />;
  }
}
