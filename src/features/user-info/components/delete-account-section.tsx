"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ErrorAlert from "@/components/ui/feedback/error-alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTransitionContext } from "@/contexts/transition-context";
import { deleteAccount } from "@/features/user-info/actions/delete-account";
import {
  DELETE_CONFIRMATION_TEXT,
  deleteAccountFormSchema,
  DeleteAccountFormValues,
} from "@/features/user-info/schemas/delete-account-form-schema";

export function DeleteAccountSection() {
  const router = useRouter();
  const { isPending, startTransition } = useTransitionContext();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountFormSchema),
    defaultValues: {
      confirmText: "",
    },
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
      setError("");
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const values = form.getValues();
    const result = deleteAccountFormSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof DeleteAccountFormValues;
        form.setError(path, { message: issue.message });
      });
      return;
    }

    startTransition(async () => {
      const apiResult = await deleteAccount();
      if (apiResult.error) {
        setError(apiResult.error);
        return;
      }
      router.push("/auth/login");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4 border-t border-destructive/30 pt-4">
      <div className="space-y-1">
        <h3 className="font-medium text-destructive">危険な操作</h3>
        <p className="text-sm text-muted-foreground">
          アカウントを削除すると、関連するすべてのデータが完全に削除され、復元できません。
        </p>
      </div>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <Button
          type="button"
          variant="destructive"
          onClick={() => setIsOpen(true)}
        >
          <Trash2 className="mr-2 size-4" />
          アカウントを削除
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>アカウントを削除しますか？</DialogTitle>
            <DialogDescription>
              この操作は取り消せません。アカウントと関連データがすべて削除されます。
              続行するには、下のフィールドに「
              {DELETE_CONFIRMATION_TEXT}
              」と入力してください。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="confirmText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>確認テキスト</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder={DELETE_CONFIRMATION_TEXT}
                        autoComplete="off"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ErrorAlert message={error} onClose={() => setError("")} />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isPending}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isPending}
                >
                  {isPending ? "削除中..." : "削除を確定"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
