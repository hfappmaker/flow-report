import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input, NumberInputField } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ComboBoxField } from "@/components/ui/select";
import {
  TimePickerFieldForDate,
  TimePickerFieldForNumber,
} from "@/components/ui/time-picker";

export const contractFormSchema = z.object({
  name: z.string().min(1, "契約名は必須です"),
  startDate: z.date(),
  endDate: z.date().optional(),
  clientName: z.string().min(1, "クライアント名は必須です"),
  clientContactName: z.string(),
  clientEmail: z
    .string()
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      message: "有効なメールアドレスを入力してください",
    }),
  unitPrice: z.number().optional(),
  settlementMin: z.number().optional(),
  settlementMax: z.number().optional(),
  rateType: z.enum(["upperLower", "middle"]).default("upperLower"),
  upperRate: z.number().optional(),
  lowerRate: z.number().optional(),
  middleRate: z.number().optional(),
  dailyWorkMinutes: z.number().optional(),
  monthlyWorkMinutes: z.number().optional(),
  basicStartTime: z.date().optional(),
  basicEndTime: z.date().optional(),
  basicBreakDuration: z.number().optional(),
  closingDay: z.number().optional(),
  taxInclusiveType: z.enum(["INCLUSIVE", "EXCLUSIVE"]).default("EXCLUSIVE"),
  taxRoundingType: z
    .enum(["ROUND_DOWN", "ROUND_UP", "ROUND"])
    .default("ROUND_DOWN"),
});

export type ContractFormValues = z.infer<typeof contractFormSchema>;

interface ContractFormProps {
  defaultValues?: ContractFormValues;
  onSubmit: (values: ContractFormValues) => void;
  onCancel: () => void;
  submitButtonText: string;
  isEditing?: boolean;
}

export const ContractForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  submitButtonText,
  isEditing,
}: ContractFormProps) => {
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema) as any,
    defaultValues: defaultValues ?? {
      name: "",
      startDate: new Date(),
      endDate: undefined,
      clientName: "",
      clientContactName: "",
      clientEmail: "",
      unitPrice: undefined,
      settlementMin: undefined,
      settlementMax: undefined,
      rateType: "upperLower" as const,
      upperRate: undefined,
      lowerRate: undefined,
      middleRate: undefined,
      dailyWorkMinutes: 15,
      monthlyWorkMinutes: 15,
      basicStartTime: undefined,
      basicEndTime: undefined,
      basicBreakDuration: undefined,
      closingDay: undefined,
      taxInclusiveType: "EXCLUSIVE" as const,
      taxRoundingType: "ROUND_DOWN" as const,
    },
  });

  const rateType = form.watch("rateType");
  const taxInclusiveType = form.watch("taxInclusiveType");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Contract Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>契約名</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value}
                  placeholder="契約名を入力"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>クライアント名</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value}
                  placeholder="クライアント名を入力"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientContactName"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>担当者名</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value}
                  placeholder="担当者名を入力"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value}
                  placeholder="メールアドレスを入力"
                  type="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Start Date and End Date in the same row */}
        <div className="flex gap-6">
          <DatePickerField
            control={form.control}
            name="startDate"
            label="開始日"
            placeholder="開始日を選択"
            disabled={isEditing}
          />
          <DatePickerField
            control={form.control}
            name="endDate"
            label="終了日"
            placeholder="終了日を選択（任意）"
            disabled={false}
          />
        </div>

        {/* Unit Price, Settlement Min, Settlement Max in the same row */}
        <div className="flex gap-4">
          <NumberInputField
            control={form.control}
            name="unitPrice"
            label={`月単価${taxInclusiveType === "INCLUSIVE" ? "（税込）" : "（税抜）"}`}
            placeholder="（例）500000"
            disabled={isEditing}
          />

          <NumberInputField
            control={form.control}
            name="settlementMin"
            label="精算下限（時間）"
            placeholder="（例）140"
            disabled={isEditing}
          />

          <NumberInputField
            control={form.control}
            name="settlementMax"
            label="精算上限（時間）"
            placeholder="（例）180"
            disabled={isEditing}
          />
        </div>

        {/* Rate Type Selection */}
        <FormField
          control={form.control}
          name="rateType"
          render={() => (
            <FormItem className="space-y-3">
              <FormLabel>精算方式</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value: "upperLower" | "middle") => {
                    form.setValue("rateType", value);
                  }}
                  defaultValue={form.getValues("rateType")}
                  className="flex flex-row space-x-4"
                  disabled={isEditing}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upperLower" id="upperLower" />
                    <label htmlFor="upperLower">上下割</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="middle" id="middle" />
                    <label htmlFor="middle">中間割</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Rate fields - conditionally rendered based on rate type */}
        <div className="flex gap-4">
          {rateType === "upperLower" && (
            <>
              <NumberInputField
                control={form.control}
                name="upperRate"
                label={`超過単価${taxInclusiveType === "INCLUSIVE" ? "（税込）" : "（税抜）"}`}
                placeholder="（例）5000"
                disabled={isEditing}
              />

              <NumberInputField
                control={form.control}
                name="lowerRate"
                label={`控除単価${taxInclusiveType === "INCLUSIVE" ? "（税込）" : "（税抜）"}`}
                placeholder="（例）5000"
                disabled={isEditing}
              />
            </>
          )}

          {rateType === "middle" && (
            <NumberInputField
              control={form.control}
              name="middleRate"
              label={`中間単価${taxInclusiveType === "INCLUSIVE" ? "（税込）" : "（税抜）"}`}
              placeholder="（例）5000"
              disabled={isEditing}
            />
          )}
        </div>

        {/* Tax Inclusive Type Selection */}
        <FormField
          control={form.control}
          name="taxInclusiveType"
          render={() => (
            <FormItem className="space-y-3">
              <FormLabel>税込・税抜設定</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value: "INCLUSIVE" | "EXCLUSIVE") => {
                    form.setValue("taxInclusiveType", value);
                  }}
                  defaultValue={form.getValues("taxInclusiveType")}
                  className="flex flex-row space-x-4"
                  disabled={isEditing}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="INCLUSIVE" id="inclusive" />
                    <label htmlFor="inclusive">税込</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="EXCLUSIVE" id="exclusive" />
                    <label htmlFor="exclusive">税抜</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tax Rounding Type Selection */}
        <FormField
          control={form.control}
          name="taxRoundingType"
          render={() => (
            <FormItem className="space-y-3">
              <FormLabel>消費税端数処理</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(
                    value: "ROUND_DOWN" | "ROUND_UP" | "ROUND",
                  ) => {
                    form.setValue("taxRoundingType", value);
                  }}
                  defaultValue={form.getValues("taxRoundingType")}
                  className="flex flex-row space-x-4"
                  disabled={isEditing}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ROUND_DOWN" id="roundDown" />
                    <label htmlFor="roundDown">切り捨て</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ROUND_UP" id="roundUp" />
                    <label htmlFor="roundUp">切り上げ</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ROUND" id="round" />
                    <label htmlFor="round">四捨五入</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Daily Work Minutes and Monthly Work Minutes in the same row */}
        <div className="flex gap-4">
          <ComboBoxField
            control={form.control}
            name="dailyWorkMinutes"
            options={[1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60].map((num) => ({
              value: num,
              label: num.toString(),
            }))}
            placeholder="（例）15"
            label="1日あたりの作業単位(分)"
            disabled={isEditing}
          />

          <ComboBoxField
            control={form.control}
            name="monthlyWorkMinutes"
            options={[1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60].map((num) => ({
              value: num,
              label: num.toString(),
            }))}
            placeholder="（例）15"
            label="1ヶ月あたりの作業単位(分)"
            disabled={isEditing}
          />
        </div>

        {/* Basic Start Time, Basic End Time, and Basic Break Duration in the same row */}
        <div className="flex gap-4">
          <TimePickerFieldForDate
            control={form.control}
            name="basicStartTime"
            minuteStep={form.getValues("dailyWorkMinutes") ?? 1}
            label="基本開始時刻"
          />

          <TimePickerFieldForDate
            control={form.control}
            name="basicEndTime"
            minuteStep={form.getValues("dailyWorkMinutes") ?? 1}
            label="基本終了時刻"
          />

          <TimePickerFieldForNumber
            control={form.control}
            name="basicBreakDuration"
            minuteStep={form.getValues("dailyWorkMinutes") ?? 1}
            label="基本休憩時間(分)"
          />
        </div>

        {/* Closing Day */}
        <NumberInputField
          control={form.control}
          name="closingDay"
          label="締め日"
          placeholder="（例）20（未入力の場合は末日）"
          disabled={isEditing}
        />

        <DialogFooter sticky className="p-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="submit">{submitButtonText}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
