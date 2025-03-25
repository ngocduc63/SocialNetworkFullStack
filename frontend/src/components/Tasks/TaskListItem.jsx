import React, { useState } from 'react';
import { BASE_PROFILE_IMAGE_URL } from '../../utils/constants';
import { IconDots, IconEditTitle } from './SvgIcon';
import Confirm from './Confirm';

export default function TaskListItem({
	title,
	content,
	users,
	time,
	assigner,
	done,
}) {
	const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
	const showConfirm = () => {
		setIsModalConfirmOpen(true);
	};
	const handleCloseModalConfirm = () => {
		setIsModalConfirmOpen(false);
	};
	return (
		<div className="p-3 border rounded-lg shadow-sm flex items-center gap-3 group hover:cursor-pointer hover:bg-slate-50">
			{/* Avatar + Checkbox */}
			<div className="flex items-center">
				{/* Avatar (Ẩn khi hover) */}
				<div className="flex -space-x-2 group-hover:hidden">
					{users.map((user) => (
						<img
							key={user.id}
							src={BASE_PROFILE_IMAGE_URL + user.avatar}
							alt={`${user.name}'s avatar`}
							width={32}
							height={32}
							className="rounded-full"
						/>
					))}
				</div>

				{/* Checkbox (Hiện khi hover) */}
				<input
					type="checkbox"
					className="hidden group-hover:block w-5 h-5 m-1 hover:cursor-pointer"
					onClick={showConfirm}
				/>
				<Confirm
					isModalOpen={isModalConfirmOpen}
					handleCancel={handleCloseModalConfirm}
				/>
			</div>

			{/* Nội dung công việc */}
			<div className="flex-1">
				<span className="flex">
					<p className="font-semibold text-sm">
						{title === '' ? '(Không có tiêu đề)' : title}
					</p>
					<span className="hidden group-hover:block">
						<IconEditTitle />
					</span>
				</span>
				<p className="text-sm text-gray-600">{content}</p>
				{done === false ? (
					<p className="text-sm text-gray-600">Chưa xong</p>
				) : (
					<p className="text-sm text-green-500">Đã xong</p>
				)}
			</div>
			<div className="">
				<IconDots />
			</div>
		</div>
	);
}
