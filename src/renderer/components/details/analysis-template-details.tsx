import { Renderer } from "@freelensapp/extensions";
import yaml from "js-yaml";
import { observer } from "mobx-react";
import { AnalysisTemplate } from "../../k8s/kargo/analysis-template-v1alpha1";
import { defaultYamlDumpOptions, getHeight } from "../../utils";
import styles from "./analysis-template-details.module.scss";
import stylesInline from "./analysis-template-details.module.scss?inline";

const {
  Component: { DrawerItem, DrawerTitle, MonacoEditor, Table, TableCell, TableHead, TableRow },
} = Renderer;

export const AnalysisTemplateDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<AnalysisTemplate>> = observer(
  (props) => {
    const { object } = props;
    const metrics = AnalysisTemplate.getMetrics(object);
    const args = AnalysisTemplate.getArgs(object);
    const specYaml = yaml.dump(object.spec ?? {}, defaultYamlDumpOptions);

    return (
      <>
        <style>{stylesInline}</style>
        <div className={styles.details}>
          <DrawerItem name="Metrics Count">{metrics.length}</DrawerItem>
          <DrawerItem name="Args Count">{args.length}</DrawerItem>

          {metrics.length > 0 && (
            <>
              <DrawerTitle>Metrics</DrawerTitle>
              <Table>
                <TableHead>
                  <TableCell>Name</TableCell>
                  <TableCell>Success Condition</TableCell>
                  <TableCell>Failure Limit</TableCell>
                </TableHead>
                {metrics.map((metric) => (
                  <TableRow key={metric.name}>
                    <TableCell>{metric.name}</TableCell>
                    <TableCell>{metric.successCondition ?? "—"}</TableCell>
                    <TableCell>{metric.failureLimit ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </Table>
            </>
          )}

          {args.length > 0 && (
            <>
              <DrawerTitle>Args</DrawerTitle>
              <Table>
                <TableHead>
                  <TableCell>Name</TableCell>
                  <TableCell>Value</TableCell>
                </TableHead>
                {args.map((arg) => (
                  <TableRow key={arg.name}>
                    <TableCell>{arg.name}</TableCell>
                    <TableCell>{arg.value ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </Table>
            </>
          )}

          <DrawerTitle>Spec</DrawerTitle>
          <MonacoEditor
            style={{ height: getHeight(specYaml), minHeight: 100 }}
            value={specYaml}
            language="yaml"
            readOnly
          />
        </div>
      </>
    );
  },
);
