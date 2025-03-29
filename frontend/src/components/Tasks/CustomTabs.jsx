import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import { IconAddTask, IconCheck } from './SvgIcon';
import TaskModal from './TaskModal';
import { useDispatch, useSelector } from 'react-redux';
import { setStatus, setType } from '../../actions/filterAction';
import { taskCountSelector } from './filterSelector';

const Filter = ({ pendingText, doneText, taskCountPending, taskCountDone }) => {
	const dispatch = useDispatch();
	const status = useSelector((state) => state.filter.status);
	return (
		<div className="">
			<Tabs
				size="small"
				defaultActiveKey="pending"
				activeKey={status}
				tabBarGutter={10}
				onChange={(key) => dispatch(setStatus(key))}>
				<Tabs.TabPane
					key="pending"
					tab={
						<p className="2xl:text-sm text-xs">
							Chưa xong
							<span className="ml-1 bg-blue-400 rounded-full px-1 text-white">
								{taskCountPending}
							</span>
						</p>
					}>
					{taskCountPending === 0 ? (
						<div className="border border-gray-300 rounded-lg 2xl:p-4 xl:p-3 shadow-sm 2xl:mt-4 xl:mt-1 text-center 2xl:text-base text-xs">
							<p>{pendingText}</p>
						</div>
					) : (
						<div></div>
					)}
				</Tabs.TabPane>
				<Tabs.TabPane
					key="done"
					tab={
						<p className="2xl:text-sm text-xs">
							Đã xong
							<span className="ml-1 bg-blue-400 rounded-full px-1 text-white">
								{taskCountDone}
							</span>
						</p>
					}>
					{taskCountDone === 0 ? (
						<div className="border border-gray-300 rounded-lg 2xl:p-4 xl:p-3 shadow-sm 2xl:mt-4 xl:mt-1 text-center 2xl:text-base text-xs">
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

export default function CustomTabs({
	isModalOpen,
	showModal,
	handleCancel,
	tasks,
}) {
	const dispatch = useDispatch();
	const taskCount = useSelector(taskCountSelector);
	const [width, setWidth] = useState(window.innerWidth >= 1536 ? 120 : 80);
	useEffect(() => {
		const handleResize = () => {
			setWidth(window.innerWidth >= 1536 ? 120 : 80);
		};
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);
	return (
		<>
			<div className="h-full">
				<Tabs
					size="small"
					type={'card'}
					defaultActiveKey="pending"
					tabBarStyle={{
						display: 'flex',
						justifyContent: 'center',
						padding: 0,
					}}
					tabBarGutter={5}
					onChange={(key) => {
						dispatch(setType(key));
					}}>
					<Tabs.TabPane
						key="assign"
						tab={
							<p className="text-xs 2xl:text-sm px-2 py-1">
								TÔI GIAO{' '}
								<span className="ml-1 bg-blue-400 rounded-full px-1 text-white">
									{taskCount.assign.pending}
								</span>
							</p>
						}>
						<Filter
							pendingText="Danh sách này sẽ gồm các công việc bạn giao cho người khác mà họ chưa hoàn thành."
							doneText="Danh sách này sẽ gồm các công việc bạn giao cho người khác mà họ đã hoàn thành."
							taskCountPending={taskCount.assign.pending}
							taskCountDone={taskCount.assign.done}
						/>
					</Tabs.TabPane>

					<Tabs.TabPane
						key="need"
						tab={
							<p className="text-xs 2xl:text-sm px-2 py-1">
								CẦN LÀM{' '}
								<span className="ml-1 bg-blue-400 rounded-full px-1 text-white">
									{taskCount.need.pending}
								</span>
							</p>
						}>
						<Filter
							pendingText="Danh sách này sẽ gồm các công việc giao cho bạn mà bạn chưa hoàn thành."
							doneText="Danh sách này sẽ gồm các công việc giao cho bạn mà bạn đã hoàn thành."
							taskCountPending={taskCount.need.pending}
							taskCountDone={taskCount.need.done}
						/>
					</Tabs.TabPane>
					{/* <Tabs.TabPane
					key="3"
					tab={<p className="text-sm px-2 py-1">THEO DÕI</p>}>
					<Filter
						pendingText="Danh sách này sẽ gồm các công việc giao cho thành viên mà họ chưa hoàn thành, bạn trong danh sách theo dõi."
						doneText="Danh sách này sẽ gồm các công việc giao cho thành viên mà họ đã hoàn thành, bạn trong danh sách theo dõi."
						taskCountPending={taskCount.follow.pending}
						taskCountDone={taskCount.follow.done}
					/>
				</Tabs.TabPane> */}
				</Tabs>

				{tasks.length === 0 && (
					<div className="flex flex-col items-center  2xl:pt-10 pt-3">
						<IconCheck width={width} height={width} />
						<p className="2xl:text-base xl:text-sm">
							Danh sách công việc đang trống
						</p>
						<span
							className="2xl:mt-4 xl:mt-2 flex items-center gap-1 text-primary-blue hover:cursor-pointer"
							onClick={showModal}>
							<p className="2xl:text-xl xl:text-base">Giao việc</p>
							<IconAddTask className={'text-primary-blue'} />
						</span>
					</div>
				)}
			</div>
			<TaskModal open={isModalOpen} onClose={handleCancel} />
		</>
	);
}
