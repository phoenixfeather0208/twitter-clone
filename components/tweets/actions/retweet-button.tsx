import { RetweetIcon } from "@/assets/retweet-icon";
import { Repeat2 } from "lucide-react";
import { ITweet } from "../types";
import axios from "axios";
import { useSession } from "next-auth/react";

const RetweetButton = ({ tweet }: { tweet: ITweet }) => {
  const { data: session }: any = useSession();

  const retweet = async () => {
    const tweetData = {
      body: tweet.body,
      userId: session?.currentUser?.id,
      in_reply_to_screen_name: "",
      in_reply_to_tweet_id: "",
      media: tweet.media,
      image: tweet.image,
      target_id: tweet.id,
    };

    console.log(tweetData);

    const { data } = await axios.post("/api/tweets", { tweet: tweetData });
    console.log(tweet, data);
  };

  return (
    <div className="flex flex-row items-center space-x-1 group">
      <span
        className={` rounded-full p-2 fill-gray-600 dark:fill-gray-500 cursor-pointer   group-hover:fill-green-500 
        transition-colors duration-200 ease-in-out 
        group-hover:bg-green-500/10
         h-8 w-8
      `}
        onClick={() => retweet()}
      >
        <RetweetIcon />
      </span>
    </div>
  );
};

export default RetweetButton;
