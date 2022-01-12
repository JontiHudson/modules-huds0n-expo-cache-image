import React from "react";

import Cache from "./Cache";
import CacheImageComponent from "./Component";

import type { Types } from "./types";

export class CacheImage extends React.Component<Types.Props> {
  static clear = Cache.clear;
  static load = Cache.load;

  render() {
    return <CacheImageComponent {...this.props} />;
  }
}

export type { Types as CacheImageTypes } from "./types";
