"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheImage = void 0;
const tslib_1 = require("tslib");
const react_1 = (0, tslib_1.__importDefault)(require("react"));
const Cache_1 = (0, tslib_1.__importDefault)(require("./Cache"));
const Component_1 = (0, tslib_1.__importDefault)(require("./Component"));
class CacheImage extends react_1.default.Component {
    render() {
        return <Component_1.default {...this.props}/>;
    }
}
exports.CacheImage = CacheImage;
CacheImage.clear = Cache_1.default.clear;
CacheImage.load = Cache_1.default.load;
