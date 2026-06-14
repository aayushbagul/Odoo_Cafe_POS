import { Routes, Route } from "react-router-dom";
import Login from "./components/authentication/Login";
import Signup from "./components/authentication/Signup";
import POSTerminal from "./pages/POSTerminal";
import POSTerminalReal from "./components/POSTerminalReal";
import KDS from "./components/KDS";
import "@fontsource/inter";
import TableView from "./pages/TableView";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/pos" element={<POSTerminalReal />} />
	  <Route path="/kds" element={<KDS />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;