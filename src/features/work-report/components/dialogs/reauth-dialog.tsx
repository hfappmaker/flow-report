"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";

interface ReauthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReauthDialog({ isOpen, onClose }: ReauthDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
          <Button type="button" onClick={onClose}>
            閉じる
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}