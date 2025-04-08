import React, { useState } from "react";
import { Modal } from "antd";
import { BASE_MESS_IMAGE_URL } from "../../utils/constants";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const MessageContent = ({ message, ownMsg }) => {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isShowImages = message?.type === "image";
  const images = message?.images || [];

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {!isShowImages && (
        <span
          className={`text-sm px-4 py-3 rounded-3xl max-w-xs whitespace-pre-wrap break-words ${
            ownMsg ? "text-white bg-violet-600" : "bg-gray-200"
          }`}
        >
          {message.content}
        </span>
      )}

      {isShowImages && images.length > 0 && (
        <div className="mt-2 relative flex gap-2">
          {images.length === 1 ? (
            <img
              src={BASE_MESS_IMAGE_URL + images[0]}
              alt="image"
              className="w-40 h-40 object-cover rounded-lg cursor-pointer"
              onClick={() => {
                setCurrentIndex(0);
                setVisible(true);
              }}
            />
          ) : (
            <div
              className="relative w-40 h-40 cursor-pointer"
              onClick={() => setVisible(true)}
            >
              <img
                src={BASE_MESS_IMAGE_URL + images[0]}
                alt="image"
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-lg font-semibold rounded-lg">
                +{images.length - 1}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal
        open={visible}
        footer={null}
        onCancel={() => setVisible(false)}
        centered
        closable={false}
      >
        <div className="relative flex justify-center items-center">
          <img
            src={BASE_MESS_IMAGE_URL + images[currentIndex]}
            alt="Preview"
            className="w-full object-contain max-h-[80vh]"
          />

          {images.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                onClick={prevImage}
              >
                <LeftOutlined />
              </button>
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                onClick={nextImage}
              >
                <RightOutlined />
              </button>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default MessageContent;
