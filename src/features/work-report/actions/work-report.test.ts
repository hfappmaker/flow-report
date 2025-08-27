import {
  getContractById,
} from "@/features/contract/repositories/contract-repository";
import { ERROR_MESSAGES } from "@/features/work-report/constants/error-messages";
import {
  checkWorkReportExists,
  createWorkReport,
} from "@/features/work-report/repositories/work-report-repository";
import { createWorkReportAction } from "./work-report";

// Mocking the repositories and next/cache
jest.mock("@/features/contract/repositories/contract-repository", () => ({
  getContractById: jest.fn(),
}));

jest.mock("@/features/work-report/repositories/work-report-repository", () => ({
  checkWorkReportExists: jest.fn(),
  createWorkReport: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("createWorkReportAction", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if contract is not found", async () => {
    // Arrange
    const contractId = "1";
    const targetDate = new Date();
    (getContractById as jest.Mock).mockResolvedValue(null);

    // Act & Assert
    await expect(
      createWorkReportAction(contractId, targetDate),
    ).rejects.toThrow(ERROR_MESSAGES.CONTRACT_NOT_FOUND);
  });

  it("should throw an error if target date is before contract start date", async () => {
    // Arrange
    const contractId = "1";
    const targetDate = new Date("2023-01-15");
    const contract = {
      id: contractId,
      startDate: new Date("2023-02-01"),
      endDate: null,
    };
    (getContractById as jest.Mock).mockResolvedValue(contract);

    // Act & Assert
    await expect(
      createWorkReportAction(contractId, targetDate),
    ).rejects.toThrow(
      ERROR_MESSAGES.WORK_REPORT_CREATION_BEFORE_CONTRACT_START(2023, 2),
    );
  });

  it("should throw an error if target date is after contract end date", async () => {
    // Arrange
    const contractId = "1";
    const targetDate = new Date("2023-04-15");
    const contract = {
      id: contractId,
      startDate: new Date("2023-02-01"),
      endDate: new Date("2023-03-31"),
    };
    (getContractById as jest.Mock).mockResolvedValue(contract);

    // Act & Assert
    await expect(
      createWorkReportAction(contractId, targetDate),
    ).rejects.toThrow(
      ERROR_MESSAGES.WORK_REPORT_CREATION_AFTER_CONTRACT_END(2023, 3),
    );
  });

  it("should throw an error if work report already exists", async () => {
    // Arrange
    const contractId = "1";
    const targetDate = new Date("2023-02-15");
    const contract = {
      id: contractId,
      startDate: new Date("2023-02-01"),
      endDate: null,
    };
    (getContractById as jest.Mock).mockResolvedValue(contract);
    (checkWorkReportExists as jest.Mock).mockResolvedValue(true);

    // Act & Assert
    await expect(
      createWorkReportAction(contractId, targetDate),
    ).rejects.toThrow(ERROR_MESSAGES.WORK_REPORT_ALREADY_EXISTS(2023, 2));
  });

  it("should create a work report successfully", async () => {
    // Arrange
    const contractId = "1";
    const targetDate = new Date("2023-02-15");
    const contract = {
      id: contractId,
      startDate: new Date("2023-02-01"),
      endDate: null,
    };
    const newWorkReport = { id: "wr1", contractId, targetDate, memo: null };

    (getContractById as jest.Mock).mockResolvedValue(contract);
    (checkWorkReportExists as jest.Mock).mockResolvedValue(false);
    (createWorkReport as jest.Mock).mockResolvedValue(newWorkReport);

    // Act
    const result = await createWorkReportAction(contractId, targetDate);

    // Assert
    expect(createWorkReport).toHaveBeenCalledWith(contractId, targetDate);
    expect(result).toEqual({ ...newWorkReport, memo: undefined });
  });
});
