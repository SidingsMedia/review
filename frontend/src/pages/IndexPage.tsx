// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import * as React from "react";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { PageContainer } from "@toolpad/core";

import { useBranding } from "../context/BrandContext";

export default function IndexPage(): React.JSX.Element {
  const branding = useBranding();

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    document.title = `${branding.title}`;
  });

  return (
    <PageContainer>
      <Container component="main" maxWidth="md">
        <Typography marginBottom="10px" textAlign="center" variant="h3">
          Hello World
        </Typography>
      </Container>
    </PageContainer>
  );
}
