"use client";
import React, { FC } from "react";
import { ViamClientProvider } from "./ViamClientProvider";
import CustomDashboard from "./CustomDashboard";

interface ViamClientContextWrappedDashboardProps {}

const ViamClientContextWrappedDashboard: FC<
  ViamClientContextWrappedDashboardProps
> = () => {
  return (
    <ViamClientProvider>
      <CustomDashboard />
    </ViamClientProvider>
  );
};

export default ViamClientContextWrappedDashboard;
