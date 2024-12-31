import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityCalendar } from "@/components/events/activities/ActivityCalendar";
import { MealPlanner } from "@/components/events/meals/MealPlanner";

interface PlanningPageProps {
  params: {
    eventId: string;
  };
}

export default function PlanningPage({ params: { eventId } }: PlanningPageProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Planning</h1>
      
      <Tabs defaultValue="activities">
        <TabsList>
          <TabsTrigger value="activities">Activités</TabsTrigger>
          <TabsTrigger value="meals">Repas</TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <ActivityCalendar eventId={eventId} />
        </TabsContent>

        <TabsContent value="meals">
          <MealPlanner eventId={eventId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}