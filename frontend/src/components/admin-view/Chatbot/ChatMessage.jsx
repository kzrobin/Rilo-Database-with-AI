// export function ChatMessage({ message }) {
//   const isUser = message.sender === 'user';

//   const formatTime = (timestamp) => {
//     const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
//     return date.toLocaleTimeString([], {
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   return (
//     <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
//       <div
//         className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
//           isUser
//             ? 'bg-blue-600 text-white rounded-br-none'
//             : 'bg-gray-200 text-gray-900 rounded-bl-none'
//         }`}
//       >
//         <p className="text-sm break-words">{message.text}</p>
//         <span className={`text-xs mt-1 block ${isUser ? 'text-blue-100' : 'text-gray-600'}`}>
//           {formatTime(message.timestamp)}
//         </span>
//       </div>
//     </div>
//   );
// }

export function ChatMessage({ message }) {
  const isUser = message.sender === "user";

  const formatTime = (timestamp) => {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-200 text-gray-900 rounded-bl-none"
        }`}
      >
        {/* Preserve natural formatting */}
        <p className="text-sm whitespace-pre-wrap wrap-break-word">
          {message.text}
        </p>

        <span
          className={`text-xs mt-1 block ${
            isUser ? "text-blue-100" : "text-gray-600"
          }`}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
