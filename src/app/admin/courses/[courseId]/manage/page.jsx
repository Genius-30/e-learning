// app/admin/course/[courseId]/manage/page.tsx
import { redirect } from "next/navigation";

export default function RedirectPage({ params }) {
  redirect(`/admin/courses/${params.courseId}/manage/details`);
}
