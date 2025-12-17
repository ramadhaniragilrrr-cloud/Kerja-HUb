"use client";

import { useAuthStore } from "@/lib/store/useAuthStore";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Save, User as UserIcon } from "lucide-react";

export default function SettingsPage() {
    const { user, updateProfile } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [address, setAddress] = useState(user?.address || "");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar || null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        const { error } = await updateProfile({
            name,
            phone,
            address,
            avatarFile: avatarFile || undefined
        });

        setIsLoading(false);
        if (error) {
            alert("Failed to update profile: " + error.message);
        } else {
            alert("Profile updated successfully!");
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-8 overflow-y-auto">
            <div className="max-w-2xl mx-auto w-full space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
                    <p className="text-slate-500 mt-1">Manage your personal information and preferences.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your profile photo and details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Avatar Upload */}
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24 border-2 border-slate-200">
                                <AvatarImage src={previewUrl || ""} />
                                <AvatarFallback className="text-2xl">{name[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="h-4 w-4 mr-2" /> Change Photo
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <p className="text-xs text-slate-500">JPG, GIF or PNG. Max 1MB.</p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={user?.email} disabled className="bg-slate-100" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62..." />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your address" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t bg-slate-50 dark:bg-slate-950/50 p-6">
                        <Button onClick={handleSave} disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
