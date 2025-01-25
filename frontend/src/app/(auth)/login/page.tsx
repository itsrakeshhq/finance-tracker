import LoginForm from "@/components/modules/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Finance Tracker",
};

export default function LoginPage() {
  return <LoginForm />;
}
