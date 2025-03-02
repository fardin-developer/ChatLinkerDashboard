import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChatLinker | Sign Up",
  description: "Sign Up page of ChatLinker",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
