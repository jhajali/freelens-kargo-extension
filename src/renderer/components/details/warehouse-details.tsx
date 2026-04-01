import { Renderer } from "@freelensapp/extensions";
import yaml from "js-yaml";
import { observer } from "mobx-react";
import { Warehouse } from "../../k8s/kargo/warehouse-v1alpha1";
import { defaultYamlDumpOptions, getHeight } from "../../utils";
import styles from "./warehouse-details.module.scss";
import stylesInline from "./warehouse-details.module.scss?inline";

const {
  Component: { DrawerItem, DrawerTitle, MonacoEditor, Table, TableCell, TableHead, TableRow, WithTooltip },
} = Renderer;

export const WarehouseDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Warehouse>> = observer((props) => {
  const { object } = props;

  const policy = Warehouse.getFreightCreationPolicy(object);
  const interval = Warehouse.getInterval(object);
  const lastFreight = Warehouse.getLastFreightName(object);
  const subs = object.spec?.subscriptions;
  const specYaml = yaml.dump(object.spec ?? {}, defaultYamlDumpOptions);

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.details}>
        <DrawerItem name="Freight Creation Policy">{policy}</DrawerItem>
        {interval && <DrawerItem name="Interval">{interval}</DrawerItem>}
        <DrawerItem name="Last Freight">{lastFreight || "—"}</DrawerItem>

        {subs?.git && subs.git.length > 0 && (
          <>
            <DrawerTitle>Git Subscriptions</DrawerTitle>
            <Table>
              <TableHead>
                <TableCell>Repo URL</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Strategy</TableCell>
              </TableHead>
              {subs.git.map((sub, i) => (
                <TableRow key={`${sub.repoURL}-${i}`}>
                  <TableCell><WithTooltip>{sub.repoURL}</WithTooltip></TableCell>
                  <TableCell>{sub.branch ?? ""}</TableCell>
                  <TableCell>{sub.commitSelectionStrategy ?? ""}</TableCell>
                </TableRow>
              ))}
            </Table>
          </>
        )}

        {subs?.images && subs.images.length > 0 && (
          <>
            <DrawerTitle>Image Subscriptions</DrawerTitle>
            <Table>
              <TableHead>
                <TableCell>Repo URL</TableCell>
                <TableCell>Strategy</TableCell>
                <TableCell>Constraint</TableCell>
                <TableCell>Platform</TableCell>
              </TableHead>
              {subs.images.map((sub, i) => (
                <TableRow key={`${sub.repoURL}-${i}`}>
                  <TableCell><WithTooltip>{sub.repoURL}</WithTooltip></TableCell>
                  <TableCell>{sub.tagSelectionStrategy ?? ""}</TableCell>
                  <TableCell>{sub.semverConstraint ?? ""}</TableCell>
                  <TableCell>{sub.platform ?? ""}</TableCell>
                </TableRow>
              ))}
            </Table>
          </>
        )}

        {subs?.charts && subs.charts.length > 0 && (
          <>
            <DrawerTitle>Chart Subscriptions</DrawerTitle>
            <Table>
              <TableHead>
                <TableCell>Repo URL</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Constraint</TableCell>
              </TableHead>
              {subs.charts.map((sub, i) => (
                <TableRow key={`${sub.repoURL}-${i}`}>
                  <TableCell><WithTooltip>{sub.repoURL}</WithTooltip></TableCell>
                  <TableCell>{sub.name ?? ""}</TableCell>
                  <TableCell>{sub.semverConstraint ?? ""}</TableCell>
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
