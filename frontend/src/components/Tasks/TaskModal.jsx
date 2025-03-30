import { DatePicker, Input, Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useEffect, useRef, useState } from "react";
import en from "antd/es/date-picker/locale/en_US";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { useDispatch, useSelector } from "react-redux";
import { addTask, updateTask } from "../../actions/taskAction";
import { toast } from "react-toastify";
import UserSelect from "./UserSelect";

dayjs.extend(buddhistEra);

export default function TaskModal({ open, onClose, task }) {
  const ref = useRef();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    users: [],
    time: "",
  });
  const [width, setWidth] = useState(window.innerWidth >= 1536 ? 500 : 400);

  const currentUser = React.useMemo(() => {
    return user ? { id: user._id, name: user.name, avatar: user.avatar } : null;
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    if (date) {
      const formattedDate = date.format("HH:mm DD-MM-YYYY");
      setFormData((prev) => ({ ...prev, time: formattedDate }));
    }
  };

  const handleSaveTask = () => {
    if (!formData.title.trim()) return;
    if (formData.users.length === 0) formData.users = [currentUser];

    if (task) {
      const updatedTask = {
        ...task,
        ...formData,
        assigner: task.assigner?._id,
        users: formData.users?.map((user) => user._id) || [],
      };

      dispatch(updateTask(updatedTask));
      toast.success("Chỉnh sửa công việc thành công");
    } else {
      const newTask = {
        id: Date.now(),
        title: formData.title.trim(),
        content: formData.content.trim(),
        users: formData.users.map((user) => user._id || user.id),
        time: formData.time || "Không thời hạn",
        assigner: currentUser.id,
        done: false,
      };
      dispatch(addTask(newTask));
      toast.success("Giao việc thành công");
    }

    setFormData({ title: "", content: "", users: [], time: "" });
    onClose();
  };

  const isDisabled = !formData.title.trim();

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth >= 1536 ? 500 : 400);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        content: task.content,
        users: task.users,
        time: task.time,
      });
    } else {
      setFormData({ title: "", content: "", users: [], time: "" });
    }
  }, [task]);

  return (
    <Modal
      title={<span className="text-base font-bold">Giao công việc mới</span>}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={width}
      // style={{ top: '6vh' }}
      className="top-[6vh] 2xl:top-28"
      maskClosable
    >
      <div className="border-t pt-2 flex flex-col space-y-3 2xl:mt-0">
        {/* Tiêu đề */}
        <div>
          <p className="text-base font-semibold mb-1">
            Tiêu đề <span className={"text-red-500"}>*</span>
          </p>
          <Input
            name="title"
            placeholder="Nhập tiêu đề VD: Chuẩn bị báo cáo"
            size="middle"
            className="text-base"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        {/* Nội dung */}
        <div>
          <p className="text-base font-semibold mb-1">Nội dung</p>
          <TextArea
            ref={ref}
            name="content"
            placeholder="Nhập nội dung"
            autoSize={{ minRows: 3, maxRows: 5 }}
            className="text-base"
            value={formData.content}
            onChange={handleChange}
          />
        </div>

        {/* Giao cho */}
        <div>
          <p className="text-base font-semibold mb-1">Giao cho</p>
          <UserSelect formData={formData} setFormData={setFormData} />
        </div>

        {/* Thời hạn */}
        <div>
          <p className="text-base font-semibold mb-1">Thời hạn</p>
          <DatePicker
            value={
              formData.time && formData.time !== "Không thời hạn"
                ? dayjs(formData.time, "HH:mm DD/MM/YYYY")
                : null
            }
            placeholder="Không thời hạn"
            showTime={{ format: "HH:mm" }}
            format="HH:mm DD/MM/YYYY"
            locale={en}
            disabledDate={(current) =>
              current && current < dayjs().startOf("day")
            }
            onChange={handleDateChange}
            className="w-full text-base"
          />
        </div>
      </div>
      <div className="flex mt-5 gap-2">
        <div
          className="2xl:text-lg text-base py-2 px-4 border rounded-md hover:text-[#1777FF] cursor-pointer"
          onClick={onClose}
        >
          Hủy
        </div>
        <div
          onClick={!isDisabled ? handleSaveTask : undefined}
          className={`2xl:text-lg text-base py-2 px-3 border rounded-md ${isDisabled ? "bg-gray-400 cursor-not-allowed text-white" : "bg-[#1777FF] text-white hover:opacity-75 cursor-pointer"}`}
        >
          {task ? "Chỉnh sửa" : "Giao việc"}
        </div>
      </div>
    </Modal>
  );
}
