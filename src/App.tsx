import { useTankStore } from "./store/tankStore";
import { useAccountStore } from "./store/accountStore";
import { Garage } from "./components/garage/Garage";
import { Battle } from "./components/battle/Battle";
import { AuthScreen } from "./components/ui/AuthScreen";
import "./App.css";

export default function App() {
  const authPhase = useAccountStore((s) => s.authPhase);
  const phase = useTankStore((s) => s.phase);

  if (authPhase !== "play") {
    return (
      <div className="app">
        <AuthScreen />
      </div>
    );
  }

  return (
    <div className="app">{phase === "garage" ? <Garage /> : <Battle />}</div>
  );
}
