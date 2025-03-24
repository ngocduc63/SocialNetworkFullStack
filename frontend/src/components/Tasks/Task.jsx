import React, {
	useState,
} from 'react';



import Sidebar from './Sidebar';

import SearchModal from './SearchModal';
import { useDispatch } from 'react-redux';

const Task = () => {
	const dispatch = useDispatch();

	const [showSearch, setShowSearch] = useState(false);

	const handleModalClose = () => {
		setShowSearch(false);
	};

	const openModal = () => {
		setShowSearch(true);
	};

	return (
		<>
			{/* <MetaData title="Instagram • Chats" /> */}

			<div className="mt-14 sm:mt-[4.7rem] pb-4 rounded h-[90vh] xl:w-2/3 mx-auto sm:pr-14 sm:pl-8">
				<div className="flex border h-full rounded w-full bg-white">
					{/* sidebar */}
					<Sidebar openModal={openModal} />
				</div>

				<SearchModal open={showSearch} onClose={handleModalClose} />
			</div>
		</>
	);
};

export default Task;
