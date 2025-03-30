import { useEffect, useState } from "react";
import CustomTabs from "./CustomTabs";
import { IconAddTask, IconChart, IconMag, IconTask } from "./SvgIcon";
import { useDispatch, useSelector } from "react-redux";
import TaskListItem from "./TaskListItem";
import { filteredTasksSelector } from "./filterSelector";
import { Tabs } from "antd";
import SearchTask from "./SearchTask";
import ChartAboutTask from "./ChartAboutTask";
import { getTasks } from "../../actions/taskAction";

const Tasks = () => {
  const { user: loggedInUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.tasks);

  const filterTasks = useSelector(filteredTasksSelector);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!loggedInUser) return;
    dispatch(getTasks(loggedInUser._id));
  }, [loggedInUser]);

  const items = [
    {
      label: <IconTask />,
      key: "task",
      children: (
        <div className="mh-full">
          <CustomTabs
            isModalOpen={isModalOpen}
            showModal={showModal}
            handleCancel={handleCancel}
            tasks={tasks.tasks}
          />
          <div
            className="space-y-3 overflow-y-auto  2xl:max-h-[480px] max-h-[256px]"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              // scrollbarWidth: 'thin',
              // scrollbarColor: '#888 #f1f1f1',
            }}
          >
            {filterTasks?.map((t) => (
              <TaskListItem task={t} key={t.id} />
            ))}
          </div>
        </div>
      ),
    },
    {
      label: <IconMag />,
      key: "search",
      children: (
        <div>
          <SearchTask />
        </div>
      ),
    },
    {
      label: <IconChart />,
      key: "chart",
      children: (
        <div>
          <ChartAboutTask />
        </div>
      ),
    },
  ];
  useEffect(() => {
    // Fake tạm thời
    // dispatch(getTasks());
  }, [filterTasks]);
  return (
    <div className=" justify-between px-4 py-2 h-full">
      <Tabs
        tabBarExtraContent={{
          left: (
            <div className="flex items-center gap-2 2xl:mr-48  mr-24">
              <span className="font-semibold text-xl">To-Do</span>
              <div onClick={showModal}>
                <IconAddTask />
              </div>
            </div>
          ),
        }}
        defaultActiveKey="task"
        items={items}
        size="small"
        type="line"
        tabBarGutter={10}
        tabBarStyle={{
          display: "flex",
          justifyContent: "center",
        }}
      />
    </div>
  );
};

export default Tasks;
