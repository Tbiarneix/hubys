"use client";

// import dynamic from "next/dynamic";
import ActivitiesCalendar from "./ActivitiesCalendar";

// const Map = dynamic(() => import("./Map"), {
//   ssr: false,
// });

interface ClientActivitiesProps {
  startDate: Date;
  endDate: Date;
}

export default function ClientActivities({ startDate, endDate }: ClientActivitiesProps) {
  return (
    <div className="space-y-8">
      <p className="text-gray-700">Gestion des activités</p>
      <ActivitiesCalendar startDate={startDate} endDate={endDate} />
      {/* <Map /> */}
    </div>
  );
}
