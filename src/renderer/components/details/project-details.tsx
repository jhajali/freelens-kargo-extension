import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { Project } from "../../k8s/kargo/project-v1alpha1";
import { getConditionClass, getConditionText, getProjectPhaseClass, getProjectPhaseText } from "../status-conditions";
import styles from "./project-details.module.scss";
import stylesInline from "./project-details.module.scss?inline";

const {
  Component: { Badge, DrawerItem, DrawerTitle, Table, TableCell, TableHead, TableRow },
} = Renderer;

export const ProjectDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Project>> = observer((props) => {
  const { object } = props;
  const phase = Project.getPhase(object);
  const conditions = Project.getConditions(object);
  const policies = object.spec?.promotionPolicies ?? [];

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.details}>
        <DrawerItem name="Phase">
          <Badge label={getProjectPhaseText(phase)} className={getProjectPhaseClass(phase)} />
        </DrawerItem>

        <DrawerItem name="Conditions">
          <Badge label={getConditionText(conditions)} className={getConditionClass(conditions)} />
        </DrawerItem>

        {policies.length > 0 && (
          <>
            <DrawerTitle>Promotion Policies</DrawerTitle>
            <Table>
              <TableHead>
                <TableCell>Stage</TableCell>
                <TableCell>Auto-Promotion</TableCell>
              </TableHead>
              {policies.map((policy, i) => (
                <TableRow key={`${policy.stage}-${i}`}>
                  <TableCell>{policy.stage}</TableCell>
                  <TableCell>
                    <Badge
                      label={policy.autoPromotionEnabled ? "Enabled" : "Disabled"}
                      className={policy.autoPromotionEnabled ? "success" : ""}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </>
        )}
      </div>
    </>
  );
});
