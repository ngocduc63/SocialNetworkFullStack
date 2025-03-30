import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { clearErrors, getAllChats } from "../../actions/chatAction";
import ChatListItem from "./ChatListItem";
import { IconCreateChat, IconCreateTask } from "./SvgIcon";
import Tasks from "../Tasks/Tasks";
import { Tooltip } from "antd";

const Sidebar = ({ openModal, socket }) => {
  const dispatch = useDispatch();
  const params = useParams();
  const [isShowTaskView, setIsShowTaskView] = useState(false);
  const { user } = useSelector((state) => state.user);
  const { loading, error, chats } = useSelector((state) => state.allChats);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    dispatch(getAllChats());
  }, [dispatch, error, params.chatId]);

  const handleShowTaskView = () => {
    setIsShowTaskView(!isShowTaskView);
  };

  return (
    <>
      <div className="hidden sm:flex flex-col h-full w-2/6 border-r">
        <div className="flex items-center justify-between border-b p-4">
          <span className="mx-auto font-medium cursor-pointer">
            {user.username}
          </span>
          <div className="flex items-center gap-2">
            <Tooltip title="Quản lí công việc">
              <div>
                <IconCreateTask handleShowTaskView={handleShowTaskView} />
              </div>
            </Tooltip>
            <Tooltip title="Tạo đoạn chat">
              <div>
                <IconCreateChat openModal={openModal} />
              </div>
            </Tooltip>
          </div>
        </div>

        {!isShowTaskView && (
          <div className="flex flex-col overflow-y-auto overflow-x-hidden">
            <span className="px-4 py-2 font-medium">Messages</span>

            {/* {loading &&
                        Array(10).fill("").map((el, i) => (
                            <div className="flex items-center gap-2 py-2 px-4" key={i}>
                                <Skeleton animation="wave" variant="circular" width={65} height={50} />
                                <div className="flex flex-col gap-0 w-full">
                                    <Skeleton height={23} width="85%" animation="wave" />
                                    <Skeleton height={23} width="60%" animation="wave" />
                                </div>
                            </div>
                        ))
                    } */}

            {chats?.map((c) => (
              <ChatListItem {...c} key={c._id} />
            ))}
          </div>
        )}
        {isShowTaskView && <Tasks />}
      </div>
    </>
  );
};

export default Sidebar;
