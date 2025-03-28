import React, { useState } from 'react';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { taskCountSelector } from './filterSelector';
import { Select } from 'antd';

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

export default function ChartAboutTask() {
	const tasksCount = useSelector(taskCountSelector);
	const [selectedType, setSelectedType] = useState('assign'); 

	
	const handleChange = (value) => {
		setSelectedType(value);
	};

	
	const data = {
		labels: ['Chưa xong', 'Đã xong', 'Quá hạn'],
		datasets: [
			{
				label: '',
				data: [
					tasksCount[selectedType]?.pending || 0,
					tasksCount[selectedType]?.done || 0,
					tasksCount[selectedType]?.overdue || 0,
				],
				backgroundColor: [
					'rgb(128, 0, 128)',
					'rgb(0, 128, 0)',
					'rgb(255, 0, 0)',
				],
				barThickness: 40,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			title: {
				display: true,
				text: 'Thống kê công việc',
				font: { size: 24, weight: 'bold' },
				color: 'black',
			},
		},
		scales: {
			x: { grid: { display: true, color: 'rgba(200, 200, 200, 0.5)' } },
			y: {
				display: true,
				grid: { display: true, color: 'rgba(200, 200, 200, 0.5)' },
				ticks: { stepSize: 1 },
			},
		},
	};

	return (
		<>
			<Select
				defaultValue="assign"
				style={{ marginBottom: 20 }}
				onChange={handleChange} 
				options={[
					{ value: 'assign', label: 'TÔI GIAO' },
					{ value: 'need', label: 'CẦN LÀM' },
					{ value: 'follow', label: 'THEO DÕI' },
				]}
			/>
			<div style={{ height: '500px' }}>
				<Bar options={options} data={data} />
			</div>
		</>
	);
}
