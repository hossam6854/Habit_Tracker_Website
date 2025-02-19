import { useParams } from "react-router-dom";
import { ApiContext } from "./contextapi";
import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext"; 


function EditHabit() {
  const { habitName } = useParams();
  const { data, editData } = useContext(ApiContext);
  const [message, setMessage] = useState(null);
  const { isDarkMode, toggleDarkMode } = useTheme(); 



  const [habit, setHabit] = useState(null);
  const [formData, setFormData] = useState({
    habitName: "",
    habitDescription: "",
    numberOfDays: 1,
  });

  useEffect(() => {
    const habitData = data.find((item) => item.habitName.trim() === habitName.trim());
    if (habitData) {
      setHabit(habitData);
      setFormData({
        habitName: habitData.habitName,
        habitDescription: habitData.habitDescription,
        numberOfDays: habitData.numberOfDays,
      });
    }
  }, [data, habitName]);

  if (!habit) {
    return <p className="text-center mt-12 text-xl">Habit not found!</p>;
  }


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isSameData =
      habit.habitName.trim() === formData.habitName.trim() &&
      habit.habitDescription.trim() === formData.habitDescription.trim() &&
      habit.numberOfDays === formData.numberOfDays;

    if (isSameData) {
      setMessage({ type: "warning", text: "No changes were made." });
      return;
    }

    if (!formData.habitName.trim() || !formData.habitDescription.trim() || formData.numberOfDays < 1) {
        setMessage({ type: "error", text: "Please fill in all fields and ensure the number of days is at least 1." });
        return;
    }

    if (data.some((item) => item.habitName.toLowerCase() === formData.habitName.toLowerCase() && item.habitName.toLowerCase() !== habitName.toLowerCase())) {
        setMessage({ type: "error", text: "A habit with this name already exists." });
        return;
    }

    const completedDaysCount = habit.completionDates.length;
    const updatedRemainingDays = Math.max(formData.numberOfDays - completedDaysCount, 0);

    const success = editData(habitName, { ...formData, remainingDays: updatedRemainingDays });

    if (success) {
        setMessage({ type: "success", text: "Habit updated successfully!" });
    } else {
        setMessage({ type: "error", text: "Failed to update habit. Please try again." });
    }
};


return (
  <div className={`min-h-screen transition-all duration-300 ${isDarkMode ? "dark" : ""}`}>
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 px-4 py-2 rounded-lg font-bold transition-all shadow-md
        bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 cursor-pointer"
      >
        {isDarkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </button>
      <div className={`max-w-lg mx-auto shadow-2xl rounded-xl p-8 mt-12 ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
  <h2 className="text-3xl font-bold mb-6">Edit Habit</h2>    
  <form onSubmit={handleSubmit}>
    <div className="mb-4">
      <label htmlFor="habitName" className={`block font-medium mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>
        Habit Name
      </label>
      <input
        type="text"
        name="habitName"
        value={formData.habitName}
        onChange={handleInputChange}
        className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
          isDarkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-300" : "border-gray-300 text-black focus:ring-blue-500"
        }`}
      />
    </div>
    <div className="mb-4">
      <label htmlFor="habitDescription" className={`block font-medium mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>
        Habit Description
      </label>
      <textarea
        name="habitDescription"
        value={formData.habitDescription}
        onChange={handleInputChange}
        className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
          isDarkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-300" : "border-gray-300 text-black focus:ring-blue-500"
        }`}
      ></textarea>
    </div>
    <div className="mb-4">
      <label htmlFor="numberOfDays" className={`block font-medium mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>
        Number of Days
      </label>
      <input
        type="number"
        name="numberOfDays"
        value={formData.numberOfDays}
        onChange={handleInputChange}
        className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
          isDarkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-300" : "border-gray-300 text-black focus:ring-blue-500"
        }`}
      />
    </div>
    <button
      type="submit"
      className="w-full py-2 px-4 rounded-lg font-semibold shadow transition-all bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
    >
      Save Changes
    </button>
  </form>

  <Link
    to={`/habit-tracker/${habitName}`}
    className={`mt-2 w-full py-2 px-4 rounded-lg font-semibold shadow transition-all block text-center 
    bg-gray-500 hover:bg-gray-600 text-white`}
  >
    Back to Habit details
  </Link>
    {message && (
      <div className={`mb-4 mt-4 p-4 rounded-lg transition-all text-white ${
        message.type === "success" ? "bg-green-500" :
        message.type === "warning" ? "bg-yellow-500" : "bg-red-500"
      }`}>
        {message.text}
      </div>
    )}
    </div>
  </div>
);
}

export default EditHabit;