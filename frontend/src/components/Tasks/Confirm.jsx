import { Modal } from 'antd';
import React from 'react';

export default function Confirm({ isModalOpen, handleCancel }) {
	return (
		<Modal
			title="Kết thúc công việc"
			open={isModalOpen}
			onCancel={handleCancel}
			footer={null}>
			<div>
				<p className='text-lg'>
					HOÀN THÀNH công việc sẽ chuyển công việc sang danh sách Hoàn thành.
				</p>
				<div className="flex mt-5 gap-2 font-semibold">
					<div
						className="text-lg py-2 px-4 border rounded-md hover:text-[#1777FF] cursor-pointer"
						onClick={handleCancel}>
						Không
					</div>
					<div
						className={`text-lg py-2 px-3 border rounded-md bg-[#1777FF] text-white hover:opacity-75 cursor-pointer`}>
						Có
					</div>
				</div>
			</div>
		</Modal>
	);
}
