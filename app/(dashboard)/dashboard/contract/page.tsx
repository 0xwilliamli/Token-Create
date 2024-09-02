import BreadCrumb from "@/components/breadcrumb";
import { contracts } from "@/constants/data";
import { ContractT } from "@/components/tables/contract";

const breadcrumbItems = [{ title: "Contract", link: "/dashboard/contract" }];
export default function page() {
  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <ContractT/>
      </div>
    </>
  );
}
