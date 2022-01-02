import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  ImageURISource,
  Platform,
  ImageStyle,
  StyleSheet,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';

import Error from '@huds0n/error';
import { theme } from '@huds0n/theming/src/theme';
import {
  useAnimatedValue,
  useAsyncCallback,
  useCallback,
  useEffect,
  useState,
} from '@huds0n/utilities';

import Cache from './Cache';
import * as Types from './types';

const defaultPlaceholder = require('../assets/noImagePlaceholder.png');
const defaultErrorPlaceholder = require('../assets/errorImagePlaceholder.png');

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const imageFill: ImageStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
};

export default function CacheImageComponent(props: Types.Props) {
  const {
    activityIndicatorColor = theme.colors.TEXT,
    activityIndicatorSize = 'large',
    errorPlaceholderImage = defaultErrorPlaceholder,
    fadeDuration = 300,
    placeholderImage = defaultPlaceholder,
    resizeMethod,
    resizeMode,
    source: sourceProp,
    style,
  } = props;

  const intensity = useAnimatedValue(100);

  const [loadedSource, setLoadedSource] = useState<
    ImageURISource | null | undefined | Error
  >(undefined);

  const [load, isLoading] = useAsyncCallback(
    async (source: ImageURISource | null) => {
      setLoadedSource(source ? await Cache.load(source) : null);
    },
  );

  const fadeIn = useCallback(() => {
    Animated.timing(intensity, {
      duration: fadeDuration,
      toValue: 0,
      useNativeDriver: Platform.OS === 'android',
    }).start();
  });

  useEffect(() => {
    load(sourceProp);
  }, [sourceProp]);

  useEffect(
    () => {
      fadeIn();
    },
    [loadedSource],
    { skipMounts: true },
  );

  const opacity = intensity.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
  });

  const flattenedStyle = StyleSheet.flatten(style) || {};

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
      return (
        <Image
          source={placeholderImage}
          style={imageFill}
          resizeMode="contain"
          {...borderRadiusStyle}
        />
      );
    }

    if (loadedSource instanceof Error) {
      return (
        <Image
          source={errorPlaceholderImage}
          style={imageFill}
          resizeMode="contain"
          {...borderRadiusStyle}
        />
      );
    }

    return (
      <Image
        source={loadedSource}
        resizeMethod={resizeMethod}
        resizeMode={resizeMode}
        style={imageFill}
        {...borderRadiusStyle}
      />
    );
  })();

  return (
    <View style={StyleSheet.flatten([{ overflow: 'hidden' }, flattenedStyle])}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
        {image}

        {Platform.OS === 'ios' && (
          <AnimatedBlurView
            // @ts-ignore
            style={StyleSheet.absoluteFill}
            intensity={intensity}
            tint="default"
          />
        )}
      </Animated.View>
      {isLoading && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { alignContent: 'center', justifyContent: 'center' },
          ]}
        >
          <ActivityIndicator
            color={activityIndicatorColor}
            size={activityIndicatorSize}
          />
        </View>
      )}
    </View>
  );
}
