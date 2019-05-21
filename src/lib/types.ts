import {
  CSSProperties,
  FunctionComponent,
  PropsWithChildren,
  ReactElement,
  ReactNode,
} from 'react';
import { pseudoArrayMethods } from './createSizesConfig';
import sizePropertyNames from './sizePropertyNames';

type SizeObserverRenderProp<TSizeName extends string> = (
  breakpoint: number,
  sizes: SizesConfig<TSizeName>,
) => ReactNode | null;

export type NullableProperties<T extends object> = { [K in keyof T]: T[K] | null };

export interface SizeObserverProps<TSizeName extends string> {
  children: SizeObserverRenderProp<TSizeName> | ReactNode;
  sizes: SizesConfig<TSizeName>;
  name?: string;
  style?: NullableProperties<CSSProperties>;
  className?: string;
  renderWithoutActiveSize?: boolean;
}

export type SizeProperty = (typeof sizePropertyNames)[number];

export type SizePropertyMap = { [P in SizeProperty]?: number };

export type SizeProviderCallback<TSizeName extends string = string> = (
  activeSizeIndex: number,
  sizes: SizesConfig<TSizeName>,
) => JSX.Element;

type SizeProp<TSizeName extends string = string> = { is: TSizeName } & { largerThan: TSizeName } & {
  smallerThan: TSizeName;
};

export type SizeProps<TSizeName extends string = string> = {
  children: JSX.Element | SizeProviderCallback<TSizeName>;
} & SizeProp<TSizeName>;

export interface ActiveSizeProviderProps<TSizeName extends string = string> {
  children: SizeProviderCallback<TSizeName>;
  sizeObserver?: string;
}

export interface LayoutSwitchProps<TSizeName extends string = string> {
  sizeObserver?: string;
}

export interface SizeConfig<TSizeName extends string> extends SizePropertyMap {
  readonly name: TSizeName;
}

export type SizesConfig<TSizeName extends string> = { readonly [K in TSizeName]: number } & {
  readonly [size: number]: SizeConfig<TSizeName>;
} & { readonly [K in (typeof pseudoArrayMethods)[number]]: Array<SizeConfig<TSizeName>>[K] } & {
    readonly length: number;
    readonly hasFallbackSize: boolean;
  };

export interface SizeObserverContextValueEntry {
  sizes: SizesConfig<string>;
  activeSizeIndex: number;
}

export interface SizeObserverContextValue extends Partial<SizeObserverContextValueEntry> {
  named: {
    [name: string]: SizeObserverContextValueEntry;
  };
}

export interface SizeObserverContextProviderProps extends SizeObserverContextValueEntry {
  children: ReactElement;
  name?: string;
}

export interface PackageConfig {
  ContextProvider: FunctionComponent<SizeObserverContextProviderProps>;
  useSizeObserverContext: () => SizeObserverContextValue | null;
}
