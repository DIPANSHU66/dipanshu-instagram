import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
const Signup = () => {
  const { user } = useSelector((store) => store.auth);
  const [input, setinput] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const [loading, setloading] = useState(false);

  const changehandler = (e) => {
    setinput({ ...input, [e.target.name]: e.target.value });
  };
  const signuphandler = async (e) => {
    e.preventDefault();

    try {
      setloading(true);
      const res = await axios.post(
        "https://dipanshu-instagram.onrender.com/api/v1/user/register",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
    setloading(false);
    setinput({
      username: "",
      email: "",
      password: "",
    });
  };
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);

  return (
    <div
      className="flex  flex-col  min-w-screen   min-h-screen   items-center justify-center  bg-gradient-to-r from-pink-200 to-blue-300
 "
    >
      <form
        onSubmit={signuphandler}
        className="shadow-lg flex flex-col   gap-5 p-8  bg-white   border   rounded-md "
      >
        <div className="my-4">
          <h1 className="text-center font-bold text-xl">LOGO</h1>
          <p className="text-sm text-center font-semibold">
            Signup to see Photos & videos from your freinds
          </p>
        </div>
        <div>
          <Label className="py-2 font-medium">Username</Label>
          <Input
            value={input.username}
            onChange={changehandler}
            type="text"
            name="username"
            className="focus-visible:ring-transparent"
          ></Input>
        </div>
        <div>
          <Label className="py-2 font-medium">Email</Label>
          <Input
            onChange={changehandler}
            value={input.email}
            type="email"
            name="email"
            className="focus-visible:ring-transparent"
          ></Input>
        </div>
        <div>
          <Label className="py-2 font-medium">Password</Label>
          <Input
            onChange={changehandler}
            value={input.password}
            type="password"
            name="password"
            className="focus-visible:ring-transparent"
          ></Input>
        </div>

        {loading ? (
          <Button>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="submit">Signup</Button>
        )}

        <Label className="py-2 font-medium  text-center">
          Already Have an Account?{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </Label>
      </form>
      <div className=" absolute w-[150px]  h-[100px]   b-4  right-2">
        <img src="https://quizify.io/img/home-2/hero-banner-img-1.png" alt="" />
      </div>
    </div>
  );
};

export default Signup;
