import RegisterForm from "@/components/modules/auth/register-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Finance Tracker",
};

export default function LoginPage() {
  return <RegisterForm />;
}
