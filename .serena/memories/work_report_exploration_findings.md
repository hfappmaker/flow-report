# 作業報告書入力画面とエクスポート機能 - 調査結果

## 1. 作業報告書入力画面のコンポーネント構造

### メインページ
- **ファイル**: `/workspace/src/app/(protected)/workReport/[workReportId]/page.tsx` (サーバー側)
- **ファイル**: `/workspace/src/app/(protected)/workReport/[workReportId]/page.client.tsx` (クライアント側)
- **構造**: Next.js App Router で `[workReportId]` パラメータベースの動的ルーティング
- **主要な機能**:
  - 勤務時間の入力・編集
  - 一括編集機能
  - 月締め機能
  - テンプレート選択・作業報告書作成
  - freee連携
  - メール送信

### 関連ダイアログ・モーダルコンポーネント
| コンポーネント | ファイル | 機能 |
|---------------|---------|------|
| AttendanceEditDialog | `/workspace/src/features/work-report/components/attendance-edit-dialog.tsx` | 個別日付の勤務時間編集 |
| TemplateSelectionDialog | `/workspace/src/features/work-report/components/template-selection-dialog.tsx` | テンプレート選択（デフォルト/カスタム） |
| WorkReportDialog | `/workspace/src/features/work-report/components/work-report-dialog.tsx` | 汎用ダイアログラッパー |
| RemarksEditDialog | `/workspace/src/features/work-report/components/remarks-edit-dialog.tsx` | 備考編集 |
| FreeeInvoiceDialog | `/workspace/src/features/work-report/components/freee-invoice-dialog.tsx` | freee請求書作成 |
| FreeeReauthDialog | `/workspace/src/features/work-report/components/freee-reauth-dialog.tsx` | freee再認証 |

---

## 2. エクスポート/ダウンロード機能

### Excelファイル生成・ダウンロード処理

**ファイル**: `/workspace/src/features/work-report/libs/excel-report-generator.ts`

**キー関数**:
```typescript
export async function generateWorkReportExcel(
  templateWorkbook: ExcelJS.Workbook,
  data: WorkReportExcelData,
  customFieldMappings?: CustomFieldMapping[],
  targetSheetName?: string | null,
): Promise<Blob>
```

**実装パターン** (page.client.tsx 408-447行目):
```typescript
const createReportFromTemplate = async (
  templateWorkbook: ExcelJS.Workbook,
  fieldMappings?: { namedRange: string; valueTemplate: string; numFmt?: string | null }[],
  sheetName?: string | null,
) => {
  try {
    // 1. Blobを生成
    const blob = await generateWorkReportExcel(
      templateWorkbook,
      { /* データ */ },
      fieldMappings,
      sheetName,
    );

    // 2. ObjectURL作成
    const url = window.URL.createObjectURL(blob);
    
    // 3. ダウンロード実行
    const link = document.createElement("a");
    link.href = url;
    link.download = formatWorkReportFileName(targetDate, userName);
    link.click();
    
    // 4. リソース解放
    window.URL.revokeObjectURL(url);
    
    showSuccess("テンプレートからの作業報告書作成が完了しました");
  } catch (err) {
    // エラーハンドリング
  }
};
```

**機能詳細**:
- Excel NamedRanges に値を設定
- カスタムフィールドマッピング対応（プレースホルダー置換）
- 複数シート対応（targetSheetName指定可能）
- Blob形式で返却（ExcelJS.Workbook.xlsx.writeBuffer()使用）

---

## 3. テンプレート選択ドロップダウンコンポーネント

### TemplateSelectionDialog の構造

**ファイル**: `/workspace/src/features/work-report/components/template-selection-dialog.tsx`

**UI構成**:
1. **RadioGroup** - テンプレートタイプ選択（デフォルト/カスタム）
   - Radix UI `RadioGroup`/`RadioGroupItem` 使用
   - iconsとして lucide-react `FileSpreadsheet`, `Upload`, `Settings` 使用

2. **Select コンポーネント** - カスタムテンプレート選択
   - Radix UI ベースの Select コンポーネント
   - SelectTrigger, SelectContent, SelectItem, SelectValue 構成
   - 自動選択ロジック（カスタムテンプレート1件のみの場合）

**状態管理**:
```typescript
const [templateType, setTemplateType] = useState<"default" | "custom">("default");
const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
const [error, setError] = useState<string>("");
const [isProcessing, setIsProcessing] = useState(false);
```

**自動選択ロジック** (69-87行目):
```typescript
useEffect(() => {
  if (open) {
    setError("");
    // カスタムテンプレートが1つだけの場合は自動選択
    if (customTemplates.length === 1 && templateType === "custom") {
      setSelectedTemplateId(customTemplates[0].id);
    }
  }
}, [open, customTemplates, templateType]);
```

**返り値型** (TemplateSelectionResult):
```typescript
export interface TemplateSelectionResult {
  workbook: ExcelJS.Workbook;
  fieldMappings: WorkReportTemplateWithFields["fieldMappings"];
  sheetName: string | null;
}
```

---

## 4. ダイアログ/モーダルコンポーネント実装パターン

### 基本ダイアログコンポーネント

**ファイル**: `/workspace/src/components/ui/dialog.tsx`

**主要コンポーネント**:
- `Dialog` - Root (Radix DialogPrimitive.Root)
- `DialogTrigger` - トリガーボタン
- `DialogPortal` - ポータル
- `DialogOverlay` - 背景（半透明黒）
- `DialogContent` - コンテナ（showCloseButton オプション）
- `DialogHeader` - タイトル領域（sticky オプション対応）
- `DialogFooter` - アクション領域（sticky オプション対応）
- `DialogTitle` - タイトル

**実装例** (WorkReportDialog):
```typescript
export const WorkReportDialog = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogPortal>
      <DialogOverlay />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </DialogPortal>
  </Dialog>
);
```

### Select/ComboBox コンポーネント

**ファイル**: `/workspace/src/components/ui/select.tsx`

**主要コンポーネント**:
- `Select` - Root (Radix SelectPrimitive.Root)
- `SelectTrigger` - トリガーボタン
- `SelectContent` - ドロップダウンコンテナ（Portal使用）
- `SelectItem` - 選択肢
- `SelectValue` - 選択値表示
- `ComboBoxField` - Form統合版（React Hook Form対応）

**使用例** (TemplateSelectionDialog):
```typescript
<Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
  <SelectTrigger id="template-select">
    <SelectValue placeholder="テンプレートを選択してください" />
  </SelectTrigger>
  <SelectContent>
    {customTemplates.map((template) => (
      <SelectItem key={template.id} value={template.id}>
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="size-4" />
          <span>{template.name}</span>
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

## 5. localStorage 保存パターン

**調査結果**: 
作業報告書機能で localStorage 保存のパターンは **検出されませんでした**。

**理由**:
- サーバー側でデータベース（Prisma + PostgreSQL）に永続化
- クライアント側の状態管理は React hooks (useState) で実装
- サーバーアクション（server actions）でデータ更新

**使用例**:
```typescript
// サーバーアクション
export const updateWorkReportAttendancesAction = async (
  workReportId: string,
  attendances: AttendanceDto[],
): Promise<WorkReport>
```

---

## 補足: 関連ファイル一覧

### Actions（サーバー側）
- `/workspace/src/features/work-report/actions/work-report.ts` - 作業報告書操作
- `/workspace/src/features/work-report/actions/work-report-template.ts` - テンプレート操作
- `/workspace/src/features/work-report/actions/attendance.ts` - 勤務時間操作

### Types
- `/workspace/src/features/work-report/types/work-report.ts`
- `/workspace/src/features/work-report/types/work-report-template.ts`
- `/workspace/src/features/work-report/types/attendance.ts`

### Schemas（バリデーション）
- `/workspace/src/features/work-report/schemas/work-report-form-schemas.ts`
- `/workspace/src/features/work-report/schemas/work-report-template-form-schema.ts`

### Utils
- `/workspace/src/features/work-report/utils/excel-field-mappers.ts` - フィールドマッピング
- `/workspace/src/features/work-report/utils/placeholder-utils.ts` - プレースホルダー置換
- `/workspace/src/features/work-report/utils/excel-utils.ts` - Excel変換ユーティリティ
- `/workspace/src/features/work-report/utils/date-formatting.ts` - 日付フォーマッティング
- `/workspace/src/features/work-report/utils/attendance-utils.ts` - 勤務データ操作

### Repositories
- `/workspace/src/features/work-report/repositories/work-report-repository.ts`
- `/workspace/src/features/work-report/repositories/work-report-template-repository.ts`
- `/workspace/src/features/work-report/repositories/attendance-repository.ts`
