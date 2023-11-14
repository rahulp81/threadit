export const sidebarLinks = [
  {
    imgURL: "/assets/home.svg",
    route: "/",
    label: "Home",
  },
  {
    imgURL: "/assets/search.svg",
    route: "/search",
    label: "Search",
  },
  // {
  //   imgURL: "/assets/heart.svg",
  //   route: "/activity",
  //   label: "Activity",
  // },
  {
    imgURL: "/assets/create.svg",
    route: "/create-thread",
    label: "Create Thread",
  },
  {
    imgURL: "/assets/community.svg",
    route: "/communities",
    label: "Communities",
  },
  {
    imgURL: "/assets/user.svg",
    route: "/profile",
    label: "Profile",
  },
];

export const profileTabs = [
  { value: "threads", label: "Threads", icon: "/assets/reply.svg" },
  // { value: "replies", label: "Replies", icon: "/assets/members.svg" },
  // { value: "tagged", label: "Tagged", icon: "/assets/tag.svg" },
];

export const communityUserTabs = [
  { value: "threads", label: "Threads", icon: "/assets/reply.svg" },
  {value : "about" , label : 'About' , icon : '/assets/info.svg' }
];

export const communityAdminTabs = [
  { value: "threads", label: "Threads", icon: "/assets/reply.svg" },
  { value: "settings", label: "Settings", icon: "/assets/settings.svg" },
];


export const interestTopics = [
  { id: 1, name: "Art" },
  { id: 2, name: "Science" },
  { id: 3, name: "Technology" },
  { id: 4, name: "Fashion" },
  { id: 5, name: "Sports" },
  { id: 6, name: "Travel" },
  { id: 7, name: "Food" },
  { id: 8, name: "Music" },
  { id: 9, name: "Books" },
  { id: 10, name: "Health and Fitness" },
  { id: 11, name: "Movies and TV Shows" },
  { id: 12, name: "History" },
];

export const DayOptions = ['0', '1', '2', '3', '4', '5', '6', '7'];

export const HourOptions = Array.from({ length: 24 }, (_, i) => i + '');

export const MinuteOptions = Array.from({ length: 60 }, (_, i) => i + '');
