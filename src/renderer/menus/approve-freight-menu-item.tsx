import { type Common, Renderer } from "@freelensapp/extensions";
import { Freight } from "../k8s/kargo/freight-v1alpha1";

const {
  Component: { MenuItem, Icon },
} = Renderer;

export type ApproveFreightMenuItemProps = Common.Types.KubeObjectMenuItemProps<Freight>;

export function ApproveFreightMenuItem(props: ApproveFreightMenuItemProps) {
  const { object, toolbar } = props;
  if (!object) return <></>;

  const store = Freight.getStore<Freight>();
  if (!store) return <></>;

  const approve = async () => {
    await store.patch(
      object,
      {
        metadata: {
          annotations: { "kargo.akuity.io/approved": new Date().toISOString() },
        },
      },
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
