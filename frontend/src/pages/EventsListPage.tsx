// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT
import type { GridToolbarProps, ToolbarPropsOverrides } from "@mui/x-data-grid";

import type { Event, Monitor } from "../lib/api/responses";

import * as React from "react";
import { DateTime } from "luxon";
import { useNavigate } from "react-router";

import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import Container from "@mui/material/Container";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { PageContainer } from "@toolpad/core";

import EventSearchToolbar from "../components/tables/EventSearchToolbar";
import { humanFileSize } from "../lib/util";
import { useApi } from "../context/ApiContext";
import { useBranding } from "../context/BrandContext";

type TableData = Event & { monitorName: string };

export default function EventsListPage(): React.JSX.Element {
  const api = useApi();
  const branding = useBranding();
  const navigate = useNavigate();

  const [data, setData] = React.useState<TableData[]>([]);

  function processData(events: Event[], monitors: Monitor[]): void {
    const monitorLookup = new Map(monitors.map((i) => [i.id, i.name]));

    setData(
      events.map((val) => {
        return {
          ...val,
          monitorName: monitorLookup.get(val.monitorId) ?? "Unknown",
        };
      }),
    );
  }

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    document.title = `Events | ${branding.title}`;
  });

  return (
    <PageContainer maxWidth={false}>
      <Container component="main" maxWidth="xl">
        <div
          style={{ display: "flex", flexDirection: "column", width: "100%" }}
        >
          <DataGrid
            columns={[
              { field: "id", headerName: "ID" },
              { field: "monitorName", flex: 1, headerName: "Monitor" },
              {
                field: "start",
                flex: 2,
                headerName: "Start Time",
                renderCell: (cell) =>
                  DateTime.fromISO(cell.row.start).toLocaleString(
                    DateTime.DATETIME_SHORT_WITH_SECONDS,
                  ),
              },
              {
                field: "end",
                flex: 2,
                headerName: "End Time",
                renderCell: (cell) =>
                  DateTime.fromISO(cell.row.end).toLocaleString(
                    DateTime.DATETIME_SHORT_WITH_SECONDS,
                  ),
              },
              {
                field: "frames",
                headerName: "Frames",
              },
              {
                field: "size",
                headerName: "Size",
                renderCell: (cell) => humanFileSize(cell.row.size, true),
              },
              {
                field: "actions",
                type: "actions",
                headerName: "Actions",
                width: 100,
                cellClassName: "actions",
                getActions: ({ row }) => {
                  return [
                    // eslint-disable-next-line react/jsx-key
                    <GridActionsCellItem
                      icon={<VisibilityIcon />}
                      label="View"
                      onClick={() =>
                        void navigate(`/events/${row.id.toString()}`)
                      }
                    />,
                    // eslint-disable-next-line react/jsx-key
                    <GridActionsCellItem
                      icon={<DownloadIcon />}
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = api
                          .constructUrl(
                            `event/${row.id.toString()}/export?download=true`,
                          )
                          .toString();
                        link.setAttribute(
                          "download",
                          `${row.monitorName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${row.id.toString()}.mp4`,
                        );
                        document.body.appendChild(link);
                        link.click();
                        link.parentNode?.removeChild(link);
                      }}
                      label="Download"
                    />,
                  ];
                },
              },
            ]}
            slots={{ toolbar: EventSearchToolbar }}
            slotProps={{
              // Force typescript to not get annoyed at our custom prop here
              toolbar: {
                onDataLoad: processData,
              } as Partial<GridToolbarProps & ToolbarPropsOverrides>,
            }}
            showToolbar
            rows={data}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 25, 50, 100, { label: "All", value: -1 }]}
          />
        </div>
      </Container>
    </PageContainer>
  );
}
