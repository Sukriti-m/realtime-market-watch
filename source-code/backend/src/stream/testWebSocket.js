// const socket =
//   new WebSocket(
//     "ws://localhost:4000/stream"
//   );

// socket.onopen = () => {
//   console.log(
//     "conn"
//   );
// };

// socket.onmessage = (event) => {
//   const message =
//     JSON.parse(event.data);

//   console.log(
//     JSON.stringify(
//       message,
//       null,
//       2
//     )
//   );
// };

// socket.onclose = () => {
//   console.log(
//     "disconn"
//   );
// };

// socket.onerror = (error) => {
//   console.error(
//     "error:",
//     error
//   );
// };