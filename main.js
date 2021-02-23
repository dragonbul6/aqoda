const fs = require("fs");

class Command {
  constructor(name, params) {
    this.name = name;
    this.params = params;
  }
}

class Renter {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}

var comparison = {
  ">": function (x, y) {
    return x > y;
  },
  "<": function (x, y) {
    return x < y;
  },
};

function main() {
  const filename = "input.txt";
  const commands = getCommandsFromFileName(filename);
  const hotels = {};
  var bookingSession = null;

  commands.forEach((command) => {
    var name = removeSpecialChar(command.name);
    if (name == "checkout") {
      command.params[1] = removeSpecialChar(command.params[1]);
    }
    switch (name) {
      case "create_hotel":
        const [floor, roomPerFloor] = command.params;
        hotels.floor = floor;
        hotels.numberRoom = roomPerFloor * floor;
        hotels.roomPerFloor = roomPerFloor;

        bookingSession = new Array();

        console.log(
          `Hotel created with ${hotels["floor"]} floor(s), ${hotels["roomPerFloor"]} room(s) per floor.`
        );
        return;

      case "book":
        const [roomNumber, name, age] = command.params;

        if (hotels.numberRoom > 0) {
          var floorChecking = bookingSession.length > 0;

          if (floorChecking) {
            var emptyRoom = bookingSession.filter(
              (item) => item.roomNumber == roomNumber
            )[0];

            if (emptyRoom) {
              console.log(
                `Cannot book room ${roomNumber} for ${name}, The room is currently booked by ${emptyRoom["renter"]["name"]}.`
              );
            } else {
              bookingSession.push({
                roomNumber,
                renter: new Renter(name, age),
              });
              bookingSession[bookingSession.length - 1]["keycard"] =
                bookingSession.length;
              hotels.numberRoom--;
              console.log(
                `Room ${roomNumber} is booked by ${name} with keycard number ${bookingSession.length}.`
              );
            }
          } else {
            bookingSession.push({
              roomNumber,
              renter: new Renter(name, age),
            });
            bookingSession[bookingSession.length - 1]["keycard"] =
              bookingSession.length;
            hotels.numberRoom--;
            console.log(
              `Room ${roomNumber} is booked by ${name} with keycard number 1.`
            );
          }
        } else {
          console.log(
            `The reservation is not completed, all of room have rented.`
          );
        }
        return;

      case "list_available_rooms":
        for (let i = 0; i < hotels.floor; i++) {
          for (let j = 0; j < hotels.roomPerFloor; j++) {
            var roomCode = i + 1 + "" + (j / 10 > 0.9 ? j : "0" + (j + 1));

            var emptyRoom = bookingSession.filter(
              (item) => item.roomNumber == roomCode
            );

            if (!emptyRoom.length > 0) {
              console.log(roomCode);
            }
          }
        }
        return;
      case "checkout":
        const [keycard, renter] = command.params;

        var roombyKeyCard = bookingSession.find(
          (item) => item.keycard == keycard
        );
        // Check renter
        if (roombyKeyCard) {
          if (roombyKeyCard["renter"]["name"] == renter) {
            var index = bookingSession.findIndex((el) => el.keycard == keycard);
            bookingSession.splice(index, 1);
            bookingSession.map((item, i) => (item.keycard = i + 1));
            hotels.numberRoom++;
            console.log(`Room ${roombyKeyCard["roomNumber"]} is checkout.`);
          }
        } else {
          console.log("Invalid keycard no.");
        }
        return;
      case "list_guest":
        printText(bookingSession);
        return;
      case "get_guest_in_room":
        const [code] = command.params;
        var findbyRoom = bookingSession.find((item) => item.roomNumber == code);
        console.log(findbyRoom.renter.name);
        return;
      case "list_guest_by_age":
        const [condition, ageRequired] = command.params;
        var findGuestbyAge = bookingSession.filter((item) =>
          comparison[condition](item.renter.age, ageRequired)
        );

        if (findGuestbyAge.length > 0) {
          printText(findGuestbyAge);
        }
        return;
      case "list_guest_by_floor":
        const [ageFloor] = command.params;
        var listGuestbyFloor = bookingSession.filter(
          (item) => (item.roomNumber / 100).toFixed(0) == ageFloor
        );
        if (listGuestbyFloor.length > 0) {
          printText(listGuestbyFloor);
        }
        return;
      case "checkout_guest_by_floor":
        const [findFloor] = command.params;

        var findGuestbyFloor = bookingSession.filter(
          (item) => (item.roomNumber / 100).toFixed(0) == findFloor
        );

        if (findGuestbyFloor.length > 0) {
          findGuestbyFloor.map((item) => {
            var index = bookingSession.findIndex(
              (el) => el.roomNumber == item.roomNumber
            );
            bookingSession.splice(index, 1);
            bookingSession.map((item, i) => (item.keycard = i + 1));
          });

          console.log(
            `Room ${printText(
              findGuestbyFloor,
              "roomNumber",
              false,
              true
            )} are checkout.`
          );
        } else {
          console.log("Not found...");
        }
        return;
      case "book_by_floor":
        const [rentFloor, rentername, renterage] = command.params;
        var checkFloor = bookingSession.filter(
          (item) => (item.roomNumber / 100).toFixed(0) == rentFloor
        );
        var currentRenting = [];

        if (checkFloor.length == 0) {
          for (let index = 0; index < hotels.roomPerFloor; index++) {
            var currentRoom = Number(
              `${rentFloor}${
                index + 1 / 10 > 0.99 ? index + 1 : "0" + (index + 1)
              }`
            );
            bookingSession.push({
              currentRoom,
              renter: new Renter(rentername, renterage),
            });
            bookingSession[bookingSession.length - 1]["keycard"] =
              bookingSession.length;
            currentRenting.push({
              roomNumber: currentRoom,
              keycard: bookingSession.length,
            });
            hotels.numberRoom--;
          }
          console.log(
            `Room ${printText(
              currentRenting,
              "roomNumber",
              false,
              true
            )} are booked with keycard number ${printText(
              currentRenting,
              "keycard",
              false,
              true
            )}`
          );
        } else {
          console.log(`Cannot book floor ${rentFloor} for ${rentername}.`);
        }

        return;
      default:
        return;
    }
  });
}

function removeSpecialChar(str) {
  return str.split("\\").join("").trim();
}

function printText(
  array,
  target = "renter.name",
  object = true,
  returning = false
) {
  var text = "";
  if (object) {
    var keys = target.split(".");
    array.map((item, i) => {
      text += item[keys[0]][keys[1]];
      if (i < array.length - 1) {
        text += ", ";
      } else {
        text += "";
      }
    });
  } else {
    array.map((item, i) => {
      text += item[target];
      if (i < array.length - 1) {
        text += ", ";
      } else {
        text += "";
      }
    });
  }

  if (returning) {
    return text;
  } else {
    console.log(text);
  }
}

function getCommandsFromFileName(fileName) {
  const file = fs.readFileSync(fileName, "utf-8");

  return file
    .split("\n")
    .map((line) => line.split(" "))
    .map(
      ([commandName, ...params]) =>
        new Command(
          commandName,
          params.map((param) => {
            const parsedParam = parseInt(param, 10);

            return Number.isNaN(parsedParam) ? param : parsedParam;
          })
        )
    );
}

main();
