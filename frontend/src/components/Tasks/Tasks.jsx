import { useEffect, useState } from 'react';
import CustomTabs from './CustomTabs';
import { IconAddTask, IconChart, IconMag } from './SvgIcon';
import TaskModal from './TaskModal';
import { useDispatch, useSelector } from 'react-redux';
import { getTasks } from '../../actions/taskAction';
import TaskListItem from './TaskListItem';

const Tasks = () => {
	const { tasks } = useSelector((state) => state.tasks);
	const dispatch = useDispatch();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const showModal = () => {
		setIsModalOpen(true);
	};
	const handleCancel = () => {
		setIsModalOpen(false);
	};
	useEffect(() => {
		// Fake tạm thời
		dispatch(getTasks());
		console.log(tasks);
	}, [tasks]);
	return (
		<>
			<div className="flex justify-between px-4 py-2 ">
				<div className="flex gap-1">
					<span className="font-semibold text-xl">To-Do</span>
					<div onClick={showModal}>
						<IconAddTask />
					</div>
				</div>
				<div className="flex gap-1">
					<IconMag />
					<IconChart />
				</div>
			</div>
			<TaskModal open={isModalOpen} onClose={handleCancel} />
			{/* Tabs */}
			<CustomTabs
				isModalOpen={isModalOpen}
				showModal={showModal}
				handleCancel={handleCancel}
				tasks={tasks}
			/>
			<div className='px-4 space-y-4'>
				{tasks?.map((t) => (
					<TaskListItem {...t} key={t.id} />
				))}
			</div>
		</>
	);
};

export default Tasks;
