import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { signIn } from "next-auth/react";
import axios from "axios";

const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  const result = await signInWithPopup(auth, provider);
  const user: any = result.user;

  try {
    if (!user.email) {
      return {
        success: false,
        msg: "Please verify your email on Google account.",
      };
    }

    const step1_value = {
      name: user.displayName,
      email: user.email,
    };

    const data: any = await axios.post(
      "/api/auth/register?step=1",
      step1_value
    );

    if (data.data.success) {
      return { success: true, data: step1_value };
    }
  } catch (error: any) {
    if (error.status === 400) {
      await signIn("credentials", {
        email: user.email,
        password: user.email,
      });
    } else {
      //   console.error("Error signing in with Google:", error);
      //   throw error;
      return {
        success: false,
        msg: "Error signing in with Google.",
      };
    }
  }
};

const signInWithTwitter = async () => {
  const provider = new TwitterAuthProvider();

  const result = await signInWithPopup(auth, provider);
  const user: any = result.user;

  try {
    if (!user.email) {
      return {
        success: false,
        msg: "Please verify your email on X account.",
      };
    }

    const step1_value = {
      name: user.displayName,
      email: user.email,
    };

    const data: any = await axios.post(
      "/api/auth/register?step=1",
      step1_value
    );

    if (data.data.success) {
      return { success: true, data: step1_value };
    }
  } catch (error: any) {
    if (error.status === 400) {
      await signIn("credentials", {
        email: user.email,
        password: user.email,
      });
    } else {
      //   console.error("Error signing in with Twitter:", error);
      //   throw error;
      return {
        success: false,
        msg: "Error signing in with X.",
      };
    }
  }
};

const signInWithApple = async () => {
  const provider = new OAuthProvider("apple.com");

  provider.addScope("email");
  provider.addScope("name");

  const result = await signInWithPopup(auth, provider);
  const user: any = result.user;
  console.log(user);

  //   try {
  //     const step1_value = {
  //       name: user.displayName,
  //       email: user.email,
  //     };

  //     const data: any = await axios.post(
  //       "/api/auth/register?step=1",
  //       step1_value
  //     );

  //     if (data.data.success) {
  //       return { success: true, data: step1_value };
  //     }
  //   } catch (error: any) {
  //     if (error.status === 400) {
  //       await signIn("credentials", {
  //         email: user.email,
  //         password: user.email,
  //       });
  //     } else {
  //       console.error("Error signing in with Twitter:", error);
  //       throw error;
  //     }
  //   }
};

export const socialLogin = async (social: string) => {
  let data;

  switch (social) {
    case "google":
      data = await signInWithGoogle();
      return data;
    case "twitter":
      data = await signInWithTwitter();
      return data;
    case "apple":
      data = await signInWithApple();
  }
};
