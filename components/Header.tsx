// components/Header.tsx
import OrganizationSwitcher from "./OrganizationSwitcher";
import LocationSwitcher from "./LocationSwitcher";
import ClientStatusIndicator from "./ClientStatusIndicator";

import AppStateController from "./AppStateController";

const Header: React.FC = () => (
  <div className="flex justify-between items-center border-b border-gray-300 py-4">
    <div className="flex space-x-2 items-center">
      <OrganizationSwitcher />
      <span className="px-1 text-gray-700">/</span>
      <LocationSwitcher />
    </div>
    <div className="flex space-x-2 items-center">
      <AppStateController />

      <ClientStatusIndicator />
    </div>
  </div>
);

export default Header;
