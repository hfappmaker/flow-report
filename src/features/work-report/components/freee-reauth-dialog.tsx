import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";

interface FreeeReauthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * freee再連携促進ダイアログ
 */
export const FreeeReauthDialog = ({
  open,
  onOpenChange,
}: FreeeReauthDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>freee再連携が必要です</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p className="text-muted-foreground">
          freee連携の有効期限が切れています。左側の「freee連携」ボタンから再度連携してください。
        </p>
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          閉じる
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);
