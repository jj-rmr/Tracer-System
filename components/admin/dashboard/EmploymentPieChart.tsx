"use client";

import { LabelList, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface EmploymentSlice {
  status: string;
  label: string;
  count: number;
}

const chartConfig = {
  employed: {
    label: "Employed",
    theme: {
      light: "oklch(0.596 0.145 163.225)",
      dark: "oklch(0.696 0.17 162.48)",
    },
  },
  notEmployed: {
    label: "Not employed",
    theme: {
      light: "oklch(0.646 0.222 41.116)",
      dark: "oklch(0.705 0.213 47.604)",
    },
  },
  neverEmployed: {
    label: "Never employed",
    theme: {
      light: "oklch(0.546 0.245 262.881)",
      dark: "oklch(0.623 0.214 259.815)",
    },
  },
} satisfies ChartConfig;

const statusKeys: Record<string, keyof typeof chartConfig> = {
  Yes: "employed",
  No: "notEmployed",
  "Never Employed": "neverEmployed",
};

export default function EmploymentPieChart({
  slices,
}: {
  slices: EmploymentSlice[];
}) {
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);
  const chartData = slices
    .filter((slice) => slice.count > 0)
    .map((slice) => {
      const key = statusKeys[slice.status];
      return {
        key,
        label: slice.label,
        count: slice.count,
        percentage: total ? Math.round((slice.count / total) * 100) : 0,
        fill: `var(--color-${key})`,
      };
    });

  if (!chartData.length) {
    return (
      <div className="grid aspect-square w-full max-w-48 place-items-center rounded-full bg-secondary text-center text-xs text-muted-foreground ring-1 ring-border">
        No employment data
      </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-square w-full max-w-52 shrink-0"
      initialDimension={{ width: 208, height: 208 }}
    >
      <PieChart accessibilityLayer>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              nameKey="key"
              formatter={(value, _name, item) => (
                <div className="flex min-w-36 items-center justify-between gap-4">
                  <span className="text-muted-foreground">
                    {item.payload.label}
                  </span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {Number(value).toLocaleString()} · {item.payload.percentage}
                    %
                  </span>
                </div>
              )}
            />
          }
        />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="key"
          stroke="var(--card)"
          strokeWidth={2}
        >
          <LabelList
            dataKey="percentage"
            position="inside"
            className="fill-white stroke-black/45 stroke-[2.5px] text-[10px] font-semibold [paint-order:stroke]"
            formatter={(value) => `${value}%`}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
