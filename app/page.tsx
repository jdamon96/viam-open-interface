import dynamic from "next/dynamic";

const ViamClientContextWrappedDashboard = dynamic(
  () => import("@/components/ViamClientContextWrappedDashboard"),
  {
    ssr: false,
  }
);

export default function Page() {
  return <ViamClientContextWrappedDashboard />;
}
