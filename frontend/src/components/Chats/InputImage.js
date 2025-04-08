import React, { useRef, useState } from "react";
import { Modal, Upload } from "antd";
import { IconAddImage } from "./SvgIcon";

const InputImage = ({ onChange, fileList }) => {
  const uploadRef = useRef(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const handleChange = ({ fileList: newFileList }) => {
    onChange(newFileList);
  };

  const triggerUpload = () => {
    if (uploadRef.current) {
      uploadRef.current.upload.uploader.fileInput.click();
    }
  };

  const handlePreview = (file) => {
    setPreviewImage(file.url || URL.createObjectURL(file.originFileObj));
    setPreviewVisible(true);
  };

  const handleCancel = () => {
    setPreviewVisible(false);
  };

  return (
    <div className="relative">
      {/* Component Upload */}
      <Upload
        ref={uploadRef}
        listType="picture-card"
        fileList={fileList}
        onChange={handleChange}
        onPreview={handlePreview}
        beforeUpload={() => false}
        multiple
        showUploadList={true}
        style={{ display: "block" }}
      />

      <div
        className="w-8 h-8 flex items-center justify-center border rounded-lg cursor-pointer hover:bg-gray-100 transition"
        onClick={triggerUpload}
      >
        <IconAddImage />
      </div>

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={handleCancel}
        centered
      >
        <img
          alt="Preview"
          style={{
            width: "100%",
            maxHeight: "80vh",
            objectFit: "contain",
            marginTop: 20,
          }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
};

export default InputImage;
