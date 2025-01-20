import { useState } from "react";
import { useStore } from "./store";
import { useTheme } from "./ThemeContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const TodoPage = ({ habitName, showInput = true }) => {
  const {
    todos,
    todosHabit,
    addTodo,
    addTodoInHabit,
    removeTodo,
    toggleDone,
    updateTodo,
    removeTodoInHabit,
    toggleDoneInHabit,
    updateTodoInHabit,
  } = useStore();

  const { isDarkMode } = useTheme();
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [activeTab, setActiveTab] = useState("daily");
  const [activeDay, setActiveDay] = useState(null);
  const [message, setMessage] = useState(null);

  const handleAddTask = (isHabitTask) => {
    if (!task.trim()) return;

    if (activeTab === "daily" && !dueDate) {
      setMessage({
        type: "error",
        text: "Please select a date for the daily task.",
      });
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    if (!dueDate || dayjs(dueDate).isAfter(dayjs().subtract(1, "day"))) {
      if (isHabitTask) {
        addTodoInHabit(task.trim(), habitName, dueDate || null);
      } else {
        addTodo(task.trim(), dueDate || null);
      }
      setTask("");
      setDueDate("");
    }
  };

  const todosToRender = habitName
    ? todosHabit.filter((todo) => todo.habitName === habitName)
    : todos;

  const groupedTasks = todosToRender.reduce((acc, todo) => {
    const dateKey = todo.dueDate
      ? dayjs(todo.dueDate).format("YYYY-MM-DD")
      : "general";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(todo);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedTasks)
    .filter((date) => date !== "general")
    .sort();

  const today = dayjs().format("YYYY-MM-DD");
  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");

  return (
    <div
      className={`p-6 min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <h1 className="text-4xl font-bold text-center mb-6">
        {habitName || "Task Manager"}
      </h1>

      <div className="flex mb-4 border-b">
        <button
          className={`px-4 py-2 ${
            activeTab === "daily"
              ? "border-b-2 border-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("daily")}
        >
          Daily
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "general"
              ? "border-b-2 border-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("general")}
        >
          General
        </button>
      </div>

      {showInput && (
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            className={`border rounded-lg p-3 w-full ${
              isDarkMode ? "text-black" : ""
            }`}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Add a new task..."
          />
          {activeTab === "daily" && (
            <input
              type="date"
              className={`border rounded-lg p-3 ${isDarkMode ? "bg-gray-800 text-white" : ""}`}
              value={dueDate}
              min={today}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="Choose a date for the daily task"
            />
          )}

          <button
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
            onClick={() => handleAddTask(!!habitName)}
          >
            ➕ Add
          </button>
        </div>
      )}

      {activeTab === "daily" && (
        <div>
          <div className="flex space-x-4 mb-6 overflow-x-auto">
            {sortedDates.map((date) => (
              <button
                key={date}
                className={`px-4 py-2 rounded-lg ${
                  activeDay === date ? "bg-blue-500 text-white" : "bg-gray-300"
                }`}
                onClick={() => setActiveDay(date)}
              >
                {date === today
                  ? "📆 Today"
                  : date === tomorrow
                  ? "🌅 Tomorrow"
                  : dayjs(date).format("ddd, MMM D")}
              </button>
            ))}
          </div>
          {activeDay && groupedTasks[activeDay] && (
            <TaskSection
              title={dayjs(activeDay).format("dddd, MMM D")}
              tasks={groupedTasks[activeDay]}
              {...{
                habitName,
                toggleDone,
                removeTodo,
                updateTodo,
                toggleDoneInHabit,
                removeTodoInHabit,
                updateTodoInHabit,
              }}
            />
          )}
        </div>
      )}

      {activeTab === "general" && (
        <TaskSection
          title="📝 General Tasks"
          tasks={groupedTasks["general"] || []}
          {...{
            habitName,
            toggleDone,
            removeTodo,
            updateTodo,
            toggleDoneInHabit,
            removeTodoInHabit,
            updateTodoInHabit,
          }}
        />
      )}

      {message && (
        <div
          className={`p-4 rounded-lg shadow-lg ${
            message.type === "success"
              ? "bg-green-200 text-green-800"
              : message.type === "warning"
              ? "bg-yellow-200 text-yellow-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      
    </div>
  );
};

const TaskSection = ({
  title,
  tasks,
  toggleDone,
  removeTodo,
  updateTodo,
  habitName,
  toggleDoneInHabit,
  removeTodoInHabit,
  updateTodoInHabit,
}) => (
  <div className="mt-6 p-6 rounded-lg shadow-lg bg-white text-black">
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    <ul className="space-y-3">
      {tasks.map((todo) => (
        <li
          key={todo.id}
          className={`p-4 rounded-lg shadow flex justify-between items-center ${
            todo.done ? "bg-green-200" : "bg-gray-100"
          }`}
        >
          <span
            className={`text-lg ${
              todo.done ? "line-through text-gray-500" : ""
            }`}
          >
            {todo.text}{" "}
            {todo.dueDate && `- 📅 ${dayjs(todo.dueDate).format("MMM D")}`}
          </span>
          <div className="space-x-2 flex">
            <button
              className="text-green-500 text-xl"
              onClick={() =>
                habitName ? toggleDoneInHabit(todo.id) : toggleDone(todo.id)
              }
            >
              ✔️
            </button>
            <button
              className="text-red-500 text-xl"
              onClick={() =>
                habitName ? removeTodoInHabit(todo.id) : removeTodo(todo.id)
              }
            >
              ❌
            </button>
            <button
              className="text-blue-500 text-xl"
              onClick={() => {
                const newText = prompt("Update task", todo.text);
                if (newText)
                  habitName
                    ? updateTodoInHabit(todo.id, newText)
                    : updateTodo(todo.id, newText);
              }}
            >
              ✏️
            </button>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default TodoPage;
