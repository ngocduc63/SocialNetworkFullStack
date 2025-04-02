import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { clearErrors, getPostsOfFollowing } from "../../actions/postAction";
import {
  LIKE_UNLIKE_POST_RESET,
  NEW_COMMENT_RESET,
  POST_FOLLOWING_RESET,
  SAVE_UNSAVE_POST_RESET,
} from "../../constants/postConstants";
import UsersDialog from "../Layouts/UsersDialog";
import PostItem from "./PostItem";
import StoriesContainer from "./StoriesContainer";
import InfiniteScroll from "react-infinite-scroll-component";
import SpinLoader from "../Layouts/SpinLoader";
import SkeletonPost from "../Layouts/SkeletonPost";

const PostsContainer = ({ postId }) => {
  const dispatch = useDispatch();

  const [usersList, setUsersList] = useState([]);
  const [usersDialog, setUsersDialog] = useState(false);
  const [page, setPage] = useState(2);

  // State mới cho bài đăng đơn lẻ
  const [singlePost, setSinglePost] = useState(null);
  const [singlePostLoading, setSinglePostLoading] = useState(false);

  const { loading, error, posts, totalPosts } = useSelector(
    (state) => state.postOfFollowing,
  );
  const {
    error: likeError,
    message,
    success,
  } = useSelector((state) => state.likePost);
  const { error: commentError, success: commentSuccess } = useSelector(
    (state) => state.newComment,
  );
  const {
    error: saveError,
    success: saveSuccess,
    message: saveMessage,
  } = useSelector((state) => state.savePost);

  const handleClose = () => setUsersDialog(false);

  // Tải bài đăng đơn lẻ nếu có postId
  useEffect(() => {
    if (postId) {
      // const fetchSinglePost = async () => {
      //   setSinglePostLoading(true);
      //   try {
      //     const { data } = await axios.get(`/api/v1/post/detail/${postId}`);
      //     if (data.success) {
      //       setSinglePost(data.post);
      //     }
      //   } catch (error) {
      //     console.error("Lỗi khi tải chi tiết bài đăng:", error);
      //     toast.error("Không thể tải bài đăng. Vui lòng thử lại.");
      //   } finally {
      //     setSinglePostLoading(false);
      //   }
      // };
      //
      // fetchSinglePost();
      const fetchSinglePost = async () => {
        setSinglePostLoading(true);
        try {
          console.log("Đang tải bài đăng với ID:", postId);

          // Thêm headers authorization nếu cần
          const config = {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true, // Đảm bảo gửi cookies nếu bạn đang sử dụng cookies để xác thực
          };

          const { data } = await axios.get(
            `/api/v1/post/detail/${postId}`,
            config,
          );

          if (data.success) {
            console.log("Đã tải bài đăng thành công:", data.post);
            setSinglePost(data.post);
          }
        } catch (error) {
          console.error("Lỗi khi tải chi tiết bài đăng:", error);

          // Log chi tiết hơn về lỗi
          if (error.response) {
            console.error("Dữ liệu phản hồi:", error.response.data);
            console.error("Mã trạng thái:", error.response.status);

            if (error.response.status === 400) {
              toast.error("ID bài đăng không hợp lệ");
            } else if (error.response.status === 404) {
              toast.error("Không tìm thấy bài đăng");
            } else {
              toast.error(
                error.response.data?.message || "Không thể tải bài đăng",
              );
            }
          } else if (error.request) {
            console.error("Không nhận được phản hồi từ server");
            toast.error("Không nhận được phản hồi từ server");
          } else {
            console.error("Lỗi khi thiết lập request:", error.message);
            toast.error("Lỗi khi tải bài đăng");
          }
        } finally {
          setSinglePostLoading(false);
        }
      };
      fetchSinglePost();
    } else {
      // Nếu không có postId, tải danh sách bài đăng bình thường
      if (error) {
        toast.error(error);
        dispatch(clearErrors());
      }
      dispatch(getPostsOfFollowing());
      dispatch({ type: POST_FOLLOWING_RESET });
    }
  }, [dispatch, error, postId]);

  useEffect(() => {
    if (likeError) {
      toast.error(likeError);
      dispatch(clearErrors());
    }
    if (success) {
      toast.success(message);
      dispatch({ type: LIKE_UNLIKE_POST_RESET });
    }
    if (commentError) {
      toast.error(commentError);
      dispatch(clearErrors());
    }
    if (commentSuccess) {
      toast.success("Comment Added");
      dispatch({ type: NEW_COMMENT_RESET });
    }
    if (saveError) {
      toast.error(saveError);
      dispatch(clearErrors());
    }
    if (saveSuccess) {
      toast.success(saveMessage);
      dispatch({ type: SAVE_UNSAVE_POST_RESET });
    }
  }, [
    dispatch,
    success,
    likeError,
    message,
    commentError,
    commentSuccess,
    saveError,
    saveSuccess,
    saveMessage,
  ]);

  const fetchMorePosts = () => {
    setPage((prev) => prev + 1);
    dispatch(getPostsOfFollowing(page));
  };

  return (
    <>
      <div className="flex flex-col w-full lg:w-2/3 sm:mt-6 sm:px-8 mb-8">
        {/* Hiển thị StoriesContainer chỉ khi không xem bài đăng đơn lẻ */}
        {!postId && <StoriesContainer />}

        {/* Hiển thị bài đăng đơn lẻ khi có postId */}
        {postId ? (
          singlePostLoading ? (
            <SkeletonPost />
          ) : singlePost ? (
            <PostItem
              key={singlePost._id}
              {...singlePost}
              setUsersDialog={setUsersDialog}
              setUsersList={setUsersList}
            />
          ) : (
            <div className="text-center py-8 bg-white rounded mt-4 shadow">
              <h2 className="text-xl font-semibold text-gray-800">
                Không tìm thấy bài đăng
              </h2>
              <p className="text-gray-600 mt-2">
                Bài đăng không tồn tại hoặc đã bị xóa.
              </p>
            </div>
          )
        ) : (
          /* Hiển thị danh sách bài đăng khi không có postId */
          <>
            {loading &&
              Array(5)
                .fill("")
                .map((el, i) => <SkeletonPost key={i} />)}
            <InfiniteScroll
              dataLength={posts.length}
              next={fetchMorePosts}
              hasMore={posts.length !== totalPosts}
              loader={<SpinLoader />}
            >
              <div className="w-full h-full mt-1 sm:mt-6 flex flex-col space-y-4">
                {posts?.map((post) => (
                  <PostItem
                    key={`post-${post._id}`} // Chỉ thêm tiền tố vào key
                    {...post}
                    setUsersDialog={setUsersDialog}
                    setUsersList={setUsersList}
                  />
                ))}
              </div>
            </InfiniteScroll>
          </>
        )}

        <UsersDialog
          title="Likes"
          open={usersDialog}
          onClose={handleClose}
          usersList={usersList}
        />
      </div>
    </>
  );
};

export default PostsContainer;
