import { Routes, Route, HashRouter as Router } from "react-router-dom";
import "./App.css";
import AddHabit from "./Components/AddHabit";
import { ApiProvider } from "./Components/contextapi";
import HomePage from "./Components/HomePage";
import HabitTracker from "./Components/HabitTracker";
import EditHabit from "./Components/EditHabit";
import Todos from "./Components/todos";
import { ThemeProvider } from "./Components/ThemeContext";

function App() {
  return (
    <div className="App">
      <Router>
        <ThemeProvider>
        <ApiProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/add-habit" element={<AddHabit />} />
            <Route path="/todos" element={<Todos />} />
            <Route
              path="/habit-tracker/:habitName"
              element={<HabitTracker />}
            />
            <Route
              path="/edit-habit/:habitName"
              element={<EditHabit />}
            />
          </Routes>
        </ApiProvider>
        </ThemeProvider>
      </Router>
    </div>
  );
}

export default App;
