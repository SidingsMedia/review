// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import type { ActivePage } from "@toolpad/core";

import * as React from "react";
import { useParams } from "react-router";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { PageContainer, useActivePage } from "@toolpad/core";

import { useBranding } from "../context/BrandContext";

export default function EventPage(): React.JSX.Element {
  const branding = useBranding();
  const params = useParams();
  const activePage = useActivePage();

  const id = Number(params.eventId);
  const title = `Event ${id.toString()}`;
  const path = `${activePage?.path ?? ""}/${id.toString()}`;

  const breadcrumbs = [
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    ...(activePage as ActivePage).breadcrumbs,
    { title, path },
  ];

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    document.title = `${branding.title}`;
  });

  return (
    <PageContainer title={title} breadcrumbs={breadcrumbs}>
      <Container component="main" maxWidth="md">
        <Typography marginBottom="10px" textAlign="center" variant="h3">
          Hello World
        </Typography>
      </Container>
    </PageContainer>
  );
}
