import { DatePicker, Input, Modal, Select, Space } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React, { useRef } from 'react';
import en from 'antd/es/date-picker/locale/en_US';
import dayjs from 'dayjs';
import buddhistEra from 'dayjs/plugin/buddhistEra';

dayjs.extend(buddhistEra);

const handleChange = (value) => {
	console.log(`Selected: ${value}`);
};

const options = [
	{
		label: 'China',
		value: 'china',
		emoji: '🇨🇳',
		desc: 'China (中国)',
	},
	{
		label: 'USA',
		value: 'usa',
		emoji: '🇺🇸',
		desc: 'USA (美国)',
	},
	{
		label: 'Japan',
		value: 'japan',
		emoji: '🇯🇵',
		desc: 'Japan (日本)',
	},
	{
		label: 'Korea',
		value: 'korea',
		emoji: '🇰🇷',
		desc: 'Korea (韩国)',
	},
];

const buddhistLocale = {
	...en,
	lang: {
		...en.lang,
		dateFormat: 'BBBB-MM-DD',
		dateTimeFormat: 'BBBB-MM-DD HH:mm:ss',
		yearFormat: 'BBBB',
	},
};

export default function TaskModal({ open, onClose }) {
	const ref = useRef();

	const onChange = (_, dateStr) => {
		console.log('Date selected:', dateStr);
	};

	return (
		<Modal
			title="Giao công việc mới"
			open={open}
			onCancel={onClose}
			footer={null}
			destroyOnClose // Xóa dữ liệu khi đóng modal
			maskClosable // Đóng modal khi nhấn ngoài
		>
			<div className="border-t pt-2 flex flex-col space-y-3">
				{/* Tiêu đề */}
				<div>
					<p className="text-base font-semibold mb-1">Tiêu đề</p>
					<Input
						placeholder="Nhập tiêu đề VD: Chuẩn bị báo cáo"
						size="middle"
						className="text-base"
					/>
				</div>

				{/* Nội dung */}
				<div>
					<p className="text-base font-semibold mb-1">Nội dung</p>
					<TextArea
						ref={ref}
						placeholder="Nhập nội dung"
						autoSize={{ minRows: 3, maxRows: 5 }}
						className="text-base"
					/>
				</div>

				{/* Giao cho */}
				<div>
					<p className="text-base font-semibold mb-1">Giao cho</p>
					<Select
						mode="multiple"
						style={{ width: '100%' }}
						placeholder="Chọn người nhận"
						onChange={handleChange}
						options={options}
						optionRender={(option) => (
							<Space>
								<span role="img" aria-label={option.data.label}>
									{option.data.emoji}
								</span>
								{option.data.desc}
							</Space>
						)}
					/>
				</div>

				{/* Thời hạn */}
				<div>
					<p className="text-base font-semibold mb-1">Thời hạn</p>
					<DatePicker
						defaultValue={dayjs()}
						showTime
						locale={buddhistLocale}
						onChange={onChange}
						className="w-full"
					/>
				</div>
			</div>
		</Modal>
	);
}
