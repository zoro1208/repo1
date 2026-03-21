import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore.js";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";

const MessageInput = () => {
  let typingTimeout;
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const { sendMessage, replyingTo, clearReply } = useChatStore();

  // IMAGE HANDLING
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.05,
        maxWidthOrHeight: 600,
        useWebWorker: true,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      toast.error("Image compression failed");
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // SEND MESSAGE
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        replyTo: replyingTo?._id, // ✅ reply id
      });

      // clear form
      setText("");
      setImagePreview(null);
      clearReply(); // ✅ clear reply

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full">

      {/* ✅ REPLY PREVIEW */}
      {replyingTo && (
        <div className="mb-2 p-2 bg-base-200 rounded-lg flex justify-between items-center">
          <div className="text-sm truncate">
            Replying to: {replyingTo.text || "Image"}
          </div>
          <button onClick={clearReply}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* IMAGE PREVIEW */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* INPUT */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

// import { useRef, useState } from "react";
// import { useChatStore } from "../store/useChatStore.js";
// import { useAuthStore } from "../store/useAuthStore.js";
// import { Image, Send, X, FileText } from "lucide-react";
// import toast from "react-hot-toast";
// import imageCompression from "browser-image-compression";

// const MessageInput = () => {
//   const typingTimeout = useRef(null);

//   const [text, setText] = useState("");
//   const [imagePreview, setImagePreview] = useState(null);
//   const [filePreview, setFilePreview] = useState(null);

//   const imageInputRef = useRef(null);
//   const fileInputRef = useRef(null);

//   const { sendMessage, replyingTo, clearReply } = useChatStore();

//   // Typing indicator
//   const handleTyping = () => {
//     const socket = useAuthStore.getState().socket;
//     const selectedUser = useChatStore.getState().selectedUser;
//     if (!socket || !selectedUser) return;

//     socket.emit("typing", { to: selectedUser._id });

//     clearTimeout(typingTimeout.current);
//     typingTimeout.current = setTimeout(() => {
//       socket.emit("stopTyping", { to: selectedUser._id });
//     }, 1500);
//   };

//   // Image upload
//   const handleImageChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file || !file.type.startsWith("image/")) {
//       toast.error("Please select a valid image file");
//       return;
//     }

//     try {
//       const compressedFile = await imageCompression(file, {
//         maxSizeMB: 0.05,
//         maxWidthOrHeight: 600,
//         useWebWorker: true,
//       });

//       const reader = new FileReader();
//       reader.onloadend = () => setImagePreview({ file: compressedFile, preview: reader.result });
//       reader.readAsDataURL(compressedFile);
//     } catch (error) {
//       toast.error("Image compression failed");
//     }
//   };

//   // File upload (PDF, DOC, etc.)
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setFilePreview(file); // store File object directly, no base64
//   };

//   const removeImage = () => setImagePreview(null);
//   const removeFile = () => setFilePreview(null);

//   // Send message
//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!text.trim() && !imagePreview && !filePreview) return;

//     try {
//       const formData = new FormData();
//       formData.append("text", text.trim());
//       if (imagePreview) formData.append("image", imagePreview.file);
//       if (filePreview) formData.append("file", filePreview);

//       if (replyingTo?._id) formData.append("replyTo", replyingTo._id);

//       await sendMessage(formData); // backend must accept multipart/form-data

//       setText("");
//       setImagePreview(null);
//       setFilePreview(null);
//       clearReply();

//       if (imageInputRef.current) imageInputRef.current.value = "";
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     } catch (error) {
//       console.error("Failed to send message:", error);
//       toast.error("Failed to send message");
//     }
//   };

//   return (
//     <div className="p-4 w-full">
//       {/* REPLY PREVIEW */}
//       {replyingTo && (
//         <div className="mb-2 p-2 bg-base-200 rounded-lg flex justify-between items-center">
//           <div className="text-sm truncate">
//             Replying to: {replyingTo.text || "Attachment"}
//           </div>
//           <button onClick={clearReply}>
//             <X size={16} />
//           </button>
//         </div>
//       )}

//       {/* IMAGE PREVIEW */}
//       {imagePreview && (
//         <div className="mb-2 flex items-center gap-2">
//           <div className="relative">
//             <img
//               src={imagePreview.preview}
//               alt="Preview"
//               className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
//             />
//             <button
//               onClick={removeImage}
//               className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
//             >
//               <X size={12} />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* FILE PREVIEW */}
//       {filePreview && (
//         <div className="mb-2 flex items-center gap-2 p-2 bg-base-200 rounded-lg">
//           <FileText className="size-5" />
//           <span className="truncate">{filePreview.name}</span>
//           <button onClick={removeFile}>
//             <X size={12} />
//           </button>
//         </div>
//       )}

//       {/* INPUT */}
//       <form onSubmit={handleSendMessage} className="flex items-center gap-2">
//         <div className="flex-1 flex gap-2">
//           <input
//             type="text"
//             placeholder="Type a message..."
//             value={text}
//             onChange={(e) => {
//               setText(e.target.value);
//               handleTyping();
//             }}
//             className="w-full input input-bordered rounded-lg input-sm sm:input-md"
//           />

//           {/* IMAGE INPUT */}
//           <input
//             type="file"
//             accept="image/*"
//             className="hidden"
//             ref={imageInputRef}
//             onChange={handleImageChange}
//           />
//           <button
//             type="button"
//             onClick={() => imageInputRef.current?.click()}
//             className="btn btn-circle hidden sm:flex"
//           >
//             <Image size={20} />
//           </button>

//           {/* FILE INPUT */}
//           <input
//             type="file"
//             accept=".pdf,.doc,.docx"
//             className="hidden"
//             ref={fileInputRef}
//             onChange={handleFileChange}
//           />
//           <button
//             type="button"
//             onClick={() => fileInputRef.current?.click()}
//             className="btn btn-circle hidden sm:flex"
//           >
//             <FileText size={20} />
//           </button>
//         </div>

//         <button
//           type="submit"
//           className="btn btn-sm btn-circle"
//           disabled={!text.trim() && !imagePreview && !filePreview}
//         >
//           <Send size={22} />
//         </button>
//       </form>
//     </div>
//   );
// };

// export default MessageInput;