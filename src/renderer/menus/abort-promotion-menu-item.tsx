import { type Common, Renderer } from "@freelensapp/extensions";
import { Promotion } from "../k8s/kargo/promotion-v1alpha1";

const {
  Component: { MenuItem, Icon },
} = Renderer;

export type AbortPromotionMenuItemProps = Common.Types.KubeObjectMenuItemProps<Promotion>;

export function AbortPromotionMenuItem(props: AbortPromotionMenuItemProps) {
  const { object, toolbar } = props;
  if (!object) return <></>;

  // Only show for non-terminal promotions
  const phase = object.status?.phase;
  if (phase !== "Pending" && phase !== "Running") return <></>;

  const store = Promotion.getStore<Promotion>();
  if (!store) return <></>;

  const abort = async () => {
    await store.patch(
      object,
      {
        metadata: {
          annotations: { "kargo.akuity.io/abort": "true" },
        },
      },
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
