export type SessionUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
  workspaceId: string;
  workspaceName: string;
  authProvider: string;
};

export function getCurrentUser(): SessionUser {
  return {
    id: "user_aditya_demo",
    name: "Aditya",
    email: "aditya@example.com",
    initials: "AD",
    workspaceId: "workspace_personal",
    workspaceName: "Personal Finance",
    authProvider: "Demo session",
  };
}
