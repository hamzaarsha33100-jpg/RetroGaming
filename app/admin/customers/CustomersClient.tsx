"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Ban,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Customer {
  _id: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
  role: "admin" | "customer";
  isActive: boolean;
  orderCount: number;
  totalSpent: number;
  lastOrder?: string;
  createdAt: string;
  addresses: any[];
  wishlist: any[];
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export default function CustomersClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const res = await fetch("/api/admin/customers");
      if (!res.ok) throw new Error("Failed to fetch customers");
      return res.json();
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const res = await fetch(`/api/admin/customers/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update customer");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      toast.success("Customer status updated!");
      setSelectedCustomer(null);
    },
    onError: () => {
      toast.error("Failed to update customer status");
    },
  });

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-900/50 rounded-2xl p-6 animate-pulse"
          >
            <div className="h-6 bg-slate-800 rounded w-1/4 mb-4" />
            <div className="h-4 bg-slate-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // Stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.isActive).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Customers</p>
              <p className="text-3xl font-bold text-white">{totalCustomers}</p>
            </div>
            <Users className="w-12 h-12 text-purple-400" />
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Active Customers</p>
              <p className="text-3xl font-bold text-white">{activeCustomers}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-white">
                {formatPrice(totalRevenue)}
              </p>
            </div>
            <ShoppingBag className="w-12 h-12 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800/50 border-purple-500/20 text-white"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-purple-500/20">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Orders
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Total Spent
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Joined
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No customers found</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <motion.tr
                    key={customer._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-800/30 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={customer.image} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-sm">
                            {getInitials(customer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-white">
                            {customer.name}
                          </div>
                          {customer.role === "admin" && (
                            <Badge className="bg-purple-500/10 text-purple-400 text-xs">
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="text-xs text-gray-500">
                          {customer.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">
                        {customer.orderCount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-purple-400">
                        {formatPrice(customer.totalSpent)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={`${
                          customer.isActive
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {customer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        onClick={() => setSelectedCustomer(customer)}
                        size="sm"
                        variant="ghost"
                        className="text-purple-400 hover:text-purple-300"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Dialog */}
      <Dialog
        open={!!selectedCustomer}
        onOpenChange={() => setSelectedCustomer(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-purple-500/20">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-white flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedCustomer.image} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                      {getInitials(selectedCustomer.name)}
                    </AvatarFallback>
                  </Avatar>
                  {selectedCustomer.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail className="w-5 h-5 text-purple-400" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <Phone className="w-5 h-5 text-purple-400" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span>Joined {formatDate(selectedCustomer.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <ShoppingBag className="w-5 h-5 text-purple-400" />
                    <span>{selectedCustomer.orderCount} orders</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {formatPrice(selectedCustomer.totalSpent)}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Wishlist Items</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {selectedCustomer.wishlist.length}
                    </p>
                  </div>
                </div>

                {/* Addresses */}
                {selectedCustomer.addresses.length > 0 && (
                  <div>
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-purple-400" />
                      Saved Addresses
                    </h3>
                    <div className="space-y-2">
                      {selectedCustomer.addresses.map((address: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-slate-800/50 rounded-lg p-3 text-sm text-gray-300"
                        >
                          <p>
                            {address.address1}, {address.city}, {address.state}{" "}
                            {address.zipCode}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedCustomer.role !== "admin" && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-purple-500/20">
                    <Button
                      onClick={() =>
                        toggleStatusMutation.mutate({
                          userId: selectedCustomer._id,
                          isActive: !selectedCustomer.isActive,
                        })
                      }
                      variant={selectedCustomer.isActive ? "destructive" : "default"}
                      className={
                        selectedCustomer.isActive
                          ? ""
                          : "bg-gradient-to-r from-green-600 to-emerald-600"
                      }
                    >
                      {selectedCustomer.isActive ? (
                        <>
                          <Ban className="w-4 h-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
