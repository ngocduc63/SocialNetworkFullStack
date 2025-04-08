import PostsContainer from "./PostsContainer";
import Sidebar from "./Sidebar/Sidebar";
import MetaData from "../Layouts/MetaData";
import { useParams } from "react-router-dom";

const Home = () => {
  // Lấy ID bài đăng từ tham số URL (nếu có)
  const { id: postId } = useParams();

  return (
    <>
      <MetaData title="Pollux" />

      <div className="flex h-full md:w-4/5 lg:w-4/6 mt-14 mx-auto">
        <PostsContainer postId={postId} />
        <Sidebar />
      </div>
    </>
  );
};

export default Home;
