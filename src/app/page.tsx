import { redirect } from "next/navigation";

export default function Home() {
  // Redirect directly to quotation form
  redirect("/job-sheet-form");

  // This return statement will never be reached due to redirect
  return null;
}
