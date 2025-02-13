import {useContext, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Link} from "react-router-dom";
import {addComment, deletePost, likePost, savePost,} from "../../actions/postAction";
import {BASE_POST_IMAGE_URL, BASE_PROFILE_IMAGE_URL,} from "../../utils/constants";
import {likeFill} from "../Navbar/SvgIcons";
import {
    commentIcon,
    emojiIcon,
    likeIconOutline,
    moreIcons,
    saveIconFill,
    saveIconOutline,
    shareIcon,
} from "./SvgIcons";
import {Picker} from "emoji-mart";
import ScrollToBottom from "react-scroll-to-bottom";
import axios from "axios";
import moment from "moment";
import {Dialog} from "@mui/material";
import {AppContext} from "../../context/AppContext";

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
    const dispatch = useDispatch();
    const commentInput = useRef(null);

    const {user} = useSelector((state) => state.user);
    // const { loading, post } = useSelector((state) => state.postDetails);

    const [allLikes, setAllLikes] = useState(likes);
    const [allComments, setAllComments] = useState(comments);
    const [allSavedBy, setAllSavedBy] = useState(savedBy);
    const {socket} = useContext(AppContext);
    const [deleteModal, setDeleteModal] = useState(false);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [comment, setComment] = useState("");
    const [viewComment, setViewComment] = useState(false);
    const [showEmojis, setShowEmojis] = useState(false);

    const [likeEffect, setLikeEffect] = useState(false);

    useEffect(() => {
        if (!socket) return;
        socket.current.on("updatePost", (data) => {
            if (data.action === "like") {
                setAllLikes(data.data.post.likes);
            } else if (data.action === "comment") {
                setAllComments(data.data.post.comments);
            }
        });
    }, [socket]);

    const handleLike = async () => {
        setLiked(!liked);
        await dispatch(likePost(_id));
        const {data} = await axios.get(`/api/v1/post/detail/${_id}`);
        //socket send like
        socket?.current.emit("likePost", data);
    };

    const handleComment = async (e) => {
        e.preventDefault();

        if (!comment.trim()) {
            return;
        }
        await dispatch(addComment(_id, comment));
        setComment("");
        const {data} = await axios.get(`/api/v1/post/detail/${_id}`);
        socket?.current.emit("commentPost", data);
    };
    const handleSave = async () => {
        setSaved(!saved);
        await dispatch(savePost(_id));
        const {data} = await axios.get(`/api/v1/post/detail/${_id}`);
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
    }, [allLikes]);

    useEffect(() => {
        setSaved(allSavedBy.some((id) => id === user._id));
    }, [allSavedBy]);

    return (
        <div className="flex flex-col border rounded bg-white relative">
            <div className="flex justify-between px-3 py-2.5 border-b items-center">
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
                            <button
                                onClick={handleDeletePost}
                                className="text-red-600 font-medium border-b py-2.5 w-full hover:bg-red-50"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            onClick={closeDeleteModal}
                            className="py-2.5 w-full hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </Dialog>
            </div>

            {/* post image container */}
            <div
                className="relative flex items-center justify-center"
                onDoubleClick={setLike}
            >
                <img
                    draggable="false"
                    loading="lazy"
                    className="w-full h-full object-cover object-center"
                    src={BASE_POST_IMAGE_URL + image}
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

            {/* like comment container */}
            <div className="flex flex-col px-4 space-y-1 border-b pb-2 mt-2">
                {/* icons container */}
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

                {/* likes  */}
                <span
                    onClick={handleLikeModal}
                    className="font-semibold text-sm cursor-pointer"
                >
          {allLikes.length} likes
        </span>

                {/* comment */}
                <div className="flex flex-auto items-center space-x-1">
                    <Link
                        to={`/${postedBy.username}`}
                        className="text-sm font-semibold hover:underline"
                    >
                        {postedBy.username}
                    </Link>
                    <span className="text-sm">{caption}</span>
                </div>

                {/* time */}
                {allComments.length > 0 ? (
                    <span
                        onClick={() => setViewComment(!viewComment)}
                        className="text-[13px] text-gray-500 cursor-pointer"
                    >
            {viewComment
                ? "Hide Comments"
                : allComments.length === 1
                    ? `View ${allComments.length} Comment`
                    : `View All ${allComments.length} Comments`}
          </span>
                ) : (
                    <span className="text-[13px] text-gray-500">No Comments Yet!</span>
                )}
                <span className="text-xs text-gray-500 cursor-pointer">
          {moment(createdAt).fromNow()}
        </span>

                {viewComment && (
                    <ScrollToBottom className="w-full h-52 overflow-y-auto py-1">
                        {allComments.map((c) => (
                            <div className="flex items-start mb-2 space-x-2" key={c._id}>
                                <img
                                    draggable="false"
                                    className="h-7 w-7 rounded-full object-cover mr-0.5"
                                    src={BASE_PROFILE_IMAGE_URL + c.user.avatar}
                                    alt="avatar"
                                />
                                <Link
                                    to={`/${c.user}`}
                                    className="text-sm font-semibold hover:underline"
                                >
                                    {c.user.username}
                                </Link>
                                <p className="text-sm">{c.comment}</p>
                            </div>
                        ))}
                    </ScrollToBottom>
                )}
            </div>

            {/* comment input container */}
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
                    <div className="absolute bottom-12 -left-2">
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
                    placeholder="Add a comment..."
                />
                <button
                    type="submit"
                    className={`${comment.trim().length < 1 ? "text-blue-300" : "text-primary-blue"} text-sm font-semibold`}
                    disabled={comment.trim().length < 1}
                >
                    Post
                </button>
            </form>
        </div>
    );
};

export default PostItem;
