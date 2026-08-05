"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageIcon, Loader2 } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  image: z
    .string()
    .trim()
    .url("Enter a valid image URL")
    .or(z.literal(""))
    .optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string | null;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      image: user?.image || "",
    },
  });

  const imagePreview = watch("image") || user?.image || "";

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 md:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Image */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={imagePreview} alt={user?.name || ""} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-2xl">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">Profile Photo</h3>
            <p className="text-sm text-gray-400">
              Use an HTTPS image URL for your avatar.
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="image" className="text-gray-300">
            Profile Image URL
          </Label>
          <div className="relative mt-1.5">
            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              id="image"
              type="url"
              {...register("image")}
              placeholder="https://example.com/avatar.jpg"
              className="pl-10 bg-slate-800/50 border-purple-500/20 text-white"
            />
          </div>
          {errors.image && (
            <p className="text-red-400 text-sm mt-1">{errors.image.message}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <Label htmlFor="name" className="text-gray-300">
            Full Name *
          </Label>
          <Input
            id="name"
            {...register("name")}
            className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white"
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-gray-300">
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            disabled
            className="mt-1.5 bg-slate-800/30 border-purple-500/20 text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Email cannot be changed
          </p>
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="text-gray-300">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            placeholder="+1 (555) 000-0000"
            className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="border-purple-500/20"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
