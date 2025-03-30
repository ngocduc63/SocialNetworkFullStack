import { Modal } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { IconBin, IconCheck, IconList, IconPen, IconRedo } from "./SvgIcon";
import { BASE_PROFILE_IMAGE_URL } from "../../utils/constants";
import Confirm from "./Confirm";
import TaskModal from "./TaskModal";
import { useDispatch, useSelector } from "react-redux";
import { deleteTask, updateTaskStatus } from "../../actions/taskAction";

export default function TaskDetail({ isModalOpen, handleCancel, task }) {
  const { title, content, users, time, assigner, done } = task;
  const dispatch = useDispatch();
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { user: loggedInUser } = useSelector((state) => state.user);
  const [width, setWidth] = useState(window.innerWidth >= 1536 ? 640 : 580);
  const isAssign = useMemo(() => {
    return task.assigner._id === loggedInUser._id;
  }, [loggedInUser, task]);

  const showConfirm = (event, type) => {
    event.stopPropagation();
    setConfirmType(type);
    setIsModalConfirmOpen(true);
  };

  const handleCloseModalConfirm = () => {
    setIsModalConfirmOpen(false);
    setConfirmType(null);
  };

  const handleOpenTaskModal = () => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setEditingTask(null);
    setTaskModalOpen(false);
  };

  const handleConfirmComplete = () => {
    dispatch(updateTaskStatus(task._id, true));
    setIsModalConfirmOpen(false);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteTask(task._id));
    setIsModalConfirmOpen(false);
    handleCancel();
  };

  const handleConfirmAgain = () => {
    dispatch(updateTaskStatus(task._id, false));
    setIsModalConfirmOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth >= 1536 ? 640 : 580);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <Modal
        title={
          <span className="2xl:text-lg text-base font-bold">{task.title}</span>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        style={{ top: "10vh" }}
        width={width}
      >
        <div className="border-t pt-3 flex">
          {/* Trái */}
          <div className="flex flex-col border-r pr-3" style={{ flex: "7" }}>
            <div className="flex-1 2xl:min-h-[450px]">
              <div className="flex flex-col space-y-2 pb-3 border-b">
                <h2 className="text-base font-medium">
                  {title === "" ? "(Không có tiêu đề)" : ""}
                </h2>
                <p className="text-base">{content}</p>
              </div>
              <div className="pt-3 flex flex-col space-y-4">
                <div className="flex space-x-2 items-center">
                  <IconList />
                  <p className="2xl:text-base text-sm font-semibold">
                    Hoạt động
                  </p>
                </div>
                <div className="flex space-x-2 items-center">
                  <img
                    key={assigner.id}
                    src={BASE_PROFILE_IMAGE_URL + assigner.avatar}
                    alt={`${assigner.name}'s avatar`}
                    className="rounded-full 2xl:w-8 2xl:h-8 w-7 h-7 object-cover"
                  />
                  <p className="2xl:text-base text-sm font-medium">
                    {assigner.name} đã giao việc cho bạn
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Phải */}
          <div style={{ flex: "3" }} className="pl-5 flex flex-col space-y-3">
            <div className="flex flex-col space-y-2 2xl:text-base text-sm font-medium">
              <p>Trạng thái</p>
              <p>
                {done === false ? (
                  <div className="flex items-center text-sm 2xl:text-base">
                    <div className="bg-blue-500 2xl:w-3 2xl:h-3 w-2 h-2 rounded-full border mr-1"></div>{" "}
                    Chưa xong
                  </div>
                ) : (
                  <div className="flex items-center text-sm 2xl:text-base">
                    <div className="bg-green-500 2xl:w-3 2xl:h-3 w-2 h-2 rounded-full border mr-1"></div>{" "}
                    Đã xong
                  </div>
                )}
              </p>
            </div>
            <div className="flex flex-col space-y-2 2xl:text-base text-sm font-medium">
              <p>Ngày hết hạn</p>
              <p>{time}</p>
            </div>
            <div className="flex flex-col space-y-1 relative group">
              <p className="text-base font-medium">Giao cho</p>
              <div className="flex cursor-pointer">
                {users?.slice(0, 3).map((user, index) => (
                  <img
                    key={user.id}
                    src={BASE_PROFILE_IMAGE_URL + user.avatar}
                    alt={user.name}
                    className={`rounded-full object-cover w-7 2xl:w-8 h-7 2xl:h-8  border-2 border-white shadow-md ${
                      index !== 0 ? "-ml-2" : ""
                    }`}
                  />
                ))}
                {users?.length > 3 && (
                  <div className="-ml-2 w-7 h-7 flex items-center justify-center bg-gray-300 rounded-full text-xs font-semibold shadow-md border-2 border-white">
                    +{users.length - 3}
                  </div>
                )}
              </div>

              {/* Hover để hiển thị danh sách đầy đủ */}
              <div className="absolute left-0 top-10 hidden group-hover:flex flex-col bg-white p-3 rounded-lg shadow-lg border w-52 z-10">
                {users?.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 mb-2 last:mb-0"
                  >
                    <img
                      src={BASE_PROFILE_IMAGE_URL + user.avatar}
                      alt={user.name}
                      className="w-7 h-7 2xl:w-8 2xl:h-8 rounded-full object-cover"
                    />
                    <p className="text-sm 2xl:text-base font-medium">
                      {user.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col 2xl:text-base text-sm font-medium space-y-1">
              <p>Tác vụ</p>
              <div className="flex flex-col space-y-2">
                {!done ? (
                  <div
                    className="border w-full pl-3 py-2 flex items-center space-x-2 hover:cursor-pointer shadow-lg rounded-lg hover:opacity-80"
                    onClick={(e) => showConfirm(e, "complete")}
                  >
                    <IconCheck width={24} height={24} />
                    <p>Hoàn thành</p>
                  </div>
                ) : isAssign ? (
                  <div
                    className="border w-full pl-3 py-2 flex items-center space-x-2 hover:cursor-pointer shadow-lg rounded-lg hover:opacity-80"
                    onClick={(e) => showConfirm(e, "again")}
                  >
                    <IconRedo width={24} height={24} />
                    <p>Giao lại</p>
                  </div>
                ) : null}
                {isAssign && !done && (
                  <>
                    <div
                      className="border w-full pl-3 py-2 flex items-center space-x-2 hover:cursor-pointer shadow-lg rounded-lg hover:opacity-80"
                      onClick={handleOpenTaskModal}
                    >
                      <IconPen />
                      <p>Chỉnh sửa</p>
                    </div>
                    <div
                      className="border w-full pl-3 py-2 flex items-center space-x-2 hover:cursor-pointer shadow-lg rounded-lg hover:opacity-80"
                      onClick={(e) => showConfirm(e, "delete")}
                    >
                      <IconBin />
                      <p>Xóa công việc</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Confirm
        isModalOpen={isModalConfirmOpen}
        handleCancel={handleCloseModalConfirm}
        confirmType={confirmType}
        onConfirm={
          confirmType === "complete"
            ? handleConfirmComplete
            : confirmType === "again"
              ? handleConfirmAgain
              : handleConfirmDelete
        }
      />
      <TaskModal
        open={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        task={editingTask}
      />
    </>
  );
}
