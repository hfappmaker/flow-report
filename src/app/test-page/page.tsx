import { getTestAction } from "@/features/test/actions/test";

import TestPageClient from "./page.client";



export default async function TestPage() {
    const getTest = await getTestAction();
    console.log(getTest);
    return (
        <TestPageClient test={getTest.test}
            testDate={getTest.testDate}
            testDecimal={getTest.testDecimal}
            testArray={getTest.testArray}
            testObject={getTest.testObject} />
    );
}
