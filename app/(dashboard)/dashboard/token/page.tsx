import BreadCrumb from "@/components/breadcrumb";
import { CreateTokenOne } from "@/components/forms/user-token-stepper/create-token";

const breadcrumbItems = [{ title: "Token", link: "/dashboard/token" }];
export default function page() {
  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <CreateTokenOne categories={[]} initialData={null} />
      </div>
    </>
  );
}
