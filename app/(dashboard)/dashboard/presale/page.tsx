import BreadCrumb from "@/components/breadcrumb";
import { PresaleBoard } from "@/components/presale/presale-board";
import NewTokenDialog from "@/components/presale/new-task-dialog";
import { Heading } from "@/components/ui/heading";

const breadcrumbItems = [{ title: "Presale", link: "/dashboard/presale" }];
export default function page() {
  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex items-start justify-between">
          <Heading title={`Presale`} description="Manage tasks by dnd" />
          <NewTokenDialog />
        </div>
        <div className="h-screen">
          <PresaleBoard />
        </div>
      </div>
    </>
  );
}
