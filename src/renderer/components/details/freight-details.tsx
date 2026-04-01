import { Renderer } from "@freelensapp/extensions";
import yaml from "js-yaml";
import { observer } from "mobx-react";
import { Freight } from "../../k8s/kargo/freight-v1alpha1";
import { defaultYamlDumpOptions, getHeight } from "../../utils";
import styles from "./freight-details.module.scss";
import stylesInline from "./freight-details.module.scss?inline";

const {
  Component: { Badge, DrawerItem, DrawerTitle, MonacoEditor, Table, TableCell, TableHead, TableRow, WithTooltip },
} = Renderer;

export const FreightDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Freight>> = observer((props) => {
  const { object } = props;

  const alias = Freight.getAlias(object);
  const warehouse = Freight.getOriginWarehouse(object);
  const commits = Freight.getCommits(object);
  const images = Freight.getImages(object);
  const charts = Freight.getCharts(object);
  const verifiedIn = Freight.getVerifiedInStages(object);
  const approvedFor = Freight.getApprovedForStages(object);
  const specYaml = yaml.dump(object.spec ?? {}, defaultYamlDumpOptions);

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.details}>
        <DrawerItem name="Alias">{alias}</DrawerItem>
        <DrawerItem name="Origin Warehouse">{warehouse || "—"}</DrawerItem>

        <DrawerItem name="Verified In">
          {verifiedIn.length > 0
            ? verifiedIn.map((s) => <Badge key={s} label={s} className="success" />)
            : "None"}
        </DrawerItem>

        <DrawerItem name="Approved For">
          {approvedFor.length > 0
            ? approvedFor.map((s) => <Badge key={s} label={s} className="success" />)
            : "None"}
        </DrawerItem>

        {commits.length > 0 && (
          <>
            <DrawerTitle>Git Commits</DrawerTitle>
            <Table>
              <TableHead>
                <TableCell>Repo</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Message</TableCell>
              </TableHead>
              {commits.map((commit, i) => (
                <TableRow key={`${commit.id}-${i}`}>
                  <TableCell><WithTooltip>{commit.repoURL ?? ""}</WithTooltip></TableCell>
                  <TableCell>{commit.id?.substring(0, 7) ?? ""}</TableCell>
                  <TableCell>{commit.branch ?? ""}</TableCell>
                  <TableCell><WithTooltip>{commit.message ?? ""}</WithTooltip></TableCell>
                </TableRow>
              ))}
            </Table>
          </>
        )}

        {images.length > 0 && (
          <>
            <DrawerTitle>Images</DrawerTitle>
            <Table>
              <TableHead>
                <TableCell>Repository</TableCell>
                <TableCell>Tag</TableCell>
                <TableCell>Digest</TableCell>
              </TableHead>
              {images.map((image, i) => (
                <TableRow key={`${image.repoURL}-${i}`}>
                  <TableCell><WithTooltip>{image.repoURL ?? ""}</WithTooltip></TableCell>
                  <TableCell>{image.tag ?? ""}</TableCell>
                  <TableCell><WithTooltip>{image.digest?.substring(0, 16) ?? ""}</WithTooltip></TableCell>
                </TableRow>
              ))}
            </Table>
          </>
        )}

        {charts.length > 0 && (
          <>
            <DrawerTitle>Charts</DrawerTitle>
            <Table>
              <TableHead>
                <TableCell>Repository</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Version</TableCell>
              </TableHead>
              {charts.map((chart, i) => (
                <TableRow key={`${chart.name}-${i}`}>
                  <TableCell><WithTooltip>{chart.repoURL ?? ""}</WithTooltip></TableCell>
                  <TableCell>{chart.name ?? ""}</TableCell>
                  <TableCell>{chart.version ?? ""}</TableCell>
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
