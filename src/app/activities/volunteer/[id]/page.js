"use client";

import { useEffect, useState } from "react";
import { arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../../../../firebase/config";

import {
  Button,
  Box,
  Grid,
  GridItem,
  Image,
  Text,
  Stack,
  Badge,
  Flex,
  Card,
  Icon,
  CardHeader,
  CardBody,
  CardFooter,
} from "@chakra-ui/react";
import { FaRegCalendarAlt, FaMapPin } from "react-icons/fa";
import Attendance from "../../../../components/activities/Attendance.js";
import Posts from "../../../../components/activities/Posts.js";
import CreatePost from "../../../../components/activities/CreatePost.js";
import withAuth from "../../../../hoc/withAuth";
import Entries from "../../../../components/blog/Entries";

import classes from "./page.module.css";

const Volunteer = ({ user, params }) => {
  const { id } = params;
  const userId = user.uid;
  const userRole = user.role;

  const currentTimeStamp = new Date();

  console.log(user);
  console.log(userRole);

  const [activity, setActivity] = useState(); // the page
  const [isSignedUp, setIsSignedUp] = useState(); // if current user signed up
  const [vacancyRemaining, setVacancyRemaining] = useState(0);

  const [signups, setSignups] = useState([]); // users who have signed up for this activity -> ids
  const [marked, setMarked] = useState([]);

  const [reflections, setReflections] = useState();

  useEffect(() => {
    const fetchActivityContent = async () => {
      if (id) {
        try {
          const activityDoc = await db.collection("Activities").doc(id).get();
          if (activityDoc.exists) {
            const activityData = activityDoc.data();
            setActivity(activityData);
            setIsSignedUp(activityData.participants_signups.includes(userId));
            console.log(
              "activityData.participants_signups",
              activityData.participants_signups
            );
            console.log("userId", userId);
            console.log(
              activityData.participants_signups.some((id) => (id = userId))
            );
            setSignups(activityData.participants_signups);
            setMarked(activityData.participants_attended);
            setVacancyRemaining(
              activityData.vacancy_total -
                activityData.participants_signups.length
            );
          } else {
            console.log("Activity not found");
          }
        } catch (error) {
          console.error("Error fetching activity content:", error);
        } finally {
          console.log(activity);
        }
      }
    };

    fetchActivityContent();
  }, [id]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (id) {
        try {
          const collectionRef = db.collection("Posts");
          const querySnapshot = await collectionRef
            .where("activity_id", "==", id)
            .get();

          const reflectionsArray = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setReflections(reflectionsArray);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchPosts();
  }, []);

  const handleSignUp = async () => {
    try {
      if (!signups.includes(userId)) {
        setSignups((prevSignups) => [...prevSignups, userId]);

        const activityRef = db.collection("Activities").doc(id);
        await activityRef.update({
          participants_signups: arrayUnion(userId),
        });

        const userRef = db.collection("Users").doc(userId);
        await userRef.update({
          activities_signedup: arrayUnion(id),
        });

        console.log("Signed up successfully!");
        setIsSignedUp(true);
        setVacancyRemaining(
          activity.vacancy_total - (activity.participants_signups.length + 1)
        );
      } else {
        console.log("Already signed up.");
      }
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  const handleUnsignUp = async () => {
    try {
      if (signups.includes(userId)) {
        setSignups((prevSignups) => prevSignups.filter((id) => id !== userId));

        const activityRef = db.collection("Activities").doc(id);
        await activityRef.update({
          participants_signups: arrayRemove(userId),
        });

        const userRef = db.collection("Users").doc(userId);
        await userRef.update({
          activities_signedup: arrayRemove(id),
        });

        console.log("Sign up removed successfully!");
        setIsSignedUp(false);
        setVacancyRemaining((prevVacancyRemaining) => prevVacancyRemaining + 1);
      } else {
        console.log("Not signed up.");
      }
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  return (
    <div>
      {activity && (
        <div>
          <div>
            <li className={classes["image_wrapper"]}>
              <img
                src={
                  activity
                    ? activity.image
                    : "https://source.unsplash.com/VWcPlbHglYc"
                }
                className={classes["image"]}
              />
              <div className={classes["overlay-main"]}>
                <h1>{activity.activity_name}</h1>
                <h2>{activity.organiser_name}</h2>
                <p>{activity.description}</p>
              </div>

              <Card width="23%" pos="absolute" zIndex={2} top="27%" left="67%">
                <CardHeader>
                  <h1
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Icon as={FaRegCalendarAlt} mr="2" />
                    Date & Time
                  </h1>
                </CardHeader>
                <CardBody>
                  <Stack mt="1">
                    <Text fontSize="m">
                      {activity.datetime_start
                        .toDate()
                        .toLocaleString("en-EN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      ,{" "}
                      {activity.datetime_start
                        .toDate()
                        .toLocaleString("en-EN", {
                          weekday: "long",
                        })}
                    </Text>
                    <Text fontSize="m">
                      {activity.datetime_start
                        .toDate()
                        .toLocaleString("en-EN", {
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })}
                      {" to "}
                      {activity.datetime_end.toDate().toLocaleString("en-EN", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })}
                    </Text>
                    <Text fontSize="m">{vacancyRemaining} slots left</Text>
                    <Text fontSize="m">
                      Sign up by{" "}
                      {activity.signup_deadline
                        .toDate()
                        .toLocaleString("en-EN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                    </Text>
                  </Stack>
                </CardBody>
                <CardFooter>
                  {userRole === "volunteer" && signups ? (
                    activity.signup_deadline.toDate() >= currentTimeStamp ? (
                      signups.some((id) => id === userId) ? (
                        <Button
                          width="100%"
                          onClick={handleUnsignUp}
                          colorScheme="red"
                          variant="outline"
                        >
                          Withdraw
                        </Button>
                      ) : (
                        <Button
                          width="100%"
                          onClick={handleSignUp}
                          colorScheme="red"
                          variant="solid"
                        >
                          Sign Up Now
                        </Button>
                      )
                    ) : signups.some((id) => id === userId) ? (
                      <Button
                        width="100%"
                        onClick={handleUnsignUp}
                        colorScheme="red"
                        variant="outline"
                      >
                        Withdraw
                      </Button>
                    ) : (
                      <Button
                        width="100%"
                        onClick={handleUnsignUp}
                        colorScheme="red"
                        variant="outline"
                        isDisabled={true}
                      >
                        Sign ups have closed
                      </Button>
                    )
                  ) : (
                    <Button
                      width="100%"
                      onClick={handleUnsignUp}
                      colorScheme="red"
                      variant="outline"
                      isDisabled={true}
                    >
                      {activity.participants_signups.length} sign ups
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </li>
            <div className={classes["two-column-container"]}>
              <div className={classes["column-left"]}>
                <h1>Description</h1>
                <p>{activity.description}</p>
              </div>
              <div className={classes["column-right"]}>
                <h1
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {" "}
                  <Icon as={FaMapPin} mr="2" />
                  Location
                </h1>
                <p style={{ fontWeight: "700" }}>{activity.location_name}</p>
                <p>{activity.location_address}</p>
                <br />
                <h1>Tags</h1>
                <ul className={classes["tags"]}>
                  {activity.tags.map((tag, index) => (
                    <li key={index}>{tag}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <br />
          <Attendance
            userRole={userRole}
            classes={classes}
            activity={activity}
            activityId={id}
          />
          <CreatePost
            activityId={id}
            activityName={activity.activity_name}
            user={user}
            classes={classes}
          />
          <br />

          {reflections && <Posts reflections={reflections} classes={classes} />}
        </div>
      )}
    </div>
  );
};

export default withAuth(Volunteer);
