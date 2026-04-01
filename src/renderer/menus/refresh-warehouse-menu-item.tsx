import { Renderer } from "@freelensapp/extensions";

import type { Warehouse } from "../k8s/kargo/warehouse-v1alpha1";

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

export interface RefreshWarehouseMenuItemProps extends Renderer.Component.KubeObjectMenuProps<Warehouse> {
  resource: KargoKubeObjectCtor;
}

export function RefreshWarehouseMenuItem(props: RefreshWarehouseMenuItemProps) {
  const { object, toolbar, resource } = props;
  if (!object) return <></>;

  const store = resource.getStore<KargoKubeObject>();
  if (!store) return <></>;

  const refresh = async () => {
    await store.patch(
      object,
      {
        metadata: {
          annotations: { "kargo.akuity.io/refresh": new Date().toISOString() },
        },
      } as any,
      "merge",
    );
  };

  return (
    <MenuItem onClick={refresh}>
      <Icon material="refresh" interactive={toolbar} title="Refresh Warehouse" />
      <span className="title">Refresh</span>
    </MenuItem>
  );
}
