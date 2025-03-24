import React from 'react';
import { Tooltip } from 'antd';
import { Link } from 'react-router-dom';

export const ReplyIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		className="w-5 h-5 text-gray-600">
		<path d="M10 9V5l-7 7 7 7v-4.1c3.9 0 6.5 1.2 8.3 3.7-.8-3.8-3.6-7.2-8.3-7.6z" />
	</svg>
);

export const IconAddImage = () => {
	return (
		<svg
			className="cursor-pointer"
			aria-label="Add Photo or Video"
			color="#262626"
			fill="#262626"
			height="24"
			role="img"
			viewBox="0 0 24 24"
			width="24">
			<path
				d="M6.549 5.013A1.557 1.557 0 108.106 6.57a1.557 1.557 0 00-1.557-1.557z"
				fillRule="evenodd"></path>
			<path
				d="M2 18.605l3.901-3.9a.908.908 0 011.284 0l2.807 2.806a.908.908 0 001.283 0l5.534-5.534a.908.908 0 011.283 0l3.905 3.905"
				fill="none"
				stroke="currentColor"
				strokeLinejoin="round"
				strokeWidth="2"></path>
			<path
				d="M18.44 2.004A3.56 3.56 0 0122 5.564h0v12.873a3.56 3.56 0 01-3.56 3.56H5.568a3.56 3.56 0 01-3.56-3.56V5.563a3.56 3.56 0 013.56-3.56z"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"></path>
		</svg>
	);
};

export const IconLike = ({ handleSubmit }) => {
	return (
		<svg
			onClick={(e) => handleSubmit(e, '❤️')}
			className="hover:opacity-70 cursor-pointer"
			aria-label="Like"
			color="#262626"
			fill="#262626"
			height="24"
			role="img"
			viewBox="0 0 24 24"
			width="24">
			<path d="M16.792 3.904A4.989 4.989 0 0121.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 014.708-5.218 4.21 4.21 0 013.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 013.679-1.938m0-2a6.04 6.04 0 00-4.797 2.127 6.052 6.052 0 00-4.787-2.127A6.985 6.985 0 00.5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 003.518 3.018 2 2 0 002.174 0 45.263 45.263 0 003.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 00-6.708-7.218z"></path>
		</svg>
	);
};

export const IconTask = () => {
	return (
		<Tooltip placement="bottom" title="Task" className="cursor-pointer">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width={27}
				height={27}
				color="#262626"
				className="font-bold"
				viewBox="0 0 24 24">
				<path
					// fill="#000"
					strokeWidth={0.6}
					stroke="#000"
					d="M6 5h2.5a3 3 0 0 1 3-3a3 3 0 0 1 3 3H17a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3m0 1a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1v3H7V6zm2 2h7V6H8zm3.5-5a2 2 0 0 0-2 2h4a2 2 0 0 0-2-2m5.65 8.6L10 18.75l-3.2-3.2l.7-.71l2.5 2.5l6.44-6.45z"></path>
			</svg>
		</Tooltip>
	);
};

export const IconMessage = () => {
	return (
		<Link to={'/direct/inbox'}>
			<Tooltip placement="bottom" title="message" className="cursor-pointer">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width={27}
					height={27}
					viewBox="0 0 24 24">
					<path
						fill="#000"
						d="M3 20.59L6.59 17H18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2zM3 22H2V6a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H7zM6.5 9A1.5 1.5 0 0 1 8 10.5A1.5 1.5 0 0 1 6.5 12A1.5 1.5 0 0 1 5 10.5A1.5 1.5 0 0 1 6.5 9m0 1a.5.5 0 0 0-.5.5a.5.5 0 0 0 .5.5a.5.5 0 0 0 .5-.5a.5.5 0 0 0-.5-.5m5-1a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5a1.5 1.5 0 0 1-1.5-1.5A1.5 1.5 0 0 1 11.5 9m0 1a.5.5 0 0 0-.5.5a.5.5 0 0 0 .5.5a.5.5 0 0 0 .5-.5a.5.5 0 0 0-.5-.5m5-1a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5a1.5 1.5 0 0 1-1.5-1.5A1.5 1.5 0 0 1 16.5 9m0 1a.5.5 0 0 0-.5.5a.5.5 0 0 0 .5.5a.5.5 0 0 0 .5-.5a.5.5 0 0 0-.5-.5"
						strokeWidth={0.7}
						stroke="#000"></path>
				</svg>
			</Tooltip>
		</Link>
	);
};

export const IconAddTask = ({className}) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={27}
			height={27}
			className={`cursor-pointer hover:fill-primary-blue ${className}`}
			viewBox="0 0 24 24">
			<path
				fill="currentColor"
				d="M10 2h4a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v5.53a5.7 5.7 0 0 0-2-1.19V8H4v11h8.08c.12.72.37 1.39.72 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2m4 4V4h-4v2zm0 11h3v-3h2v3h3v2h-3v3h-2v-3h-3z"
				strokeWidth={0.7}
				stroke="#000"></path>
		</svg>
	);
};

export const IconMag = () => {
	return (
		<Tooltip title="Tìm kiếm" placement="bottomRight">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width={27}
				height={27}
				className="cursor-pointer fill-black hover:fill-blue-500 transition-all duration-200"
				viewBox="0 0 24 24">
				<path
					d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5"
					strokeWidth={0.5}
					stroke="currentColor"></path>
			</svg>
		</Tooltip>
	);
};

export const IconChart = () => {
	return (
		<Tooltip placement="bottomRight" title="Thống kê công việc">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width={27}
				height={27}
				className="cursor-pointer fill-black hover:fill-blue-500 transition-all duration-200"
				viewBox="0 0 24 24">
				<path
					d="m16.18 19.6l-2.01-3.48c.98-.72 1.66-1.84 1.8-3.12H20a8.55 8.55 0 0 1-3.82 6.6M13 7.03V3c4.3.26 7.74 3.7 8 8h-4.03A4.49 4.49 0 0 0 13 7.03M7 12.5c0 .64.13 1.25.38 1.8L3.9 16.31A8.4 8.4 0 0 1 3 12.5C3 7.97 6.54 4.27 11 4v4.03c-2.25.25-4 2.15-4 4.47m4.5 8.5c-2.97 0-5.58-1.5-7.1-3.82l3.48-2.01A4.47 4.47 0 0 0 11.5 17c.64 0 1.25-.13 1.8-.38l2.01 3.48c-1.15.58-2.44.9-3.81.9"
					strokeWidth={0.5}
					stroke="currentColor"></path>
			</svg>
		</Tooltip>
	);
};

export const IconCheck = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={120}
			height={120}
			viewBox="0 0 24 24">
			<path
				fill="#000"
				d="m10 17l-5-5l1.41-1.42L10 14.17l7.59-7.59L19 8m0-5H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"
				strokeWidth={0.5}
				stroke="#000"></path>
		</svg>
	);
};
