import React from "react";
import Card from "./Card";

const palette = {
  primary: {
    icon: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    bar: "bg-emerald-600",
  },
  success: {
    icon: "bg-blue-50 text-blue-700 ring-blue-100",
    bar: "bg-blue-600",
  },
  warning: {
    icon: "bg-amber-50 text-amber-700 ring-amber-100",
    bar: "bg-amber-500",
  },
  info: {
    icon: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    bar: "bg-cyan-600",
  },
};

export default function StatCard({
  icon,
  title,
  value,
  color = "primary",
  trend,
  subtitle,
  loading = false,
}) {
  const colors = palette[color] || palette.primary;

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-1 ${colors.bar}`} />

      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 shrink-0 rounded-lg ring-1 flex items-center justify-center ${colors.icon}`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
          <p className="mt-1 text-3xl font-extrabold leading-none text-gray-900">
            {loading ? "..." : value}
          </p>

          {(trend || subtitle) && (
            <div className="mt-3 flex flex-col gap-1 text-sm">
              {trend && <span className="font-medium text-gray-700">{trend}</span>}
              {subtitle && <span className="text-gray-500">{subtitle}</span>}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
