import { Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function SearchTask() {
	const [search, setSearch] = useState('');
    const tasks = useSelector(state => state.tasks)

	const handleChangeInputSearch = (e) => {
		setSearch(e.target.value);
	};

    useEffect(()=>{console.log(tasks)},[search])

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
		</div>
	);
}
