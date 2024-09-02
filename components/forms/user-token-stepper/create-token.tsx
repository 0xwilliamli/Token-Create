"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox"

import { tokenSchema, type TokenFormValues } from "@/lib/form-schema";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface TokenFormType {
  initialData: any | null;
  categories: any;
}

export const CreateTokenOne: React.FC<TokenFormType> = ({
  initialData,
  categories,
}) => {
  const { toast } = useToast()
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const title = initialData ? "Edit product" : "Create Your Token";
  const description = initialData
    ? "Edit a product."
    : "To create your Token, we first need some basic information about you.";
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);


  const form = useForm<TokenFormValues>({
    resolver: zodResolver(tokenSchema),
    mode: "onChange",
  });

  const {
    control,
    formState: { errors },
  } = form;


  async function onSubmit(data: TokenFormValues) {
    const formvalue = form.getValues()
    const res = await fetch(`/api/deploytoken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        formvalue
      })
    })
    if (res.ok) {
      toast({
        title: "Token Alert ",
        description: "Your token has been distributed successfully.",
        action: (
          <ToastAction altText="Goto schedule to undo">Undo</ToastAction>
        ),
      })
      return router.push(`/dashboard/presale`)
    }
  };

  type FieldName = keyof TokenFormValues;

  const steps = [
    {
      id: "Step 1",
      name: "Professional Information",
      fields: [
        "tokenName",
        "tokenSymbol",
        "tokenInitsupply",
        "tokenDecimals",
      ],
    },
    {
      id: "Step 2",
      name: "Advancd Setting",
      fields: [
        "burn",
        "mint",
        "pause",
        "blacklist",
        "deflation",
        "s_deflation"
      ]
    },
    {
      id: "Step 3",
      name: "Complete"
    },
  ];

  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await form.trigger(fields as FieldName[], {
      shouldFocus: true,
    });
    if (!output) {
      return
    }
    if (currentStep < steps.length - 1) {
      setPreviousStep(currentStep);
      setCurrentStep((step) => step + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep);
      setCurrentStep((step) => step - 1);
    }
  };


  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <div>
        <ul className="flex gap-4">
          {steps.map((step, index) => (
            <li key={step.name} className="md:flex-1">
              {currentStep > index ? (
                <div className="group flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-sky-600 transition-colors ">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ) : currentStep === index ? (
                <div
                  className="flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                  aria-current="step"
                >
                  <span className="text-sm font-medium text-sky-600">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ) : (
                <div className="group flex h-full w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-gray-500 transition-colors">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div
            className={cn(
              currentStep === 1
                ? "md:inline-block w-full"
                : "md:grid md:grid-cols-3 gap-8",
            )}
          >
            {currentStep === 0 && (
              <>
                <FormField
                  control={form.control}
                  name="tokenName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Name:</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="e.g.Good Luck Token"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tokenSymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol:</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="e.g.GLT"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tokenInitsupply"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Supply:</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="21000000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tokenDecimals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decimals(1-18):</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="18"
                          disabled={loading}
                          {...field}
                          max={18}
                          min={1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {currentStep === 1 && (
              <>
                <p className="py-4">You can set specific value for your token!</p>
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="burn"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Available Burn:
                          </FormLabel>
                          <FormDescription>
                            Burn is ...
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mint"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Available Mint:
                          </FormLabel>
                          <FormDescription>
                            Mint is .....
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pause"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Available Pause:
                          </FormLabel>
                          <FormDescription>
                            Pause can .....
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="blacklist"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Available BlackList:
                          </FormLabel>
                          <FormDescription>
                            BlackList can .....
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deflation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Available Deflation:
                          </FormLabel>
                          <FormDescription>
                            Deflation is ....
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="s_deflation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Available Super Deflation:
                          </FormLabel>
                          <FormDescription>
                            Super Deflations can ......
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
            {currentStep === 2 && (
              <div>
                <h1>Completed</h1>
                <FormField
                  control={form.control}
                  name="privateKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Private Key:</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="0x..........."
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button disabled={loading} className="ml-auto mt-4" type="submit" onClick={onSubmit}>
                  Deploy Token
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>
      {/* Navigation */}
      <div className="mt-8 pt-5">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={currentStep === 0}
            className="rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            disabled={currentStep === steps.length - 1}
            className="rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>
      {/* accordion */}
      <Accordion type="single" collapsible className="w-2/3 mx-auto">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            All tokens have been reviewed by the security audit company and passed the contract security audit!
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>
            All tokens have been satisfied all of clent's conditions!
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Is it Value?</AccordionTrigger>
          <AccordionContent>
            It only takes 10 seconds to create successfully, without manual intervention, the token will be automatically transferred to the address of the creator/owner after the creation is successful. The token does not have any copyright, it is automatically deployed to the main network and verified!
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};
