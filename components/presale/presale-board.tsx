"use client";
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/utils/supabase/newclient';
import { BoardCard } from './board-card';
import { Card } from '../ui/card';

type CardProps = React.ComponentProps<typeof Card>;

export function PresaleBoard({ className, ...props }: CardProps) {

  const [tokens, setTokens] = useState<any[]>([])

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select();
      if (error) {
        console.error('Error fetching data:', error.message);
        return;
      }
      if (data) {
        setTokens(data)
      }

    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ScrollArea className="h-96 rounded-md border p-8 ">
      <div className="grid grid-cols-2 gap-4">
        {tokens.map((token, index) => (
          <BoardCard key={index} token={token} />
        ))}
      </div>
    </ScrollArea>
  );
}