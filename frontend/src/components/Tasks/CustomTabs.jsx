import React, { useEffect } from 'react';
import { Tabs } from 'antd';
import { IconAddTask, IconCheck } from './SvgIcon';
import TaskModal from './TaskModal';
import TaskListItem from './TaskListItem';

const Filter = ({ pendingText, doneText, tasksLength }) => {
	return (
		<div className="px-4">
			<Tabs defaultActiveKey="pending">
				<Tabs.TabPane key="pending" tab="Chưa xong">
					{tasksLength === 0 ? (
						<div className="border border-gray-300 rounded-lg p-4 shadow-sm mt-4 text-center text-base">
							<p>{pendingText}</p>
						</div>
					) : (
						<div></div>
					)}
				</Tabs.TabPane>
				<Tabs.TabPane key="done" tab="Đã xong">
					{tasksLength === 0 ? (
						<div className="border border-gray-300 rounded-lg p-4 shadow-sm mt-4 text-center text-base">
							<p>{doneText}</p>
						</div>
					) : (
						<div></div>
					)}
				</Tabs.TabPane>
			</Tabs>
		</div>
	);
};

export default function CustomTabs({isModalOpen,showModal,handleCancel,tasks}) {

	useEffect(() => {
		// Gọi API lấy danh sách công việc nếu cần
		
	}, []);

	return (
		<div className="">
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
					<IconCheck width={120} height={120}/>
					<p>Danh sách công việc đang trống</p>
					<span
						className="mt-4 flex gap-1 text-primary-blue hover:cursor-pointer"
						onClick={showModal}>
						<p className="text-lg">Giao việc</p>
						<IconAddTask className={'text-primary-blue'} />
					</span>
				</div>
			)}
			<TaskModal open={isModalOpen} onClose={handleCancel} />
			
		</div>
	);
}
