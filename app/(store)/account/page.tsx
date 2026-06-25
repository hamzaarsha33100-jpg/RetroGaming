import { auth } from "@/lib/auth";
import { Metadata } from "next";
import ProfileForm from "./ProfileForm";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your account profile",
};

export default async function ProfilePage() {
  const session = await auth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-gray-400">
          Manage your personal information and preferences
        </p>
      </div>

      <ProfileForm user={session?.user} />
    </div>
  );
}
