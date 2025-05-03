"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { StrictOmit } from "ts-essentials";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogFooter } from "@/components/ui/dialog";
import { MessageDisplay } from "@/components/ui/feedback/message-display";
import { Label } from "@/components/ui/label";
import { useTransitionContext } from "@/contexts/transition-context";
import {
  getClientsByUserIdAction,
  createClientAction,
  updateClientAction,
  deleteClientAction,
} from "@/features/client/actions/client";
import { ClientDialog, type DialogType } from "@/features/client/components/client-dialog";
import { ClientForm, type ClientFormValues } from "@/features/client/components/client-form";
import { Client } from "@/features/client/types/client";
import { useMessageState } from "@/hooks/use-message-state";
import { truncate } from "@/utils/string/string-utils";

export default function ClientClientListPage({ userId }: { userId: string }) {
  const [clients, setClients] = useState<Client[]>([]);
  const { startTransition } = useTransitionContext();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const { error, success, showError, showSuccess } = useMessageState();

  const router = useRouter();

  const fetchClients = async () => {
    try {
      const data = await getClientsByUserIdAction(userId);
      setClients(data);
    } catch (error) {
      showError("クライアント情報の取得に失敗しました");
      console.error(error);
    }
  };

  useEffect(() => {
    startTransition(async () => {
      await fetchClients();
    });
  }, []);

  const closeDialog = () => {
    setActiveDialog(null);
    setSelectedClient(null);
  };

  const convertClientFormValuesToClient = (
    data: ClientFormValues,
    userId: string
  ): StrictOmit<Client, "id"> => {
    return {
      name: data.name,
      contactName: data.contactName,
      email: data.email,
      defaultEmailTemplateId: undefined,
      createUserId: userId,
    };
  };

  const onCreateClient = (values: ClientFormValues) => {
    startTransition(async () => {
      try {
        const clientData = convertClientFormValuesToClient(values, userId);
        await createClientAction(clientData);
        showSuccess(`クライアント '${values.name}' を作成しました`);
        closeDialog();
        await fetchClients();
      } catch (err) {
        console.error(err);
        showError("クライアントの作成に失敗しました");
      }
    });
  };

  const onEditClient = (values: ClientFormValues) => {
    if (!selectedClient) return;
    startTransition(async () => {
      try {
        const clientData = convertClientFormValuesToClient(values, userId);
        await updateClientAction(selectedClient.id, clientData);
        showSuccess(`クライアント '${values.name}' を編集しました`);
        closeDialog();
        await fetchClients();
      } catch (err) {
        console.error(err);
        showError("クライアントの更新に失敗しました");
      }
    });
  };

  const handleDeleteClient = () => {
    if (!selectedClient) return;
    startTransition(async () => {
      try {
        await deleteClientAction(selectedClient.id);
        showSuccess("クライアントを削除しました");
        await fetchClients();
        closeDialog();
      } catch (error) {
        if (error instanceof Error) {
          showError(error.message);
        } else {
          showError("クライアントの削除に失敗しました");
        }
        console.error(error);
      }
    });
  };

  const openDetailsModal = (client: Client) => {
    setSelectedClient(client);
    setActiveDialog("details");
  };

  const openDeleteConfirm = () => {
    setActiveDialog("delete");
  };

  const handleNavigation = (clientId: string) => {
    startTransition(() => {
      router.push(`/client/${clientId}`);
    });
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>クライアント一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4">
            <MessageDisplay error={error} success={success} />
            {clients.length === 0 ? (
              <div className="text-center">
                <p className="text-muted-foreground" data-testid="no-clients-message">クライアントがありません</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div
                      className="cursor-pointer font-medium hover:text-blue-500"
                      onClick={() => {
                        handleNavigation(client.id);
                      }}
                    >
                      <Label className="max-w-[300px] cursor-pointer truncate">
                        {truncate(client.name, 30)}
                      </Label>
                    </div>
                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          openDetailsModal(client);
                        }}
                      >
                        詳細
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => {
            setActiveDialog("create");
          }}
        >
          新規クライアント作成
        </Button>
      </div>

      {/* Details Modal */}
      <ClientDialog
        type="details"
        isOpen={activeDialog === "details"}
        onClose={closeDialog}
      >
        {selectedClient && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">クライアント名:</div>
              <div>{selectedClient.name}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">担当者名:</div>
              <div>{selectedClient.contactName}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">メールアドレス:</div>
              <div>{selectedClient.email}</div>
            </div>
          </div>
        )}
        <DialogFooter className="flex justify-between space-x-2">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setActiveDialog("edit");
              }}
            >
              編集
            </Button>
            <Button variant="destructive" onClick={openDeleteConfirm}>
              削除
            </Button>
          </div>
          <Button variant="outline" onClick={closeDialog}>
            閉じる
          </Button>
        </DialogFooter>
      </ClientDialog>

      {/* Create Modal */}
      <ClientDialog
        type="create"
        isOpen={activeDialog === "create"}
        onClose={closeDialog}
      >
        <ClientForm
          onSubmit={onCreateClient}
          submitButtonText="作成"
          onCancel={closeDialog}
        />
      </ClientDialog>

      {/* Edit Modal */}
      <ClientDialog
        type="edit"
        isOpen={activeDialog === "edit"}
        onClose={closeDialog}
      >
        <ClientForm
          defaultValues={
            selectedClient
              ? {
                name: selectedClient.name,
                contactName: selectedClient.contactName,
                email: selectedClient.email,
              }
              : undefined
          }
          onSubmit={onEditClient}
          submitButtonText="保存"
          onCancel={closeDialog}
        />
      </ClientDialog>

      {/* Delete Confirmation Modal */}
      <ClientDialog
        type="delete"
        isOpen={activeDialog === "delete"}
        onClose={closeDialog}
      >
        <div className="py-4">
          <p className="text-center">
            {selectedClient?.name} を削除してもよろしいですか？
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            この操作は元に戻せません。
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleDeleteClient}>
            削除
          </Button>
        </DialogFooter>
      </ClientDialog>
    </div>
  );
}
