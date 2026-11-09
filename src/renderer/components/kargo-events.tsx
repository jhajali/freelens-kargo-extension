import { Common, Renderer } from "@freelensapp/extensions";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { useState } from "react";

const {
  Component: {
    KubeObjectListLayout,
    Icon,
    MaybeLink,
    KubeObjectAge,
    NamespaceSelectBadge,
    WithTooltip,
    TabLayout,
    ReactiveDuration,
  },
  Navigation: { getDetailsUrl },
  K8sApi: { eventStore, apiManager },
} = Renderer;

const {
  Util: { cssNames, stopPropagation },
} = Common;

function isKargoEvent(event: Renderer.K8sApi.KubeEvent): boolean {
  return event?.involvedObject?.apiVersion?.includes("kargo.akuity.io/") ?? false;
}

enum columnId {
  message = "message",
  namespace = "namespace",
  object = "object",
  type = "type",
  count = "count",
  source = "source",
  age = "age",
  lastSeen = "last-seen",
}

export interface KargoEventsProps {
  className?: string;
  compact?: boolean;
  compactLimit?: number;
}

type KubeEvent = Renderer.K8sApi.KubeEvent;

const sortingCallbacks = {
  [columnId.namespace]: (event: KubeEvent) => event.getNs(),
  [columnId.type]: (event: KubeEvent) => event.type,
  [columnId.object]: (event: KubeEvent) => event.involvedObject.name,
  [columnId.count]: (event: KubeEvent) => event.count,
  [columnId.age]: (event: KubeEvent) => -event.getCreationTimestamp(),
  [columnId.lastSeen]: (event: KubeEvent) => (event.lastTimestamp ? -new Date(event.lastTimestamp).getTime() : 0),
};

type Sorting = { sortBy: string; orderBy: "asc" | "desc" };

function getSortedItems({ sortBy, orderBy }: Sorting): KubeEvent[] {
  const items = eventStore.contextItems.filter(isKargoEvent);
  const sortingCallback = sortingCallbacks[sortBy as keyof typeof sortingCallbacks];

  return [...items].sort((a, b) => {
    const valA = sortingCallback(a);
    const valB = sortingCallback(b);
    if (valA === valB) return 0;
    // As before the port: an undefined value compares as false, so it sorts after every other value.
    const compare = (valA as string | number) > (valB as string | number) ? 1 : -1;
    return orderBy === "asc" ? compare : -compare;
  });
}

// A function component: the host calls `getItems` and `customizeHeader` from its own derivations, where an
// `@observer` class component may not read `this.props` under mobx-react 10. Both read only the props of this render.
export const KargoEvents = observer(({ compact, compactLimit, className }: KargoEventsProps) => {
  const [sorting] = useState(() => observable.object<Sorting>({ sortBy: columnId.age, orderBy: "asc" }));

  const getVisibleItems = () => {
    const items = getSortedItems(sorting);
    return compact ? items.slice(0, compactLimit) : items;
  };

  const customizeHeader = ({ info, title, ...headerPlaceholders }: Renderer.Component.HeaderPlaceholders) => {
    if (compact) {
      const items = getSortedItems(sorting);
      const visibleItems = getVisibleItems();
      if (visibleItems.length === items.length) {
        return { title };
      }
      return {
        title,
        info: (
          <span>
            {"("}
            {visibleItems.length}
            {" of "}
            {items.length}
            {")"}
          </span>
        ),
      };
    }

    return {
      info: (
        <>
          {info}
          <Icon small material="help_outline" className="help-icon" tooltip={`Limited to ${eventStore.limit}`} />
        </>
      ),
      title,
      ...headerPlaceholders,
    };
  };

  const events = (
    <KubeObjectListLayout
      isConfigurable
      tableId="kargo-events"
      store={eventStore}
      className={cssNames("Events", className, { compact })}
      renderHeaderTitle="Kargo Events"
      customizeHeader={customizeHeader}
      isSelectable={false}
      getItems={getVisibleItems}
      virtual={!compact}
      tableProps={{
        sortSyncWithUrl: false,
        sortByDefault: sorting,
        onSort: (params) => Object.assign(sorting, params),
      }}
      sortingCallbacks={sortingCallbacks}
      searchFilters={[
        (event) => event.getSearchFields(),
        (event) => event.message,
        (event) => event.getSource(),
        (event) => event.involvedObject.name,
      ]}
      renderTableHeader={[
        { title: "Type", className: "type", sortBy: columnId.type, id: columnId.type },
        { title: "Message", className: "message", id: columnId.message },
        { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
        { title: "Involved Object", className: "object", sortBy: columnId.object, id: columnId.object },
        { title: "Source", className: "source", id: columnId.source },
        { title: "Count", className: "count", sortBy: columnId.count, id: columnId.count },
        { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        { title: "Last Seen", className: "last-seen", sortBy: columnId.lastSeen, id: columnId.lastSeen },
      ]}
      renderTableContents={(event) => {
        const { involvedObject, type, message } = event;
        const isWarning = event.isWarning();

        return [
          <WithTooltip>{type}</WithTooltip>,
          {
            className: cssNames({ warning: isWarning }),
            title: <WithTooltip>{message}</WithTooltip>,
          },
          <NamespaceSelectBadge key="namespace" namespace={event.getNs()} />,
          <MaybeLink
            key="link"
            to={getDetailsUrl(apiManager.lookupApiLink(involvedObject, event))}
            onClick={stopPropagation}
          >
            <WithTooltip>{`${involvedObject.kind}: ${involvedObject.name}`}</WithTooltip>
          </MaybeLink>,
          <WithTooltip>{event.getSource()}</WithTooltip>,
          event.count,
          <KubeObjectAge key="age" object={event} />,
          <WithTooltip tooltip={event.lastTimestamp ? new Date(event.lastTimestamp) : undefined}>
            <ReactiveDuration key="last-seen" timestamp={event.lastTimestamp} />
          </WithTooltip>,
        ];
      }}
    />
  );

  if (compact) {
    return events;
  }

  return <TabLayout>{events}</TabLayout>;
});
