import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { signIn } from "next-auth/react";
import axios from "axios";

const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  const result = await signInWithPopup(auth, provider);
  const user: any = result.user;

  try {
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
      console.error("Error signing in with Google:", error);
      throw error;
    }
  }
};

export const socialLogin = async (social: string) => {
  let data;

  switch (social) {
    case "google":
      data = await signInWithGoogle();
  }

  return data;
};
