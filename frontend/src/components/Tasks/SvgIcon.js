import { Tooltip } from 'antd';

export const IconMag = () => {
	return (
		<Tooltip title="Tìm kiếm" placement="bottomRight">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="cursor-pointer fill-black hover:fill-blue-500 transition-all duration-200 w-5"
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
				className="cursor-pointer fill-black hover:fill-blue-500 transition-all duration-200  w-5"
				viewBox="0 0 24 24">
				<path
					d="m16.18 19.6l-2.01-3.48c.98-.72 1.66-1.84 1.8-3.12H20a8.55 8.55 0 0 1-3.82 6.6M13 7.03V3c4.3.26 7.74 3.7 8 8h-4.03A4.49 4.49 0 0 0 13 7.03M7 12.5c0 .64.13 1.25.38 1.8L3.9 16.31A8.4 8.4 0 0 1 3 12.5C3 7.97 6.54 4.27 11 4v4.03c-2.25.25-4 2.15-4 4.47m4.5 8.5c-2.97 0-5.58-1.5-7.1-3.82l3.48-2.01A4.47 4.47 0 0 0 11.5 17c.64 0 1.25-.13 1.8-.38l2.01 3.48c-1.15.58-2.44.9-3.81.9"
					strokeWidth={0.5}
					stroke="currentColor"></path>
			</svg>
		</Tooltip>
	);
};

export const IconCheck = ({ width, height }) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={width}
			height={height}
			className="fill-green-400 aspect-square"
			viewBox="0 0 24 24">
			<path
				d="m10 17l-5-5l1.41-1.42L10 14.17l7.59-7.59L19 8m0-5H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"
				strokeWidth={0.5}
				stroke="#000"></path>
		</svg>
	);
};
export const IconAddTask = ({ className }) => {
	return (
		<Tooltip placement="bottomRight" title="Giao việc">
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
		</Tooltip>
	);
};

export const IconEditTitle = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={16}
			height={16}
			className="fill hover:fill-blue-500"
			viewBox="0 0 24 24">
			<path
				d="M20.22 2H7.78C6.8 2 6 2.8 6 3.78v12.44C6 17.2 6.8 18 7.78 18h12.44c.98 0 1.78-.79 1.78-1.78V3.78C22 2.8 21.2 2 20.22 2m-9.16 13H9v-2.06l6.06-6.06l2.06 2.06zm7.64-7.65l-1 1l-2.05-2.05l1-1c.21-.22.56-.22.77 0l1.28 1.28c.22.21.22.56 0 .77M4 6H2v14a2 2 0 0 0 2 2h14v-2H4z"
				strokeWidth={0.5}
				stroke="#000"></path>
		</svg>
	);
};

export const IconDots = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			// width={20}
			// height={20}
			className="fill hover:fill-blue-500 w-3 2xl:w-4"
			viewBox="0 0 24 24">
			<path
				d="M16 12a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2"
				strokeWidth={0.5}
				stroke="#000"></path>
		</svg>
	);
};

export const IconList = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className='w-5 2xl:w-6'
			viewBox="0 0 24 24">
			<path
				fill="#000"
				d="M7 5h14v2H7zm0 8v-2h14v2zM4 4.5A1.5 1.5 0 0 1 5.5 6A1.5 1.5 0 0 1 4 7.5A1.5 1.5 0 0 1 2.5 6A1.5 1.5 0 0 1 4 4.5m0 6A1.5 1.5 0 0 1 5.5 12A1.5 1.5 0 0 1 4 13.5A1.5 1.5 0 0 1 2.5 12A1.5 1.5 0 0 1 4 10.5M7 19v-2h14v2zm-3-2.5A1.5 1.5 0 0 1 5.5 18A1.5 1.5 0 0 1 4 19.5A1.5 1.5 0 0 1 2.5 18A1.5 1.5 0 0 1 4 16.5"
				strokeWidth={0.5}
				stroke="#000"></path>
		</svg>
	);
};

export const IconDot = ({ className }) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={32}
			height={32}
			className={`${className}`}
			viewBox="0 0 24 24">
			<path
				d="M12 10a2 2 0 0 0-2 2a2 2 0 0 0 2 2c1.11 0 2-.89 2-2a2 2 0 0 0-2-2"
				strokeWidth={0.5}
				stroke="#000"></path>
		</svg>
	);
};

export const IconPen = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			className="fill-yellow-400"
			viewBox="0 0 24 24">
			<path
				d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z"
				strokeWidth={0.5}
				stroke="#000"></path>
		</svg>
	);
};

export const IconBin = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			className="fill-red-500"
			viewBox="0 0 24 24">
			<path
				d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM8 9h8v10H8zm7.5-5l-1-1h-5l-1 1H5v2h14V4z"
				strokeWidth={0.5}
				stroke="#000"></path>
		</svg>
	);
};

export const IconTask = () => {
	return (
		<Tooltip title="Công việc" placement="bottom">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="cursor-pointer fill-black hover:fill-blue-500 transition-all duration-200  w-5"
				viewBox="0 0 24 24">
				<path
					d="M19 6q-1.25 0-2.125-.875T16 3t.875-2.125T19 0t2.125.875T22 3t-.875 2.125T19 6M6 18l-2.3 2.3q-.475.475-1.088.213T2 19.575V4q0-.825.588-1.412T4 2h9.1q.4 0 .663.3T14 3q0 1.125.488 2.125T15.85 6.85q.65.525 1.463.838T19 8q.45 0 .9-.075t.875-.25t.825.05t.4.65V16q0 .825-.588 1.413T20 18z"
					strokeWidth={0.5}
					stroke="#000"></path>
			</svg>
		</Tooltip>
	);
};

export const IconRedo = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			viewBox="0 0 24 24">
			<path
				fill="#000"
				d="M10.5 7A6.5 6.5 0 0 0 4 13.5a6.5 6.5 0 0 0 6.5 6.5H14v-2h-3.5C8 18 6 16 6 13.5S8 9 10.5 9h5.67l-3.08 3.09l1.41 1.41L20 8l-5.5-5.5l-1.42 1.41L16.17 7zM18 18h-2v2h2z"
				strokeWidth={0.5}
				stroke="#000"></path>
		</svg>
	);
};
