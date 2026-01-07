// app/actions/signOutAction.ts
import { signOut } from "next-auth/react";

export async function signOutAction() {
  await signOut({ redirect: true, callbackUrl: '/auth/signin' });
}
