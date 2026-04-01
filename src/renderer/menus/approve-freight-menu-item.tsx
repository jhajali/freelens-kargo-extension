import { Renderer } from "@freelensapp/extensions";

import type { Freight } from "../k8s/kargo/freight-v1alpha1";

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

export interface ApproveFreightMenuItemProps extends Renderer.Component.KubeObjectMenuProps<Freight> {
  resource: KargoKubeObjectCtor;
}

export function ApproveFreightMenuItem(props: ApproveFreightMenuItemProps) {
  const { object, toolbar, resource } = props;
  if (!object) return <></>;

  const store = resource.getStore<KargoKubeObject>();
  if (!store) return <></>;

  const approve = async () => {
    await store.patch(
      object,
      {
        metadata: {
          annotations: { "kargo.akuity.io/approved": new Date().toISOString() },
        },
      } as any,
      "merge",
    );
  };

  return (
    <MenuItem onClick={approve}>
      <Icon material="check_circle" interactive={toolbar} title="Approve Freight" />
      <span className="title">Approve Freight</span>
    </MenuItem>
  );
}
