import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deletePost, likePost, savePost } from "../../actions/postAction";
import { toast } from "react-toastify";
import {
  BASE_POST_IMAGE_URL,
  BASE_PROFILE_IMAGE_URL,
} from "../../utils/constants";
import { likeFill } from "../Navbar/SvgIcons";
import {
  commentIcon,
  emojiIcon,
  likeIconOutline,
  moreIcons,
  saveIconFill,
  saveIconOutline,
  shareIcon,
} from "./SvgIcons";
import { Picker } from "emoji-mart";
import ScrollToBottom from "react-scroll-to-bottom";
import axios from "axios";
import moment from "moment";
import { Dialog } from "@mui/material";
import { AppContext } from "../../context/AppContext";

// Component hiển thị bình luận
const CommentItem = ({
  comment,
  postId,
  level = 0,
  onReplySubmit,
  onCommentDeleted,
}) => {
  const { user } = useSelector((state) => state.user);
  const { socket } = useContext(AppContext);

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showChildComments, setShowChildComments] = useState(false);
  const [childComments, setChildComments] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    comment.comment_likes ? comment.comment_likes.length : 0,
  );
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Kiểm tra xem người dùng hiện tại đã thích bình luận này chưa
    if (comment.comment_likes) {
      setLiked(comment.comment_likes.includes(user._id));
      setLikeCount(comment.comment_likes.length);
    }
  }, [comment.comment_likes, user._id]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    console.log("Đang gửi bình luận trả lời cho:", comment._id);

    try {
      const success = await onReplySubmit(replyContent, comment._id);

      if (success) {
        setReplyContent("");
        setShowReplyForm(false);
        // Thêm timeout để đảm bảo server đã xử lý xong
        setTimeout(() => {
          loadChildComments();
        }, 500);
      }
    } catch (error) {
      console.error("Lỗi khi gửi bình luận trả lời:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadChildComments = async () => {
    setLoadingChildren(true);
    try {
      console.log("Đang tải bình luận con cho comment ID:", comment._id);
      const response = await axios.get(
        `/api/v1/comments/${postId}/parent?parentId=${comment._id}`,
      );

      if (response.data.success) {
        const uniqueComments = [];
        const commentIds = new Set();

        response.data.comments.forEach((comment) => {
          if (!commentIds.has(comment._id)) {
            commentIds.add(comment._id);
            uniqueComments.push(comment);
          }
        });

        setChildComments(uniqueComments);
        setShowChildComments(true);
      }
    } catch (error) {
      console.error("Lỗi khi tải bình luận con:", error);
    } finally {
      setLoadingChildren(false);
    }
  };

  // Kiểm tra nếu comment có thể có replies dựa trên left và right
  const hasChildren = comment.comment_right - comment.comment_left > 1;

  const toggleChildComments = () => {
    if (showChildComments) {
      setShowChildComments(false);
    } else {
      loadChildComments();
    }
  };
  // Hàm xử lý thích/bỏ thích bình luận
  const handleLikeComment = async () => {
    try {
      const wasLiked = !liked; // Lưu trạng thái trước khi cập nhật UI
      setLiked(!liked); // Cập nhật UI ngay lập tức để phản hồi người dùng
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);

      const response = await axios.post(`/api/v1/comment/${comment._id}/like`);

      if (response.data.success) {
        // Cập nhật lại state dựa trên phản hồi từ server
        setLiked(response.data.isLiked);
        setLikeCount(response.data.likeCount);

        // Gửi thông báo qua socket nếu là like (không phải unlike)
        // và người like không phải chủ comment
        if (
          socket?.current &&
          response.data.isLiked &&
          comment.comment_userId._id !== user._id
        ) {
          socket.current.emit("likeComment", {
            commentId: comment._id,
            postId: postId,
            likerId: user._id,
            commentOwnerId: comment.comment_userId._id,
            likerName: user.username || user.name,
          });
        }
      }
    } catch (error) {
      // Nếu có lỗi, hoàn tác thay đổi UI
      setLiked(!liked);
      setLikeCount(liked ? likeCount + 1 : likeCount - 1);
      console.error("Lỗi khi thích/bỏ thích bình luận:", error);
    }
  };

  // Hàm xử lý xóa bình luận
  const handleDeleteComment = async () => {
    try {
      const response = await axios.delete(`/api/v1/comment/${comment._id}`, {
        data: { postId: postId },
      });

      if (response.data.success) {
        // Thông báo cho component cha biết bình luận đã bị xóa
        onCommentDeleted(comment._id);
      }
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error);
    } finally {
      setDeleteDialog(false);
    }
  };

  // Kiểm tra quyền xóa bình luận
  const canDelete = user._id === comment.comment_userId._id;

  return (
    // <div
    //   className={`mb-3 ${level > 0 ? "border-l-2 border-gray-200 pl-4 ml-4" : ""}`}
    // >
    <div
      id={`comment-${comment._id}`}
      className={`mb-3 ${level > 0 ? "border-l-2 border-gray-200 pl-4 ml-4" : ""}`}
    >
      <div className="flex items-start space-x-2">
        <img
          draggable="false"
          className="h-7 w-7 rounded-full object-cover mr-0.5"
          src={ comment.comment_userId.avatar}
          alt="avatar"
        />
        <div className="flex flex-col flex-1">
          <div className="flex items-start">
            <Link
              to={`/${comment.comment_userId.username}`}
              className="text-sm font-semibold hover:underline mr-2"
            >
              {comment.comment_userId.username}
            </Link>
            <p className="text-sm">{comment.comment_content}</p>
          </div>

          <div className="flex space-x-4 mt-1 text-xs text-gray-500">
            <span>{moment(comment.createdAt).fromNow()}</span>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleLikeComment}
                className="focus:outline-none"
              >
                {liked ? (
                  <span className="text-red-500">❤️</span>
                ) : (
                  <span>🤍</span>
                )}
              </button>
              {likeCount > 0 && <span>{likeCount}</span>}
            </div>

            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="font-semibold hover:text-gray-700"
            >
              Trả lời
            </button>

            {hasChildren && (
              <button
                onClick={toggleChildComments}
                className="font-semibold hover:text-gray-700"
              >
                {showChildComments ? "Ẩn trả lời" : "Xem trả lời"}
              </button>
            )}

            {/* Nút xóa bình luận */}
            {canDelete && (
              <button
                onClick={() => setDeleteDialog(true)}
                className="font-semibold text-red-500 hover:text-red-700"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Dialog xác nhận xóa bình luận */}
          <Dialog
            open={deleteDialog}
            onClose={() => setDeleteDialog(false)}
            maxWidth="xs"
          >
            <div className="flex flex-col items-center p-4 w-64">
              <h3 className="mb-4 text-lg font-medium">Xóa bình luận?</h3>
              <p className="mb-4 text-sm text-gray-500">
                Bạn có chắc chắn muốn xóa bình luận này không?
              </p>
              <div className="flex w-full space-x-2">
                <button
                  onClick={handleDeleteComment}
                  className="w-1/2 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                >
                  Xóa
                </button>
                <button
                  onClick={() => setDeleteDialog(false)}
                  className="w-1/2 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Hủy
                </button>
              </div>
            </div>
          </Dialog>

          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="mt-2 flex">
              <span
                onClick={() => setShowEmojis(!showEmojis)}
                className="cursor-pointer mr-2"
              >
                {emojiIcon}
              </span>

              {showEmojis && (
                <div className="absolute z-10">
                  <Picker
                    set="google"
                    onSelect={(e) => setReplyContent(replyContent + e.native)}
                    title="Emojis"
                  />
                </div>
              )}

              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Viết trả lời..."
                className="flex-1 text-sm outline-none border rounded-l-lg px-2 py-1"
                required
                onFocus={() => setShowEmojis(false)}
              />
              <button
                type="submit"
                className={`${replyContent.trim().length < 1 || isSubmitting ? "text-blue-300" : "text-white bg-primary-blue"} text-sm font-semibold px-2 rounded-r-lg`}
                disabled={replyContent.trim().length < 1 || isSubmitting}
              >
                {isSubmitting ? "Đang gửi..." : "Gửi"}
              </button>
            </form>
          )}
        </div>
      </div>

      {loadingChildren && (
        <div className="mt-2 text-gray-500 text-sm pl-9">
          Đang tải bình luận...
        </div>
      )}

      {/* Hiển thị bình luận con với đường viền rõ ràng */}
      {showChildComments && childComments.length > 0 && (
        <div className="mt-2">
          {childComments.map((childComment) => (
            <CommentItem
              key={`comment-${childComment._id}-${level}`}
              comment={childComment}
              postId={postId}
              level={level + 1}
              onReplySubmit={onReplySubmit}
              onCommentDeleted={onCommentDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Component PostItem chính
const PostItem = ({
  _id,
  caption,
  likes,
  comments,
  image,
  postedBy,
  savedBy,
  createdAt,
  setUsersDialog,
  setUsersList,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const commentInput = useRef(null);

  const { user } = useSelector((state) => state.user);

  const [allLikes, setAllLikes] = useState(likes);
  const [hierarchicalComments, setHierarchicalComments] = useState([]);
  const [allSavedBy, setAllSavedBy] = useState(savedBy);
  const { socket } = useContext(AppContext);
  const [deleteModal, setDeleteModal] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comment, setComment] = useState("");
  const [viewComment, setViewComment] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [newCaption, setNewCaption] = useState(caption);
  const [likeEffect, setLikeEffect] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  // Lấy thông tin từ URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const focusedCommentId = queryParams.get("comment");
  const action = queryParams.get("action");
  const [highlightLike, setHighlightLike] = useState(false);

  // Xử lý tham số từ thông báo
  useEffect(() => {
    // Xử lý highlight like nếu là thông báo like bài đăng
    if (action === "like") {
      setHighlightLike(true);
      // Highlight trong 3 giây rồi trở về bình thường
      setTimeout(() => {
        setHighlightLike(false);
      }, 3000);
    }

    // Xử lý khi có comment id cần focus
    if (focusedCommentId) {
      setViewComment(true);

      // Đợi bình luận được tải
      setTimeout(() => {
        loadComments().then(() => {
          setTimeout(() => {
            const commentElement = document.getElementById(
              `comment-${focusedCommentId}`,
            );
            if (commentElement) {
              commentElement.scrollIntoView({ behavior: "smooth" });
              // Thêm class highlight tạm thời
              commentElement.classList.add("bg-blue-50");
              setTimeout(() => {
                commentElement.classList.remove("bg-blue-50");
              }, 3000);
            }
          }, 500);
        });
      }, 500);
    }
  }, [focusedCommentId, action]);

  // Kiểm tra kết nối socket khi component mount
  useEffect(() => {
    if (socket && socket.current) {
      console.log("Socket đã kết nối:", socket.current.connected);

      if (!socket.current.connected) {
        console.log("Socket chưa kết nối, đang thử kết nối lại...");
        socket.current.connect();
      }
    } else {
      console.log("Socket chưa được khởi tạo");
    }
  }, [socket]);

  // Tải bình luận từ API khi mở xem bình luận
  useEffect(() => {
    if (viewComment) {
      loadComments();
    }
  }, [viewComment]);

  // Tải số lượng bình luận khi component mount
  useEffect(() => {
    fetchCommentCount();
  }, [_id]);

  // Tải số lượng bình luận
  const fetchCommentCount = async () => {
    try {
      const response = await axios.get(`/api/v1/comments/${_id}/count`);
      if (response.data.success) {
        setCommentCount(response.data.count);
      }
    } catch (error) {
      console.error("Lỗi khi tải số lượng bình luận:", error);
    }
  };

  // Tải bình luận gốc (không có parent)
  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      console.log("Đang tải bình luận gốc cho bài đăng:", _id);
      const response = await axios.get(`/api/v1/comments/${_id}/parent`);
      if (response.data.success) {
        console.log("Bình luận gốc nhận được:", response.data.comments);

        // Lọc bỏ bình luận trùng lặp
        const uniqueComments = [];
        const commentIds = new Set();

        response.data.comments.forEach((comment) => {
          if (!commentIds.has(comment._id)) {
            commentIds.add(comment._id);
            uniqueComments.push(comment);
          }
        });

        setHierarchicalComments(uniqueComments);
        return true; // Thêm dòng này để trả về true khi tải thành công
      }
      return false; // Thêm dòng này để trả về false khi tải không thành công
    } catch (error) {
      console.error("Lỗi khi tải bình luận:", error);
      return false; // Thêm dòng này để trả về false khi có lỗi
    } finally {
      setCommentsLoading(false);
    }
  };
  // Xử lý khi một bình luận bị xóa
  const handleCommentDeleted = (commentId) => {
    console.log("Bình luận đã bị xóa:", commentId);

    // Xóa bình luận khỏi danh sách hiện tại
    setHierarchicalComments((prevComments) =>
      prevComments.filter((comment) => comment._id !== commentId),
    );

    // Giảm số lượng bình luận
    setCommentCount((prev) => Math.max(0, prev - 1));

    // Tải lại bình luận sau khi xóa
    fetchCommentCount();
  };

  // Lắng nghe sự kiện updatePost từ Socket.IO
  useEffect(() => {
    if (!socket || !socket.current) return;

    const handlePostUpdate = (data) => {
      console.log("Nhận sự kiện updatePost:", data);

      if (data.action === "like" && data.data && data.data.post) {
        setAllLikes(data.data.post.likes);
      } else if (data.action === "comment") {
        // Khi có bình luận mới, cập nhật số lượng bình luận và tải lại nếu đang xem
        fetchCommentCount();
        if (viewComment) {
          loadComments();
        }
      }
    };

    socket.current.on("updatePost", handlePostUpdate);

    return () => {
      socket.current.off("updatePost", handlePostUpdate);
    };
  }, [socket, viewComment, _id]);
  // Thêm hàm này vào các hàm xử lý
  const fetchFollowingUsers = async () => {
    try {
      const response = await axios.get("/api/v1/user/following");
      if (response.data.success) {
        setFollowingUsers(response.data.users);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng đang follow:", error);
      toast.error("Không thể tải danh sách người dùng");
    }
  };
  const handleSharePost = () => {
    // Mở modal share thay vì chuyển hướng
    setShareModal(true);
    // Lấy danh sách người dùng đang follow
    fetchFollowingUsers();
  };
  const handleShareToUser = async (recipientId, recipientUsername) => {
    setIsSharing(true);
    try {
      // Gọi API để chia sẻ bài viết
      const response = await axios.post("/api/v1/message/share-post", {
        postId: _id,
        recipientId: recipientId,
        message: `Đã chia sẻ một bài viết với bạn`,
      });

      if (response.data.success) {
        toast.success(`Đã chia sẻ bài viết với ${recipientUsername}`);
        setShareModal(false);

        // Gửi thông báo qua socket để làm real-time
        if (socket?.current && socket.current.connected) {
          socket.current.emit("sharePost", {
            senderId: user._id,
            senderName: user.username || user.name,
            recipientId: recipientId,
            postId: _id,
            postImage: image,
            postCaption: caption,
            postOwnerUsername: postedBy.username,
            message: `Đã chia sẻ một bài viết với bạn`,
          });
          console.log("Đã gửi sự kiện sharePost qua socket");
        }
      }
    } catch (error) {
      console.error("Lỗi khi chia sẻ bài viết:", error);
      toast.error("Có lỗi xảy ra khi chia sẻ bài viết");
    } finally {
      setIsSharing(false);
    }
  };
  // Xử lý like/unlike bài đăng
  const handleLike = async () => {
    const wasLiked = liked; // Lưu trạng thái trước khi cập nhật UI
    setLiked(!liked); // Cập nhật UI ngay lập tức

    try {
      await dispatch(likePost(_id));
      const { data } = await axios.get(`/api/v1/post/detail/${_id}`);
      setAllLikes(data.post.likes);

      // Gửi thông báo qua socket.io
      if (socket?.current && socket.current.connected) {
        // Thêm thông tin người like
        const postData = {
          ...data,
          likerId: user._id,
          likerName: user.username || user.name,
        };

        socket.current.emit("likePost", postData);
        console.log("Đã gửi sự kiện likePost:", postData);
      } else {
        console.log("Socket không khả dụng hoặc không kết nối");
      }
    } catch (error) {
      // Nếu có lỗi, hoàn tác UI
      setLiked(wasLiked);
      console.error("Lỗi khi cập nhật like:", error);
    }
  };

  // Gửi bình luận mới (không có parent)
  const handleComment = async (e) => {
    e.preventDefault();

    if (!comment.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Gửi bình luận mới:", {
        postId: _id,
        content: comment,
        parentCommentId: null,
      });

      // Thêm các thông tin debug để xem request
      console.log("URL API:", `/api/v1/post/${_id}/comment`);

      // Gọi API để tạo comment
      const response = await axios({
        method: "post",
        url: `/api/v1/post/${_id}/comment`,
        data: {
          content: comment,
          parentCommentId: null,
        },
        // Thêm header để dễ debug
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Kết quả gửi bình luận:", response.data);

      // Xóa nội dung input
      setComment("");

      // Tải lại bình luận và số lượng
      fetchCommentCount();
      if (viewComment) {
        // Thêm timeout để đảm bảo server đã xử lý xong
        setTimeout(() => {
          loadComments();
        }, 500);
      }

      // Emit sự kiện socket nếu socket khả dụng
      if (socket?.current && socket.current.connected) {
        console.log("Emit sự kiện commentPost");

        socket.current.emit("commentPost", {
          post: {
            _id: _id,
            postedBy: postedBy._id,
          },
          comment: response.data.comment,
          commenterId: user._id,
          commenterName: user.username || user.name,
        });
      } else {
        console.log(
          "Socket không khả dụng hoặc không kết nối, không thể emit sự kiện",
        );
      }
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
      // Thêm thông tin chi tiết về lỗi
      if (error.response) {
        console.error(
          "Lỗi response:",
          error.response.status,
          error.response.data,
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  // Xử lý trả lời bình luận
  const handleReplySubmit = async (content, parentId) => {
    if (!content.trim()) return false;

    try {
      console.log("Gửi bình luận trả lời:", {
        postId: _id,
        content: content,
        parentCommentId: parentId,
      });

      const response = await axios.post(`/api/v1/post/${_id}/comment`, {
        content,
        parentCommentId: parentId,
      });

      console.log("Kết quả trả lời:", response.data);

      // Cập nhật số lượng bình luận
      fetchCommentCount();

      // Gửi thông báo về trả lời bình luận qua socket
      if (socket?.current && socket.current.connected) {
        try {
          // Tìm thông tin về comment gốc
          const parentCommentResponse = await axios.get(
            `/api/v1/comment/${parentId}`,
          );

          if (
            parentCommentResponse.data &&
            parentCommentResponse.data.comment
          ) {
            const parentComment = parentCommentResponse.data.comment;
            const parentCommentOwnerId =
              parentComment.comment_userId._id || parentComment.comment_userId;

            // Chỉ gửi thông báo nếu người trả lời không phải là chủ bình luận gốc
            if (parentCommentOwnerId !== user._id) {
              socket.current.emit("replyComment", {
                commentId: response.data.comment._id,
                postId: _id,
                parentCommentId: parentId,
                replierId: user._id,
                parentCommentOwnerId: parentCommentOwnerId,
                replierName: user.username || user.name,
              });

              console.log("Đã gửi sự kiện replyComment");
            }
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin comment gốc:", error);
        }
      } else {
        console.log(
          "Socket không khả dụng hoặc không kết nối, không thể emit sự kiện",
        );
      }

      return true;
    } catch (error) {
      console.error("Lỗi khi gửi trả lời:", error);
      return false;
    }
  };

  const handleSave = async () => {
    setSaved(!saved);
    await dispatch(savePost(_id));
    const { data } = await axios.get(`/api/v1/post/detail/${_id}`);
    setAllSavedBy(data.post.savedBy);
  };

  const handleLikeModal = () => {
    setUsersDialog(true);
    setUsersList(allLikes);
  };

  const handleDeletePost = () => {
    dispatch(deletePost(_id, true));
    setDeleteModal(false);
  };

  const handleEditPost = async () => {
    try {
      const response = await axios.put(`/api/v1/post/${_id}`, {
        caption: newCaption,
      });

      if (response.data.success) {
        toast.success("Cập nhật bài viết thành công!");
        setEditModal(false);
        setDeleteModal(false);
        // Cập nhật caption hiển thị trên UI
        // Bạn có thể reload trang hoặc cập nhật state caption trong component
        window.location.reload();
        // Hoặc cách tốt hơn là dispatch một action để cập nhật state Redux
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
      toast.error("Có lỗi xảy ra khi cập nhật bài viết");
    }
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

  const closeDeleteModal = () => {
    setDeleteModal(false);
  };

  useEffect(() => {
    setLiked(allLikes.some((u) => u._id === user._id));
  }, [allLikes, user._id]);

  useEffect(() => {
    setSaved(allSavedBy.some((id) => id === user._id));
  }, [allSavedBy, user._id]);

  return (
    <div className="flex flex-col border rounded bg-white relative">
      {/* Header phần */}
      <div className="flex justify-between px-3 py-2.5 border-b items-center">
        <div className="flex space-x-3 items-center">
          <Link to={`/${postedBy.username}`}>
            <img
              draggable="false"
              className="w-10 h-10 rounded-full object-cover"
              src={ postedBy.avatar}
              alt="avatar"
            />
          </Link>
          <Link
            to={`/${postedBy.username}`}
            className="text-black text-sm font-semibold"
          >
            {postedBy.username}
          </Link>
        </div>
        <span onClick={() => setDeleteModal(true)} className="cursor-pointer">
          {moreIcons}
        </span>

        <Dialog open={deleteModal} onClose={closeDeleteModal} maxWidth="xl">
          <div className="flex flex-col items-center w-80">
            {postedBy._id === user._id && (
              <>
                <button
                  onClick={() => {
                    setEditModal(true);
                    setDeleteModal(false);
                    setNewCaption(caption); // Đảm bảo newCaption được cập nhật với giá trị hiện tại
                  }}
                  className="text-black font-medium border-b py-2.5 w-full hover:bg-gray-50"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={handleDeletePost}
                  className="text-red-600 font-medium border-b py-2.5 w-full hover:bg-red-50"
                >
                  Xóa
                </button>
              </>
            )}
            <button
              onClick={closeDeleteModal}
              className="py-2.5 w-full hover:bg-gray-50"
            >
              Hủy
            </button>
          </div>
        </Dialog>
        {/* Dialog chỉnh sửa bài viết */}
        <Dialog
          open={editModal}
          onClose={() => setEditModal(false)}
          maxWidth="xl"
        >
          <div className="flex flex-col p-4 w-80">
            <h3 className="text-xl font-medium mb-4">Chỉnh sửa bài viết</h3>
            <textarea
              className="w-full border rounded p-2 mb-4 resize-none"
              rows="4"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              placeholder="Nhập nội dung mới..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleEditPost}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Lưu
              </button>
            </div>
          </div>
        </Dialog>

        {/* Dialog chia sẻ bài viết */}
        <Dialog
          open={shareModal}
          onClose={() => setShareModal(false)}
          maxWidth="xs"
        >
          <div className="flex flex-col p-4 w-80">
            <h3 className="text-xl font-medium mb-4">Chia sẻ bài viết</h3>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                className="w-full border rounded p-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="max-h-60 overflow-y-auto">
              {followingUsers.length > 0 ? (
                followingUsers
                  .filter(
                    (u) =>
                      u.username
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      (u.name &&
                        u.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())),
                  )
                  .map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between py-2 border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleShareToUser(user._id, user.username)}
                    >
                      <div className="flex items-center">
                        <img
                          src={ user.avatar}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <div>
                          <div className="font-semibold">{user.username}</div>
                          {user.name && (
                            <div className="text-sm text-gray-500">
                              {user.name}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        className="text-primary-blue font-semibold text-sm"
                        disabled={isSharing}
                      >
                        Gửi
                      </button>
                    </div>
                  ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {searchTerm ? "Không tìm thấy người dùng" : "Đang tải..."}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShareModal(false)}
                className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
              >
                Hủy
              </button>
            </div>
          </div>
        </Dialog>
      </div>

      {/* Phần ảnh bài đăng */}
      <div
        className="relative flex items-center justify-center"
        onDoubleClick={setLike}
      >
        <img
          draggable="false"
          loading="lazy"
          className="w-full h-full object-cover object-center"
          src={image}
          alt="post image"
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

      {/* Phần nút like, bình luận và caption */}
      <div className="flex flex-col px-4 space-y-1 border-b pb-2 mt-2">
        {/* Các nút tương tác */}
        <div className="flex items-center justify-between py-2">
          <div className="flex space-x-4">
            <button onClick={handleLike}>
              {liked ? likeFill : likeIconOutline}
            </button>
            <button onClick={() => commentInput.current.focus()}>
              {commentIcon}
            </button>
            <button onClick={handleSharePost}>{shareIcon}</button>
          </div>
          <button onClick={handleSave}>
            {saved ? saveIconFill : saveIconOutline}
          </button>
        </div>

        {/* Số lượt thích */}
        <span
          onClick={handleLikeModal}
          className="font-semibold text-sm cursor-pointer"
        >
          {allLikes.length} lượt thích
        </span>

        {/* Caption */}
        <div className="flex flex-auto items-center space-x-1">
          <Link
            to={`/${postedBy.username}`}
            className="text-sm font-semibold hover:underline"
          >
            {postedBy.username}
          </Link>
          <span className="text-sm">{caption}</span>
        </div>

        {/* Số lượng bình luận và thời gian */}
        {commentCount > 0 ? (
          <span
            onClick={() => setViewComment(!viewComment)}
            className="text-[13px] text-gray-500 cursor-pointer"
          >
            {viewComment
              ? "Ẩn bình luận"
              : commentCount === 1
                ? `Xem ${commentCount} bình luận`
                : `Xem tất cả ${commentCount} bình luận`}
          </span>
        ) : (
          <span className="text-[13px] text-gray-500">
            Chưa có bình luận nào!
          </span>
        )}
        <span className="text-xs text-gray-500 cursor-pointer">
          {moment(createdAt).fromNow()}
        </span>

        {/* Phần hiển thị bình luận */}
        {viewComment && (
          <ScrollToBottom className="w-full h-52 overflow-y-auto py-1">
            {commentsLoading ? (
              <div className="text-center py-4 text-gray-500">
                Đang tải bình luận...
              </div>
            ) : hierarchicalComments.length > 0 ? (
              hierarchicalComments.map((comment) => (
                <CommentItem
                  key={`root-comment-${comment._id}`}
                  comment={comment}
                  postId={_id}
                  onReplySubmit={handleReplySubmit}
                  onCommentDeleted={handleCommentDeleted}
                />
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                Chưa có bình luận nào!
              </div>
            )}
          </ScrollToBottom>
        )}
      </div>

      {/* Form nhập bình luận */}
      <form
        onSubmit={handleComment}
        className="flex items-center justify-between p-3 w-full space-x-3"
      >
        <span
          onClick={() => setShowEmojis(!showEmojis)}
          className="cursor-pointer"
        >
          {emojiIcon}
        </span>

        {showEmojis && (
          <div className="absolute bottom-12 -left-2 z-10">
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
          onFocus={() => setShowEmojis(false)}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Thêm bình luận..."
        />
        <button
          type="submit"
          className={`${comment.trim().length < 1 || isSubmitting ? "text-blue-300" : "text-primary-blue"} text-sm font-semibold`}
          disabled={comment.trim().length < 1 || isSubmitting}
        >
          {isSubmitting ? "Đang gửi..." : "Đăng"}
        </button>
      </form>
    </div>
  );
};

export default PostItem;
