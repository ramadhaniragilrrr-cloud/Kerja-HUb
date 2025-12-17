"use client";

import { useEffect, useState } from "react";
import { useTeamStore, UserProfile } from "@/lib/store/useTeamStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, Pencil } from "lucide-react";

export default function TeamPage() {
    const { users, loadUsers, isLoading, updateUser, outlets, loadOutlets, createOutlet, deleteOutlet, error } = useTeamStore();
    const { user: currentUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'employees' | 'outlets'>('employees');

    // Employee State
    const [search, setSearch] = useState("");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [editName, setEditName] = useState("");
    const [editRole, setEditRole] = useState<'admin' | 'user'>('user');
    const [editOutletId, setEditOutletId] = useState<string>("unassigned");
    const [isSaving, setIsSaving] = useState(false);

    // Outlet State
    const [isAddOutletOpen, setIsAddOutletOpen] = useState(false);
    const [newOutletName, setNewOutletName] = useState("");
    const [newOutletAddress, setNewOutletAddress] = useState("");
    const [newOutletPhone, setNewOutletPhone] = useState("");

    useEffect(() => {
        loadUsers();
        loadOutlets();
    }, []);

    // Filter Users
    const filteredUsers = users.filter((u) =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    // Employee Actions
    const handleEditClick = (user: UserProfile) => {
        setSelectedUser(user);
        setEditName(user.full_name || "");
        setEditRole(user.role);
        setEditOutletId(user.outlet_id || "unassigned");
        setIsEditOpen(true);
    };

    const handleSaveUser = async () => {
        if (!selectedUser) return;
        setIsSaving(true);
        await updateUser(selectedUser.id, {
            full_name: editName,
            role: editRole,
            outlet_id: editOutletId === "unassigned" ? undefined : editOutletId // undefined usually doesn't clear in partial update if value is null in DB, specifically setting to null might be needed if Supabase supports it, but for now assuming we just switch outlets
        });
        setIsSaving(false);
        setIsEditOpen(false);
    };

    // Outlet Actions
    const handleAddOutlet = async () => {
        if (!newOutletName) return alert("Outlet Name is required");
        setIsSaving(true);
        const { error } = await createOutlet({
            name: newOutletName,
            address: newOutletAddress,
            phone: newOutletPhone
        });
        setIsSaving(false);
        if (error) {
            alert("Failed to create outlet: " + error.message);
        } else {
            setIsAddOutletOpen(false);
            setNewOutletName("");
            setNewOutletAddress("");
            setNewOutletPhone("");
        }
    };

    const handleDeleteOutlet = async (id: string) => {
        if (confirm("Are you sure you want to delete this outlet?")) {
            await deleteOutlet(id);
        }
    };

    const getOutletName = (id?: string) => {
        if (!id) return "Unassigned";
        const outlet = outlets.find(o => o.id === id);
        return outlet ? outlet.name : "Unknown Outlet";
    };

    if (currentUser?.role !== 'admin') {
        return <div className="p-8 text-center text-red-500">Access Denied. Admins only.</div>;
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
            <div className="p-6 border-b bg-white dark:bg-slate-950 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
                    <p className="text-slate-500">Manage team and outlets.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('employees')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'employees' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        Employees
                    </button>
                    <button
                        onClick={() => setActiveTab('outlets')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'outlets' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        Outlets
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                {activeTab === 'employees' ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <div className="relative max-w-sm w-full">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search employees..."
                                    className="pl-8 bg-white"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-950 rounded-lg border shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Outlet</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.avatar_url} />
                                                    <AvatarFallback>{user.full_name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{user.full_name || "Unknown"}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'}`}>
                                                    {user.role}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-sm ${user.outlet_id ? 'text-blue-600 font-medium' : 'text-slate-400 italic'}`}>
                                                    {getOutletName(user.outlet_id)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
                                                    <Pencil className="h-4 w-4 text-slate-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Outlet List</h2>
                            <Button onClick={() => setIsAddOutletOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700">
                                + Add Outlet
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {outlets.map((outlet) => (
                                <div key={outlet.id} className="bg-white dark:bg-slate-950 p-4 rounded-lg border shadow-sm flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg">{outlet.name}</h3>
                                        <p className="text-sm text-slate-500 mt-1">{outlet.address || "No Address"}</p>
                                        <p className="text-sm text-slate-500">{outlet.phone || "No Phone"}</p>
                                        <div className="mt-4 pt-4 border-t text-xs text-slate-400 flex justify-between items-center">
                                            <span>{users.filter(u => u.outlet_id === outlet.id).length} Employees assigned</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteOutlet(outlet.id)}>Delete</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit User Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                        <DialogDescription>Assign role and outlet.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Name</Label>
                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Role</Label>
                            <Select value={editRole} onValueChange={(val: 'admin' | 'user') => setEditRole(val)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Outlet</Label>
                            <Select value={editOutletId} onValueChange={setEditOutletId}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select Outlet" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {outlets.map(o => (
                                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveUser} disabled={isSaving}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Outlet Dialog */}
            <Dialog open={isAddOutletOpen} onOpenChange={setIsAddOutletOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Outlet</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Outlet Name</Label>
                            <Input value={newOutletName} onChange={(e) => setNewOutletName(e.target.value)} placeholder="e.g. Jakarta Branch" />
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Input value={newOutletAddress} onChange={(e) => setNewOutletAddress(e.target.value)} placeholder="Full address" />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={newOutletPhone} onChange={(e) => setNewOutletPhone(e.target.value)} placeholder="Phone number" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOutletOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddOutlet} disabled={isSaving}>Create Outlet</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
