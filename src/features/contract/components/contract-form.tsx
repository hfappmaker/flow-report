import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useForm, Resolver } from "react-hook-form";
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

const createContractFormSchema = (dailyWorkMinutes: number | null) =>
  z
    .object({
      name: z.string().min(1, "契約名は必須です"),
      startDate: z.date({
        message: "開始日は必須です",
      }),
      endDate: z.date({
        message: "終了日は必須です",
      }),
      clientName: z.string().min(1, "クライアント名は必須です"),
      unitPrice: z.number().nullable(),
      settlementMin: z.number().nullable(),
      settlementMax: z.number().nullable(),
      rateType: z
        .enum(["upperLower", "middle", "fixed", "hourlyRate"])
        .default("upperLower"),
      upperRate: z.number().nullable(),
      lowerRate: z.number().nullable(),
      middleRate: z.number().nullable(),
      hourlyRate: z.number().nullable(),
      dailyWorkMinutes: z.number().nullable(),
      monthlyWorkMinutes: z.number().nullable(),
      basicStartTime: z.date().nullable(),
      basicEndTime: z.date().nullable(),
      basicBreakDuration: z.number().nullable(),
      basicMemo: z.string().nullable(),
      closingDay: z.number().int().min(1).max(31),
      paymentMonthOffset: z.number().int().min(0).max(2), // 0=当月, 1=翌月, 2=翌々月
      paymentDay: z.number().int().min(1).max(31),
      taxInclusiveType: z.enum(["INCLUSIVE", "EXCLUSIVE"]).default("EXCLUSIVE"),
      taxRoundingType: z
        .enum(["ROUND_DOWN", "ROUND_UP", "ROUND"])
        .default("ROUND_DOWN"),
    })
    .refine(
      (data) => {
        // 固定精算と時間単価以外は月単価が必須
        if (data.rateType !== "fixed" && data.rateType !== "hourlyRate") {
          return data.unitPrice !== null;
        }
        // 固定精算の場合は月単価が必須
        if (data.rateType === "fixed") {
          return data.unitPrice !== null;
        }
        return true;
      },
      {
        message: "月単価を入力してください",
        path: ["unitPrice"],
      },
    )
    .refine(
      (data) => {
        // 固定精算と時間単価は精算下限が不要
        if (data.rateType === "fixed" || data.rateType === "hourlyRate") {
          return true;
        }
        if (data.settlementMin === null) {
          return false;
        }
        return true;
      },
      {
        message: "精算下限を入力してください",
        path: ["settlementMin"],
      },
    )
    .refine(
      (data) => {
        // 固定精算と時間単価は精算上限が不要
        if (data.rateType === "fixed" || data.rateType === "hourlyRate") {
          return true;
        }
        if (data.settlementMax === null) {
          return false;
        }
        return true;
      },
      {
        message: "精算上限を入力してください",
        path: ["settlementMax"],
      },
    )
    .refine(
      (data) => {
        if (data.rateType === "upperLower" && data.upperRate === null) {
          return false;
        }
        return true;
      },
      {
        message: "超過単価を入力してください",
        path: ["upperRate"],
      },
    )
    .refine(
      (data) => {
        if (data.rateType === "upperLower" && data.lowerRate === null) {
          return false;
        }
        return true;
      },
      {
        message: "控除単価を入力してください",
        path: ["lowerRate"],
      },
    )
    .refine(
      (data) => {
        if (data.rateType === "middle" && data.middleRate === null) {
          return false;
        }
        return true;
      },
      {
        message: "中間単価を入力してください",
        path: ["middleRate"],
      },
    )
    .refine(
      (data) => {
        if (data.rateType === "hourlyRate" && data.hourlyRate === null) {
          return false;
        }
        return true;
      },
      {
        message: "時間単価を入力してください",
        path: ["hourlyRate"],
      },
    )
    .refine(
      (data) => {
        const s = dayjs(data.startDate);
        const e = dayjs(data.endDate);
        return !s.isAfter(e);
      },
      {
        message: "終了日は開始日以降の日付を選択してください",
        path: ["endDate"],
      },
    )
    .refine(
      (data) => {
        const s = dayjs(data.startDate);
        const e = dayjs(data.endDate);
        const oneYearLater = s.add(1, "year");
        return e.isBefore(oneYearLater);
      },
      {
        message: "契約期間は最長1年以内にしてください",
        path: ["endDate"],
      },
    )
    .refine(
      (data) => {
        if (dailyWorkMinutes === null || data.basicStartTime === null) {
          return true;
        }
        const totalMinutes =
          data.basicStartTime.getUTCHours() * 60 +
          data.basicStartTime.getUTCMinutes();
        return totalMinutes % dailyWorkMinutes === 0;
      },
      {
        message:
          dailyWorkMinutes !== null
            ? `基本開始時刻は1日あたりの作業単位（${dailyWorkMinutes}分）で入力してください`
            : "基本開始時刻は1日あたりの作業単位で入力してください",
        path: ["basicStartTime"],
      },
    )
    .refine(
      (data) => {
        if (dailyWorkMinutes === null || data.basicEndTime === null) {
          return true;
        }
        const totalMinutes =
          data.basicEndTime.getUTCHours() * 60 +
          data.basicEndTime.getUTCMinutes();
        return totalMinutes % dailyWorkMinutes === 0;
      },
      {
        message:
          dailyWorkMinutes !== null
            ? `基本終了時刻は1日あたりの作業単位（${dailyWorkMinutes}分）で入力してください`
            : "基本終了時刻は1日あたりの作業単位で入力してください",
        path: ["basicEndTime"],
      },
    )
    .refine(
      (data) => {
        if (dailyWorkMinutes === null || data.basicBreakDuration === null) {
          return true;
        }
        return data.basicBreakDuration % dailyWorkMinutes === 0;
      },
      {
        message:
          dailyWorkMinutes !== null
            ? `基本休憩時間は1日あたりの作業単位（${dailyWorkMinutes}分）で入力してください`
            : "基本休憩時間は1日あたりの作業単位で入力してください",
        path: ["basicBreakDuration"],
      },
    );

export const contractFormSchema = createContractFormSchema(null);

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
    resolver: zodResolver(contractFormSchema) as Resolver<ContractFormValues>,
    defaultValues: defaultValues ?? {
      name: "",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      clientName: "",
      unitPrice: null,
      settlementMin: null,
      settlementMax: null,
      rateType: "upperLower" as const,
      upperRate: null,
      lowerRate: null,
      middleRate: null,
      hourlyRate: null,
      dailyWorkMinutes: 15,
      monthlyWorkMinutes: 15,
      basicStartTime: null,
      basicEndTime: null,
      basicBreakDuration: null,
      basicMemo: null,
      closingDay: 31,
      paymentMonthOffset: 1,
      paymentDay: 31,
      taxInclusiveType: "EXCLUSIVE" as const,
      taxRoundingType: "ROUND_DOWN" as const,
    },
  });

  const rateType = form.watch("rateType");
  const taxInclusiveType = form.watch("taxInclusiveType");
  const dailyWorkMinutes = form.watch("dailyWorkMinutes");

  const dynamicSchema = useMemo(
    () => createContractFormSchema(dailyWorkMinutes),
    [dailyWorkMinutes],
  );

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = form.getValues();
    const result = dynamicSchema.safeParse(values);
    if (!result.success) {
      // エラーをフォームにセット
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof ContractFormValues;
        form.setError(path, { message: issue.message });
      });
      return;
    }
    onSubmit(result.data);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} noValidate className="space-y-6">
        {/* 基本情報 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">基本情報</h3>

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

          {/* Start Date and End Date in the same row */}
          <div className="flex flex-col gap-6 md:flex-row">
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
              placeholder="終了日を選択"
              disabled={isEditing}
            />
          </div>
        </div>

        {/* 税務設定 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">税務設定</h3>

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
        </div>

        {/* 精算情報 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">精算情報</h3>

          {/* Rate Type Selection */}
          <FormField
            control={form.control}
            name="rateType"
            render={() => (
              <FormItem className="space-y-3">
                <FormLabel>精算方式</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(
                      value: "upperLower" | "middle" | "fixed" | "hourlyRate",
                    ) => {
                      form.setValue("rateType", value);
                      // 非表示になる項目の値をクリア
                      if (value === "upperLower") {
                        form.setValue("middleRate", null);
                        form.setValue("hourlyRate", null);
                      } else if (value === "middle") {
                        form.setValue("upperRate", null);
                        form.setValue("lowerRate", null);
                        form.setValue("hourlyRate", null);
                      } else if (value === "fixed") {
                        form.setValue("upperRate", null);
                        form.setValue("lowerRate", null);
                        form.setValue("middleRate", null);
                        form.setValue("hourlyRate", null);
                        form.setValue("settlementMin", null);
                        form.setValue("settlementMax", null);
                      } else if (value === "hourlyRate") {
                        form.setValue("upperRate", null);
                        form.setValue("lowerRate", null);
                        form.setValue("middleRate", null);
                        form.setValue("unitPrice", null);
                        form.setValue("settlementMin", null);
                        form.setValue("settlementMax", null);
                      }
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
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="fixed" />
                      <label htmlFor="fixed">固定精算</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hourlyRate" id="hourlyRate" />
                      <label htmlFor="hourlyRate">時間単価</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Unit Price - 時間単価方式では非表示 */}
          {rateType !== "hourlyRate" && (
            <NumberInputField
              control={form.control}
              name="unitPrice"
              label={`月単価${taxInclusiveType === "INCLUSIVE" ? "（税込）" : "（税抜）"}`}
              placeholder="（例）500000"
              disabled={isEditing}
            />
          )}

          {/* Rate fields - conditionally rendered based on rate type */}
          <div className="flex flex-col gap-4 md:flex-row">
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

            {rateType === "hourlyRate" && (
              <NumberInputField
                control={form.control}
                name="hourlyRate"
                label={`時間単価${taxInclusiveType === "INCLUSIVE" ? "（税込）" : "（税抜）"}`}
                placeholder="（例）5000"
                disabled={isEditing}
              />
            )}
          </div>

          {/* Settlement Min and Settlement Max - 固定精算と時間単価方式では非表示 */}
          {rateType !== "fixed" && rateType !== "hourlyRate" && (
            <div className="flex flex-col gap-4 md:flex-row">
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
          )}
        </div>

        {/* 勤務設定 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">勤務設定</h3>

          {/* Daily Work Minutes and Monthly Work Minutes in the same row */}
          <div className="flex flex-col gap-4 md:flex-row">
            <ComboBoxField
              control={form.control}
              name="dailyWorkMinutes"
              options={[1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60].map(
                (num) => ({
                  value: num,
                  label: num.toString(),
                }),
              )}
              label="1日あたりの作業単位(分)"
              disabled={isEditing}
              showClearButton={false}
              variant="native"
            />

            <ComboBoxField
              control={form.control}
              name="monthlyWorkMinutes"
              options={[1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60].map(
                (num) => ({
                  value: num,
                  label: num.toString(),
                }),
              )}
              label="1ヶ月あたりの作業単位(分)"
              disabled={isEditing}
              showClearButton={false}
              variant="native"
            />
          </div>

          {/* Basic Start Time, Basic End Time, and Basic Break Duration in the same row */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-4">
              <div className="w-[140px]">
                <TimePickerFieldForDate
                  control={form.control}
                  name="basicStartTime"
                  minuteStep={form.getValues("dailyWorkMinutes") ?? 1}
                  label="基本開始時刻"
                  showFormMessage={false}
                />
              </div>

              <div className="w-[140px]">
                <TimePickerFieldForDate
                  control={form.control}
                  name="basicEndTime"
                  minuteStep={form.getValues("dailyWorkMinutes") ?? 1}
                  label="基本終了時刻"
                  showFormMessage={false}
                />
              </div>

              <div className="w-[160px]">
                <TimePickerFieldForNumber
                  control={form.control}
                  name="basicBreakDuration"
                  minuteStep={form.getValues("dailyWorkMinutes") ?? 1}
                  label="基本休憩時間"
                  showFormMessage={false}
                />
              </div>
            </div>
            {/* バリデーションエラーをまとめて表示 */}
            {(form.formState.errors.basicStartTime ??
              form.formState.errors.basicEndTime ??
              form.formState.errors.basicBreakDuration) && (
              <p className="text-sm font-medium text-destructive">
                {[
                  form.formState.errors.basicStartTime?.message,
                  form.formState.errors.basicEndTime?.message,
                  form.formState.errors.basicBreakDuration?.message,
                ]
                  .filter(Boolean)
                  .join(" / ")}
              </p>
            )}
          </div>

          {/* Basic Memo */}
          <FormField
            control={form.control}
            name="basicMemo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>基本作業内容</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? null : value);
                    }}
                    placeholder="基本時間入力時に自動で入力される作業内容"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Closing Day */}
          <div className="space-y-2">
            <FormLabel>締め日</FormLabel>
            <div className="flex items-end gap-2">
              <ComboBoxField
                control={form.control}
                name="closingDay"
                options={[
                  ...Array.from({ length: 30 }, (_, i) => ({
                    value: i + 1,
                    label: `${i + 1}`,
                  })),
                  { value: 31, label: "31（末）" },
                ]}
                disabled={isEditing}
                showClearButton={false}
                variant="native"
              />
              <span className="mb-2 text-sm text-muted-foreground">日</span>
            </div>
            <p className="text-sm text-muted-foreground">
              月末日がない場合（例：2月30日）はその月の末日になります。
            </p>
          </div>

          {/* Payment Site */}
          <div className="space-y-2">
            <FormLabel>支払いサイト</FormLabel>
            <div className="flex items-end gap-2">
              <ComboBoxField
                control={form.control}
                name="paymentMonthOffset"
                options={[
                  { value: Number(0), label: "当月" },
                  { value: Number(1), label: "翌月" },
                  { value: Number(2), label: "翌々月" },
                ]}
                disabled={isEditing}
                showClearButton={false}
                variant="native"
              />
              <ComboBoxField
                control={form.control}
                name="paymentDay"
                options={[
                  ...Array.from({ length: 30 }, (_, i) => ({
                    value: i + 1,
                    label: `${i + 1}`,
                  })),
                  { value: 31, label: "31（末）" },
                ]}
                disabled={isEditing}
                showClearButton={false}
                variant="native"
              />
              <span className="mb-2 text-sm text-muted-foreground">日</span>
            </div>
            <p className="text-sm text-muted-foreground">
              月末日がない場合（例：2月30日）はその月の末日になります。
            </p>
          </div>
        </div>

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
