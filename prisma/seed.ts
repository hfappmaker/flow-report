import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const testUsers = [
    {
      email: "loadtest1@example.com",
      password: "LoadTest123!",
      name: "テストユーザー1",
    },
    {
      email: "loadtest2@example.com",
      password: "LoadTest123!",
      name: "テストユーザー2",
    },
    {
      email: "loadtest3@example.com",
      password: "LoadTest123!",
      name: "テストユーザー3",
    },
  ];

  console.log("テストユーザーの作成を開始します...");

  for (const userData of testUsers) {
    try {
      // パスワードをハッシュ化
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // ユーザーが既に存在するかチェック
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`✅ ${userData.email} は既に存在します`);
        continue;
      }

      // ユーザーを作成
      const user = await prisma.user.create({
        data: {
          id: `test-${userData.email.split("@")[0]}`, // ユーザーIDを一意にするためのプレフィックス
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          emailVerified: new Date(), // テスト環境では即座に認証済みにする
          role: "USER",
        },
      });

      // 認証プロバイダー用のAccountレコードを作成
      await prisma.account.create({
        data: {
          userId: user.id,
          type: "credentials",
          provider: "credentials",
          providerAccountId: user.id,
        },
      });

      // サブスクリプション情報の追加
      if (userData.email === "loadtest1@example.com") {
        const stripeCustomer = await prisma.stripeCustomer.create({
          data: {
            userId: user.id,
            stripeCustomerId: `cus_test_${user.id}`,
            created: new Date(),
          },
        });
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        await prisma.subscription.create({
          data: {
            stripeCustomerId: stripeCustomer.stripeCustomerId,
            stripeSubscriptionId: `sub_test_${user.id}`,
            status: "ACTIVE",
            currentPeriodEnd: oneMonthLater,
            created: new Date(),
          },
        });
        console.log(
          `✅ ${userData.email} に有効なサブスクリプションを追加しました`,
        );
      } else if (userData.email === "loadtest3@example.com") {
        const stripeCustomer = await prisma.stripeCustomer.create({
          data: {
            userId: user.id,
            stripeCustomerId: `cus_test_${user.id}`,
            created: new Date(),
          },
        });
        await prisma.subscription.create({
          data: {
            stripeCustomerId: stripeCustomer.stripeCustomerId,
            stripeSubscriptionId: `sub_test_${user.id}`,
            status: "CANCELED",
            currentPeriodEnd: new Date(),
            created: new Date(),
          },
        });
        console.log(
          `✅ ${userData.email} にキャンセル済みのサブスクリプションを追加しました`,
        );
      }

      console.log(`✅ ${userData.email} を作成しました (ID: ${user.id})`);
    } catch (error) {
      console.error(`❌ ${userData.email} の作成に失敗しました:`, error);
    }
  }

  console.log("テストユーザーの作成が完了しました");
}

main()
  .catch((e: unknown) => {
    console.error("エラーが発生しました:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
