import { create } from "zustand";

// Utility for debounced localStorage update
const debouncedUpdate = (() => {
  let timeout;
  return (key, value) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error("Failed to save to localStorage:", e);
      }
    }, 300);
  };
})();


export const useStore = create((set) => {
  const updateState = (key, stateKey, updater) => {
    set((state) => {
      const updatedState = updater(state[stateKey]);
      debouncedUpdate(key, updatedState);
      return { [stateKey]: updatedState };
    });
  };

  return {
    todos: JSON.parse(localStorage.getItem("todo") || "[]"),
    todosHabit: JSON.parse(localStorage.getItem("todoinhabit") || "[]"),

    // General Todos
    addTodo: (text, dueDate) => {
      updateState("todo", "todos", (todos) => {
        const id = todos.length ? Math.max(...todos.map((todo) => todo.id)) + 1 : 1;
        return [...todos, { id, text, dueDate, done: false }];
      });
    },
    

    removeTodo: (id) => {
      if (window.confirm("Are you sure you want to delete this todo?")) {
        updateState("todo", "todos", (todos) => todos.filter((todo) => todo.id !== id));
      }
    },

    toggleDone: (id) => {
      updateState("todo", "todos", (todos) =>
        todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
      );
    },

    updateTodo: ({ id, text }) => {
      updateState("todo", "todos", (todos) =>
        todos.map((todo) => (todo.id === id ? { ...todo, text } : todo))
      );
    },

    removeAllTodos: () => {
      if (window.confirm("Are you sure you want to delete all todos?")) {
        updateState("todo", "todos", () => []);
      }
    },

    // Habit Todos
    addTodoInHabit: (text, habitName, dueDate) => {
      updateState("todoinhabit", "todosHabit", (todosHabit) => {
        const lastId = todosHabit.reduce((maxId, todo) => Math.max(maxId, todo.id), 0);
        return [...todosHabit, { id: lastId + 1, text, habitName, dueDate, done: false }];
      });
    },
    

    removeTodoInHabit: (id) => {
      if (window.confirm("Are you sure you want to delete this todo?")) {
        updateState("todoinhabit", "todosHabit", (todosHabit) =>
          todosHabit.filter((todo) => todo.id !== id)
        );
      }
    },

    toggleDoneInHabit: (id) => {
      updateState("todoinhabit", "todosHabit", (todosHabit) =>
        todosHabit.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
      );
    },

    updateTodoInHabit: ({ id, text }) => {
      updateState("todoinhabit", "todosHabit", (todosHabit) =>
        todosHabit.map((todo) => (todo.id === id ? { ...todo, text } : todo))
      );
    },

    deleteAllTodosInHabit: (habitName) => {
      if (window.confirm("Are you sure you want to delete all todos in this habit?")) {
        updateState("todoinhabit", "todosHabit", (todosHabit) =>
          todosHabit.filter((todo) => todo.habitName !== habitName)
        );
      }
    },
  };
});
