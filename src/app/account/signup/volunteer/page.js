"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Button,
	FormControl,
	FormLabel,
	Input,
	Flex,
	Alert,
} from "@chakra-ui/react";
import { Link } from '@chakra-ui/next-js'
import NextLink from 'next/link'
import { FcGoogle } from "react-icons/fc";
import { FiAlertCircle } from "react-icons/fi";
import { AiOutlineArrowRight } from "react-icons/ai";
import { RiAdminLine } from "react-icons/ri";
import { UserAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2"
import {
	emailPwSignUp,
	googleSignIn,
} from "../../../../firebase/functions";
import { db } from "../../../../firebase/config";
import { Timestamp } from "firebase/firestore";
import { projectStorage } from "../../../../firebase/config";

const VolunteerSignup = () => {
	const router = useRouter();
	const { user, isLoading } = UserAuth();
	const [isJustSignedUp, setIsJustSignedUp] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loginError, setLoginError] = useState(null);

	const [defaultImageUrl, setDefaultImageUrl] = useState("");

	useEffect(() => {
		const fetchDefaultPic = async () => {
			try {
				const imageRef = projectStorage.ref(
					"General/default_user_profile.png"
				);
				const defaultImage = await imageRef.getDownloadURL();
				setDefaultImageUrl(defaultImage);
			} catch (error) {
				console.error("Error fetching activities:", error);
			}
		};
		fetchDefaultPic();
	}, []);


	useEffect(() => {
		if (user) {
			Swal.fire({
				title: "You have logged in.",
				text: "Redirecting ...",
				icon: "success",
				timer: 1000,
				timerProgressBar: true,
				showConfirmButton: false,
				allowOutsideClick: false,
			}).then(() => {
				if (isJustSignedUp) {
					router.push("/profile/volunteer-preferences");
				} else {
					router.push("/activities");
				}
			});
		}
	}, [user, isJustSignedUp]);

	const addVolunteerToDb = async (userCredential, name) => {
		try {
			const data = {
				uid: userCredential.user.uid,
				email: userCredential.user.email,
				role: "volunteer",
				name: name,
				created_on: Timestamp.fromDate(new Date()),
				exp_points: 0,
				activities_attended: [],
				activities_signedup: [],
				posts: [],
				image: defaultImageUrl,
			};
			await db.collection("Users").doc(userCredential.user.uid).set(data);
		} catch (error) {
			console.log(error);
			throw error;
		}
	};

	const handleEmailSignUp = async (e) => {
		e.preventDefault();
		emailPwSignUp(email, password)
			.then(async (userCredential) => {
				setIsJustSignedUp(true);
				await addVolunteerToDb(userCredential, name);
				// router.push("/profile/volunteer-preferences");
			})
			.catch((error) => {
				const errorMessage = error.message;
				console.log(`Email sign up error: ${errorMessage}`);
				setLoginError(errorMessage);
			});
	};

	const handleGoogleSignUp = async (e) => {
		e.preventDefault();
		googleSignIn()
			.then(async(userCredential) => {
				setIsJustSignedUp(true);
				await addVolunteerToDb(userCredential, name);
				// router.push("/profile/volunteer-preferences");
			})
			.catch((error) => {
				const errorMessage = error.message;
				console.log(`Email login error: ${errorMessage}`);
				setLoginError(errorMessage);
			});
	};

	return isLoading || user ? null : (
		<>
			<Button
				style={{ top: "1.5rem", right: "1.5rem", position: "fixed" }}
				variant={"outline"}
				colorScheme={"red"}
				onClick={() => router.push("/account/signup/admin")}
			>
				<RiAdminLine style={{ marginRight: "10px" }} />
				Admin Sign Up
				<AiOutlineArrowRight style={{ marginLeft: "10px" }} />
			</Button>
			<Box style={{ maxWidth: "600px", margin: "80px auto" }}>
				<h1 style={{ textAlign: "center" }}>Volunteer Sign Up Page</h1>
				<br />
				<form onSubmit={handleEmailSignUp}>
					<FormControl isRequired style={{ marginBottom: "8px" }}>
						<FormLabel>Name:</FormLabel>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							variant="filled"
						/>
					</FormControl>
					<FormControl isRequired style={{ marginBottom: "8px" }}>
						<FormLabel>Email:</FormLabel>
						<Input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							variant="filled"
						/>
					</FormControl>
					<FormControl isRequired>
						<FormLabel>Password:</FormLabel>
						<Input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							variant="filled"
						/>
					</FormControl>
					<br />
					<Button
						type="submit"
						style={{ width: "100%" }}
						colorScheme="red"
					>
						Sign Up
					</Button>
				</form>
				<br />
				<Flex justify={"center"}>
					<p>
						or{" "}
						<Button
							onClick={handleGoogleSignUp}
							colorScheme="red"
							variant={"outline"}
						>
							{" "}
							<FcGoogle style={{ marginRight: "10px" }} />
							Sign Up with Google
						</Button>
					</p>
				</Flex>
				<br />
				<Box>
					{loginError && (
						<Alert status="error">
							<FiAlertCircle style={{ marginRight: "10px" }} />
							{loginError}{" "}
						</Alert>
					)}
				</Box>
				<div
					style={{
						backgroundColor: "black",
						opacity: "10%",
						width: "100%",
						height: "1px",
						margin: "15px 0",
					}}
				></div>
				<br />
				<Flex justify={"center"}>
					<p>
						Already have an account?{" "}
						<Link as={NextLink} color="red.500" href="/account/login">
							Log in here.
						</Link>
					</p>
				</Flex>
			</Box>
		</>
	);
};

export default VolunteerSignup;
