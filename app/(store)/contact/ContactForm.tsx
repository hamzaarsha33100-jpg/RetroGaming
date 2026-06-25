"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to send message");

      toast.success("Message sent successfully!", {
        description: "We'll get back to you within 24 hours.",
      });
      reset();
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <Label htmlFor="name" className="text-gray-300">
          Full Name *
        </Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="John Doe"
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
          placeholder="john@example.com"
          className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white"
        />
        {errors.email && (
          <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Subject */}
      <div>
        <Label htmlFor="subject" className="text-gray-300">
          Subject *
        </Label>
        <Input
          id="subject"
          {...register("subject")}
          placeholder="How can we help you?"
          className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white"
        />
        {errors.subject && (
          <p className="text-red-400 text-sm mt-1">{errors.subject.message}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <Label htmlFor="message" className="text-gray-300">
          Message *
        </Label>
        <Textarea
          id="message"
          {...register("message")}
          placeholder="Tell us more about your inquiry..."
          rows={6}
          className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white resize-none"
        />
        {errors.message && (
          <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6"
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Send Message
      </Button>
    </form>
  );
}
