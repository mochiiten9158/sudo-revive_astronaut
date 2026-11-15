
import { createContext, useContext } from "react";

interface MissionDayContextType {
  selectedMissionDay: number | null;
  setSelectedMissionDay: (day: number | null) => void;
}

export const MissionDayContext =
  createContext<MissionDayContextType | null>(null);

export function useMissionDay() {
  const context = useContext(MissionDayContext);

  if (!context) {
    throw new Error(
      "useMissionDay must be used inside MissionDayContext.Provider"
    );
  }

  return context;
}