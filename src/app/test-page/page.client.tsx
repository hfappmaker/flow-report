"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { getTestAction, Test, createTestAction } from "@/features/test/actions/test";
import { DeserializeBuiltInObject, SerializedType } from "@/utils/serialization/serialization-utils";

export default function TestPageClient({ test, testDate, testDecimal, testArray, testObject }: SerializedType<Test>) {

    const [isOpen, setIsOpen] = useState<boolean>(false);

    // const [date, setDate] = useState<Date>(new Date());

    const date = new Date();

    useEffect(() => {
        const fetchData = async () => {
            const test = await getTestAction();
            console.log(test);
            createTestAction({
                ...test,
                testDate: new Date(test.testDate.toISOString()),
                testDecimal: new Prisma.Decimal(test.testDecimal),
                testArray: test.testArray.map(item => new Prisma.Decimal(item)),
                testObject: { ...test.testObject, age: new Prisma.Decimal(test.testObject.age) }
            });
        };

        void fetchData();
    }, []);

    const editFormSchema = z.object({
        targetDate: z.date().optional(),
    })

    type EditFormValues = z.infer<typeof editFormSchema>;

    const editForm = useForm<EditFormValues>({
        resolver: zodResolver(editFormSchema),
        defaultValues: {
            targetDate: date
        }
    });

    const onEditSubmit = () => {
        date.setDate(date.getDate() + 1);
    }

    return (
        <div>
            <h1>Test Page</h1>
            <p>Test: {test}</p>
            <p>Test Date: {testDate.toString()}</p>
            <p>Test Decimal: {DeserializeBuiltInObject(testDecimal, Prisma.Decimal).toString()}</p>
            <p>Test Array: {testArray.map(item => DeserializeBuiltInObject(item, Prisma.Decimal).toString()).join(", ")}</p>
            <p>Test Object: {testObject.name}</p>
            <p>Test Object: {DeserializeBuiltInObject(testObject.age, Prisma.Decimal).toString()}</p>
            <p>Test Object: {testObject.isActive.toString()}</p>
            {/* 編集用モーダルダイアログ */}
            <Dialog open={isOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>勤怠情報の編集</DialogTitle>
                    </DialogHeader>
                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(onEditSubmit)} onReset={() => { editForm.reset({ targetDate: date }); }} className="space-y-4">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <input readOnly value={date.toISOString()} />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                                <Button type="submit">
                                    保存
                                </Button>
                                <Button type="reset">
                                    リセット
                                </Button>
                                <Button onClick={() => { setIsOpen(false); }}>
                                    閉じる
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <Button onClick={() => { setIsOpen(true); }}></Button>
        </div>
    );
}