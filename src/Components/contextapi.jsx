import { createContext, useState, useEffect, useCallback } from "react";

export const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (!loading) {
        localStorage.setItem("data", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
    }
  }, [data, loading]);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem("data");
      if (storedData) {
        const parsedData = JSON.parse(storedData);

        // تحقق أن البيانات عبارة عن مصفوفة
        if (!Array.isArray(parsedData)) {
          throw new Error("Invalid data format in localStorage.");
        }

        const sanitizedData = parsedData.map((habit) => ({
          ...habit,
          remainingDays: habit.remainingDays || 0,
          completedToday: habit.completedToday || "",
          completionDates: habit.completionDates || [],
          startDate:
            habit.startDate || habit.createdAt || new Date().toISOString(),
        }));

        setData(sanitizedData);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
      localStorage.removeItem("data"); // مسح البيانات التالفة
    } finally {
      setLoading(false);
    }
  }, []);

  const addData = useCallback(
    (newData) => {
      try {
        if (
          data.some(
            (habit) =>
              habit.habitName.toLowerCase() ===
              newData.habitName.trim().toLowerCase()
          )
        ) {
          return false; // فشل الإضافة بسبب تكرار الاسم
        }

        const habitWithDefaults = {
          ...newData,
          habitName: newData.habitName.trim(),
          habitDescription: newData.habitDescription.trim(),
          startDate: newData.startDate || new Date().toISOString(),
          completionDates: [],
        };

        setData((prevData) => [...prevData, habitWithDefaults]);
        return true;
      } catch (error) {
        console.error("Error adding new data:", error);
        return false;
      }
    },
    [data]
  );

  const deleteData = useCallback((habitName) => {
    setData((prevData) =>
      prevData.filter((habit) => habit.habitName !== habitName)
    );
  }, []);

  const editData = useCallback((habitName, updatedData) => {
    let updated = false;
    setData((prevData) =>
      prevData.map((habit) => {
        if (habit.habitName === habitName) {
          updated = true;
          return {
            ...habit,
            ...Object.fromEntries(
              Object.entries(updatedData).map(([key, value]) => [
                key,
                typeof value === "string" ? value.trim() : value,
              ])
            ),
          };
        }
        return habit;
      })
    );
    return updated;
  }, []);

  const updateDaysLeft = useCallback((habitName) => {
    const currentDate = new Date();
    const todayDate = currentDate.toDateString();

    setData((prevData) =>
      prevData.map((habit) => {
        if (habit.habitName === habitName) {
          const isCompleted = habit.completedToday === todayDate;

          return {
            ...habit,
            remainingDays: isCompleted
              ? habit.remainingDays
              : Math.max(0, habit.remainingDays - 1),
            completedToday: todayDate,
            completionDates: isCompleted
              ? habit.completionDates
              : [...(habit.completionDates || []), todayDate],
          };
        }

        return habit;
      })
    );
  }, []);

  const getMissedDates = (habit) => {
    const today = new Date().toDateString();
    const completedDates = new Set(habit.completionDates || []);

    // استرجاع الأيام الفائتة من التخزين المحلي
    const missedDays = JSON.parse(localStorage.getItem("missedDays")) || {};

    if (!completedDates.has(today)) {
      if (!missedDays[habit.habitName]?.includes(today)) {
        missedDays[habit.habitName] = [
          ...(missedDays[habit.habitName] || []),
          today,
        ];
        localStorage.setItem("missedDays", JSON.stringify(missedDays));
      }
    } else {
      // إزالة اليوم من missedDays إذا تم استكمال العادة
      if (missedDays[habit.habitName]?.includes(today)) {
        missedDays[habit.habitName] = missedDays[habit.habitName].filter(
          (date) => date !== today
        );
        localStorage.setItem("missedDays", JSON.stringify(missedDays));
      }
    }

    return missedDays[habit.habitName] || [];
  };

  const getCompletionRate = () => {
    const totalHabits = data.length;
    if (totalHabits === 0) return 0;

    const totalCompletion = data.reduce((sum, habit) => {
      const completedDays = habit.completionDates.length;
      return sum + completedDays / habit.numberOfDays;
    }, 0);

    return Math.round((totalCompletion / totalHabits) * 100);
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      data.forEach((habit) => {
        const today = new Date().toDateString();
        if (habit.remainingDays > 0 && habit.completedToday !== today) {
          new Notification("Reminder", {
            body: `You haven't completed habit "${habit.habitName}" today!`,
          });
        }
      });
    }
  }, [data]);

  return (
    <ApiContext.Provider
      value={{
        data,
        setData,
        loading,
        setLoading,
        updateDaysLeft,
        addData,
        getMissedDates,
        getCompletionRate,
        deleteData,
        editData,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};
