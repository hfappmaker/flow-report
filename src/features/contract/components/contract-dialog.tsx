import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";

export type DialogType =
  | "create"
  | "edit"
  | "delete"
  | "details"
  | "copy"
  | null;

interface ContractDialogProps {
  type: DialogType;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const ContractDialog = ({
  type,
  isOpen,
  onClose,
  children,
}: ContractDialogProps) => (
  <Dialog
    open={isOpen}
    onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}
  >
    <DialogPortal>
      <DialogOverlay />
      <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-[1400px] flex-col overflow-hidden p-0">
        <DialogHeader sticky>
          <DialogTitle>
            {type === "create" && "契約を作成"}
            {type === "edit" && "契約を編集"}
            {type === "delete" && "契約の削除確認"}
            {type === "details" && "契約詳細"}
            {type === "copy" && "契約をコピー"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 pb-0 pt-4">{children}</div>
      </DialogContent>
    </DialogPortal>
  </Dialog>
);
