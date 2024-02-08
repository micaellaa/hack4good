"use client"; // This is a client component
import {
	Flex,
	Spacer,
	Tabs,
	Tab,
	Button,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { FaChevronDown, FaRegUser } from "react-icons/fa";
import Image from "next/image";
import theme from "../../theme.js";
import { UserAuth } from "../../app/context/AuthContext.js";
import { logOut } from "../../firebase/functions.js";
import { Roboto_Slab } from "next/font/google";

const roboto_slab = Roboto_Slab({
	weight: ["400", "700"],
	subsets: ["latin"],
	display: "swap",
});

export default function NavBar() {
	const { user } = UserAuth();
	// const isAdmin = !user?.role === "volunteer";
	const router = useRouter();
	const pathname = usePathname();
	const toast = useToast();
	const [activeIndex, setActiveIndex] = useState(0);
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		if (user) setIsAdmin(user.role === "admin");
	}, [user]);

	useEffect(() => {
		const path = pathname.split("/")[1];
		const items = [
			{
				key: "",
				label: "Home",
			},
			{
				key: "activities",
				label: "Activities",
			},
			{
				key: "blog",
				label: "Blog",
			},
			{
				key: "profile",
				label: "Profile",
			},
		];
		const activeIndex = items.findIndex((item) => item.key.includes(path));

		// const activeIndex = 0;
		if (activeIndex) {
			console.log("matchingItem", activeIndex);
			setActiveIndex(activeIndex);
		} else {
			setActiveIndex(0);
		}
	}, [pathname, user]);

	const [loginStatus, setLoginStatus] = useState(true);
	const [isOpen, setIsOpen] = useState(false);
	const items = [
		{
			key: "",
			label: "Home",
		},
		{
			key: "activities",
			label: "Activities",
		},
		{
			key: "blog",
			label: "Blog",
		},
		...(user && isAdmin
			? [
					{
						key: "profile",
						label: "Edit Profile",
					},
					{
						key: "reports",
						label: "Reports",
					},
			  ]
			: [
					{
						key: "profile",
						label: "Profile",
					},
					{
						key: "heroes",
						label: "Heroes",
					},
			  ]),
		,
	];

	const navigateTo = (path) => {
		router.push(`/${path}`);
	};

	const handleLogout = () => {
		try {
			logOut();
			console.log("you have been logout");
			setLoginStatus((prevLoginStatus) => !prevLoginStatus);
			console.log("New login status:", loginStatus);
			toast({
				title: "Logged out.",
				description: "See you soon!",
				status: "success",
				duration: 3500,
				isClosable: true,
			});
		} catch (error) {
			console.log("Error logging out", error);
		}
	};

	// const handleLogin = () => {
	//   navigateTo("account/login");
	// };
	return (
		<div
			style={{
				top: 0,
				position: "sticky",
				display: "flex",
				zIndex: 1,
				width: "100%",
				justifyContent: "space-between",
				alignItems: "center",
				backgroundColor: "rgb(247, 246, 240)",
				padding: "0.5rem 1rem 0 1rem",
				minWidth: "800px",
				boxShadow: "1px 1px 5px #00000010",
			}}
		>
			<Flex align={"center"}>
				<Image
					src={require("../../resources/public/big-at-heart-logo.png")}
					width={50}
					height={50}
					alt="Big At Heart"
				/>
				<div
					style={{
						width: "2px",
						height: "25px",
						backgroundColor: "#00000080",
						margin: "0 10px",
					}}
				/>
				<h1 className={roboto_slab.className}>hack4good</h1>
			</Flex>
			<Tabs
				style={{
					width: "40%",
					display: "flex",
					justifyContent: "center",
				}}
				colorScheme={"red"}
				index={activeIndex}
			>
				<Flex key={"tabs"} style={{ width: "100%" }}>
					{items.map((navItem) => (
						<>
							<Tab
								key={navItem.key}
								onClick={() => navigateTo(navItem.key)}
								// isSelected={true}
							>
								{navItem.label}
							</Tab>
							<Spacer key={"spacer-" + navItem.key} />
						</>
					))}
				</Flex>
			</Tabs>{" "}
			<Menu>
				{({ isOpen }) => (
					<>
						<MenuButton
							isActive={isOpen}
							as={Button}
							style={{
								backgroundColor: "transparent",
							}}
							leftIcon={<FaRegUser />}
							rightIcon={<FaChevronDown />}
						>
							<div
								style={{
									width: "150px",
									overflow: "hidden",
									whiteSpace: "nowrap",
									textOverflow: "ellipsis",
								}}
							>
								{user ? user.name : "Guest"}
							</div>
						</MenuButton>

						<MenuList>
							{user ? (
								<>
									<MenuItem
										key={"profile/go"}
										onClick={() => navigateTo("profile")}
									>
										Profile
									</MenuItem>
									<MenuItem
										key={"account/logout"}
										onClick={handleLogout}
									>
										Log out
									</MenuItem>
								</>
							) : (
								<MenuItem
									key={"account/login"}
									onClick={() => navigateTo("account/login")}
								>
									Log in
								</MenuItem>
							)}
						</MenuList>
					</>
				)}
			</Menu>
		</div>
	);
}
