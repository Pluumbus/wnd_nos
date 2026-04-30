import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersQueryKey } from "../context/OrdersRealtimeContext";
import { OrderJoin, OrderService } from "../services/orderService";

export const useOrders = () => {
  const queryClient = useQueryClient();

  const {
    data: orders = [],
    isLoading: loading,
    error: queryError,
    refetch: loadOrders,
  } = useQuery({
    queryKey: ordersQueryKey,
    queryFn: () => OrderService.getOrders(),
    staleTime: 60_000,
  });

  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? "Произошла ошибка при загрузке заказов"
        : null;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => OrderService.deleteOrder(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<OrderJoin>(ordersQueryKey, (prev) =>
        (prev ?? []).filter((o) => o.id !== id)
      );
    },
  });

  return {
    orders,
    loading,
    error,
    loadOrders,
    deleteOrder: deleteMutation.mutateAsync,
    deleteOrderPending: deleteMutation.isPending,
  };
};
