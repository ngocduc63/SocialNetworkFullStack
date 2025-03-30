import { createSelector } from "reselect";
import moment from "moment";

const taskSelector = (state) => state.tasks.tasks;
const filterSelector = (state) => state.filter;
const userSelector = (state) => state.user.user;

export const filteredTasksSelector = createSelector(
  [taskSelector, filterSelector, userSelector],
  (tasks, filter, user) => {
    let filteredTasks = tasks;

    if (filteredTasks.length <= 0) return [];

    const now = new Date();
    const parseTaskTime = (time) => {
      if (!time || time === "Không thời hạn") return null;

      const parts = time.split(" ");
      const [timePart, datePart] = parts;
      const [day, month, year] = datePart.split("-").map(Number);
      const [hour, minute] = timePart.split(":").map(Number);

      const parsedDate = new Date(year, month - 1, day, hour, minute);

      return parsedDate;
    };

    if (filter.type === "assign") {
      filteredTasks = filteredTasks.filter(
        (task) => task.assigner._id === user._id,
      );
    }

    if (filter.type === "need") {
      filteredTasks = filteredTasks.filter((task) =>
        task.users.some((u) => u._id === user._id),
      );
    }

    if (filter.status === "pending") {
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.done === false &&
          (parseTaskTime(task.time) === null ||
            parseTaskTime(task.time) >= now),
      );
    }

    if (filter.status === "done") {
      filteredTasks = filteredTasks.filter((task) => task.done === true);
    }

    if (filter.status === "overdue") {
      filteredTasks = filteredTasks.filter(
        (task) =>
          !task.done &&
          parseTaskTime(task.time) !== null &&
          parseTaskTime(task.time) < now,
      );
    }

    return filteredTasks.sort((a, b) =>
      moment(b.updatedAt).diff(moment(a.updatedAt)),
    );
  },
);

export const taskCountSelector = createSelector(
  [taskSelector, userSelector],
  (tasks, user) => {
    const now = new Date();
    const parseTaskTime = (time) => {
      if (!time || time === "Không thời hạn") return null;

      const parts = time.split(" ");
      const [timePart, datePart] = parts;
      const [day, month, year] = datePart.split("-").map(Number);
      const [hour, minute] = timePart.split(":").map(Number);

      const parsedDate = new Date(year, month - 1, day, hour, minute);

      return parsedDate;
    };

    const countByType = (typeFilter) => {
      const filteredTasks = tasks.filter(typeFilter);

      const pending = filteredTasks.filter(
        (task) =>
          task.done === false &&
          (parseTaskTime(task.time) === null ||
            parseTaskTime(task.time) >= now),
      ).length;

      const done = filteredTasks.filter((task) => task.done).length;

      const overdue = filteredTasks.filter(
        (task) =>
          !task.done &&
          parseTaskTime(task.time) !== null &&
          parseTaskTime(task.time) < now,
      ).length;

      return { pending, done, overdue };
    };

    return {
      assign: countByType((task) => task.assigner._id === user._id),
      need: countByType((task) => task.users.some((u) => u._id === user._id)),
    };
  },
);
