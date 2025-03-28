import { Modal } from 'antd';
import React from 'react';

export default function Confirm({ isModalOpen, handleCancel, confirmType, onConfirm }) {
	const confirmMessage =
		confirmType === 'delete'
			? 'Công việc này sẽ không còn hiển thị trên danh sách của bạn. Bạn có chắc rằng bạn muốn xoá công việc này không?'
			: confirmType === 'again'
			? 'Người bạn giao việc sẽ nhận được thông báo bạn giao lại công việc. Công việc sẽ được chuyển sang danh mục Chưa xong.'
			: 'HOÀN THÀNH công việc sẽ chuyển công việc sang danh sách Hoàn thành.';

	const confirmTitle =
		confirmType === 'delete'
			? 'Xóa công việc'
			: confirmType === 'again'
			? 'Giao lại công việc'
			: 'Kết thúc công việc';

	return (
		<Modal
			title={<span className="text-lg font-bold">{confirmTitle}</span>}
			open={isModalOpen}
			onCancel={handleCancel}
			footer={null}>
			<div className="border-t pt-4">
				<p className="text-base font-medium">{confirmMessage}</p>
				<div className="flex justify-end mt-4 space-x-2 text-base">
					<button
						onClick={handleCancel}
						className="border px-4 py-2 rounded-md">
						Hủy
					</button>
					<button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={onConfirm}>
						{confirmType === 'delete'
							? 'Xóa công việc'
							: confirmType === 'again'
							? 'Giao lại'
							: 'Kết thúc'}
					</button>
				</div>
			</div>
		</Modal>
	);
}
