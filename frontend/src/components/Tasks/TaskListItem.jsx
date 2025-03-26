import React, { useState } from 'react';
import { BASE_PROFILE_IMAGE_URL } from '../../utils/constants';
import { IconDots, IconEditTitle } from './SvgIcon';
import Confirm from './Confirm';
import TaskDetail from './TaskDetail';
import { useDispatch } from 'react-redux';
import { updateTaskStatus } from '../../actions/taskAction';

export default function TaskListItem({ task }) {
	const { title, content, users, time, assigner, done } = task;
	const dispatch = useDispatch()
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
		dispatch(updateTaskStatus(task.id, true));
		setIsModalConfirmOpen(false);
	};

	return (
		<>
			<div
				className="p-3 border rounded-lg shadow-sm flex items-center gap-3 group hover:cursor-pointer hover:bg-slate-50"
				onClick={handleTaskDetailOpen}>
				{/* Avatar + Checkbox */}
				<div className="flex items-center">
					
					<div className="flex -space-x-2 group-hover:hidden">
						<div className="relative w-8 h-8">
							
							<img
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
				<div className="flex-1">
					<span className="flex">
						<p className="font-semibold text-sm">
							{title === '' ? '(Không có tiêu đề)' : title}
						</p>
						<span className="hidden group-hover:block">
							<IconEditTitle />
						</span>
					</span>
					<p className="text-sm text-gray-600">{content}</p>
					{done === false ? (
						<p className="text-sm text-gray-600">Chưa xong</p>
					) : (
						<p className="text-sm text-green-500">Đã xong</p>
					)}
				</div>
				<div className="cursor-pointer">
					<IconDots />
				</div>
			</div>
			<Confirm
				isModalOpen={isModalConfirmOpen}
				handleCancel={handleCloseModalConfirm}
				confirmType={'complete'}
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
