import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChatLinker | Sign In",
  description: "Sign In page of ChatLinker",
};

export default function SignIn() {
  return <SignInForm />;
}
