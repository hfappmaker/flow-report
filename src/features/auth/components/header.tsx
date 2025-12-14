import Image from "next/image";

interface HeaderProps {
  label: string;
}

const Header = ({ label }: HeaderProps) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-4">
      <div className="flex items-center justify-center">
        <Image
          src="/flow-report.png"
          alt="Flow Report"
          width={200}
          height={60}
          priority
        />
      </div>

      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
};

export default Header;
