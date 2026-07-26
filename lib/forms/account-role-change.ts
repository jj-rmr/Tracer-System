import { deleteResponseDriveData } from "@/lib/google-drive/response-cleanup";
import {
  claimFormResponseDeletion,
  deleteFormResponse,
  listDraftResponsesOwnedByAccount,
  markFormResponseDeletionFailed,
} from "@/lib/repositories/form-responses.repository";

export async function deleteAccountDraftResponses(accountId: string) {
  const drafts = await listDraftResponsesOwnedByAccount(accountId);

  for (const draft of drafts) {
    const claimed = await claimFormResponseDeletion(draft.id);
    if (!claimed) {
      throw new Error(
        "A draft response is currently being processed. Try again shortly.",
      );
    }

    try {
      await deleteResponseDriveData(claimed.id);
      await deleteFormResponse(claimed.id);
    } catch (error) {
      await markFormResponseDeletionFailed(claimed.id).catch(() => undefined);
      throw error;
    }
  }

  return drafts.length;
}
