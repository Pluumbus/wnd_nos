import React, { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import type { OrderJoin, Order, OrderWithJoins } from "../services/orderService";
import { OrderService } from "../services/orderService";

export const ordersQueryKey = ["orders"] as const;

export const OrdersRealtimeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!session?.user?.id) return;

    const topic = `orders_rt:${session.user.id}`;
    const channel = supabase
      .channel(topic)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        async (payload: RealtimePostgresChangesPayload<Order>) => {
          if (payload.eventType === "INSERT" && payload.new?.id != null) {
            const row = await OrderService.getOrderWithJoinsById(
              payload.new.id as number
            );
            if (row) {
              queryClient.setQueryData<OrderJoin>(ordersQueryKey, (prev) => {
                const list = prev ?? [];
                const without = list.filter((o) => o.id !== row.id);
                return [row, ...without];
              });
            }
          } else if (payload.eventType === "UPDATE" && payload.new) {
            const updated = payload.new as Order;
            queryClient.setQueryData<OrderJoin>(ordersQueryKey, (prev) =>
              (prev ?? []).map((o) =>
                o.id === updated.id ? ({ ...o, ...updated } as OrderWithJoins) : o
              )
            );
          } else if (payload.eventType === "DELETE" && payload.old) {
            const id = (payload.old as Partial<Order>).id;
            if (id != null) {
              queryClient.setQueryData<OrderJoin>(ordersQueryKey, (prev) =>
                (prev ?? []).filter((o) => o.id !== id)
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [session?.user?.id, queryClient]);

  return <>{children}</>;
};
