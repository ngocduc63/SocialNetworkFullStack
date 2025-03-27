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
				<>
					<CustomTabs
						isModalOpen={isModalOpen}
						showModal={showModal}
						handleCancel={handleCancel}
						tasks={tasks}
					/>
					<div className="2xl:px-4 space-y-4">
						{filterTasks?.map((t) => (
							<TaskListItem task={t} key={t.id} />
						))}
					</div>
				</>
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
			<div className=" justify-between px-4 py-2 ">
				{/* <div className="flex gap-1">
					<span className="font-semibold text-xl">To-Do</span>
					<div onClick={showModal}>
						<IconAddTask />
					</div>
				</div> */}

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
