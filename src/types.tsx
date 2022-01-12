import {
  ImageProps as ImagePropsRN,
  ImageSourcePropType,
  ImageURISource,
} from "react-native";

export declare namespace Types {
  export type Props = Omit<
    ImagePropsRN,
    "defaultSource" | "borderRadius" | "source"
  > & {
    activityIndicatorColor?: string;
    activityIndicatorSize?: number | "small" | "large";
    errorPlaceholderImage?: ImageSourcePropType;
    fadeDuration?: number;
    loadingBackgroundColor?: string;
    placeholderImage?: ImageSourcePropType;
    source: ImageURISource | null;
  };
}
