import { type Common, Renderer } from "@freelensapp/extensions";
import { Stage } from "../k8s/kargo/stage-v1alpha1";

const {
  Component: { MenuItem, Icon },
} = Renderer;

export type PromoteFreightMenuItemProps = Common.Types.KubeObjectMenuItemProps<Stage>;

export function PromoteFreightMenuItem(props: PromoteFreightMenuItemProps) {
  const { object, toolbar } = props;
  if (!object) return <></>;

  const store = Stage.getStore<Stage>();
  if (!store) return <></>;

  const promote = async () => {
    await store.patch(
      object,
      {
        metadata: {
          annotations: { "kargo.akuity.io/request-promote": new Date().toISOString() },
        },
      },
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
