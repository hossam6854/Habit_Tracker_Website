import { useContext, useMemo, useState, useEffect } from "react";
import { ApiContext } from "./contextapi";
import { motion } from "framer-motion";
import Todos from "./todos";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { Check, ChevronRight, Clock, Calendar, Trophy } from 'lucide-react';


const HomePage = () => {
  const { data, updateDaysLeft, getMissedDates } = useContext(ApiContext);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("habits");
  const navigate = useNavigate();

  const completedHabits = useMemo(
    () => data.filter((habit) => habit.remainingDays === 0),
    [data]
  );
  const activeHabits = useMemo(
    () => data.filter((habit) => habit.remainingDays > 0),
    [data]
  );

  const filteredData = useMemo(
    () =>
      data.filter(
        (habit) =>
          habit.habitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          habit.habitDescription
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      ),
    [searchQuery, data]
  );

  const pieChartData = [
    { name: "Completed", value: completedHabits.length },
    { name: "Active", value: activeHabits.length },
  ];

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    data.forEach((habit) => {
      const today = new Date().toDateString();
      if (habit.remainingDays > 0 && habit.completedToday !== today) {
        new Notification("Reminder", {
          body: `Don't forget to complete the habit "${habit.habitName}" today!`,
        });
      }
    });
  }, [data]);

  return (
    <div
      className={`habit-tracker p-6 min-h-screen transition-colors ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Navbar */}
      <nav className="flex justify-between items-center mb-8 flex-wrap md:flex-nowrap">
        <div className="flex flex-wrap gap-4 md:flex-nowrap">
          <button
            className={`text-lg font-semibold py-2 px-4 rounded-lg ${
              activeTab === "habits" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("habits")}
            aria-label="Show habits"
          >
            Habits
          </button>

          <button
            className={`text-lg font-semibold py-2 px-4 rounded-lg ${
              activeTab === "todos" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("todos")}
          >
            Todos
          </button>
        </div>
        <div className="flex flex-wrap gap-4 md:flex-nowrap mt-4 md:mt-0">
          <button
            className="text-lg font-semibold py-2 px-4 rounded-lg shadow-lg bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => navigate("/add-habit")}
          >
            Add Habit
          </button>
          <button
            className="text-lg font-semibold py-2 px-4 rounded-lg shadow-lg bg-blue-500 text-white hover:bg-blue-600"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>
      </nav>

      {/* Content */}
      {activeTab === "habits" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-4">Habit Tracker Website</h1>
          <input
            type="text"
            placeholder="Search for a habit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-6 w-full border p-3 rounded-lg text-black dark:text-black"
            aria-label="Search habits"
          />

          <div className="habit-list grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredData.map((habit) => (
              <motion.div
                key={habit.habitName}
                className={`bg-white shadow-xl p-6 rounded-xl transform hover:scale-105 transition-all duration-300 ${
                  habit.remainingDays === 0
                    ? "border-green-400 border-2"
                    : "border-blue-400 border-2"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-xl font-semibold text-gray-700">
                  <strong>Habit Name:</strong> {habit.habitName}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Description:</strong> {habit.habitDescription}
                </p>


                <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1 text-white dark:text-black">
                  <Clock className="h-4 w-4" /> Days Left
                </p>
                <p className="font-semibold text-white dark:text-black">{habit.remainingDays}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1 text-white dark:text-black">
                  <Calendar className="h-4 w-4" /> Started
                </p>
                <p className="font-semibold text-white dark:text-black">{new Date(habit.startDate).toLocaleDateString('en-GB')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-white dark:text-black">Missed Days</p>
                <p className="font-semibold text-red-600"> {getMissedDates(habit).length || 0} {getMissedDates(habit).length === 1 ? 'day' : 'days'}</p>
              </div>

              
              <div className="space-y-1">
                <p className="text-muted-foreground text-white dark:text-black">Completion Dates</p>
                <p className="font-semibold text-green-600"> {habit.completionDates.length || 0} {habit.completionDates.length === 1 ? 'day' : 'days'}</p>
              </div>

            </div>



                
                



             

                {/* Progress Bar */}
                <div className="progress-bar bg-gray-300 rounded-full overflow-hidden h-4 my-4">
                  <div
                    className={`h-full transition-all duration-300 ${
                      habit.remainingDays / habit.numberOfDays >= 0.5
                        ? "bg-green-500"
                        : habit.remainingDays / habit.numberOfDays > 0.2
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${
                        (100 * (habit.numberOfDays - habit.remainingDays)) /
                        habit.numberOfDays
                      }%`,
                    }}
                  ></div>
                </div>

                {/* Habit Status */}
                <motion.p
                  className={`mt-4 ${
                    habit.completedToday === new Date().toDateString()
                      ? "text-green-600"
                      : "text-red-600"
                  } font-medium`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {habit.remainingDays === 0
                    ? "Habit Completed!"
                    : habit.completedToday === new Date().toDateString()
                    ? "✅ You have completed today's challenge!"
                    : "❌ You haven't completed today's challenge yet."}
                </motion.p>

                {/* Complete Button */}
                {habit.remainingDays === 0 ? (
                  <motion.div
                    className="text-center text-green-600 font-semibold mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7 }}
                  >
                    <p>🎉 Perfect job! You have completed this challenge!</p>
                  </motion.div>
                ) : (
                  <motion.button
                    onClick={() => updateDaysLeft(habit.habitName)}
                    className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold shadow hover:bg-blue-600 disabled:opacity-50 transition-all"
                    disabled={
                      habit.completedToday === new Date().toDateString()
                    }
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {habit.completedToday === new Date().toDateString()
                      ? "Challenge Completed"
                      : "Complete for today"}
                  </motion.button>
                )}

                {/* View Habit Details Link */}
                <Link
                  to={`/habit-tracker/${habit.habitName}`}
                  className="mt-2 w-full bg-gray-500 text-white py-2 px-4 rounded-lg font-semibold shadow hover:bg-gray-600 transition-all block text-center"
                >
                  View Habit Details
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Summary Section with Pie Chart */}
          <motion.div
            className="summary mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4 ">Summary</h2>

            {/* Pie Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <PieChart aria-label="Pie chart showing habit summary">
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  aria-label="Habit data"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? "#82ca9d" : "#8884d8"}
                      aria-label={`${entry.name}: ${entry.value}`}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="flex justify-center gap-8">
              <div className="bg-green-100 text-green-800 p-4 rounded-lg shadow">
                <p className="text-lg font-medium">Completed Habits</p>
                <p className="text-4xl font-bold">{completedHabits.length}</p>
              </div>
              <div className="bg-blue-100 text-blue-800 p-4 rounded-lg shadow">
                <p className="text-lg font-medium">Active Habits</p>
                <p className="text-4xl font-bold">{activeHabits.length}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {activeTab === "todos" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Todos />
        </motion.div>
      )}
    </div>
  );
};

export default HomePage;
