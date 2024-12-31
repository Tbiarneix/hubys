import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { ChildrenList } from "@/components/profile/ChildrenList";

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Mon profil</h1>

      <div className="space-y-8">
        <AvatarUpload />

        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="children">Enfants</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <ProfileForm />
          </TabsContent>

          <TabsContent value="children">
            <ChildrenList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}