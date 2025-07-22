import { setEmailContacts } from "../../../redux/email_contact_slice";
import { setEmailSyncConfigs } from "../../../redux/email_sync_config_slice";
import { IEmailContact } from "../../../types/email_contact";

export const exportEmailContacts = (params: { emailContacts: IEmailContact[] }) => {
    const { emailContacts } = params;
    const headers = [
        "Name",
        "Email",
        "Phone",
        "Source",
        "Customer ID",
        "Loan ID",
        "Created At",
        "Sync Status",
        "Subscribed",
        "Tags",
    ];
    const csvData = emailContacts?.map((contact) => [
        contact.name,
        contact.email,
        contact.phone,
        contact.source,
        contact.customerId || "",
        contact.loanId || "",
        contact.createdAt,
        contact.syncStatus || "pending",
        contact.isSubscribed ? "Yes" : "No",
        (contact.tags || []).join(", "),
    ]);

    const csvContent = [headers, ...csvData ?? []]
        .map((row) => row.map((field: any) => `"${field}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-contacts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
};

export const syncEmailContacts = async (params: { emailContacts: IEmailContact[] }): Promise<{
    success: number;
    failed: number;
  }> => {
    const { emailContacts } = params;
    return new Promise((resolve) => {
      setTimeout(() => {
        let success = 0;
        let failed = 0;

        const updatedContacts = emailContacts?.map((contact) => {
          if (contact.syncStatus === "pending") {
            const isSuccess = Math.random() > 0.1;
            if (isSuccess) {
              success++;
              return {
                ...contact,
                syncStatus: "synced" as const,
                lastSyncedAt: new Date().toISOString(),
              };
            } else {
              failed++;
              return { ...contact, syncStatus: "failed" as const };
            }
          }
          return contact;
        });

        setEmailContacts(updatedContacts);
        setEmailSyncConfigs((prev:any) => ({
          ...prev,
          lastSyncAt: new Date().toISOString(),
        }));

        resolve({ success, failed });
      }, 1500); // Simulate network delay
    });
  };