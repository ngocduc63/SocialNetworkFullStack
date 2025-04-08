import { useEffect, useRef, useState } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ModeCommentIcon from "@mui/icons-material/ModeComment";
import { Dialog } from "@mui/material";
import {
  BASE_POST_IMAGE_URL,
  BASE_PROFILE_IMAGE_URL,
} from "../../../utils/constants";
import { Link } from "react-router-dom";
import {
  commentIcon,
  emojiIcon,
  likeIconOutline,
  saveIconFill,
  saveIconOutline,
  shareIcon,
} from "../../Home/SvgIcons";
import { likeFill } from "../../Navbar/SvgIcons";
import { useDispatch, useSelector } from "react-redux";
import { deletePost, likePost, savePost } from "../../../actions/postAction";
import { Picker } from "emoji-mart";
import { metaballsMenu } from "../SvgIcons";
import moment from "moment";
import axios from "axios";
import { toast } from "react-toastify";

const PostItem = ({
  _id,
  caption,
  likes,
  comments,
  image,
  postedBy,
  savedBy,
  createdAt,
}) => {
  const dispatch = useDispatch();
  const commentInput = useRef(null);

  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comment, setComment] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [likeEffect, setLikeEffect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentComments, setCurrentComments] = useState(comments || []);
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state) => state.user);
  const { loading: commentLoading, error: commentError } = useSelector(
    (state) => state.newComment,
  );

  // Debug: Log để kiểm tra props comments ban đầu
  useEffect(() => {
    console.log("PostItem khởi tạo với comments:", comments);
  }, []);

  // Tải lại danh sách bình luận từ API với endpoint hiệu quả hơn
  const loadComments = async () => {
    setLoading(true);
    try {
      // Sử dụng API endpoint hiệu quả hơn, tương tự như trong Home/PostItem
      const response = await axios.get(`/api/v1/comments/${_id}/parent`);

      if (response.data.success) {
        console.log("Bình luận đã tải thành công:", response.data.comments);

        // Lọc bỏ bình luận trùng lặp nếu có
        const uniqueComments = [];
        const commentIds = new Set();

        if (response.data.comments) {
          response.data.comments.forEach((comment) => {
            if (!commentIds.has(comment._id)) {
              commentIds.add(comment._id);
              uniqueComments.push(comment);
            }
          });
        }

        setCurrentComments(uniqueComments);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi khi tải bình luận:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Tải bình luận khi component mount hoặc mở modal
  useEffect(() => {
    if (open) {
      loadComments();
    }
  }, [open]);

  // Xử lý lỗi bình luận
  useEffect(() => {
    if (commentError) {
      console.error("Lỗi bình luận:", commentError);
      toast.error("Có lỗi xảy ra khi xử lý bình luận");
    }
  }, [commentError]);

  const handleLike = () => {
    setLiked(!liked);
    dispatch(likePost(_id));
  };

  // Gửi bình luận mới
  const handleComment = async (e) => {
    e.preventDefault();

    if (!comment.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Gửi bình luận mới:", comment);

      const response = await axios.post(
        `/api/v1/post/${_id}/comment`,
        {
          content: comment,
          parentCommentId: null,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Kết quả gửi bình luận:", response.data);

      if (response.data.success) {
        toast.success("Đã thêm bình luận");
        setComment("");

        // Tải lại bình luận sau khi thêm thành công
        await loadComments();

        // Thông báo Redux để cập nhật store nếu cần
        dispatch({
          type: "NEW_COMMENT_SUCCESS",
          payload: response.data,
        });
      }
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
      if (error.response) {
        console.error("Chi tiết lỗi:", error.response.data);
      }
      toast.error(error.response?.data?.message || "Lỗi khi gửi bình luận");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = () => {
    setSaved(!saved);
    dispatch(savePost(_id));
  };

  const handleDeletePost = () => {
    dispatch(deletePost(_id));
    setDeleteModal(false);
  };

  // Cập nhật trạng thái like khi likes thay đổi
  useEffect(() => {
    if (likes) {
      setLiked(likes.some((id) => id === user._id));
    }
  }, [likes, user._id]);

  // Cập nhật trạng thái save khi savedBy thay đổi
  useEffect(() => {
    if (savedBy) {
      setSaved(savedBy.some((id) => id === user._id));
    }
  }, [savedBy, user._id]);

  const closeDeleteModal = () => {
    setDeleteModal(false);
  };

  const setLike = () => {
    setLikeEffect(true);
    setTimeout(() => {
      setLikeEffect(false);
    }, 500);
    if (liked) {
      return;
    }
    handleLike();
  };

  // Hàm để xử lý hiển thị comment đúng cách với các cấu trúc dữ liệu khác nhau
  const renderComment = (c) => {
    // Xác định cấu trúc comment (hỗ trợ cả format cũ và mới)
    const username = c.user?.username || c.comment_userId?.username;
    const avatar = c.user?.avatar || c.comment_userId?.avatar;
    const content = c.comment || c.comment_content;
    const userId = c.user?._id || c.comment_userId?._id;
    const commentTime = c.createdAt || c.updatedAt; // Lấy thời gian bình luận

    if (!username || !avatar) {
      console.warn("Comment thiếu thông tin username hoặc avatar:", c);
      return null;
    }

    return (
      <div className="flex items-start mb-4" key={c._id}>
        <Link to={`/${username}`}>
          <img
            draggable="false"
            className="w-9 h-9 rounded-full object-cover mr-2.5"
            src={BASE_PROFILE_IMAGE_URL + avatar}
            alt="avatar"
          />
        </Link>
        <div className="flex flex-col flex-1">
          <div className="flex items-start">
            <Link
              to={`/${username}`}
              className="text-sm font-semibold hover:underline mr-2"
            >
              {username}
            </Link>
            <p className="text-sm whitespace-pre-line">{content}</p>
          </div>

          {/* Hiển thị thời gian comment */}
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-500">
              {commentTime ? moment(commentTime).fromNow() : ""}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="group w-full h-32 sm:h-72 max-h-72 flex justify-center items-center bg-black cursor-pointer relative z-0"
      >
        <img
          draggable="false"
          loading="lazy"
          className="hover:opacity-75 group-hover:opacity-75 cursor-pointer object-cover h-full w-full"
          src={BASE_POST_IMAGE_URL + image}
          alt="Post"
        />
        <div className="hidden group-hover:flex text-white absolute pointer-events-none gap-4">
          <span>
            <FavoriteIcon /> {likes ? likes.length : 0}
          </span>
          <span>
            <ModeCommentIcon /> {currentComments ? currentComments.length : 0}
          </span>
        </div>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xl">
        <div className="flex sm:flex-row flex-col max-w-7xl">
          <div
            className="relative flex items-center justify-center bg-black sm:h-[90vh] w-full"
            onDoubleClick={setLike}
          >
            <img
              draggable="false"
              className="object-contain h-full w-full"
              src={BASE_POST_IMAGE_URL + image}
              alt="post"
            />
            {likeEffect && (
              <img
                draggable="false"
                height="80px"
                className="likeEffect"
                alt="heart"
                src="https://img.icons8.com/ios-filled/2x/ffffff/like.png"
              />
            )}
          </div>

          <div className="flex flex-col justify-between border w-full max-w-xl rounded bg-white">
            {/* Header với menu */}
            <div className="flex justify-between px-3 py-2 border-b items-center">
              <div className="flex space-x-3 items-center">
                <Link to={`/${postedBy.username}`}>
                  <img
                    draggable="false"
                    className="w-10 h-10 rounded-full object-cover"
                    src={BASE_PROFILE_IMAGE_URL + postedBy.avatar}
                    alt="avatar"
                  />
                </Link>
                <Link
                  to={`/${postedBy.username}`}
                  className="text-black text-sm font-semibold hover:underline"
                >
                  {postedBy.username}
                </Link>
              </div>
              <span
                onClick={() => setDeleteModal(true)}
                className="cursor-pointer"
              >
                {metaballsMenu}
              </span>
            </div>

            {/* Dialog xóa bài viết */}
            <Dialog open={deleteModal} onClose={closeDeleteModal} maxWidth="xl">
              <div className="flex flex-col items-center w-80">
                {postedBy._id === user._id && (
                  <button
                    onClick={handleDeletePost}
                    className="text-red-600 font-medium border-b py-2.5 w-full hover:bg-red-50"
                  >
                    Xóa
                  </button>
                )}
                <button
                  onClick={closeDeleteModal}
                  className="py-2.5 w-full hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </Dialog>

            {/* Phần hiển thị bình luận */}
            <div className="p-4 w-full flex-1 max-h-[63vh] overscroll-x-hidden overflow-y-auto">
              {/* Phần caption của người đăng */}
              <div className="flex items-start mb-4">
                <Link to={`/${postedBy.username}`} className="w-12">
                  <img
                    draggable="false"
                    className="w-9 h-9 rounded-full object-cover"
                    src={BASE_PROFILE_IMAGE_URL + postedBy.avatar}
                    alt="avatar"
                  />
                </Link>
                <div className="flex flex-col flex-1">
                  <Link
                    to={`/${postedBy.username}`}
                    className="text-sm font-semibold hover:underline"
                  >
                    {postedBy.username}
                  </Link>
                  <p className="text-sm whitespace-pre-line mt-1">{caption}</p>
                  <span className="text-xs text-gray-500 mt-1">
                    {moment(createdAt).fromNow()}
                  </span>
                </div>
              </div>

              {/* Đường phân cách giữa caption và comments */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Tiêu đề phần bình luận */}
              <h4 className="text-sm font-medium text-gray-500 mb-4">
                {currentComments && currentComments.length > 0
                  ? `Bình luận (${currentComments.length})`
                  : "Bình luận"}
              </h4>

              {/* Hiển thị bình luận */}
              {loading ? (
                <div className="text-center text-gray-500 py-4">
                  Đang tải bình luận...
                </div>
              ) : currentComments && currentComments.length > 0 ? (
                currentComments.map((c) => renderComment(c))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                </div>
              )}
            </div>

            <div>
              {/* Phần like, comment */}
              <div className="flex flex-col px-3 space-y-1 border-b border-t pb-2">
                <div className="flex items-center justify-between py-2">
                  <div className="flex space-x-4">
                    <button onClick={handleLike}>
                      {liked ? likeFill : likeIconOutline}
                    </button>
                    <button onClick={() => commentInput.current.focus()}>
                      {commentIcon}
                    </button>
                    {shareIcon}
                  </div>
                  <button onClick={handleSave}>
                    {saved ? saveIconFill : saveIconOutline}
                  </button>
                </div>

                {/* Hiển thị số lượt thích */}
                <span className="w-full font-semibold text-sm">
                  {likes ? likes.length : 0} lượt thích
                </span>
              </div>

              {/* Form nhập bình luận */}
              <form
                onSubmit={handleComment}
                className="flex items-center justify-between p-3 w-full space-x-3 relative"
              >
                <span
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="cursor-pointer"
                >
                  {emojiIcon}
                </span>

                {showEmojis && (
                  <div className="absolute bottom-12 -left-20 z-10">
                    <Picker
                      set="google"
                      onSelect={(e) => setComment(comment + e.native)}
                      title="Emojis"
                    />
                  </div>
                )}

                <input
                  className="flex-auto text-sm outline-none border-none bg-transparent"
                  type="text"
                  value={comment}
                  ref={commentInput}
                  required
                  onClick={() => setShowEmojis(false)}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Thêm bình luận..."
                />
                <button
                  type="submit"
                  className={`${
                    comment.trim().length < 1 || isSubmitting
                      ? "text-blue-300"
                      : "text-primary-blue"
                  } text-sm font-semibold`}
                  disabled={comment.trim().length < 1 || isSubmitting}
                >
                  {isSubmitting ? "Đang gửi..." : "Đăng"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default PostItem;
