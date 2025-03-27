import { useEffect, useState } from 'react';
import CustomTabs from './CustomTabs';
import { IconAddTask, IconChart, IconMag, IconTask } from './SvgIcon';
import TaskModal from './TaskModal';
import { useDispatch, useSelector } from 'react-redux';
import TaskListItem from './TaskListItem';
import { filteredTasksSelector } from './filterSelector';
import { Tabs } from 'antd';
import SearchTask from './SearchTask';
// import { getTasks } from '../../actions/taskAction';
const Tasks = () => {
	const { tasks } = useSelector((state) => state.tasks);
	const filterTasks = useSelector(filteredTasksSelector);
	// const dispatch = useDispatch();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const showModal = () => {
		setIsModalOpen(true);
	};
	const handleCancel = () => {
		setIsModalOpen(false);
	};
	const items = [
		{
			label: <IconTask />,
			key: 'task',
			children: (
				<div className="min-h-full">
					<CustomTabs
						isModalOpen={isModalOpen}
						showModal={showModal}
						handleCancel={handleCancel}
						tasks={tasks}
					/>
					<div
						className="space-y-3 overflow-y-auto  2xl:max-h-[550px] max-h-[530px]"
						style={{
							scrollbarWidth: 'none',
							msOverflowStyle: 'none',
							// scrollbarWidth: 'thin',
							// scrollbarColor: '#888 #f1f1f1',
						}}>
						{filterTasks?.map((t) => (
							<TaskListItem task={t} key={t.id} />
						))}
					</div>
				</div>
			),
		},
		{
			label: <IconMag />,
			key: 'search',
			children: (
				<div>
					<SearchTask />
				</div>
			),
		},
		{
			label: <IconChart />,
			key: 'chart',
			children: <div>chart</div>,
		},
	];
	useEffect(() => {
		// Fake tạm thời
		// dispatch(getTasks());
	}, [filterTasks]);
	return (
		<div>
			<div className=" justify-between px-4 py-2">
				<Tabs
					tabBarExtraContent={{
						left: (
							<div className="flex items-center gap-2 2xl:mr-44  mr-10">
								<span className="font-semibold text-xl">To-Do</span>
								<div onClick={showModal}>
									<IconAddTask />
								</div>
							</div>
						),
					}}
					defaultActiveKey="task"
					items={items}
					size="small"
					type="line"
					tabBarGutter={10}
					tabBarStyle={{
						display: 'flex',
						justifyContent: 'center', // Đảm bảo tabs nằm giữa
					}}
				/>
			</div>
			{/* Tabs */}

			<TaskModal open={isModalOpen} onClose={handleCancel} />
		</div>
	);
};

export default Tasks;
