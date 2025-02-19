import { useContext, useMemo, useState, Suspense, lazy } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ApiContext } from "./contextapi";
import { useTheme } from "./ThemeContext";
import { motion } from "framer-motion";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import Todos from "./todos";
import "./Css/Calendar.css";
const Calendar = lazy(() => import("react-calendar"));
import { useStore } from "./store";
import { FaHome, FaListUl, FaTasks, FaMoon, FaSun } from "react-icons/fa";


const HabitDetails = () => {
  const { habitName } = useParams();
  const { data, updateDaysLeft, deleteData, getMissedDates } =
    useContext(ApiContext);
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const { isDarkMode } = useTheme();

  const { deleteAllTodosWithHabit } = useStore();

  const habit = useMemo(
    () => data.find((item) => item.habitName.trim() === habitName.trim()),
    [data, habitName]
  );

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (!habit)
    return (
      <div className="text-center mt-12 text-xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Habit not found! Please try again.
        </motion.p>
      </div>
    );

  const handleDayClick = (date) => {
    const today = new Date().toDateString();
    if (date.toDateString() === today) {
      updateDaysLeft(habitName);
      showNotification("You have marked today's challenge as completed!");
    }
  };

  const handleEditHabit = () => {
    navigate(`/edit-habit/${habitName}`);
  };

  const handleDeleteHabit = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this habit?"
    );
    if (!confirmDelete) return;

    deleteData(habitName);
    showNotification("Habit deleted successfully!", "error");
    navigate("/");
  };

  return (
    <div
      className={`habit-details-page p-6 ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Notification */}
      {notification && (
        <motion.div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {notification.message}
        </motion.div>
      )}

      <motion.div
        className="header text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-extrabold">{habit.habitName}</h1>
        <p className="text-lg italic">{habit.habitDescription}</p>
      </motion.div>

      {/* Calendar Section */}
      <motion.div
        className="calendar-container max-w-lg mx-auto mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Suspense fallback={<div>Loading Calendar...</div>}>
          <Calendar
            className={isDarkMode ? "calendar-dark" : "calendar-light"}
            tileClassName={({ date }) => {
              const formattedDate = date.toDateString();
              const completedDates = new Set(habit.completionDates || []);
              const missedDates = new Set(getMissedDates(habit));

              if (completedDates.has(formattedDate)) {
                return "completed-day";
              }
              if (missedDates.has(formattedDate)) {
                return "missed-day";
              }
              return "";
            }}
            onClickDay={handleDayClick}
          />
        </Suspense>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p
          className={`mt-4 ${
            habit.completedToday === new Date().toDateString()
              ? "text-green-600"
              : "text-red-600"
          } font-medium`}
        >
          {habit.remainingDays === 0
            ? "Habit Completed!"
            : habit.completedToday === new Date().toDateString()
            ? "✅ You have completed today's challenge!"
            : "❌ You haven't completed today's challenge yet."}
        </p>
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
            className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold shadow hover:bg-blue-600 disabled:opacity-50 transition-all cursor-pointer"
            disabled={habit.completedToday === new Date().toDateString()}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {habit.completedToday === new Date().toDateString()
              ? "Challenge Completed"
              : "Complete for today"}
          </motion.button>
        )}
        <Tooltip id="complete-tooltip">
          {habit.completedToday === new Date().toDateString()
            ? "You've already completed today's challenge."
            : "Click to mark today's challenge as complete."}
        </Tooltip>
      </motion.div>

      {/* Edit and Delete Habit Buttons */}
      <div className="text-center mt-6 space-x-4">
        <button
          className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-full transition duration-300 cursor-pointer"
          onClick={handleEditHabit}
          data-tooltip-id="edit-tooltip"
        >
          Edit Habit
        </button>
        <Tooltip id="edit-tooltip">Edit your habit details.</Tooltip>

        <button
          className="bg-red-500  text-white font-bold py-2 px-4 rounded-full transition duration-300 cursor-pointer"
          onClick={() => {
            handleDeleteHabit();
            deleteAllTodosWithHabit(habitName);
          }}
          data-tooltip-id="delete-tooltip"
        >
          Delete Habit
        </button>
        <Tooltip id="delete-tooltip">Delete this habit permanently.</Tooltip>
      </div>
    </div>
  );
};

const HabitTracker = () => {
  const { habitName } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("habit");
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div>
       <div
      className={`tabs flex items-center justify-center space-x-4 p-4 shadow-xl  transition-all duration-300
      ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
    >
      <button
        className="flex items-center gap-2 bg-gray-700 text-white py-2 px-5 rounded-lg shadow-md hover:bg-gray-600 transition-all cursor-pointer"
        onClick={() => navigate("/")}
      >
        <FaHome /> Home
      </button>

      <button
        className={`flex items-center gap-2 px-5 py-2 rounded-lg shadow-md transition-all
        ${activeTab === "habit" ? "bg-gray-400 text-white" : "bg-blue-500 hover:bg-blue-400 text-white  cursor-pointer"}`}
        onClick={() => setActiveTab("habit")}
      >
        <FaListUl /> {habitName} Details
      </button>

      <button
        className={`flex items-center gap-2 px-5 py-2 rounded-lg shadow-md transition-all 
        ${activeTab === "todos" ? "bg-gray-400 text-white" : "bg-blue-500 hover:bg-blue-400 text-white cursor-pointer"}`}
        onClick={() => setActiveTab("todos")}
      >
        <FaTasks /> {habitName} Todos
      </button>

      <button
        onClick={toggleDarkMode}
        className="flex items-center gap-2 bg-gray-700 text-white py-2 px-5 rounded-lg shadow-md hover:bg-gray-600 transition-all ml-auto cursor-pointer"
      >
        {isDarkMode ? <FaMoon /> : <FaSun />} {isDarkMode ? "Dark Mode" : "Light Mode"}
      </button>
    </div>
      {activeTab === "habit" ? (
        <HabitDetails />
      ) : (
        <Todos habitName={habitName} />
      )}
    </div>
  );
};

export default HabitTracker;
