import { type Common, Renderer } from "@freelensapp/extensions";
import { Warehouse } from "../k8s/kargo/warehouse-v1alpha1";

const {
  Component: { MenuItem, Icon },
} = Renderer;

export type RefreshWarehouseMenuItemProps = Common.Types.KubeObjectMenuItemProps<Warehouse>;

export function RefreshWarehouseMenuItem(props: RefreshWarehouseMenuItemProps) {
  const { object, toolbar } = props;
  if (!object) return <></>;

  const store = Warehouse.getStore<Warehouse>();
  if (!store) return <></>;

  const refresh = async () => {
    await store.patch(
      object,
      {
        metadata: {
          annotations: { "kargo.akuity.io/refresh": new Date().toISOString() },
        },
      },
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
