import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { PromotionPolicy } from "../../k8s/kargo/promotion-policy-v1alpha1";
import { getAutoPromotionClass, getAutoPromotionText } from "../status-conditions";
import styles from "./promotion-policy-details.module.scss";
import stylesInline from "./promotion-policy-details.module.scss?inline";

const {
  Component: { Badge, DrawerItem },
} = Renderer;

export const PromotionPolicyDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<PromotionPolicy>> = observer(
  (props) => {
    const { object } = props;
    const autoPromo = PromotionPolicy.isAutoPromotionEnabled(object);

    return (
      <>
        <style>{stylesInline}</style>
        <div className={styles.details}>
          <DrawerItem name="Stage">{PromotionPolicy.getStage(object) || "—"}</DrawerItem>

          <DrawerItem name="Auto-Promotion">
            <Badge label={getAutoPromotionText(autoPromo)} className={getAutoPromotionClass(autoPromo)} />
          </DrawerItem>
        </div>
      </>
    );
  },
);
