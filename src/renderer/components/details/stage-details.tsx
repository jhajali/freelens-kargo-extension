import { Renderer } from "@freelensapp/extensions";
import yaml from "js-yaml";
import { observer } from "mobx-react";
import { Stage } from "../../k8s/kargo/stage-v1alpha1";
import { defaultYamlDumpOptions, getHeight } from "../../utils";
import {
  getStageHealthClass,
  getStageHealthText,
  getStagePhaseClass,
  getStagePhaseText,
} from "../status-conditions";
import styles from "./stage-details.module.scss";
import stylesInline from "./stage-details.module.scss?inline";

const {
  Component: { Badge, DrawerItem, DrawerTitle, MonacoEditor, WithTooltip },
} = Renderer;

export const StageDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Stage>> = observer((props) => {
  const { object } = props;

  const phase = object.status?.phase;
  const health = object.status?.health?.status;
  const healthIssues = Stage.getHealthIssues(object);
  const currentFreight = Stage.getCurrentFreightName(object);
  const upstreamStages = Stage.getUpstreamStages(object);
  const warehouseSub = Stage.getWarehouseSubscription(object);
  const mechanisms = Stage.getPromotionMechanisms(object);
  const verification = Stage.getVerificationStatus(object);
  const currentPromo = Stage.getCurrentPromotionName(object);
  const lastPromo = Stage.getLastPromotionName(object);
  const specYaml = yaml.dump(object.spec ?? {}, defaultYamlDumpOptions);

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.details}>
        <DrawerItem name="Phase">
          <Badge label={getStagePhaseText(phase)} className={getStagePhaseClass(phase)} />
        </DrawerItem>

        <DrawerItem name="Health">
          <Badge label={getStageHealthText(health)} className={getStageHealthClass(health)} />
        </DrawerItem>

        {healthIssues.length > 0 && (
          <DrawerItem name="Health Issues">
            {healthIssues.map((issue, i) => (
              <div key={i}>{issue}</div>
            ))}
          </DrawerItem>
        )}

        <DrawerItem name="Current Freight">
          <WithTooltip>{currentFreight || "—"}</WithTooltip>
        </DrawerItem>

        {warehouseSub && <DrawerItem name="Warehouse Subscription">{warehouseSub}</DrawerItem>}

        {upstreamStages.length > 0 && (
          <DrawerItem name="Upstream Stages">{upstreamStages.join(", ")}</DrawerItem>
        )}

        <DrawerItem name="Promotion Mechanisms">{mechanisms}</DrawerItem>

        <DrawerItem name="Verification">{verification}</DrawerItem>

        {currentPromo && <DrawerItem name="Current Promotion">{currentPromo}</DrawerItem>}
        {lastPromo && <DrawerItem name="Last Promotion">{lastPromo}</DrawerItem>}

        <DrawerTitle>Spec</DrawerTitle>
        <MonacoEditor
          className={styles.editor}
          style={{ height: getHeight(specYaml), minHeight: 100 }}
          value={specYaml}
          language="yaml"
          readOnly
        />
      </div>
    </>
  );
});
