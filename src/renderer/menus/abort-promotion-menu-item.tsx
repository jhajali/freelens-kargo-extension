import { Renderer } from "@freelensapp/extensions";

import type { Promotion } from "../k8s/kargo/promotion-v1alpha1";

const {
  Component: { MenuItem, Icon },
} = Renderer;

type KargoKubeObject = Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  unknown,
  unknown
>;
type KargoKubeObjectCtor = typeof Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  unknown,
  unknown
>;

export interface AbortPromotionMenuItemProps extends Renderer.Component.KubeObjectMenuProps<Promotion> {
  resource: KargoKubeObjectCtor;
}

export function AbortPromotionMenuItem(props: AbortPromotionMenuItemProps) {
  const { object, toolbar, resource } = props;
  if (!object) return <></>;

  // Only show for non-terminal promotions
  const phase = (object as any).status?.phase;
  if (phase !== "Pending" && phase !== "Running") return <></>;

  const store = resource.getStore<KargoKubeObject>();
  if (!store) return <></>;

  const abort = async () => {
    await store.patch(
      object,
      {
        metadata: {
          annotations: { "kargo.akuity.io/abort": "true" },
        },
      } as any,
      "merge",
    );
  };

  return (
    <MenuItem onClick={abort}>
      <Icon material="cancel" interactive={toolbar} title="Abort Promotion" />
      <span className="title">Abort Promotion</span>
    </MenuItem>
  );
}
