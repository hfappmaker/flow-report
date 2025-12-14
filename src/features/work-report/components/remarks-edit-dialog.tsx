"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TextArea } from "@/components/ui/textarea";

const remarksFormSchema = z.object({
  remarks: z.string().nullable(),
});

type RemarksFormValues = z.infer<typeof remarksFormSchema>;

interface RemarksEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (remarks: string | null) => Promise<void>;
  defaultValue: string | null;
}

export function RemarksEditDialog({
  isOpen,
  onClose,
  onSubmit,
  defaultValue,
}: RemarksEditDialogProps) {
  const form = useForm<RemarksFormValues>({
    resolver: zodResolver(remarksFormSchema),
    defaultValues: {
      remarks: defaultValue,
    },
  });

  const handleSubmit = async (data: RemarksFormValues) => {
    await onSubmit(data.remarks);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>備考編集</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              void form.handleSubmit(handleSubmit)(e);
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>備考</FormLabel>
                  <FormControl>
                    <TextArea
                      {...field}
                      value={field.value ?? ""}
                      rows={8}
                      placeholder="備考を入力してください"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                キャンセル
              </Button>
              <Button type="submit">保存</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
