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
		<Link to={'/direct/task'}>
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
		</Link>
	);
};

export const IconMessage = () => {
	return (
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
	);
};
