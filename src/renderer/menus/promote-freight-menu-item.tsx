import { Renderer } from "@freelensapp/extensions";

import type { Stage } from "../k8s/kargo/stage-v1alpha1";

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

export interface PromoteFreightMenuItemProps extends Renderer.Component.KubeObjectMenuProps<Stage> {
  resource: KargoKubeObjectCtor;
}

export function PromoteFreightMenuItem(props: PromoteFreightMenuItemProps) {
  const { object, toolbar, resource } = props;
  if (!object) return <></>;

  const store = resource.getStore<KargoKubeObject>();
  if (!store) return <></>;

  const promote = async () => {
    await store.patch(
      object,
      {
        metadata: {
          annotations: { "kargo.akuity.io/request-promote": new Date().toISOString() },
        },
      } as any,
      "merge",
    );
  };

  return (
    <MenuItem onClick={promote}>
      <Icon material="rocket_launch" interactive={toolbar} title="Promote Freight" />
      <span className="title">Promote Freight</span>
    </MenuItem>
  );
}
