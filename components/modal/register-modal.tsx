import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import Modal from "../ui/modal";
import useRegisterModal from "@/components/modal/hooks/useRegisterModal";
import useLoginModal from "@/components/modal/hooks/useLoginModal";
import { useForm } from "react-hook-form";
import { registerStep1Schema, registerStep2Schema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import axios from "axios";
import { signIn } from "next-auth/react";
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/firebaseConfig";

interface RegisterType {
  registerStep: number;
  registerData: any;
}

const RegisterModal = (props: RegisterType) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    username: "",
  });

  useEffect(() => {
    setStep(props.registerStep);
    setData(props.registerData);
  }, [props.registerStep, props.registerData]);

  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();

  const bodyContent =
    step === 1 ? (
      <RegisterStep1 setData={setData} setStep={setStep} />
    ) : step == 2 ? (
      <RegisterStep2 data={data} setData={setData} setStep={setStep} />
    ) : (
      <RegisterStep3 />
    );

  const onToggle = useCallback(() => {
    registerModal.onClose();
    loginModal.onOpen();
  }, [registerModal, loginModal]);

  const footer = (
    <div className="">
      <p>
        Already have an account?{""}
        <span
          className=" cursor-pointer hover:underline pl-2 text-sky-400"
          onClick={onToggle}
        >
          Sign in
        </span>
      </p>
    </div>
  );

  return (
    <Modal
      title="Create account"
      body={bodyContent}
      // footer={footer}
      isOpen={registerModal.isOpen}
      onClose={registerModal.onClose}
      step={step}
      totalSteps={2}
    />
  );
};

export default RegisterModal;

function RegisterStep1({
  setData,
  setStep,
}: {
  setData: Dispatch<
    SetStateAction<{
      name: string;
      email: string;
      password: string;
      username: string;
    }>
  >;
  setStep: Dispatch<SetStateAction<number>>;
}) {
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof registerStep1Schema>>({
    resolver: zodResolver(registerStep1Schema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerStep1Schema>) {
    try {
      values.email = values.email.toLowerCase();
      const { data } = await axios.post("/api/auth/register?step=1", values);

      if (data.success) {
        setData({ ...values, password: "", username: "" });
        setStep(2);
      }
    } catch (error: any) {
      if (error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  }

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Name" {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <Button type="submit" size={"csize"} disabled={isSubmitting}>
          Next
        </Button>
      </form>
    </Form>
  );
}

export function RegisterStep2({
  data,
  setData,
  setStep,
}: {
  data: { name: string; email: string };
  setData: Dispatch<
    SetStateAction<{
      name: string;
      email: string;
      password: string;
      username: string;
    }>
  >;
  setStep: Dispatch<SetStateAction<number>>;
}) {
  const [error, setError] = useState("");
  const registerModal = useRegisterModal();

  const form = useForm<z.infer<typeof registerStep2Schema>>({
    resolver: zodResolver(registerStep2Schema),
    defaultValues: {
      password: "",
      username: "",
    },
  });

  const getCookieValue = (cookieName: string) => {
    const cookies = document.cookie.split("; ");
    const cookie = cookies.find((row) => row.startsWith(`${cookieName}=`));
    return cookie ? cookie.split("=")[1] : null;
  };

  async function onSubmit(values: z.infer<typeof registerStep2Schema>) {
    try {
      const isSocial = localStorage.getItem("login") == "social";
      if (values.password == values.password_confirm) {
        if (!isSocial) {
          await createUserWithEmailAndPassword(auth, data.email, data.email);

          const userCredential = await signInWithEmailAndPassword(
            auth,
            data.email,
            data.email
          );
          const { data: response, status } = await axios.post(
            "/api/auth/register?step=2",
            {
              ...data,
              ...values,
              verified: userCredential.user.emailVerified,
            }
          );

          if (!userCredential.user.emailVerified) {
            await sendEmailVerification(userCredential.user, {
              url:
                process.env.NEXT_PUBLIC_NEXTAUTH_URL +
                `/api/auth/verify/${data.email}`,
              handleCodeInApp: false,
            });

            setStep(3);
            setData({
              name: data.name,
              email: data.email,
              password: values.password,
              username: values.username,
            });

            axios.post("/api/auth/sendmail", {
              to: data.email,
              subject: "Opinyx.com",
              text: "Thanks for your registration to Opinyx.com",
              html: `<p>Registration is done successfully.</p>
              <p>Please verify your email to sign up.</p>`,
            });
          }
        } else {
          const { data: response, status } = await axios.post(
            "/api/auth/register?step=2",
            {
              ...data,
              ...values,
              verified: true,
            }
          );
          signIn("credentials", {
            email: data.email,
            password: values.password,
          });
          axios.post("/api/auth/sendmail", {
            to: data.email,
            subject: "Opinyx.com",
            text: "Thanks for your registration to Opinyx.com",
            html: `<p>Registration is done successfully.</p>`,
          });
        }
      } else {
        setError("Password is not matched");
      }
      // if (!user.user.emailVerified) {
      //   setError("Email not verified. Please verify your email.");
      //   await sendEmailVerification(user.user);
      // } else {

      // signIn("credentials", {
      //   email: data.email,
      //   password: values.password,
      // });

      // registerModal.onClose();
      // }
    } catch (error: any) {
      if (error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  }

  const { isSubmitting } = form.formState;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Username" {...field} autoComplete="off" />
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
        <FormField
          control={form.control}
          name="password_confirm"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Confirm Password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size={"csize"}
          // disabled={isSubmitting}
          className="gap-2"
        >
          Register
        </Button>
      </form>
    </Form>
  );
}

export function RegisterStep3() {
  const registerModal = useRegisterModal();

  return <div>Check your inbox to verify email.</div>;
}
