import { useEffect, useState } from "react";
import { Image } from "react-native";

const DEFAULT_ENTRY_LOADING_MS = 700;

type UseEntryLoadingOptions = {
  durationMs?: number;
  assetModules?: readonly number[];
};

export function useEntryLoading(
  options: UseEntryLoadingOptions = {},
): boolean {
  const { durationMs = DEFAULT_ENTRY_LOADING_MS, assetModules = [] } = options;
  const [minDurationElapsed, setMinDurationElapsed] = useState(false);
  const [assetsReady, setAssetsReady] = useState(assetModules.length === 0);

  useEffect(() => {
    setMinDurationElapsed(false);
    const timeoutId = setTimeout(() => {
      setMinDurationElapsed(true);
    }, durationMs);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [durationMs]);

  useEffect(() => {
    let isActive = true;

    if (assetModules.length === 0) {
      setAssetsReady(true);
      return () => {
        isActive = false;
      };
    }

    setAssetsReady(false);
    void Promise.all(
      assetModules.map((moduleId) => {
        const resolvedSource = Image.resolveAssetSource(moduleId);
        const uri = resolvedSource?.uri;
        if (!uri) return Promise.resolve(undefined);
        return Image.prefetch(uri).then(() => undefined).catch(() => undefined);
      }),
    ).then(() => {
      if (isActive) {
        setAssetsReady(true);
      }
    });

    return () => {
      isActive = false;
    };
  }, [assetModules]);

  return !(minDurationElapsed && assetsReady);
}
