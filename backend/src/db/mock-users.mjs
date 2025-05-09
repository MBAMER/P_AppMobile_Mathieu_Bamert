import bcrypt from "bcrypt";

let users = [
  {
    id: 1,
    pseudo: "Etml",
    mdp: bcrypt.hashSync("Etml2025", 10),
    date_entre: new Date("2022-06-15"),
    admin: true,
  },
  {
    id: 2,
    pseudo: "Alice",
    mdp: bcrypt.hashSync("Alice2025", 10),
    date_entre: new Date("2023-01-10"),
    admin: false,
  },
  {
    id: 3,
    pseudo: "Bob",
    mdp: bcrypt.hashSync("Bob2025", 10),
    date_entre: new Date("2023-03-20"),
    admin: false,
  },
  {
    id: 4,
    pseudo: "Charlie",
    mdp: bcrypt.hashSync("Charlie2025", 10),
    date_entre: new Date("2022-11-05"),
    admin: true,
  },
  {
    id: 5,
    pseudo: "Diana",
    mdp: bcrypt.hashSync("Diana2025", 10),
    date_entre: new Date("2023-05-01"),
    admin: false,
  },
  {
    id: 6,
    pseudo: "Eve",
    mdp: bcrypt.hashSync("Eve2025", 10),
    date_entre: new Date("2023-06-15"),
    admin: false,
  },
  {
    id: 7,
    pseudo: "Frank",
    mdp: bcrypt.hashSync("Frank2025", 10),
    date_entre: new Date("2023-07-20"),
    admin: true,
  },
  {
    id: 8,
    pseudo: "Grace",
    mdp: bcrypt.hashSync("Grace2025", 10),
    date_entre: new Date("2023-08-05"),
    admin: false,
  },
  {
    id: 9,
    pseudo: "Hank",
    mdp: bcrypt.hashSync("Hank2025", 10),
    date_entre: new Date("2023-09-10"),
    admin: false,
  },
  {
    id: 10,
    pseudo: "Ivy",
    mdp: bcrypt.hashSync("Ivy2025", 10),
    date_entre: new Date("2023-10-01"),
    admin: true,
  },
  {
    id: 11,
    pseudo: "Jack",
    mdp: bcrypt.hashSync("Jack2025", 10),
    date_entre: new Date("2023-11-15"),
    admin: false,
  },
];

export { users };
