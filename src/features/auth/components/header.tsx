import { MdOutlineSecurity } from "react-icons/md";

interface HeaderProps {
  label: string;
}

const Header = ({ label }: HeaderProps) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-4">
      <div className="flex items-center justify-center">
        <MdOutlineSecurity className="text-3xl text-sky-400" />
        <h1 className="text-3xl font-semibold text-primary drop-shadow-md">
          Auth
        </h1>
      </div>

      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
};

export default Header;
