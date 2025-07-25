import type { CardProps } from "@mui/material/Card";
import type { PaletteColorKey } from "src/theme/core";
import type { ChartOptions } from "src/components/chart";

import { varAlpha } from "minimal-shared/utils";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { useTheme } from "@mui/material/styles";

import { fNumber, fPercent, fShortenNumber } from "src/utils/format-number";

import { Iconify } from "src/components/iconify";
import { SvgColor } from "src/components/svg-color";
import { Chart, useChart } from "src/components/chart";

// ----------------------------------------------------------------------

type Props = CardProps & {
  title: string;
  total: number;
  color?: PaletteColorKey;
  icon: React.ReactNode;
};

export function AnalyticsWidgetSummary({
  sx,
  icon,
  title,
  total,
  color = "primary",
  ...other
}: Props) {
  const theme = useTheme();

  return (
    <Card
      sx={[
        () => ({
          p: 3,
          boxShadow: "none",
          position: "relative",
          color: `${color}.darker`,
          backgroundColor: "common.white",
          backgroundImage: `linear-gradient(135deg, ${varAlpha(theme.vars.palette[color].lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette[color].lightChannel, 0.48)})`,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box sx={{ width: 48, height: 48, mb: 3 }}>{icon}</Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "flex-end",
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 112 }}>
          <Box sx={{ mb: 1, typography: "subtitle2" }}>{title}</Box>

          <Box sx={{ typography: "h4" }}>{fShortenNumber(total)}</Box>
        </Box>
      </Box>

      <SvgColor
        src="/assets/background/shape-square.svg"
        sx={{
          top: 0,
          left: -20,
          width: 240,
          zIndex: -1,
          height: 240,
          opacity: 0.24,
          position: "absolute",
          color: `${color}.main`,
        }}
      />
    </Card>
  );
}
