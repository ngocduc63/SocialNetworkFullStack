import { Input } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import TaskListItem from './TaskListItem';
import { debounce } from 'lodash';

export default function SearchTask() {
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const tasks = useSelector((state) => state.tasks.tasks);

	const debouncedSetSearch = useCallback(
		debounce((value) => setDebouncedSearch(value), 300),
		[]
	);

	useEffect(() => {
		return () => {
			debouncedSetSearch.cancel();
		};
	}, [debouncedSetSearch]);

	const handleChangeInputSearch = (e) => {
		setSearch(e.target.value);
		debouncedSetSearch(e.target.value);
	};

	const filteredTasks = useMemo(() => {
		if (!debouncedSearch) return tasks;
		return tasks?.filter(
			(task) =>
				task.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
				task.content.toLowerCase().includes(debouncedSearch.toLowerCase())
		);
	}, [debouncedSearch, tasks]);
	return (
		<div>
			<div className="flex flex-col gap-2">
				<p className="text-lg font-semibold">Tìm kiếm công việc</p>
				<Input
					placeholder="Tìm kiếm công việc"
					className="text-base"
					name="search"
					value={search}
					onChange={handleChangeInputSearch}
				/>
			</div>
			<div
				className="space-y-3 overflow-y-auto 2xl:max-h-[580px] max-h-[550px] mt-4"
				style={{
					scrollbarWidth: 'none',
					msOverflowStyle: 'none',
					// scrollbarWidth: 'thin',
					// scrollbarColor: '#888 #f1f1f1',
				}}>
				{filteredTasks.length > 0 ? (
					filteredTasks.map((t) => <TaskListItem task={t} key={t.id} />)
				) : (
					<p className="text-gray-500 text-center mt-4">
						Không tìm thấy công việc nào.
					</p>
				)}
			</div>
		</div>
	);
}
