"use client";

import { UserRole } from "@prisma/client";

import FormError from "@/components/ui/feedback/error-alert";
import { useCurrentRole } from "@/hooks/use-current-role";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

const RoleGate = ({ children, allowedRole }: RoleGateProps) => {
  const role = useCurrentRole();

  if (role !== allowedRole) {
    return (
      <FormError message="Not allowed, you do not have permission to view this content!" />
    );
  }

  return <>{children}</>;
};

export default RoleGate;
