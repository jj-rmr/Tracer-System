import type { FormResponse } from "@/types";

import {
  getFormResponseDocuments,
  markResponseDriveOrganizationFailed,
  markResponseDriveOrganizationStarted,
  markResponseDriveOrganized,
} from "@/lib/repositories/form-responses.repository";

import { getResponseFolder } from "./response-folders";
import { runDriveOrganization } from "./organization-lifecycle";

export async function organizeResponseDriveFolder(response: FormResponse) {
  await runDriveOrganization({
    markStarted: () => markResponseDriveOrganizationStarted(response.id),
    organize: async () => {
      await getResponseFolder({
        response,
        documents: await getFormResponseDocuments(response.id),
      });
    },
    markOrganized: () => markResponseDriveOrganized(response.id),
    markFailed: (error) =>
      markResponseDriveOrganizationFailed(
        response.id,
        error instanceof Error
          ? error.message
          : "Unknown Drive organization error",
      ),
  });
}
