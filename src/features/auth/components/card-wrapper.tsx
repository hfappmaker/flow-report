"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import BackButton from "@/features/auth/components/back-button";
import Header from "@/features/auth/components/header";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
}

const CardWrapper = ({
  children,
  backButtonHref,
  backButtonLabel,
  headerLabel,
}: CardWrapperProps) => {
  return (
    <Card className="w-full max-w-[400px] shadow-md">
      <CardHeader>
        <Header label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter>
        <BackButton label={backButtonLabel} href={backButtonHref} />
      </CardFooter>
    </Card>
  );
};

export default CardWrapper;
