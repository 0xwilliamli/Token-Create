"use client";
import { BellRing, Check, Mail, Lock, LucideSquirrel, StepForward } from "lucide-react"
import { addYears, format } from 'date-fns';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

import { BoardContainer, BoardColumn } from "./board-column";
import { cn } from "@/lib/utils"
import { Token } from "@/lib/store";
import { useState } from "react";

type BoardCardProps = {
  key: React.Key;
  token: Token;
  className?: string;
};

export function BoardCard({ className, token, ...props }: BoardCardProps) {
  const { toast } = useToast()
  const [ethAmount, setEthAmount] = useState('')
  const [tokenAmount, setTokenAmount] = useState('')

  async function onVerify(address: string, name: string) {
    console.log(address)
    const res = await fetch(`/api/presale/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address,
        name
      })
    })
    if (res.ok) {
      console.log("ok")
      toast({
        title: "Token Alert ",
        description: "Successful.",
        action: (
          <ToastAction altText="Goto schedule to undo">Undo</ToastAction>
        ),
      })
    }
  }

  async function addLiquidity(address: string, privatekey: string) {
    const res = await fetch(`/api/presale/liquidity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ethAmount,
        tokenAmount,
        address,
        privatekey
      })
    })
    if (res.ok) {
      console.log("ok")
      toast({
        title: "Token Alert ",
        description: "Your token has been distributed successfully.",
        action: (
          <ToastAction altText="Goto schedule to undo">Undo</ToastAction>
        ),
      })
    }
  }
  async function onLock(address: string, privatekey: string) {
    const res = await fetch(`/api/presale/lock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address,
        privatekey
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
    }
  }
  return (
    <BoardContainer>
      <Card className={cn("w-[600px]", className)} {...props}>
        <CardHeader className="p-4 my-4 font-semibold border-b-2 text-left flex flex-row-reverse space-between items-center">
          <CardTitle>{token.token_name}</CardTitle>
          <CardDescription className="grow justify-items-end">
            {token.is_verified ?
              <Badge variant="secondary">
                Verified
              </Badge> :
              <Dialog>
                <DialogTrigger asChild>
                  <Badge variant="destructive">Un Verified</Badge>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Did you verify token?</DialogTitle>
                    <DialogDescription>
                      If token was verified, you can use all function!
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button onClick={() => onVerify(token.contract_address, token.token_symbol)}>Verify</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className=" flex items-center space-x-4 rounded-md border p-4">
            <BellRing />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {token.address}
              </p>
              <p className="text-sm text-muted-foreground">
                {token.contract_address}
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex flex-row gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline"><LucideSquirrel className="mr-2 h-4 w-4"></LucideSquirrel>Add Liquidity</Button>
              </SheetTrigger>
              <SheetContent position="right" size="sm">
                <SheetHeader>
                  <SheetTitle>Add Liquidity</SheetTitle>
                  <SheetDescription>
                    Adding liquidity typically refers to the act of providing funds to a liquidity pool on a decentralized finance (DeFi) platform, usually through a process called liquidity provision or liquidity mining.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ethAmount" className="text-right">
                      Eth Amount
                    </Label>
                    <Input id="ethAmount" className="col-span-3" value={ethAmount} onChange={(e) => {
                      setEthAmount(e.target.value)
                    }} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tokenAmount" className="text-right">
                      Token Amount
                    </Label>
                    <Input id="tokenAmount" className="col-span-3" value={tokenAmount} onChange={(e) => {
                      setTokenAmount(e.target.value)
                    }} />
                  </div>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button onClick={() => addLiquidity(token.contract_address, token.privatekey)}>Add</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline"><Lock className="mr-2 h-4 w-4" />Lock Liquidity Pool</Button>
              </SheetTrigger>
              <SheetContent position="right" size="sm">
                <SheetHeader>
                  <SheetTitle>Lock Pool</SheetTitle>
                  <SheetDescription>
                    In decentralized finance (DeFi), users often lock tokens in liquidity pools to provide liquidity and earn rewards. This process involves depositing equal values of two different tokens into a smart contract. Users receive liquidity pool tokens in return, representing their share of the pool.
                  </SheetDescription>
                </SheetHeader>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button onClick={() => onLock(token.contract_address, token.privatekey)}>Lock</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
        <CardFooter>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <StepForward className="mr-2 h-4 w-4" /> Presale start
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Presale Start</DialogTitle>
                <DialogDescription>
                  You must set the conditions below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="softcap" className="text-right">
                    Soft Cap
                  </Label>
                  <Input id="softcap" value="" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="hardcap" className="text-right">
                    Hard Cap
                  </Label>
                  <Input id="hardcap" value="" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lock" className="text-right">
                    Lock Time
                  </Label>
                  <Input id="lock" value="" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </BoardContainer >

  );
}
