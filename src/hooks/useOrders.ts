import { useState, useEffect } from "react";
import { Order, OrderJoin, OrderService } from "../services/orderService";
import { Database } from "../lib/supabase.types";

export const useOrders = () => {
  const [orders, setOrders] = useState<OrderJoin>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузить заказы
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await OrderService.getOrders();
      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Произошла ошибка при загрузке заказов"
      );
    } finally {
      setLoading(false);
    }
  };

  // // Создать заказ
  // const createOrder = async (orderData: Order) => {
  //   try {
  //     setError(null);
  //     const newOrder = await OrderService.createOrder(orderData);
  //     setOrders((prev) => [
  //       {
  //         ...newOrder,
  //         wnd_constructions: {
  //           created_at: new Date().toISOString(),
  //           id: 0,
  //           furniture: 0,
  //           opening_sashes: "",
  //           profileSystem: 0,
  //           sh_template: "",
  //           size: {},
  //           th_glass: null,
  //           profiles: {
  //             id: 0,
  //             name: "",
  //             description: null,
  //             created_at: new Date().toISOString(),
  //           },
  //           furnitures: {
  //             id: 0,
  //             name: "",
  //             description: null,
  //             created_at: new Date().toISOString(),
  //           },
  //         },
  //         profiles: {
  //           id: 0,
  //           name: "",
  //           description: null,
  //           created_at: new Date().toISOString(),
  //         },
  //         furnitures: {
  //           id: 0,
  //           name: "",
  //           description: null,
  //           created_at: new Date().toISOString(),
  //         },
  //       },
  //       ...prev,
  //     ]);
  //     return newOrder;
  //   } catch (err) {
  //     setError(
  //       err instanceof Error
  //         ? err.message
  //         : "Произошла ошибка при создании заказа"
  //     );
  //     throw err;
  //   }
  // };

  // Обновить заказ
  //   const updateOrder = async (id: number, updates: Partial<Order>) => {
  //     try {
  //       setError(null);
  //       const updatedOrder = await OrderService.updateOrder(id, updates);
  //       setOrders((prev) =>
  //         prev.map((order) =>
  //           order.id === id
  //             ? {
  //                 ...updatedOrder,
  //                 wnd_constructions: {
  //                   created_at: new Date().toISOString(),
  //                   id: 0,
  //                   furniture: 0,
  //                   opening_sashes: "",
  //                   profileSystem: 0,
  //                   sh_template: "",
  //                   size: {},
  //                   th_glass: null,
  //                 },
  //                 profiles: {
  //                   id: 0,
  //                   name: "",
  //                   description: null,
  //                   created_at: new Date().toISOString(),
  //                 },
  //                 furnitures: {
  //                   id: 0,
  //                   name: "",
  //                   description: null,
  //                   created_at: new Date().toISOString(),
  //                 },
  //               }
  //             : order
  //         )
  //       );
  //       return updatedOrder;
  //     } catch (err) {
  //       setError(
  //         err instanceof Error
  //           ? err.message
  //           : "Произошла ошибка при обновлении заказа"
  //       );
  //       throw err;
  //     }
  //   };

  // Удалить заказ
  const deleteOrder = async (id: number) => {
    try {
      setError(null);
      await OrderService.deleteOrder(id);
      setOrders((prev) => prev.filter((order) => order.id !== id));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Произошла ошибка при удалении заказа"
      );
      throw err;
    }
  };

  // Подписаться на изменения в реальном времени
  useEffect(() => {
    const subscription = OrderService.subscribeToOrders((payload) => {
      if (payload.eventType === "INSERT") {
        setOrders((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === "UPDATE") {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === payload.new.id ? payload.new : order
          )
        );
      } else if (payload.eventType === "DELETE") {
        setOrders((prev) =>
          prev.filter((order) => order.id !== payload.old.id)
        );
      }
    });

    // Загрузить начальные данные
    loadOrders();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    orders,
    loading,
    error,
    loadOrders,
    // createOrder,
    // updateOrder,
    deleteOrder,
  };
};
