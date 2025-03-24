import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { IconAddTask, IconCheck } from './SvgIcon';
import TaskModal from './TaskModal';

const Filter = ({ pendingText, doneText, tasksLength }) => {
	return (
		<div className="px-4">
			<Tabs defaultActiveKey="pending">
				<Tabs.TabPane key="pending" tab="Chưa xong">
					<div className="border border-gray-300 rounded-lg p-4 shadow-sm mt-4 text-center text-base">
						{tasksLength === 0 ? (
							<p>{pendingText}</p>
						) : (
							<p>Các công việc chưa xong.</p>
						)}
					</div>
				</Tabs.TabPane>
				<Tabs.TabPane key="done" tab="Đã xong">
					<div className="border border-gray-300 rounded-lg p-4 shadow-sm mt-4 text-center text-base">
						{tasksLength === 0 ? (
							<p>{doneText}</p>
						) : (
							<p>Các công việc đã hoàn thành.</p>
						)}
					</div>
				</Tabs.TabPane>
			</Tabs>
		</div>
	);
};

export default function CustomTabs() {
	const dispatch = useDispatch();
	const { tasks, loading } = useSelector((state) => state.tasks);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const showModal = () => {
		setIsModalOpen(true);
	};
	const handleOk = () => {
		setIsModalOpen(false);
	};
	const handleCancel = () => {
		setIsModalOpen(false);
	};

	useEffect(() => {
		// Gọi API lấy danh sách công việc nếu cần
		console.log(tasks);
	}, [dispatch]);

	return (
		<div className="flex-grow">
			<Tabs className="w-full" type="card">
				<Tabs.TabPane key="1" tab="TÔI GIAO">
					<Filter
						pendingText="Danh sách này sẽ gồm các công việc bạn giao cho người khác mà họ chưa hoàn thành."
						doneText="Danh sách này sẽ gồm các công việc bạn giao cho người khác mà họ đã hoàn thành."
						tasksLength={tasks.length}
					/>
				</Tabs.TabPane>
				<Tabs.TabPane key="2" tab="CẦN LÀM">
					<Filter
						pendingText="Danh sách này sẽ gồm các công việc giao cho bạn mà bạn chưa hoàn thành."
						doneText="Danh sách này sẽ gồm các công việc giao cho bạn mà bạn đã hoàn thành."
						tasksLength={tasks.length}
					/>
				</Tabs.TabPane>
				<Tabs.TabPane key="3" tab="THEO DÕI">
					<Filter
						pendingText="Danh sách này sẽ gồm các công việc giao cho thành viên mà họ chưa hoàn thành, bạn trong danh sách theo dõi."
						doneText="Danh sách này sẽ gồm các công việc giao cho thành viên mà họ đã hoàn thành, bạn trong danh sách theo dõi."
						tasksLength={tasks.length}
					/>
				</Tabs.TabPane>
			</Tabs>
			{tasks.length === 0 && (
				<div className="flex flex-col items-center pt-10">
					<IconCheck />
					<p>Danh sách công việc đang trống</p>
					<span
						className="mt-4 flex gap-1 text-primary-blue hover:cursor-pointer"
						onClick={showModal}>
						<p className="text-lg">Giao việc</p>
						<IconAddTask className={'text-primary-blue'} />
					</span>
				</div>
			)}
			<TaskModal open={isModalOpen} onClose={handleCancel}/>
		</div>
	);
}
