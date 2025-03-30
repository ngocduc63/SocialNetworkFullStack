import { Select, Space, Tag, Tooltip } from "antd";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import axios from "axios";
import { BASE_PROFILE_IMAGE_URL } from "../../utils/constants";

const UserSelect = ({ formData, setFormData }) => {
  const [options, setOptions] = useState([]);

  // Fetch users từ API
  const fetchUsers = async (searchTerm = "") => {
    try {
      const { data } = await axios.get(`/api/v1/users?keyword=${searchTerm}`);

      // Giữ lại user đã chọn
      const selectedUsersSet = new Set(formData.users.map((user) => user._id));
      const mergedUsers = [
        ...formData.users,
        ...data.users.filter((user) => !selectedUsersSet.has(user._id)),
      ];

      setOptions(mergedUsers);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm user:", error);
    }
  };

  // Debounce API call
  const debouncedSearch = useCallback(debounce(fetchUsers, 500), [
    formData.users,
  ]);

  useEffect(() => {
    fetchUsers(); // Load danh sách ban đầu
  }, []);

  const handleSelectChange = (selectedIds) => {
    const selectedUsers = options.filter((user) =>
      selectedIds.includes(user._id),
    );
    setFormData((prev) => ({ ...prev, users: selectedUsers }));
  };

  return (
    <Select
      mode="multiple"
      style={{ width: "100%" }}
      className="py-1"
      placeholder="Bản thân"
      value={formData.users.map((user) => user._id)}
      onChange={handleSelectChange}
      onSearch={debouncedSearch}
      filterOption={false}
      options={options.map((user) => ({
        label: (
          <Space>
            <Tooltip title={user.name}>
              <img
                src={`${BASE_PROFILE_IMAGE_URL}${user.avatar}`}
                alt={user.name}
                width="28"
                height="28"
                className="rounded-full object-cover"
                style={{
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  objectFit: "cover",
                }}
              />
            </Tooltip>
            {user.name}
          </Space>
        ),
        value: user._id,
      }))}
      tagRender={(props) => {
        const { value, closable, onClose } = props;
        const selectedUser = formData.users.find((user) => user._id === value);
        return selectedUser ? (
          <Tooltip title={selectedUser.name}>
            <Tag
              closable={closable}
              onClose={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 8px",
                borderRadius: "16px",
              }}
            >
              <img
                src={`${BASE_PROFILE_IMAGE_URL}${selectedUser.avatar}`}
                alt={selectedUser.name}
                width="28"
                height="28"
                style={{
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  objectFit: "cover",
                  marginRight: "8px",
                }}
              />
              {selectedUser.name}
            </Tag>
          </Tooltip>
        ) : null;
      }}
    />
  );
};

export default UserSelect;
