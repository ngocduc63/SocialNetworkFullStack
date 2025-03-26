import { Input, Modal } from 'antd';
import React, { useState } from 'react';
import { IconBin, IconCheck, IconList, IconPen } from './SvgIcon';
import { BASE_PROFILE_IMAGE_URL } from '../../utils/constants';
import Confirm from './Confirm';
import TaskModal from './TaskModal';
import { useDispatch } from 'react-redux';
import { deleteTask, updateTaskStatus } from '../../actions/taskAction';

export default function TaskDetail({ isModalOpen, handleCancel, task }) {
	const { title, content, users, time, assigner, done } = task;
	const dispatch = useDispatch()
	const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
	const [confirmType, setConfirmType] = useState(null);
	const [isTaskModalOpen, setTaskModalOpen] = useState(false);
	const [editingTask, setEditingTask] = useState(null);

	const showConfirm = (event, type) => {
		event.stopPropagation();
		setConfirmType(type);
		setIsModalConfirmOpen(true);
	};

	const handleCloseModalConfirm = () => {
		setIsModalConfirmOpen(false);
		setConfirmType(null);
	};

	const handleOpenTaskModal = () => {
		setEditingTask(task);
		setTaskModalOpen(true);
	};

	const handleCloseTaskModal = () => {
		setEditingTask(null);
		setTaskModalOpen(false);
	};

	const handleConfirmComplete = () => {
		dispatch(updateTaskStatus(task.id, true));
		setIsModalConfirmOpen(false);
	};

	const handleConfirmDelete = () => {
		dispatch(deleteTask(task.id));
		setIsModalConfirmOpen(false);
		handleCancel();
	};

	return (
		<>
			<Modal
				title={<span className="text-lg font-bold">Chi tiết công việc</span>}
				open={isModalOpen}
				onCancel={handleCancel}
				footer={null}
				width={640}>
				<div className="border-t pt-3 flex">
					{/* Trái */}
					<div className="flex flex-col border-r pr-3" style={{ flex: '7' }}>
						<div className="flex-1 min-h-[450px]">
							<div className="flex flex-col space-y-2 pb-3 border-b">
								<h2 className="text-base font-medium">{title}</h2>
								<p className="text-base">{content}</p>
							</div>
							<div className="pt-3 flex flex-col space-y-4">
								<div className="flex space-x-2 items-center">
									<IconList />
									<p className="text-base font-semibold">Hoạt động</p>
								</div>
								<div className="flex space-x-2 items-center">
									<img
										key={assigner.id}
										src={BASE_PROFILE_IMAGE_URL + assigner.avatar}
										alt={`${assigner.name}'s avatar`}
										width={32}
										height={32}
										className="rounded-full"
									/>
									<p className="text-base font-medium">
										{assigner.name} đã giao việc cho bạn
									</p>
								</div>
							</div>
						</div>
						<Input />
					</div>
					{/* Phải */}
					<div style={{ flex: '3' }} className="pl-5 flex flex-col space-y-3">
						<div className="flex flex-col space-y-2 text-base font-medium">
							<p>Trạng thái</p>
							<p>
								{done === false ? (
									<div className="flex items-center">
										<div className="bg-blue-500 w-3 h-3 rounded-full border mr-1"></div>{' '}
										Chưa xong
									</div>
								) : (
									<div className="flex items-center">
										<div className="bg-green-500 w-3 h-3 rounded-full border mr-1"></div>{' '}
										Đã xong
									</div>
								)}
							</p>
						</div>
						<div className="flex flex-col space-y-2 text-base font-medium">
							<p>Ngày hết hạn</p>
							<p>{time}</p>
						</div>
						<div className="flex flex-col space-y-1">
							<p className='text-base font-medium'>Giao cho</p>
							{users?.map((user) => (
								<div className="flex space-x-2 items-center">
									<img
										key={user.id}
										src={user.avatar}
										alt={`${user.name}'s avatar`}
										width={32}
										height={32}
										className="rounded-full"
									/>
									<p className='text-sm font-medium '>{user.name}</p>
								</div>
							))}
						</div>
						<div className="flex flex-col text-base font-medium space-y-1">
							<p>Tác vụ</p>
							<div className="flex flex-col space-y-2">
								<div
									className="border w-full pl-3 py-2 flex space-x-2 hover:cursor-pointer shadow-lg rounded-lg hover:opacity-80"
									onClick={(e) => showConfirm(e, 'complete')}>
									<IconCheck width={24} height={24} />
									<p>Hoàn thành</p>
								</div>
								<div
									className="border w-full pl-3 py-2 flex space-x-2 hover:cursor-pointer shadow-lg rounded-lg hover:opacity-80"
									onClick={handleOpenTaskModal}>
									<IconPen />
									<p>Chỉnh sửa</p>
								</div>
								<div
									className="border w-full pl-3 py-2 flex space-x-2 hover:cursor-pointer shadow-lg rounded-lg hover:opacity-80"
									onClick={(e) => showConfirm(e, 'delete')}>
									<IconBin />
									<p>Xóa công việc</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Modal>
			<Confirm
				isModalOpen={isModalConfirmOpen}
				handleCancel={handleCloseModalConfirm}
				confirmType={confirmType}
				onConfirm={confirmType === 'complete' ? handleConfirmComplete : handleConfirmDelete}
			/>
			<TaskModal
				open={isTaskModalOpen}
				onClose={handleCloseTaskModal}
				task={editingTask}
			/>
		</>
	);
}
