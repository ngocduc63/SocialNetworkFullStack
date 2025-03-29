import React, { useState } from 'react';
import { BASE_PROFILE_IMAGE_URL } from '../../utils/constants';
import { IconDots, IconEditTitle } from './SvgIcon';
import Confirm from './Confirm';
import TaskDetail from './TaskDetail';
import { useDispatch } from 'react-redux';
import { updateTaskStatus } from '../../actions/taskAction';

export default function TaskListItem({ task }) {
	const { title, content, users, time, assigner, done } = task;
	const dispatch = useDispatch();
	const [isTaskDetailOpen, setTaskDetailOpen] = useState(false);
	const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);

	const showConfirm = (event) => {
		event.stopPropagation();
		setIsModalConfirmOpen(true);
	};

	const handleCloseModalConfirm = () => {
		setIsModalConfirmOpen(false);
	};

	const handleTaskDetailOpen = () => {
		setTaskDetailOpen(true);
	};

	const handleCloseTaskDetail = () => {
		setTaskDetailOpen(false);
	};

	const handleConfirmComplete = () => {
		!done
			? dispatch(updateTaskStatus(task.id, true))
			: dispatch(updateTaskStatus(task.id, false));
		setIsModalConfirmOpen(false);
	};

	return (
		<>
			<div
				className="px-2 py-3 border rounded-lg shadow-sm flex items-center gap-3 group hover:cursor-pointer hover:bg-slate-50 hover:shadow-lg"
				onClick={handleTaskDetailOpen}>
				{/* Avatar + Checkbox */}
				<div className="flex items-center">
					<div className="flex -space-x-2 group-hover:hidden">
						<div className="relative w-8 h-8">
							<img
								// src={BASE_PROFILE_IMAGE_URL + users[0]?.avatar}
								src={users[0]?.avatar}
								alt={`${users[0]?.name}'s avatar`}
								className="w-8 h-8 rounded-full"
							/>

							{users.length > 1 && (
								<div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
									+{users.length - 1}
								</div>
							)}
						</div>
					</div>

					{/* Checkbox (Hiện khi hover) */}
					<input
						type="checkbox"
						className="hidden group-hover:block w-5 h-5 m-1 hover:cursor-pointer"
						onClick={showConfirm}
						checked={done}
					/>
				</div>

				{/* Nội dung công việc */}
				<div className="flex-1 space-y-1">
					<span className="flex">
						<p className="font-semibold 2xl:text-sm text-xs">
							{title === '' ? '(Không có tiêu đề)' : title}
						</p>
						<span className="hidden group-hover:block">
							<IconEditTitle />
						</span>
					</span>
					<p className="2xl:text-sm text-xs text-gray-600">{content}</p>
					<div className="2xl:flex justify-between items-center text-xs 2xl:text-sm">
						{done === false ? (
							<p className=" text-gray-600">Chưa xong</p>
						) : (
							<p className=" text-green-500">Đã xong</p>
						)}
						<p className="text-gray-600">Thời hạn: {time}</p>
					</div>
				</div>
				<div className="cursor-pointer">
					<IconDots />
				</div>
			</div>
			<Confirm
				isModalOpen={isModalConfirmOpen}
				handleCancel={handleCloseModalConfirm}
				confirmType={!done ? 'complete' : 'again'}
				onConfirm={handleConfirmComplete}
			/>
			<TaskDetail
				isModalOpen={isTaskDetailOpen}
				handleCancel={handleCloseTaskDetail}
				task={task}
			/>
		</>
	);
}
