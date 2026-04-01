import { Renderer } from "@freelensapp/extensions";
import yaml from "js-yaml";
import { observer } from "mobx-react";
import { Promotion } from "../../k8s/kargo/promotion-v1alpha1";
import { defaultYamlDumpOptions, getHeight } from "../../utils";
import { DurationAbsoluteTimestamp } from "../duration-absolute";
import { getPromotionPhaseClass, getPromotionPhaseText } from "../status-conditions";
import styles from "./promotion-details.module.scss";
import stylesInline from "./promotion-details.module.scss?inline";

const {
  Component: { Badge, DrawerItem, DrawerTitle, MonacoEditor, Table, TableCell, TableHead, TableRow },
} = Renderer;

export const PromotionDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Promotion>> = observer((props) => {
  const { object } = props;

  const phase = object.status?.phase;
  const stage = Promotion.getTargetStage(object);
  const freightRef = Promotion.getFreightRef(object);
  const message = Promotion.getMessage(object);
  const finishedAt = Promotion.getFinishedAt(object);
  const steps = object.spec?.steps ?? [];
  const specYaml = yaml.dump(object.spec ?? {}, defaultYamlDumpOptions);

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.details}>
        <DrawerItem name="Phase">
          <Badge label={getPromotionPhaseText(phase)} className={getPromotionPhaseClass(phase)} />
        </DrawerItem>

        <DrawerItem name="Stage">{stage || "—"}</DrawerItem>
        <DrawerItem name="Freight">{freightRef || "—"}</DrawerItem>

        {message && <DrawerItem name="Message">{message}</DrawerItem>}

        {finishedAt && (
          <DrawerItem name="Finished">
            <DurationAbsoluteTimestamp timestamp={finishedAt} />
          </DrawerItem>
        )}

        {steps.length > 0 && (
          <>
            <DrawerTitle>Promotion Steps</DrawerTitle>
            <Table>
              <TableHead>
                <TableCell>Uses</TableCell>
                <TableCell>As</TableCell>
              </TableHead>
              {steps.map((step, i) => (
                <TableRow key={`${step.uses}-${i}`}>
                  <TableCell>{step.uses}</TableCell>
                  <TableCell>{step.as ?? "—"}</TableCell>
                </TableRow>
              ))}
            </Table>
          </>
        )}

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
