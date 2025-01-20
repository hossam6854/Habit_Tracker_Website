import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ApiContext } from "./contextapi";
import { useTheme } from "./ThemeContext";

const AddHabit = () => {
  const { addData } = useContext(ApiContext); 
  const { isDarkMode, toggleDarkMode } = useTheme(); 

  const [formData, setFormData] = useState({
    habitName: "",
    habitDescription: "",
    numberOfDays: 0,
  });
  const [message, setMessage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === "numberOfDays" ? Math.max(0, parseInt(value) || 0) : value,
    }));
  };

  const validateForm = () => {
    if (!formData.habitName.trim()) return "Habit name is required.";
    if (!formData.habitDescription.trim())
      return "Habit description is required.";
    if (
      formData.numberOfDays <= 0 ||
      !Number.isInteger(Number(formData.numberOfDays))
    )
      return "Number of days must be a positive integer.";
    return null; // No errors
  };

  const resetForm = () => {
    setFormData({ habitName: "", habitDescription: "", numberOfDays: 0 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errorMessage = validateForm();

    if (errorMessage) {
      setMessage({ type: "error", text: errorMessage });
      return;
    }

    const success = addData({
      ...formData,
      remainingDays: formData.numberOfDays,
    });

    if (success) {
      resetForm();
      setMessage({ type: "success", text: "Habit added successfully!" });
    } else {
      setMessage({
        type: "error",
        text: "A habit with this name already exists!",
      });
    }
  };

  return (
    <div className={`add-habit-page p-6 min-h-screen flex flex-col items-center transition-all duration-300 ${
      isDarkMode ? "bg-gray-900 text-white" : "bg-gradient-to-r from-blue-50 via-white to-blue-50 text-gray-800"
    }`}>
      
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 px-4 py-2 rounded-lg font-bold transition-all shadow-md
        bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
      >
        {isDarkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </button>

      <h2 className="text-3xl font-bold mb-6">Add a New Habit</h2>

      <form onSubmit={handleSubmit} className={`p-6 rounded-xl shadow-lg w-full max-w-md transition-all duration-300 ${
        isDarkMode ? "bg-gray-800 text-white border border-gray-700" : "bg-white text-gray-800"
      }`}>
        
        <div className="mb-4">
          <label className="block font-semibold mb-2" htmlFor="habitName">Habit Name</label>
          <input
            type="text"
            id="habitName"
            name="habitName"
            value={formData.habitName}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              isDarkMode ? "bg-gray-700 border-gray-600 focus:ring-blue-300" : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="e.g., Morning Run"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2" htmlFor="habitDescription">Habit Description</label>
          <textarea
            id="habitDescription"
            name="habitDescription"
            value={formData.habitDescription}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              isDarkMode ? "bg-gray-700 border-gray-600 focus:ring-blue-300" : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="e.g., Run 2 km every morning"
            required
          ></textarea>
        </div>

        <div className="mb-6">
          <label className="block font-semibold mb-2" htmlFor="numberOfDays">Number of Days</label>
          <input
            id="numberOfDays"
            name="numberOfDays"
            value={formData.numberOfDays}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              isDarkMode ? "bg-gray-700 border-gray-600 focus:ring-blue-300" : "border-gray-300 focus:ring-blue-500"
            }`}
            min={1}
            placeholder="e.g., 30"
            required
          />
        </div>

        <button type="submit" className="w-full py-3 rounded-lg font-bold transition-all
          bg-blue-500 text-white hover:bg-blue-600">
          Add Habit
        </button>

        {message && (
          <div className={`p-4 rounded-lg text-center mb-4 mt-4 transition-all ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {message.text}
          </div>
        )}
      </form>

      <Link to="/" className="mt-6 font-medium transition-all hover:underline">
        ← Back to Home
      </Link>
    </div>
  );
};

export default AddHabit;