import { Renderer } from "@freelensapp/extensions";

import type { DumpOptions } from "js-yaml";

const {
  Navigation: { getDetailsUrl },
} = Renderer;

export function getMaybeDetailsUrl(url?: string): string {
  if (url) {
    return getDetailsUrl(url);
  } else {
    return "";
  }
}

export function getHeight(data?: string): number {
  const lineHeight = 18;
  if (!data) return lineHeight;

  const lines = data.split("\n").length;
  if (lines < 5) return 5 * lineHeight;
  if (lines > 20) return 20 * lineHeight;
  return lines * lineHeight;
}

export const defaultYamlDumpOptions: DumpOptions = {
  seqNoIndent: true,
  noRefs: true,
  quoteStyle: "double",
  sortKeys: true,
};

export function createEnumFromKeys<T extends Record<string, any>>(obj: T): Record<keyof T, keyof T> {
  return Object.keys(obj).reduce(
    (acc, key) => {
      acc[key as keyof T] = key as keyof T;
      return acc;
    },
    {} as Record<keyof T, keyof T>,
  );
}

// The host throws when the cluster does not serve the kind; a page then renders nothing. Call it in an observer:
// the host registers the store once the cluster frame has loaded the CRDs, and the page renders again.
export function tryGetStore<T>(getStore: () => T): T | undefined {
  try {
    return getStore();
  } catch {
    return undefined;
  }
}
