"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function InventoryListPage() {
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/inventory")
            .then((res) => res.json())
            .then((data) => {
                setInventory(data);
                setLoading(false);
            });
    }, []);

    const filtered = inventory.filter(i =>
        i.itemName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Inventory List</h1>
                    <p className="text-slate-500">Track all raw materials and stock levels.</p>
                </div>
                <div className="relative w-72">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <Input
                        className="pl-9"
                        placeholder="Search items..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white border rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Item Name</th>
                                <th className="px-6 py-3 font-medium">Current Stock</th>
                                <th className="px-6 py-3 font-medium">On Order</th>
                                <th className="px-6 py-3 font-medium">Reorder Level</th>
                                <th className="px-6 py-3 font-medium">Consumption</th>
                                <th className="px-6 py-3 font-medium">Unit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No items found.</td></tr>
                            ) : (
                                filtered.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold">{item.itemName}</td>
                                        <td className="px-6 py-4 font-mono">{item.currentStock}</td>
                                        <td className="px-6 py-4 font-mono text-blue-600">{item.onOrderStock}</td>
                                        <td className="px-6 py-4 font-mono text-slate-500">{item.reorderLevel}</td>
                                        <td className="px-6 py-4 font-mono text-slate-500">{item.dailyConsumption}/day</td>
                                        <td className="px-6 py-4 text-xs text-slate-400 uppercase">{item.unit}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
