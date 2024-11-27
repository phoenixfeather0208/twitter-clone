import useLoginModal from "@/components/modal/hooks/useLoginModal";
import Modal from "../ui/modal";
import { loginSchema } from "@/lib/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";

import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import axios from "axios";
import { signIn } from "next-auth/react";
import useRegisterModal from "@/components/modal/hooks/useRegisterModal";
import { motion } from "framer-motion";
import {
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";

const LoginModal = () => {
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const [error, setError] = useState("");

  const onToggle = useCallback(() => {
    loginModal.onClose();
    registerModal.onOpen();
  }, [loginModal, registerModal]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      values.email = values.email.toLowerCase();
      const { data } = await axios.post("/api/auth/login", values);

      if (data.success) {
        signIn("credentials", values);
        loginModal.onClose();
      }
    } catch (error: any) {
      if (error.response.data.error) {
        setError(error.response.data.error);
        if (error.response.data.error == "Verify your email.") {
          const auth = getAuth();
          const userCredential = await signInWithEmailAndPassword(
            auth,
            values.email,
            values.email
          );

          await sendEmailVerification(userCredential.user, {
            url:
              process.env.NEXT_PUBLIC_NEXTAUTH_URL +
              `/api/auth/verify/${values.email}`,
            handleCodeInApp: false,
          });
          sendEmailVerification(userCredential.user);
        }
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  }

  const { isSubmitting } = form.formState;

  const bodyContent = (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Email" {...field} autoComplete="off" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Password" type="password" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting} size={"csize"}>
            Login
          </Button>
        </form>
      </Form>
    </>
  );

  const footerContent = (
    <p>
      Don't have an account?
      <span
        className="cursor-pointer hover:underline pl-2 text-sky-500"
        onClick={onToggle}
      >
        Sign up
      </span>
    </p>
  );

  return (
    <>
      <Modal
        title="Login"
        isOpen={loginModal.isOpen}
        onClose={loginModal.onClose}
        body={bodyContent}
        // footer={footerContent}
      />
    </>
  );
};

export default LoginModal;
