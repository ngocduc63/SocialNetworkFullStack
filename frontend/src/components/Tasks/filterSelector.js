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
		const countByType = (typeFilter) => {
			const filteredTasks = tasks.filter(typeFilter);
			return {
				pending: filteredTasks.filter((task) => !task.done).length,
				done: filteredTasks.filter((task) => task.done).length,
			};
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
