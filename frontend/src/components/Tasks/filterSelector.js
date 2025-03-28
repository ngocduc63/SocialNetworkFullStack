import { createSelector } from 'reselect';

const taskSelector = (state) => state.tasks.tasks;
const filterSelector = (state) => state.filter;
const userSelector = (state) => state.user.user;

export const filteredTasksSelector = createSelector(
	[taskSelector, filterSelector, userSelector],
	(tasks, filter, user) => {
		let filteredTasks = tasks;
		if (filter.type === 'assign') {
			filteredTasks = filteredTasks.filter(
				(task) => task.assigner.id === user._id
			);
		}

		if (filter.type === 'need') {
			filteredTasks = filteredTasks.filter((task) =>
				task.users.some((u) => u.id === user._id)
			);
		}

		if (filter.status === 'pending') {
			filteredTasks = filteredTasks.filter((task) => task.done === false);
		}

		if (filter.status === 'done') {
			filteredTasks = filteredTasks.filter((task) => task.done === true);
		}

		return filteredTasks;
	}
);

export const taskCountSelector = createSelector(
	[taskSelector, userSelector],
	(tasks, user) => {
		const now = new Date();
		console.log(tasks);
		const parseTaskTime = (time) => {
			if (!time || time === 'Không thời hạn') return null;

			const parts = time.split(' ');
			console.log(parts);
			const [timePart, datePart] = parts;
			const [day, month, year] = datePart.split('-').map(Number);
			const [hour, minute] = timePart.split(':').map(Number);

			const parsedDate = new Date(year, month - 1, day, hour, minute);

			return parsedDate;
		};

		const countByType = (typeFilter) => {
			const filteredTasks = tasks.filter(typeFilter);

			const pending = filteredTasks.filter(
				(task) =>
					task.done === false &&
					(parseTaskTime(task.time) === null || parseTaskTime(task.time) >= now)
			).length;

			const done = filteredTasks.filter((task) => task.done).length;

			const overdue = filteredTasks.filter(
				(task) =>
					!task.done &&
					parseTaskTime(task.time) !== null &&
					parseTaskTime(task.time) < now
			).length;

			return { pending, done, overdue };
		};

		return {
			assign: countByType((task) => task.assigner.id === user._id),
			need: countByType((task) => task.users.some((u) => u.id === user._id)),
			follow: countByType((task) =>
				task.followers?.some((u) => u.id === user._id)
			),
		};
	}
);
