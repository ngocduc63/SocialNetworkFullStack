import { Tooltip } from 'antd';

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
			width={20}
			height={20}
			className="fill hover:fill-blue-500"
			viewBox="0 0 24 24">
			<path
				d="M16 12a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2"
				strokeWidth={0.5}
				stroke="#000"></path>
		</svg>
	);
};
