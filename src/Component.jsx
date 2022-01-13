"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = (0, tslib_1.__importDefault)(require("react"));
const react_native_1 = require("react-native");
const expo_blur_1 = require("expo-blur");
const error_1 = (0, tslib_1.__importDefault)(require("@huds0n/error"));
const theme_1 = require("@huds0n/theming/src/theme");
const utilities_1 = require("@huds0n/utilities");
const Cache_1 = (0, tslib_1.__importDefault)(require("./Cache"));
const defaultPlaceholder = require("../assets/noImagePlaceholder.png");
const defaultErrorPlaceholder = require("../assets/errorImagePlaceholder.png");
const AnimatedBlurView = react_native_1.Animated.createAnimatedComponent(expo_blur_1.BlurView);
const imageFill = {
    position: "absolute",
    width: "100%",
    height: "100%",
};
function CacheImageComponent(props) {
    const { activityIndicatorColor = theme_1.theme.colors.TEXT, activityIndicatorSize = "large", errorPlaceholderImage = defaultErrorPlaceholder, fadeDuration = 300, placeholderImage = defaultPlaceholder, resizeMethod, resizeMode, source: sourceProp, style, } = props;
    const intensity = (0, utilities_1.useAnimatedValue)(100);
    const [loadedSource, setLoadedSource] = (0, utilities_1.useState)(undefined);
    const [load, isLoading] = (0, utilities_1.useAsyncCallback)(async (source) => {
        setLoadedSource(source ? await Cache_1.default.load(source) : null);
    });
    const fadeIn = (0, utilities_1.useCallback)(() => {
        react_native_1.Animated.timing(intensity, {
            duration: fadeDuration,
            toValue: 0,
            useNativeDriver: react_native_1.Platform.OS === "android",
        }).start();
    });
    (0, utilities_1.useEffect)(() => {
        load(sourceProp);
    }, [sourceProp]);
    (0, utilities_1.useEffect)(() => {
        fadeIn();
    }, [loadedSource], { skipMounts: true });
    const opacity = intensity.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0],
    });
    const flattenedStyle = react_native_1.StyleSheet.flatten(style) || {};
    const borderRadiusStyle = {
        borderRadius: flattenedStyle.borderRadius,
        borderBottomLeftRadius: flattenedStyle.borderBottomLeftRadius,
        borderBottomRightRadius: flattenedStyle.borderBottomRightRadius,
        borderTopLeftRadius: flattenedStyle.borderTopLeftRadius,
        borderTopRightRadius: flattenedStyle.borderTopRightRadius,
    };
    const image = (function getImage() {
        if (loadedSource === undefined) {
            return null;
        }
        if (loadedSource === null) {
            return (<react_native_1.Image source={placeholderImage} style={imageFill} resizeMode="contain" {...borderRadiusStyle}/>);
        }
        if (loadedSource instanceof error_1.default) {
            return (<react_native_1.Image source={errorPlaceholderImage} style={imageFill} resizeMode="contain" {...borderRadiusStyle}/>);
        }
        return (<react_native_1.Image source={loadedSource} resizeMethod={resizeMethod} resizeMode={resizeMode} style={imageFill} {...borderRadiusStyle}/>);
    })();
    return (<react_native_1.View style={react_native_1.StyleSheet.flatten([{ overflow: "hidden" }, flattenedStyle])}>
      <react_native_1.Animated.View style={[react_native_1.StyleSheet.absoluteFill, { opacity }]}>
        {image}

        {react_native_1.Platform.OS === "ios" && (<AnimatedBlurView style={react_native_1.StyleSheet.absoluteFill} intensity={intensity} tint="default"/>)}
      </react_native_1.Animated.View>
      {isLoading && (<react_native_1.View style={[
                react_native_1.StyleSheet.absoluteFill,
                { alignContent: "center", justifyContent: "center" },
            ]}>
          <react_native_1.ActivityIndicator color={activityIndicatorColor} size={activityIndicatorSize}/>
        </react_native_1.View>)}
    </react_native_1.View>);
}
exports.default = CacheImageComponent;
