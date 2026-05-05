import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Register — ${BRAND.siteName}`,
};

export default function RegisterPage() {
  return <RegisterForm />;
}
