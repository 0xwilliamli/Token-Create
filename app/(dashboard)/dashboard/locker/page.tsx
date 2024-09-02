import BreadCrumb from "@/components/breadcrumb";
import { columns } from "@/components/tables/locker-tables/columns";
import { LockerTable } from "@/components/tables/locker-tables/locker-table";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Locker } from "@/constants/data";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";

const breadcrumbItems = [{ title: "Locker", link: "/dashboard/locker" }];

type paramsProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

export default async function page({ searchParams }: paramsProps) {
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const country = searchParams.search || null;
  const offset = (page - 1) * pageLimit;

  const res = await fetch(
    `https://api.slingacademy.com/v1/sample-data/users?offset=${offset}&limit=${pageLimit}` +
      (country ? `&search=${country}` : ""),
  );
  const lockerRes = await res.json();
  const totalUsers = lockerRes.total_users; //1000
  const pageCount = Math.ceil(totalUsers / pageLimit);
  const locker: Locker[] = lockerRes.users;
  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title={`Locker (${totalUsers})`}
            description="Manage lockers (Server side table functionalities.)"
          />

          <Link
            href={"/dashboard/locker/new"}
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </div>
        <Separator />

        <LockerTable
          searchKey="country"
          pageNo={page}
          columns={columns}
          totalUsers={totalUsers}
          data={locker}
          pageCount={pageCount}
        />
      </div>
    </>
  );
}
